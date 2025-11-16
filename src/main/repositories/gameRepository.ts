import GameModel from '../models/GameModel'

export class GameRepository {
  /**
   * 创建游戏
   */
  async create(gameData: { name: string; data: string }) {
    return await GameModel.create(gameData)
  }

  /**
   * 删除游戏
   */
  async delete(id: string) {
    return await GameModel.destroy({
      where: { id }
    })
  }

  /**
   * 更新游戏
   */
  async update(id: string, updateData: Partial<{ name: string; data: string }>) {
    return await GameModel.update(updateData, {
      where: { id }
    })
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

    const result = await GameModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })
    return result.map((item) => item.toJSON())
  }
}
