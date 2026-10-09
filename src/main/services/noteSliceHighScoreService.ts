import {
  NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION,
  type NoteSliceHighScoreDifficulty,
  type NoteSliceHighScoreMode,
  type NoteSliceHighScoreNotation
} from '../models/NoteSliceHighScoreModel'
import { NoteSliceHighScoreRepository } from '../repositories/noteSliceHighScoreRepository'

function normalizeNotation(value: unknown): NoteSliceHighScoreNotation {
  return value === 'jianpu' ? 'jianpu' : NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION
}

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
    score: number,
    notation?: NoteSliceHighScoreNotation
  ) {
    const data = await this.noteSliceHighScoreRepository.upsertIfHigher(
      mode,
      difficulty,
      score,
      normalizeNotation(notation)
    )
    return { success: true, data }
  }
}
