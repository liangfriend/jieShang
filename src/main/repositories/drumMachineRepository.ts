import DrumMachineModel from '../models/DrumMachineModel'
import { Op, type WhereOptions } from 'sequelize'

/** 列表不带 data，打开时再 get */
const LIST_ATTRIBUTES = ['id', 'name', 'created_at', 'updated_at'] as const

export type DrumMachineWritePayload = {
  name: string
  data: string
}

export class DrumMachineRepository {
  async create(payload: DrumMachineWritePayload) {
    const row = await DrumMachineModel.create(payload)
    return row.toJSON()
  }

  async delete(id: string | number) {
    return DrumMachineModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<DrumMachineWritePayload>) {
    const [count] = await DrumMachineModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await DrumMachineModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await DrumMachineModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  async list(keyword?: string) {
    const where: WhereOptions = {}
    const kw = keyword?.trim()
    if (kw) Object.assign(where, { name: { [Op.like]: `%${kw}%` } })
    const rows = await DrumMachineModel.findAll({
      attributes: [...LIST_ATTRIBUTES],
      where,
      order: [
        ['updated_at', 'DESC'],
        ['id', 'DESC']
      ]
    })
    return rows.map((r) => r.toJSON())
  }
}
