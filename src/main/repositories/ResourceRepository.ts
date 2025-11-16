// src/main/repositories/resourceRepository.ts
import ResourceModel from '../models/ResourceModel'

export class ResourceRepository {
  /**
   * 创建资源
   */
  async create(resourceData: { name: string; type: 'image' | 'audio' | 'video'; url: string }) {
    return await ResourceModel.create(resourceData)
  }

  /**
   * 删除资源
   */
  async delete(id: string) {
    return await ResourceModel.destroy({
      where: { id }
    })
  }

  /**
   * 更新资源
   */
  async update(
    id: string,
    updateData: Partial<{ name: string; type: 'image' | 'audio' | 'video'; url: string }>
  ) {
    return await ResourceModel.update(updateData, {
      where: { id }
    })
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
      type: 'image' | 'audio' | 'video'
      url: string
    }> = {}
  ) {
    const where: any = {}

    for (const key of Object.keys(filters)) {
      const val = (filters as any)[key]
      if (val !== undefined && val !== null) {
        where[key] = val // 默认全部 '=' 条件
      }
    }

    const result = await ResourceModel.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    })
    return result.map((item) => item.toJSON())
  }
}
