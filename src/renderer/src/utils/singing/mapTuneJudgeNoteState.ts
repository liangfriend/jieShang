import { NoteStateEnum } from '@deciphony/tune-judge'
import type { NoteScoreResult } from '@renderer/types/types'

/** tune-judge 音符终态 → 曲谱 canvas 符头着色（对齐练习模式色板，并扩展演唱特有态） */
export function mapTuneJudgeStateToNoteResult(
  state: NoteStateEnum | string
): NoteScoreResult | null {
  switch (state) {
    case NoteStateEnum.perfect:
    case 'perfect':
      return 'perfect'
    case NoteStateEnum['quick-start']:
    case 'quick-start':
      return 'early'
    case NoteStateEnum['slow-start']:
    case 'slow-start':
      return 'late'
    case NoteStateEnum['quick-end']:
    case 'quick-end':
      return 'quick-end'
    case NoteStateEnum['slow-end']:
    case 'slow-end':
      return 'slow-end'
    case NoteStateEnum.miss:
    case 'miss':
      return 'miss'
    case NoteStateEnum.wrong:
    case 'wrong':
      return 'wrong'
    case NoteStateEnum['high-midi']:
    case 'high-midi':
      return 'high-midi'
    case NoteStateEnum['low-midi']:
    case 'low-midi':
      return 'low-midi'
    case NoteStateEnum.pending:
    case 'pending':
    default:
      return null
  }
}

export function noteIdFromTuneJudgeData(data: unknown): string | null {
  if (data == null) return null
  if (typeof data === 'string' || typeof data === 'number') {
    const s = String(data).trim()
    return s || null
  }
  if (typeof data === 'object') {
    const rec = data as Record<string, unknown>
    const raw = rec.note_id ?? rec.noteId ?? rec.id
    if (raw == null) return null
    const s = String(raw).trim()
    return s || null
  }
  return null
}
