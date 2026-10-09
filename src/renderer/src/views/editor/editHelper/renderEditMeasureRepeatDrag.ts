import type {
  Measure,
  MeasureEndRepeat,
  MeasureStartRepeat,
  MusicScore,
  SlotData,
  VDom,
} from '@deciphony/renderer'
import {scoreWriteGateFor, type UpdateVDomFn} from './scoreWriteGate'
import type {FrameBox} from './renderEditNoteAffiliatedDrag'

/** 小节反复符号（coda / segno / D.C. / D.S. / fine 等）：移动按钮整体平移，改自身 relativeX / relativeY */

type MeasureRepeat = MeasureStartRepeat | MeasureEndRepeat

function findMeasureRepeat(measure: Measure | null | undefined, id: string): MeasureRepeat | null {
  if (!measure) return null
  if (measure.startRepeat?.id === id) return measure.startRepeat
  if (measure.endRepeat?.id === id) return measure.endRepeat
  return null
}

function locateMeasureRepeatById(musicScore: MusicScore, id: string): MeasureRepeat | null {
  for (const grandStaff of musicScore.grandStaffs) {
    for (const singleStaff of grandStaff.staves) {
      for (const measure of singleStaff.measures) {
        const hit = findMeasureRepeat(measure, id)
        if (hit) return hit
      }
    }
  }
  return null
}

export function isMeasureRepeatSelected(
  selected: SlotData | null,
): selected is SlotData & {measure: Measure; self: MeasureRepeat} {
  const self = selected?.self as {id?: unknown} | null | undefined
  if (!selected?.measure || !self || typeof self.id !== 'string') return false
  return findMeasureRepeat(selected.measure, self.id) != null
}

export function isMeasureRepeatVDom(vdom: VDom | null | undefined, symbolId: string): boolean {
  return (vdom?.tag === 'repeat_f' || vdom?.tag === 'repeat_b') && vdom.targetId === symbolId
}

export type MeasureRepeatDragSession = {
  pointerId: number
  symbolId: string
  pointerStartX: number
  pointerStartY: number
  baseBox: FrameBox
  baseRelativeX: number
  baseRelativeY: number
}

export function createMeasureRepeatDragSession(
  event: PointerEvent,
  musicScore: MusicScore,
  vdom: VDom,
  svgX: number,
  svgY: number,
): MeasureRepeatDragSession | null {
  const symbolId = vdom.targetId
  if (!symbolId) return null
  const repeat = locateMeasureRepeatById(musicScore, symbolId)
  if (!repeat) return null
  return {
    pointerId: event.pointerId,
    symbolId,
    pointerStartX: svgX,
    pointerStartY: svgY,
    baseBox: {x: vdom.x, y: vdom.y, w: vdom.w, h: vdom.h},
    baseRelativeX: repeat.relativeX ?? 0,
    baseRelativeY: repeat.relativeY ?? 0,
  }
}

/** 拖反复符号：立刻 updateVDom 平移节点；relativeX / relativeY 防抖落盘。返回拖拽框新位置 */
export function previewMeasureRepeatDrag(
  musicScore: MusicScore,
  getUpdateVDom: () => UpdateVDomFn | undefined,
  session: MeasureRepeatDragSession,
  svgX: number,
  svgY: number,
): FrameBox {
  const dx = svgX - session.pointerStartX
  const dy = svgY - session.pointerStartY
  const box = {...session.baseBox, x: session.baseBox.x + dx, y: session.baseBox.y + dy}
  scoreWriteGateFor(musicScore, getUpdateVDom).patch({
    key: `measureRepeat:${session.symbolId}:frame`,
    mirror: {targetId: session.symbolId, patch: {x: box.x, y: box.y}},
    commit: () => {
      const repeat = locateMeasureRepeatById(musicScore, session.symbolId)
      if (!repeat) return
      repeat.relativeX = session.baseRelativeX + dx
      repeat.relativeY = session.baseRelativeY + dy
    },
  })
  return box
}
