import { ipcRenderer } from 'electron'

export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

/** 谱面模式：线谱 / 简谱（最高分分开记录） */
export type NoteSliceHighScoreNotation = 'staff' | 'jianpu'

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  notation: NoteSliceHighScoreNotation
  high_score: number
  created_at?: string
  updated_at?: string
}

export const noteSliceHighScoreInvoke = {
  list: () => ipcRenderer.invoke('noteSliceHighScore:list'),
  upsertIfHigher: (
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    score: number,
    notation: NoteSliceHighScoreNotation = 'staff'
  ) => ipcRenderer.invoke('noteSliceHighScore:upsertIfHigher', mode, difficulty, score, notation)
}
