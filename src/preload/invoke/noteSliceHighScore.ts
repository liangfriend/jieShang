import { ipcRenderer } from 'electron'

export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  high_score: number
  created_at?: string
  updated_at?: string
}

export const noteSliceHighScoreInvoke = {
  list: () => ipcRenderer.invoke('noteSliceHighScore:list'),
  upsertIfHigher: (mode: NoteSliceHighScoreMode, score: number) =>
    ipcRenderer.invoke('noteSliceHighScore:upsertIfHigher', mode, score)
}
