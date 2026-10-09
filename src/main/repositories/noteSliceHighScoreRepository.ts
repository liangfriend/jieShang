import NoteSliceHighScoreModel, {
  NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION,
  type NoteSliceHighScoreDifficulty,
  type NoteSliceHighScoreMode,
  type NoteSliceHighScoreNotation
} from '../models/NoteSliceHighScoreModel'

export class NoteSliceHighScoreRepository {
  async list() {
    const rows = await NoteSliceHighScoreModel.findAll({
      order: [
        ['mode', 'ASC'],
        ['difficulty', 'ASC'],
        ['notation', 'ASC']
      ]
    })
    return rows.map((row) => row.toJSON())
  }

  async findByModeAndDifficulty(
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    notation: NoteSliceHighScoreNotation = NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION
  ) {
    const row = await NoteSliceHighScoreModel.findOne({ where: { mode, difficulty, notation } })
    return row ? row.toJSON() : null
  }

  /** 仅当新分数更高时更新；否则返回当前记录。记录按 (mode, difficulty, notation) 区分 */
  async upsertIfHigher(
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    score: number,
    notation: NoteSliceHighScoreNotation = NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION
  ) {
    const normalizedScore = Math.max(0, Math.floor(score))
    const existing = await NoteSliceHighScoreModel.findOne({ where: { mode, difficulty, notation } })
    if (!existing) {
      const created = await NoteSliceHighScoreModel.create({
        mode,
        difficulty,
        notation,
        high_score: normalizedScore
      })
      return { record: created.toJSON(), updated: true }
    }
    if (normalizedScore <= existing.high_score) {
      return { record: existing.toJSON(), updated: false }
    }
    await existing.update({ high_score: normalizedScore })
    return { record: existing.toJSON(), updated: true }
  }
}
