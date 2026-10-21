import CustomSymbolModel, { type CustomSymbolKind } from '../models/CustomSymbolModel'
import type { WhereOptions } from 'sequelize'

export type CustomSymbolWritePayload = {
  name: string
  kind: CustomSymbolKind
  skin_key: string
  data: string
}

export class CustomSymbolRepository {
  async create(payload: CustomSymbolWritePayload) {
    const row = await CustomSymbolModel.create(payload)
    return row.toJSON()
  }

  async delete(id: string | number) {
    return CustomSymbolModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<Pick<CustomSymbolWritePayload, 'name' | 'data'>>) {
    const [count] = await CustomSymbolModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await CustomSymbolModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await CustomSymbolModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  /** 含已软删的行：skin_key 唯一索引覆盖软删行 */
  async existsSkinKey(skinKey: string) {
    const row = await CustomSymbolModel.findOne({ where: { skin_key: skinKey }, paranoid: false })
    return Boolean(row)
  }

  async list(kind?: CustomSymbolKind) {
    const where: WhereOptions = {}
    if (kind) Object.assign(where, { kind })
    const rows = await CustomSymbolModel.findAll({
      where,
      order: [
        ['created_at', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return rows.map((r) => r.toJSON())
  }
}
