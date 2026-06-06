import ScoreModel from '../models/ScoreModel'
import { Op } from 'sequelize'

const SCORE_LIST_ATTRIBUTES = ['id', 'name', 'thumbnail', 'created_at', 'updated_at'] as const

export class ScoreRepository {
  async create(payload: { name: string; data?: string }) {
    const result = await ScoreModel.create({
      name: payload.name,
      data: payload.data ?? '{}'
    })
    return result.toJSON()
  }

  async delete(id: string | number) {
    return ScoreModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<{ name: string; data: string }>) {
    const [count] = await ScoreModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await ScoreModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await ScoreModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  async query(filters: Partial<{ id: string | number; name: string }> = {}) {
    const where: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) where[key] = val
    }
    const result = await ScoreModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async listSummaries() {
    const result = await ScoreModel.findAll({
      attributes: [...SCORE_LIST_ATTRIBUTES],
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async searchByName(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) {
      return this.listSummaries()
    }

    const result = await ScoreModel.findAll({
      attributes: [...SCORE_LIST_ATTRIBUTES],
      where: { name: { [Op.like]: `%${trimmed}%` } },
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }
}
