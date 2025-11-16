// src/main/services/workService.ts

import { WorkRepository } from '../repositories/workRepository'

export class WorkService {
  private workRepository: WorkRepository

  constructor({ workRepository }) {
    this.workRepository = workRepository
  }

  /** 创建 */
  async createWork(payload: { name: string; data: string }) {
    return await this.workRepository.create(payload)
  }

  /** 删除 */
  async deleteWork(id: string) {
    return await this.workRepository.delete(id)
  }

  /** 更新 */
  async updateWork(id: string, payload: Partial<{ name: string; data: string }>) {
    return await this.workRepository.update(id, payload)
  }

  /** 条件查询 */
  async queryWorks(filters: Partial<{ id: string; name: string; data: string }>) {
    return await this.workRepository.query(filters)
  }

  /** 查询全部 */
  async listWorks() {
    return await this.workRepository.query({})
  }
}
