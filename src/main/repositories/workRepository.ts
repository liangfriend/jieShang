// src/main/repositories/workRepository.ts
import WorkModel from '../models/WorkModel'

export class WorkRepository {
  /**
   * 创建作品
   */
  async create(workData: { name: string; data: string }) {
    const result = await WorkModel.create(workData)
    return result.toJSON()
  }

  /**
   * 删除作品
   */
  async delete(id: string) {
    const count = await WorkModel.destroy({
      where: { id }
    })
    return count
  }

  /**
   * 更新作品
   */
  async update(id: string, updateData: Partial<{ name: string; data: string }>) {
    const [count] = await WorkModel.update(updateData, {
      where: { id }
    })
    if (count === 0) return null

    // 取更新后的记录并返回 JSON
    const updated = await WorkModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  /**
   * 条件查询（传入属性即条件，不传查全部）
   * 例：query({ name: "xxx" }) → WHERE name='xxx'
   *     query({}) → 查全部
   */
  async query(filters: Partial<{ id: string; name: string; data: string }> = {}) {
    const where: any = {}

    for (const key of Object.keys(filters)) {
      const val = (filters as any)[key]
      if (val !== undefined && val !== null) {
        where[key] = val // 默认全部 '=' 条件
      }
    }

    const result = await WorkModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })

    return result.map((item) => item.toJSON())
  }
}
