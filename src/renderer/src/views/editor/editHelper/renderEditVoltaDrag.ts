import { DoubleMeasureAffiliatedSymbolNameEnum, mirrorVoltaData } from '@deciphony/renderer'
import type {
  DoubleMeasureAffiliatedSymbol,
  MusicScore,
  SlotData,
  VDom,
  VoltaMirror
} from '@deciphony/renderer'
import { scoreWriteGateFor, type UpdateVDomFn } from './scoreWriteGate'

export type VoltaHandleKind = 'left' | 'right' | 'center'

export type VoltaHandlePoints = {
  left: { x: number; y: number }
  right: { x: number; y: number }
  center: { x: number; y: number }
}

export type VoltaDragSession = {
  pointerId: number
  voltaId: string
  handle: VoltaHandleKind
  pointerStartX: number
  pointerStartY: number
  baseRelativeX: number
  baseRelativeY: number
  baseRelativeW: number
  /** 上一帧预览的相对值，用于 mirrorVoltaData 的 prev */
  preview?: Required<Pick<VoltaMirror, 'relativeX' | 'relativeY' | 'relativeW' | 'relativeH'>>
  /** 拖拽首帧的 volta 节点几何；updateVDom 原地改 live 节点，补丁必须相对这份快照 */
  baseVdom?: VDom
}

function snapshotVoltaVdom(vdom: VDom): VDom {
  const volta = vdom.special?.volta
  return {
    ...vdom,
    startPoint: { x: vdom.startPoint.x, y: vdom.startPoint.y },
    endPoint: { x: vdom.endPoint.x, y: vdom.endPoint.y },
    special: { ...vdom.special, ...(volta ? { volta: { ...volta } } : {}) }
  }
}

export function isVoltaVDom(vdom: VDom | null | undefined): boolean {
  return vdom?.tag === 'affiliation' && vdom.special?.volta != null
}

export function isVoltaSelected(
  selected: SlotData | null
): selected is SlotData & { self: DoubleMeasureAffiliatedSymbol } {
  const self = selected?.self
  return (
    self != null &&
    'name' in self &&
    self.name === DoubleMeasureAffiliatedSymbolNameEnum.Volta &&
    'startId' in self
  )
}

export function findVoltaSymbol(
  musicScore: MusicScore,
  voltaId: string
): DoubleMeasureAffiliatedSymbol | null {
  const sym = musicScore.affiliatedSymbols.find((item) => item.id === voltaId)
  if (!sym || sym.name !== DoubleMeasureAffiliatedSymbolNameEnum.Volta) return null
  return sym
}

/** volta 覆盖的小节 id（起止小节在同一单谱表内，含两端） */
export function resolveVoltaMeasureIds(
  musicScore: MusicScore,
  volta: DoubleMeasureAffiliatedSymbol
): string[] {
  const { startId, endId } = volta
  for (const grandStaff of musicScore.grandStaffs) {
    for (const singleStaff of grandStaff.staves) {
      const startIdx = singleStaff.measures.findIndex((m) => m.id === startId)
      const endIdx = singleStaff.measures.findIndex((m) => m.id === endId)
      if (startIdx >= 0 && endIdx >= 0) {
        const lo = Math.min(startIdx, endIdx)
        const hi = Math.max(startIdx, endIdx)
        return singleStaff.measures.slice(lo, hi + 1).map((m) => m.id)
      }
    }
  }
  const ids = new Set<string>()
  if (startId) ids.add(startId)
  if (endId) ids.add(endId)
  return [...ids]
}

export function computeVoltaHandlePoints(vdom: VDom): VoltaHandlePoints | null {
  if (!isVoltaVDom(vdom)) return null
  return {
    left: { x: vdom.x, y: vdom.y },
    right: { x: vdom.x + vdom.w, y: vdom.y },
    center: { x: vdom.x + vdom.w / 2, y: vdom.y }
  }
}

function ensureVoltaData(sym: DoubleMeasureAffiliatedSymbol) {
  if (!sym.data.volta) {
    sym.data.volta = { text: '1.', value: [0] }
  }
  return sym.data.volta
}

function readVoltaMirror(volta: {
  relativeX?: number
  relativeY?: number
  relativeW?: number
  relativeH?: number
}): Required<Pick<VoltaMirror, 'relativeX' | 'relativeY' | 'relativeW' | 'relativeH'>> {
  return {
    relativeX: volta.relativeX ?? 0,
    relativeY: volta.relativeY ?? 0,
    relativeW: volta.relativeW ?? 0,
    relativeH: volta.relativeH ?? 0
  }
}

export function createVoltaDragSession(
  event: PointerEvent,
  voltaId: string,
  handle: VoltaHandleKind,
  sym: DoubleMeasureAffiliatedSymbol,
  svgX: number,
  svgY: number
): VoltaDragSession {
  const volta = ensureVoltaData(sym)
  const base = readVoltaMirror(volta)
  return {
    pointerId: event.pointerId,
    voltaId,
    handle,
    pointerStartX: svgX,
    pointerStartY: svgY,
    baseRelativeX: base.relativeX,
    baseRelativeY: base.relativeY,
    baseRelativeW: base.relativeW,
    preview: { ...base }
  }
}

/** 由 session 锚点与指针算出下一帧 volta 相对几何，不写 musicScore */
export function nextVoltaGeomFromPointer(
  session: VoltaDragSession,
  svgX: number,
  svgY: number
): Required<Pick<VoltaMirror, 'relativeX' | 'relativeY' | 'relativeW' | 'relativeH'>> {
  const deltaX = svgX - session.pointerStartX
  const deltaY = svgY - session.pointerStartY
  if (session.handle === 'left') {
    return {
      relativeX: session.baseRelativeX + deltaX,
      relativeY: session.baseRelativeY,
      relativeW: session.baseRelativeW - deltaX,
      relativeH: session.preview?.relativeH ?? 0
    }
  }
  if (session.handle === 'right') {
    return {
      relativeX: session.baseRelativeX,
      relativeY: session.baseRelativeY,
      relativeW: session.baseRelativeW + deltaX,
      relativeH: session.preview?.relativeH ?? 0
    }
  }
  return {
    relativeX: session.baseRelativeX,
    relativeY: session.baseRelativeY + deltaY,
    relativeW: session.baseRelativeW,
    relativeH: session.preview?.relativeH ?? 0
  }
}

function commitVoltaGeom(
  musicScore: MusicScore,
  voltaId: string,
  geom: Required<Pick<VoltaMirror, 'relativeX' | 'relativeY' | 'relativeW' | 'relativeH'>>
) {
  const sym = findVoltaSymbol(musicScore, voltaId)
  if (!sym) return
  const volta = ensureVoltaData(sym)
  volta.relativeX = geom.relativeX
  volta.relativeY = geom.relativeY
  volta.relativeW = geom.relativeW
  if (geom.relativeH !== 0) volta.relativeH = geom.relativeH
}

/**
 * 拖 volta：立刻 updateVDom(id, patch)；把手由返回值覆盖。
 * data.volta 相对几何 100ms 防抖只写最后一次。
 * patch / 把手均相对拖拽起点（session.base*）与整谱渲染时的 vdom 计算，避免叠增量。
 */
export function previewVoltaDrag(
  musicScore: MusicScore,
  getUpdateVDom: () => UpdateVDomFn | undefined,
  session: VoltaDragSession,
  vdom: VDom,
  svgX: number,
  svgY: number
): VoltaHandlePoints | null {
  session.baseVdom ??= snapshotVoltaVdom(vdom)
  const baseVdom = session.baseVdom
  const next = nextVoltaGeomFromPointer(session, svgX, svgY)
  const base = {
    relativeX: session.baseRelativeX,
    relativeY: session.baseRelativeY,
    relativeW: session.baseRelativeW,
    relativeH: session.preview?.relativeH ?? 0
  }
  const dx = next.relativeX - base.relativeX
  const dy = next.relativeY - base.relativeY
  const dw = next.relativeW - base.relativeW
  const dh = next.relativeH - base.relativeH
  const volta = baseVdom.special?.volta
  const patch: Partial<VDom> = {
    x: baseVdom.x + dx,
    y: baseVdom.y + dy,
    w: baseVdom.w + dw,
    h: baseVdom.h + dh,
    ...(volta
      ? {
          special: {
            volta: {
              ...volta
            }
          }
        }
      : {})
  }
  scoreWriteGateFor(musicScore, getUpdateVDom).patch({
    key: `volta:${session.voltaId}:geom`,
    mirror: { targetId: session.voltaId, patch },
    commit: () => commitVoltaGeom(musicScore, session.voltaId, next)
  })
  session.preview = next
  const previewed = mirrorVoltaData([baseVdom], session.voltaId, base, next)[0]
  return previewed ? computeVoltaHandlePoints(previewed) : null
}

/** @deprecated 使用 previewVoltaDrag */
export function updateVoltaDragFromPointer(
  session: VoltaDragSession,
  musicScore: MusicScore,
  svgX: number,
  svgY: number
): boolean {
  const sym = findVoltaSymbol(musicScore, session.voltaId)
  if (!sym) return false
  const geom = nextVoltaGeomFromPointer(session, svgX, svgY)
  commitVoltaGeom(musicScore, session.voltaId, geom)
  session.preview = geom
  return true
}
