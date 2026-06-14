import NoteSliceHighScoreModel, {
  type NoteSliceHighScoreMode
} from '../models/NoteSliceHighScoreModel'

export class NoteSliceHighScoreRepository {
  async list() {
    const rows = await NoteSliceHighScoreModel.findAll({
      order: [['mode', 'ASC']]
    })
    return rows.map((row) => row.toJSON())
  }

  async findByMode(mode: NoteSliceHighScoreMode) {
    const row = await NoteSliceHighScoreModel.findOne({ where: { mode } })
    return row ? row.toJSON() : null
  }

  /** 仅当新分数更高时更新；否则返回当前记录 */
  async upsertIfHigher(mode: NoteSliceHighScoreMode, score: number) {
    const normalizedScore = Math.max(0, Math.floor(score))
    const existing = await NoteSliceHighScoreModel.findOne({ where: { mode } })
    if (!existing) {
      const created = await NoteSliceHighScoreModel.create({
        mode,
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
