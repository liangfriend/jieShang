import { Op } from 'sequelize'

const LIST_ATTRIBUTES = ['id', 'name', 'url', 'created_at', 'updated_at'] as const

/** 图片 / 视频同构仓库（传入 Sequelize Model） */
export class MediaLibraryRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private model: any) {}

  async create(payload: { name: string; url: string }) {
    const result = await this.model.create({
      name: payload.name,
      url: payload.url
    })
    return result.toJSON()
  }

  async delete(id: string | number) {
    return this.model.destroy({ where: { id } })
  }

  async update(id: string | number, updateData: Partial<{ name: string }>) {
    const [count] = await this.model.update(updateData, { where: { id } })
    if (count === 0) return null
    const updated = await this.model.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  async findById(id: string | number) {
    const row = await this.model.findByPk(id)
    return row ? row.toJSON() : null
  }

  async query(filters: Partial<{ id: string | number; name: string }> = {}) {
    const where: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) where[key] = val
    }
    const result = await this.model.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['updated_at', 'DESC']]
    })
    return result.map((item: { toJSON(): unknown }) => item.toJSON())
  }

  async list() {
    const result = await this.model.findAll({
      attributes: [...LIST_ATTRIBUTES],
      order: [['updated_at', 'DESC']]
    })
    return result.map((item: { toJSON(): unknown }) => item.toJSON())
  }

  async searchByName(keyword: string) {
    const trimmed = keyword.trim()
    if (!trimmed) {
      return this.list()
    }

    const result = await this.model.findAll({
      attributes: [...LIST_ATTRIBUTES],
      where: { name: { [Op.like]: `%${trimmed}%` } },
      order: [['updated_at', 'DESC']]
    })
    return result.map((item: { toJSON(): unknown }) => item.toJSON())
  }
}
