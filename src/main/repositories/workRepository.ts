import WorkModel from '../models/WorkModel'
import ScoreModel from '../models/ScoreModel'
import { Op } from 'sequelize'

export class WorkRepository {
  async create(payload: { name: string; score_id?: number | null; data?: string }) {
    const result = await WorkModel.create({
      name: payload.name,
      score_id: payload.score_id ?? null,
      data: payload.data ?? '{}'
    })
    return result.toJSON()
  }

  async delete(id: string | number) {
    return WorkModel.destroy({ where: { id } })
  }

  async update(
    id: string | number,
    updateData: Partial<{ name: string; score_id: number | null; data: string }>
  ) {
    const [count] = await WorkModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await WorkModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number, includeScore = false) {
    const row = await WorkModel.findByPk(id, {
      include: includeScore ? [{ model: ScoreModel, as: 'score' }] : undefined
    })
    return row ? row.toJSON() : null
  }

  async query(filters: Partial<{ id: string | number; name: string; score_id: number }> = {}) {
    const where: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) where[key] = val
    }
    const result = await WorkModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async searchByName(keyword: string) {
    const result = await WorkModel.findAll({
      where: { name: { [Op.like]: `%${keyword}%` } },
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  /** 从作品取关联曲谱（独立表数据，不解析作品 data） */
  async extractScore(workId: string | number) {
    const work = await WorkModel.findByPk(workId)
    if (!work?.score_id) return null
    const score = await ScoreModel.findByPk(work.score_id)
    return score ? score.toJSON() : null
  }
}
