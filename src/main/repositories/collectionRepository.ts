import { literal } from 'sequelize'
import CollectionModel from '../models/CollectionModel'
import type { CollectionType } from '../constant/collection'

export type CollectionWritePayload = {
  type: CollectionType
  name?: string
  content?: string
  description?: string | null
  is_built_in?: boolean
  owned?: boolean
  level?: number
  thumbnail?: string | null
  option?: string
}

export type CollectionUpdatePayload = Partial<{
  type: CollectionType
  name: string
  content: string
  description: string | null
  is_built_in: boolean
  owned: boolean
  level: number
  thumbnail: string | null
  option: string
}>

export type CollectionQueryFilters = Partial<{
  id: string | number
  type: CollectionType
  is_built_in: boolean
  owned: boolean
}>

export class CollectionRepository {
  async create(payload: CollectionWritePayload) {
    const result = await CollectionModel.create({
      type: payload.type,
      name: payload.name ?? '',
      content: payload.content ?? '',
      description: payload.description ?? null,
      is_built_in: payload.is_built_in ?? false,
      owned: payload.owned ?? false,
      level: payload.level ?? 1,
      thumbnail: payload.thumbnail ?? null,
      option: payload.option ?? '{}'
    })
    return result.toJSON()
  }

  async delete(id: string | number) {
    return CollectionModel.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: CollectionUpdatePayload) {
    const [count] = await CollectionModel.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await CollectionModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await CollectionModel.findByPk(id)
    return row ? row.toJSON() : null
  }

  async query(filters: CollectionQueryFilters = {}) {
    const where: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) where[key] = val
    }
    // 列表不带音色本体（单个 2~5MB、上百个），音色内容只经 findById 按需取
    const attributes = Object.keys(CollectionModel.getAttributes()).map((name) =>
      name === 'content'
        ? ([literal(`CASE WHEN type = 'tone_color' THEN '' ELSE content END`), 'content'] as [
            ReturnType<typeof literal>,
            string
          ])
        : name
    )
    const result = await CollectionModel.findAll({
      attributes,
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async listByType(type: CollectionType) {
    return this.query({ type })
  }
}
