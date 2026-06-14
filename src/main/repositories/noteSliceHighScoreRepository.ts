import NoteSliceHighScoreModel, {
  type NoteSliceHighScoreDifficulty,
  type NoteSliceHighScoreMode
} from '../models/NoteSliceHighScoreModel'

export class NoteSliceHighScoreRepository {
  async list() {
    const rows = await NoteSliceHighScoreModel.findAll({
      order: [
        ['mode', 'ASC'],
        ['difficulty', 'ASC']
      ]
    })
    return rows.map((row) => row.toJSON())
  }

  async findByModeAndDifficulty(mode: NoteSliceHighScoreMode, difficulty: NoteSliceHighScoreDifficulty) {
    const row = await NoteSliceHighScoreModel.findOne({ where: { mode, difficulty } })
    return row ? row.toJSON() : null
  }

  /** 仅当新分数更高时更新；否则返回当前记录 */
  async upsertIfHigher(
    mode: NoteSliceHighScoreMode,
    difficulty: NoteSliceHighScoreDifficulty,
    score: number
  ) {
    const normalizedScore = Math.max(0, Math.floor(score))
    const existing = await NoteSliceHighScoreModel.findOne({ where: { mode, difficulty } })
    if (!existing) {
      const created = await NoteSliceHighScoreModel.create({
        mode,
        difficulty,
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
