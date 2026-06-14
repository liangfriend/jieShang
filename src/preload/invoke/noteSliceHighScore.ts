import { ipcRenderer } from 'electron'

export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  high_score: number
  created_at?: string
  updated_at?: string
}

export const noteSliceHighScoreInvoke = {
  list: () => ipcRenderer.invoke('noteSliceHighScore:list'),
  upsertIfHigher: (
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    score: number
  ) => ipcRenderer.invoke('noteSliceHighScore:upsertIfHigher', mode, difficulty, score)
}
