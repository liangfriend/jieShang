import { getMeasureSlots, slotSymbol } from '@deciphony/renderer'
import type { MeasureNoteSlot, MusicScore, SlotData } from '@deciphony/renderer'
import { locateSlotAffiliatedSymbolById } from '@deciphony/extensions/dr-edit/score-builder'
import { isArpeggioSelected } from './renderEditArpeggioDrag'
import { isStrummingSelected } from './renderEditStrummingDrag'
import { isLineSelected } from './renderEditLineDrag'
import { isPedalSelected } from './renderEditPedalDrag'
import { isPitchSelected } from './renderEditPitchDrag'
import { isSlurSelected } from './renderEditSlurDrag'

function findSlotById(musicScore: MusicScore, slotId: string): MeasureNoteSlot | null {
  for (const grandStaff of musicScore.grandStaffs) {
    for (const staff of grandStaff.staves) {
      for (const measure of staff.measures) {
        const hit = getMeasureSlots(measure).find((slot) => slot.id === slotId)
        if (hit) return hit
      }
    }
  }
  return null
}

function slotHeadIds(slot: MeasureNoteSlot): string[] {
  const body = slotSymbol(slot) as { id?: string; notesInfo?: Array<{ id: string }> }
  if (Array.isArray(body.notesInfo) && body.notesInfo.length) {
    return body.notesInfo.map((info) => info.id)
  }
  return body.id ? [body.id] : []
}

/**
 * 选中跨音符记号时需要绿色高亮的符头 id（NotesInfo / NotesNumberInfo / TabNoteInfo）。
 * 连音线直接锚定符头；踏板 / 八度 / 颤音线 / 渐强渐弱锚定音符列，取列内全部符头；
 * 琶音 / 扫弦挂在宿主列上，取宿主列全部符头。
 * 其它选中项返回 null。
 */
export function resolveSpanAnchorHeadIds(
  musicScore: MusicScore,
  slot: SlotData | null | undefined
): string[] | null {
  if (!slot) return null
  if (isSlurSelected(slot)) {
    const { startId, endId } = slot.self
    return startId === endId ? [startId] : [startId, endId]
  }
  if (isPedalSelected(slot) || isPitchSelected(slot) || isLineSelected(slot)) {
    const { startId, endId } = slot.self
    const slotIds = startId === endId ? [startId] : [startId, endId]
    const ids: string[] = []
    for (const id of slotIds) {
      const hit = findSlotById(musicScore, id)
      if (hit) ids.push(...slotHeadIds(hit))
    }
    return ids
  }
  if (isArpeggioSelected(slot) || isStrummingSelected(slot)) {
    const host = locateSlotAffiliatedSymbolById(musicScore, slot.self.id)?.slot
    return host ? slotHeadIds(host) : []
  }
  return null
}
