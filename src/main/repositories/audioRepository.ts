import AudioModel from '../models/AudioModel'
import { Op } from 'sequelize'

const AUDIO_LIST_ATTRIBUTES = ['id', 'name', 'url', 'created_at', 'updated_at'] as const

export class AudioRepository {
  async create(payload: { name: string; url: string }) {
    const result = await AudioModel.create({
      name: payload.name,
      url: payload.url
    })
    return result.toJSON()
  }

  async delete(id: string | number) {
    return AudioModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<{ name: string }>) {
    const [count] = await AudioModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await AudioModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await AudioModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  async query(filters: Partial<{ id: string | number; name: string }> = {}) {
    const where: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) where[key] = val
    }
    const result = await AudioModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async list() {
    const result = await AudioModel.findAll({
      attributes: [...AUDIO_LIST_ATTRIBUTES],
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async searchByName(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) {
      return this.list()
    }

    const result = await AudioModel.findAll({
      attributes: [...AUDIO_LIST_ATTRIBUTES],
      where: { name: { [Op.like]: `%${trimmed}%` } },
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }
}
