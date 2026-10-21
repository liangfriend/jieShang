import type {
  GrandStaff,
  Measure,
  MusicScore,
  SingleMeasureAffiliatedSymbol,
  SingleStaff,
  SlotData,
  VDom,
} from '@deciphony/renderer'
import {scoreWriteGateFor, type UpdateVDomFn} from './scoreWriteGate'
import type {FrameBox} from './renderEditNoteAffiliatedDrag'

/** 单小节附属（Measure.affiliatedSymbols，含曲谱自定义小节符号）：移动按钮整体平移，改自身 relativeX / relativeY */

export type LocatedMeasureAffiliated = {
  grandStaff: GrandStaff
  singleStaff: SingleStaff
  measure: Measure
  symbol: SingleMeasureAffiliatedSymbol
}

export function locateMeasureAffiliatedById(musicScore: MusicScore, id: string): LocatedMeasureAffiliated | null {
  for (const grandStaff of musicScore.grandStaffs) {
    for (const singleStaff of grandStaff.staves) {
      for (const measure of singleStaff.measures) {
        const symbol = measure.affiliatedSymbols?.find((sym) => sym.id === id)
        if (symbol) return {grandStaff, singleStaff, measure, symbol}
      }
    }
  }
  return null
}

export function isMeasureAffiliatedSelected(
  selected: SlotData | null,
): selected is SlotData & {measure: Measure; self: SingleMeasureAffiliatedSymbol} {
  const self = selected?.self as {id?: unknown} | null | undefined
  if (!selected?.measure || !self || typeof self.id !== 'string') return false
  return selected.measure.affiliatedSymbols?.some((sym) => sym.id === self.id) ?? false
}

export function isMeasureAffiliatedVDom(vdom: VDom | null | undefined, symbolId: string): boolean {
  return vdom?.tag === 'affiliation' && vdom.targetId === symbolId
}

export function removeMeasureAffiliated(measure: Measure, symbolId: string): boolean {
  const list = measure.affiliatedSymbols
  const idx = list?.findIndex((sym) => sym.id === symbolId) ?? -1
  if (idx < 0) return false
  list!.splice(idx, 1)
  return true
}

export type MeasureAffiliatedDragSession = {
  pointerId: number
  symbolId: string
  pointerStartX: number
  pointerStartY: number
  baseBox: FrameBox
  baseRelativeX: number
  baseRelativeY: number
}

export function createMeasureAffiliatedDragSession(
  event: PointerEvent,
  musicScore: MusicScore,
  vdom: VDom,
  svgX: number,
  svgY: number,
): MeasureAffiliatedDragSession | null {
  const symbolId = vdom.targetId
  if (!symbolId) return null
  const located = locateMeasureAffiliatedById(musicScore, symbolId)
  if (!located) return null
  return {
    pointerId: event.pointerId,
    symbolId,
    pointerStartX: svgX,
    pointerStartY: svgY,
    baseBox: {x: vdom.x, y: vdom.y, w: vdom.w, h: vdom.h},
    baseRelativeX: located.symbol.relativeX ?? 0,
    baseRelativeY: located.symbol.relativeY ?? 0,
  }
}

/** 拖单小节附属：立刻 updateVDom 平移节点；relativeX / relativeY 防抖落盘。返回拖拽框新位置 */
export function previewMeasureAffiliatedDrag(
  musicScore: MusicScore,
  getUpdateVDom: () => UpdateVDomFn | undefined,
  session: MeasureAffiliatedDragSession,
  svgX: number,
  svgY: number,
): FrameBox {
  const dx = svgX - session.pointerStartX
  const dy = svgY - session.pointerStartY
  const box = {...session.baseBox, x: session.baseBox.x + dx, y: session.baseBox.y + dy}
  scoreWriteGateFor(musicScore, getUpdateVDom).patch({
    key: `measureAffiliated:${session.symbolId}:frame`,
    mirror: {targetId: session.symbolId, patch: {x: box.x, y: box.y}},
    commit: () => {
      const sym = locateMeasureAffiliatedById(musicScore, session.symbolId)?.symbol
      if (!sym) return
      sym.relativeX = session.baseRelativeX + dx
      sym.relativeY = session.baseRelativeY + dy
    },
  })
  return box
}
