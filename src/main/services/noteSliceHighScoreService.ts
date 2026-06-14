import type {
  NoteSliceHighScoreDifficulty,
  NoteSliceHighScoreMode
} from '../models/NoteSliceHighScoreModel'
import { NoteSliceHighScoreRepository } from '../repositories/noteSliceHighScoreRepository'

export class NoteSliceHighScoreService {
  private noteSliceHighScoreRepository: NoteSliceHighScoreRepository

  constructor({ noteSliceHighScoreRepository }) {
    this.noteSliceHighScoreRepository = noteSliceHighScoreRepository
  }

  async listHighScores() {
    const data = await this.noteSliceHighScoreRepository.list()
    return { success: true, data }
  }

  async upsertIfHigher(
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    score: number
  ) {
    const data = await this.noteSliceHighScoreRepository.upsertIfHigher(mode, difficulty, score)
    return { success: true, data }
  }
}
