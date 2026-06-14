import AchievementProgressModel from '../models/AchievementProgressModel'

export type AchievementUnlockPayload = {
  key: string
  completed_at?: Date | string
}

export class AchievementProgressRepository {
  async list() {
    const rows = await AchievementProgressModel.findAll({
      order: [['completed_at', 'DESC']]
    })
    return rows.map((row) => row.toJSON())
  }

  async findByKey(key: string) {
    const row = await AchievementProgressModel.findOne({ where: { key } })
    return row ? row.toJSON() : null
  }

  async unlock(payload: AchievementUnlockPayload) {
    const existing = await AchievementProgressModel.findOne({ where: { key: payload.key } })
    if (existing) {
      return existing.toJSON()
    }
    const completedAt = payload.completed_at ? new Date(payload.completed_at) : new Date()
    const created = await AchievementProgressModel.create({
      key: payload.key,
      completed_at: completedAt
    })
    return created.toJSON()
  }
}
