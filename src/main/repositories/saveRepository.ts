import SaveModel from '../models/SaveModel'

export class SaveRepository {
  /**
   * 创建存档
   */
  async create(saveData: { game_id: number; name: string; data: string }) {
    const result = await SaveModel.create(saveData)
    return result.toJSON() // 保证返回 JSON
  }

  /**
   * 删除存档
   */
  async delete(id: string) {
    const count = await SaveModel.destroy({
      where: { id }
    })
    return count
  }

  /**
   * 更新存档
   */
  async update(id: string, updateData: Partial<{ game_id: number; name: string; data: string }>) {
    const [count] = await SaveModel.update(updateData, {
      where: { id }
    })

    if (count === 0) return null

    // 取更新后的记录并返回 JSON
    const updated = await SaveModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  /**
   * 条件查询（传入属性即条件，不传查全部）
   */
  async query(filters: Partial<{ id: string; game_id: number; name: string; data: string }> = {}) {
    const where: any = {}

    for (const key of Object.keys(filters)) {
      const val = (filters as any)[key]
      if (val !== undefined && val !== null) {
        where[key] = val // 默认 '=' 条件
      }
    }

    const result = await SaveModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })

    return result.map((item) => item.toJSON())
  }
}
