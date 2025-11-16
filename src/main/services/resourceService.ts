// src/main/services/resourceService.ts
export class ResourceService {
  private resourceRepository

  constructor({ resourceRepository }) {
    this.resourceRepository = resourceRepository
  }

  /** 创建 */
  async createResource(payload: { name: string; type: 'image' | 'audio' | 'video'; url: string }) {
    return await this.resourceRepository.create(payload)
  }

  /** 删除 */
  async deleteResource(id: string) {
    return await this.resourceRepository.delete(id)
  }

  /** 更新 */
  async updateResource(
    id: string,
    payload: Partial<{ name: string; type: 'image' | 'audio' | 'video'; url: string }>
  ) {
    return await this.resourceRepository.update(id, payload)
  }

  /** 条件查询 */
  async queryResources(
    filters: Partial<{ id: string; name: string; type: 'image' | 'audio' | 'video'; url: string }>
  ) {
    return await this.resourceRepository.query(filters)
  }

  /** 查询全部 */
  async listResources() {
    return await this.resourceRepository.query({})
  }
}
