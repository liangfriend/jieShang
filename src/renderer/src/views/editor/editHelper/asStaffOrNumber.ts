import type {
  Measure,
  MeasureNoteSlot,
  MeasureNoteSymbol,
  NoteNumber,
  NoteSymbol,
  StaffSlot,
} from '@deciphony/renderer'
import {isMeasureNoteVoices, slotSymbol} from '@deciphony/renderer'
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
  return findSlotIndex(measureVoiceSlots(measure, null), note)
}

function findSlotIndex(slots: MeasureNoteSlot[], note: {id?: string}): number {
  return slots.findIndex((item) => {
    if (item === note) return true
    if (note.id && item.id === note.id) return true
    const body = slotSymbol(item)
    if (body === note) return true
    return Boolean(note.id && 'id' in body && (body as {id?: string}).id === note.id)
  })
}

/** 鼓谱小节分上下声部；其余谱种 voice 恒为 null */
export type MeasureVoiceKey = 'up' | 'down' | null

/** 声部内的槽位数组；非声部小节直接返回 notes，声部小节 voice 为 null 时取上声部 */
export function measureVoiceSlots(measure: Measure, voice: MeasureVoiceKey): MeasureNoteSlot[] {
  const notes = measure.notes
  if (!isMeasureNoteVoices(notes)) return notes
  return (voice ? notes[voice] : notes.up) ?? []
}

/** 选中 note 所在声部与声部内下标；找不到 index 为 -1 */
export function locateMeasureNote(
  measure: Measure,
  note: {id?: string} | null | undefined,
): {voice: MeasureVoiceKey; index: number} {
  if (!note) return {voice: null, index: -1}
  if (!isMeasureNoteVoices(measure.notes)) return {voice: null, index: findSlotIndex(measure.notes, note)}
  for (const voice of ['up', 'down'] as const) {
    const index = findSlotIndex(measureVoiceSlots(measure, voice), note)
    if (index >= 0) return {voice, index}
  }
  return {voice: null, index: -1}
}

/**
 * extensions 的 isNoteNumberSlot 谓词指向另一份 NoteNumber，不能收窄宿主类型。
 * 这里用宿主自己的 NoteNumber 重新声明谓词。
 */
export function isHostNoteNumberSlot(slot: StaffSlot | NoteNumber): slot is NoteNumber {
  return isNoteNumberSlotRaw(slot as StaffSlot | NoteNumber)
}
