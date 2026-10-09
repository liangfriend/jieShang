import { ipcMain } from 'electron'
import type {
  NoteSliceHighScoreDifficulty,
  NoteSliceHighScoreMode,
  NoteSliceHighScoreNotation
} from '../models/NoteSliceHighScoreModel'
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
    ipcMain.handle(
      'noteSliceHighScore:upsertIfHigher',
      (
        _,
        mode: NoteSliceHighScoreMode,
        difficulty: NoteSliceHighScoreDifficulty,
        score: number,
        notation?: NoteSliceHighScoreNotation
      ) => this.noteSliceHighScoreService.upsertIfHigher(mode, difficulty, score, notation)
    )
  }
}
