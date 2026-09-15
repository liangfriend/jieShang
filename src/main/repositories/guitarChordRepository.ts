import GuitarChordModel from '../models/GuitarChordModel'
import { Op } from 'sequelize'

const LIST_ATTRIBUTES = ['id', 'name', 'data', 'created_at', 'updated_at'] as const

export class GuitarChordRepository {
  async create(payload: { name: string; data: string }) {
    const row = await GuitarChordModel.create({
      name: payload.name,
      data: payload.data
    })
    return row.toJSON()
  }

  async delete(id: string | number) {
    return GuitarChordModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<{ name: string; data: string }>) {
    const [count] = await GuitarChordModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await GuitarChordModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await GuitarChordModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  async list() {
    const rows = await GuitarChordModel.findAll({
      attributes: [...LIST_ATTRIBUTES],
      order: [
        ['name', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return rows.map((r) => r.toJSON())
  }

  async searchByName(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) return this.list()
    const rows = await GuitarChordModel.findAll({
      attributes: [...LIST_ATTRIBUTES],
      where: { name: { [Op.like]: `%${trimmed}%` } },
      order: [
        ['name', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return rows.map((r) => r.toJSON())
  }

  async count() {
    return GuitarChordModel.count()
  }
}
