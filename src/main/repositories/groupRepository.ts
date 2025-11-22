import GroupModel from '../models/GroupModel'

export class GroupRepository {
  /**
   * 创建游戏
   */
  async create(groupData: {
    name: string
    data: string
    front_cover: string
    description: string
  }) {
    const result = await GroupModel.create(groupData)
    return result.toJSON()
  }

  /**
   * 删除游戏
   */
  async delete(id: string) {
    const count = await GroupModel.destroy({
      where: { id }
    })
    return count
  }

  /**
   * 更新游戏
   */
  async update(
    id: string,
    updateData: Partial<{
      name: string
      data: string
      front_cover: string
      description: string
    }>
  ) {
    const [count] = await GroupModel.update(updateData, {
      where: { id }
    })
    if (count === 0) return null

    const updated = await GroupModel.findByPk(id)
    return updated ? updated.toJSON() : null
  }

  /**
   * 条件查询（传入属性即条件，不传查全部）
   * 例：query({ name: "xxx" }) → WHERE name='xxx'
   *     query({}) → 查全部
   */
  async query(
    filters: Partial<{
      id: string
      name: string
      data: string
      front_cover: string
      description: string
    }> = {}
  ) {
    const where: any = {}

    for (const key of Object.keys(filters)) {
      const val = (filters as any)[key]
      if (val !== undefined && val !== null) {
        where[key] = val // 默认全部 '=' 条件
      }
    }

    const result = await GroupModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })
    return result.map((item) => item.toJSON())
  }
}
