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
      thumbnail: payload.thumbnail ?? null
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
    const result = await CollectionModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item) => item.toJSON())
  }

  async listByType(type: CollectionType) {
    return this.query({ type })
  }
}
