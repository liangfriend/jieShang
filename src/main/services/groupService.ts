import { GroupRepository } from '../repositories/groupRepository'

export class GroupService {
  private groupRepository: GroupRepository

  constructor({ groupRepository }) {
    this.groupRepository = groupRepository
  }

  /** 创建 */
  async createGroup(payload: {
    name: string
    data: string
    front_cover: string
    description: string
  }) {
    const result = await this.groupRepository.create(payload)
    return {
      success: true,
      data: result
    }
  }

  /** 删除 */
  async deleteGroup(id: string) {
    const result = await this.groupRepository.delete(id)
    return {
      success: true,
      data: result
    }
  }

  /** 更新 */
  async updateGroup(
    id: string,
    payload: Partial<{
      name: string
      data: string
      front_cover: string
      description: string
    }>
  ) {
    const result = await this.groupRepository.update(id, payload)
    return {
      success: true,
      data: result
    }
  }

  /** 条件查询 */
  async queryGroups(
    filters: Partial<{
      id: string
      name: string
      data: string
      front_cover: string
      description: string
    }>
  ) {
    const result = await this.groupRepository.query(filters)
    return {
      success: true,
      data: result
    }
  }

  /** 查询全部 */
  async listGroups() {
    const result = await this.groupRepository.query({})
    return {
      success: true,
      data: result
    }
  }
}
