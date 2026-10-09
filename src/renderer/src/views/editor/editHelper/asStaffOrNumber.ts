import type {
  Measure,
  MeasureNoteSlot,
  MeasureNoteSymbol,
  NoteNumber,
  NoteSymbol,
  StaffSlot,
} from '@deciphony/renderer'
import {slotSymbol} from '@deciphony/renderer'
import {isNoteNumberSlot as isNoteNumberSlotRaw} from '@deciphony/extensions/dr-edit/score-builder'

/**
 * renderer 0.0.39 起 measure.notes 为 MeasureNoteSlot（id + Frame + symbol）。
 * 编辑器五线/简谱路径需要槽内记谱体，统一经 slotSymbol 解包。
 */
export function asStaffOrNumber(
  slot: MeasureNoteSlot | StaffSlot | NoteNumber | NoteSymbol | MeasureNoteSymbol,
): StaffSlot | NoteNumber {
  if (isMeasureNoteSlot(slot)) return slotSymbol(slot) as StaffSlot | NoteNumber
  return slot as StaffSlot | NoteNumber
}

export function isMeasureNoteSlot(
  slot: MeasureNoteSlot | StaffSlot | NoteNumber | NoteSymbol | MeasureNoteSymbol | null | undefined,
): slot is MeasureNoteSlot {
  return Boolean(
    slot
    && typeof slot === 'object'
    && 'symbol' in slot
    && (slot as MeasureNoteSlot).symbol != null
    && typeof (slot as MeasureNoteSlot).symbol === 'object',
  )
}

/**
 * 在小节 notes 中定位选中 note（可能是 MeasureNoteSlot 或槽内 symbol）。
 * 优先引用相等，其次 id（slot.id 或 symbol.id）。
 */
export function findMeasureNoteIndex(
  measure: Measure,
  note: {id?: string} | null | undefined,
): number {
  if (!note) return -1
  return measure.notes.findIndex((item) => {
    if (item === note) return true
    if (note.id && item.id === note.id) return true
    const body = slotSymbol(item)
    if (body === note) return true
    return Boolean(note.id && 'id' in body && (body as {id?: string}).id === note.id)
  })
}

/**
 * extensions 的 isNoteNumberSlot 谓词指向另一份 NoteNumber，不能收窄宿主类型。
 * 这里用宿主自己的 NoteNumber 重新声明谓词。
 */
export function isHostNoteNumberSlot(slot: StaffSlot | NoteNumber): slot is NoteNumber {
  return isNoteNumberSlotRaw(slot as StaffSlot | NoteNumber)
}
