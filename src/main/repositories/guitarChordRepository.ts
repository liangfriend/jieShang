import GuitarChordModel, {
  isGuitarChordTabType,
  type GuitarChordTabType
} from '../models/GuitarChordModel'
import { Op, type WhereOptions } from 'sequelize'

const LIST_ATTRIBUTES = [
  'id',
  'name',
  'data',
  'hand_pose',
  'tab_type',
  'created_at',
  'updated_at'
] as const

export type GuitarChordWritePayload = {
  name: string
  data: string
  hand_pose?: string | null
  tab_type?: GuitarChordTabType
}

export type GuitarChordListFilter = {
  keyword?: string
  tabType?: GuitarChordTabType | 'all' | null
}

function normalizeTabType(raw: unknown): GuitarChordTabType {
  return isGuitarChordTabType(raw) ? raw : 'tab6'
}

export class GuitarChordRepository {
  async create(payload: GuitarChordWritePayload) {
    const row = await GuitarChordModel.create({
      name: payload.name,
      data: payload.data,
      hand_pose: payload.hand_pose ?? null,
      tab_type: normalizeTabType(payload.tab_type)
    })
    return row.toJSON()
  }

  async delete(id: string | number) {
    return GuitarChordModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<GuitarChordWritePayload>) {
    const payload: Partial<GuitarChordWritePayload> = { ...updateData }
    if (payload.tab_type !== undefined) {
      payload.tab_type = normalizeTabType(payload.tab_type)
    }
    const [count] = await GuitarChordModel.update(payload, { where: { id } })
    if (count === 0) return null
    const updated = await GuitarChordModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await GuitarChordModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  private buildWhere(filter: GuitarChordListFilter = {}): WhereOptions {
    const where: WhereOptions = {}
    const keyword = filter.keyword?.trim()
    if (keyword) {
      Object.assign(where, { name: { [Op.like]: `%${keyword}%` } })
    }
    if (isGuitarChordTabType(filter.tabType)) {
      Object.assign(where, { tab_type: filter.tabType })
    }
    return where
  }

  async list(filter: GuitarChordListFilter = {}) {
    const rows = await GuitarChordModel.findAll({
      attributes: [...LIST_ATTRIBUTES],
      where: this.buildWhere(filter),
      order: [
        ['name', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return rows.map((r) => r.toJSON())
  }

  async searchByName(keyword: string, tabType?: GuitarChordTabType | 'all' | null) {
    return this.list({ keyword, tabType })
  }

  async count() {
    return GuitarChordModel.count()
  }
}
