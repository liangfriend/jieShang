import type { Measure, MusicScore, NoteNumber, NotesInfo, StaffSlot } from 'deciphony-renderer'
import { NoteSymbolTypeEnum } from 'deciphony-renderer'

function collectNotesInfoIds(ni: NotesInfo, onId: (id: string) => void) {
  onId(ni.id)
}

function walkMeasureNoteIds(measure: Measure, onId: (id: string) => void) {
  for (const slot of measure.notes) {
    if (!('type' in slot)) {
      const note = slot as NoteNumber
      for (const ni of note.notesInfo) onId(ni.id)
      continue
    }
    const s = slot as StaffSlot
    if (s.type === NoteSymbolTypeEnum.Rest) {
      onId(s.id)
    } else if (s.type === NoteSymbolTypeEnum.Note) {
      for (const ni of s.notesInfo) collectNotesInfoIds(ni, onId)
      for (const g of s.graceNotes ?? []) collectNotesInfoIds(g, onId)
      for (const g of s.graceNotesAfter ?? []) collectNotesInfoIds(g, onId)
    }
  }
}

/** 收集某一单谱表行上所有音符/休止符 id（含倚音） */
export function collectSingleStaffNoteIds(score: MusicScore, staffIndex: number): string[] {
  const ids = new Set<string>()
  for (const grandStaff of score.grandStaffs ?? []) {
    const staff = grandStaff.staves?.[staffIndex]
    if (!staff) continue
    for (const measure of staff.measures ?? []) {
      walkMeasureNoteIds(measure, (id) => ids.add(id))
    }
  }
  return [...ids]
}

/** note_id / rest id → 单谱表行号 staveIndex */
export function buildNoteStaveIndexMap(score: MusicScore): Map<string, number> {
  const map = new Map<string, number>()
  for (const grandStaff of score.grandStaffs ?? []) {
    for (let staveIndex = 0; staveIndex < (grandStaff.staves?.length ?? 0); staveIndex++) {
      const staff = grandStaff.staves[staveIndex]
      for (const measure of staff.measures ?? []) {
        walkMeasureNoteIds(measure, (id) => map.set(id, staveIndex))
      }
    }
  }
  return map
}
