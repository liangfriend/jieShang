// src/main/services/resourceService.ts
import { ResourceRepository } from '../repositories/resourceRepository'

export class ResourceService {
  private resourceRepository

  constructor({ resourceRepository }: { resourceRepository: ResourceRepository }) {
    this.resourceRepository = resourceRepository
  }

  /** 创建 */
  async createResource(payload: { name: string; type: 'image' | 'audio' | 'video'; url: string }) {
    const data = await this.resourceRepository.create(payload)
    return { success: true, data }
  }

  /** 删除 */
  async deleteResource(id: string) {
    const data = await this.resourceRepository.delete(id)
    return { success: true, data }
  }

  /** 更新 */
  async updateResource(
    id: string,
    payload: Partial<{ name: string; type: 'image' | 'audio' | 'video'; url: string }>
  ) {
    const data = await this.resourceRepository.update(id, payload)
    return { success: true, data }
  }

  /** 条件查询 */
  async queryResources(
    filters: Partial<{ id: string; name: string; type: 'image' | 'audio' | 'video'; url: string }>
  ) {
    const data = await this.resourceRepository.query(filters)
    return { success: true, data }
  }

  /** 查询全部 */
  async listResources() {
    const data = await this.resourceRepository.query({})
    return { success: true, data }
  }
}
