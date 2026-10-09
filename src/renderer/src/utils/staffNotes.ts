import type {Measure, MusicScore, NoteNumber, NotesInfo, StaffSlot} from '@deciphony/renderer'
import {getMeasureSlots, isNoteRest, isNoteSymbol, NoteSymbolTypeEnum, slotSymbol} from '@deciphony/renderer'

function collectNotesInfoIds(ni: NotesInfo, onId: (id: string) => void) {
  onId(ni.id)
}

type HeadLike = {
  id: string
  notesInfo?: Array<{id: string}>
  graceNotes?: Array<{id: string}>
  graceNotesAfter?: Array<{id: string}>
}

/** measure.notes 为 MeasureNoteSlot（含 symbol）；兼容旧数据上直接挂记谱体 */
function noteBodyOf(slot: Measure['notes'][number]): HeadLike | StaffSlot | NoteNumber {
  if (slot && typeof slot === 'object' && 'symbol' in slot && (slot as {symbol?: unknown}).symbol) {
    return slotSymbol(slot as never) as HeadLike | StaffSlot | NoteNumber
  }
  return slot as HeadLike | StaffSlot | NoteNumber
}

function walkHeadIds(body: HeadLike, onId: (id: string) => void) {
  const infos = body.notesInfo
  if (!Array.isArray(infos)) return
  for (const ni of infos) onId(ni.id)
  for (const g of body.graceNotes ?? []) onId(g.id)
  for (const g of body.graceNotesAfter ?? []) onId(g.id)
}

function walkMeasureNoteIds(measure: Measure, onId: (id: string) => void) {
  for (const raw of measure.notes ? getMeasureSlots(measure) : []) {
    const body = noteBodyOf(raw)

    // TabNote：带 isSlap；只取各 info id
    if ('isSlap' in body) {
      walkHeadIds(body as HeadLike, onId)
      continue
    }

    // 简谱 NoteNumber：无 type
    if (!('type' in body)) {
      walkHeadIds(body as HeadLike, onId)
      continue
    }

    const s = body as StaffSlot
    if (isNoteRest(s) || s.type === NoteSymbolTypeEnum.Rest) {
      onId(s.id)
    } else if (isNoteSymbol(s) || s.type === NoteSymbolTypeEnum.Note) {
      walkHeadIds(s as HeadLike, onId)
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
