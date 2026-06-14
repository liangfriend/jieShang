import { ipcMain } from 'electron'
import type { NoteSliceHighScoreMode } from '../models/NoteSliceHighScoreModel'
import { NoteSliceHighScoreService } from '../services/noteSliceHighScoreService'

export class NoteSliceHighScoreController {
  private noteSliceHighScoreService: NoteSliceHighScoreService

  constructor({ noteSliceHighScoreService }) {
    this.noteSliceHighScoreService = noteSliceHighScoreService
  }

  register() {
    ipcMain.handle('noteSliceHighScore:list', () =>
      this.noteSliceHighScoreService.listHighScores()
    )
    ipcMain.handle('noteSliceHighScore:upsertIfHigher', (_, mode: NoteSliceHighScoreMode, score: number) =>
      this.noteSliceHighScoreService.upsertIfHigher(mode, score)
    )
  }
}
