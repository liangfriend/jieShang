import SaveModel from '../models/SaveModel'

export class SaveRepository {
  /**
   * 创建存档
   */
  async create(saveData: { game_id: number; name: string; data: string }) {
    return await SaveModel.create(saveData)
  }

  /**
   * 删除存档
   */
  async delete(id: string) {
    return await SaveModel.destroy({
      where: { id }
    })
  }

  /**
   * 更新存档
   */
  async update(id: string, updateData: Partial<{ game_id: number; name: string; data: string }>) {
    return await SaveModel.update(updateData, {
      where: { id }
    })
  }

  /**
   * 条件查询（传入属性即条件，不传查全部）
   * 例：query({ name: "xxx" }) → WHERE name='xxx'
   *     query({}) → 查全部
   */
  async query(filters: Partial<{ id: string; game_id: number; name: string; data: string }> = {}) {
    const where: any = {}

    for (const key of Object.keys(filters)) {
      const val = (filters as any)[key]
      if (val !== undefined && val !== null) {
        where[key] = val // 默认全部 '=' 条件
      }
    }

    const result = await SaveModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })
    return result.map((item) => item.toJSON())
  }
}
