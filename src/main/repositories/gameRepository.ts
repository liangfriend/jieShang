import GameModel from '../models/GameModel'
import { Op } from 'sequelize'

export class GameRepository {
  /**
   * 创建游戏
   */
  async create(gameData: { name: string; data: string; front_cover: string; description: string }) {
    const result = await GameModel.create(gameData)
    return result.toJSON()
  }

  /**
   * 删除游戏
   */
  async delete(id: string) {
    const count = await GameModel.destroy({
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
    const [count] = await GameModel.update(updateData, {
      where: { id }
    })
    if (count === 0) return null

    const updated = await GameModel.findByPk(id)
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

    const result = await GameModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })
    return result.map((item) => item.toJSON())
  }
  /**
   * 根据 name 进行模糊匹配查询
   * 例：searchByName("abc") → name LIKE '%abc%'
   */
  async searchByName(keyword: string) {
    const result = await GameModel.findAll({
      where: {
        name: {
          [Op.like]: `%${keyword}%`
        }
      }
    })

    return result.map((item) => item.toJSON())
  }
}
