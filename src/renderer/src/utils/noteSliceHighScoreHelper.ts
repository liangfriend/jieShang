export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  high_score: number
  created_at?: string
  updated_at?: string
}

function parseHighScoreList(res: unknown): NoteSliceHighScoreRecord[] {
  if (!res || typeof res !== 'object') return []
  const payload = res as { success?: boolean; data?: unknown }
  if (!payload.success || !Array.isArray(payload.data)) return []
  return payload.data as NoteSliceHighScoreRecord[]
}

export async function fetchNoteSliceHighScores(): Promise<NoteSliceHighScoreRecord[]> {
  const res = await window.api.noteSliceHighScore.list()
  return parseHighScoreList(res)
}

export async function upsertNoteSliceHighScoreIfHigher(
  mode: NoteSliceHighScoreMode,
  score: number
): Promise<void> {
  await window.api.noteSliceHighScore.upsertIfHigher(mode, score)
}

export const NOTE_SLICE_HIGH_SCORE_MODE_LABELS: Record<NoteSliceHighScoreMode, string> = {
  arcade: '街机模式',
  endless: '无限模式',
  extreme: '极限模式'
}
