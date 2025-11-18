// src/main/services/workService.ts

import { WorkRepository } from '../repositories/workRepository'

export class WorkService {
  private workRepository: WorkRepository

  constructor({ workRepository }) {
    this.workRepository = workRepository
  }

  /** 创建 */
  async createWork(payload: { name: string; data: string }) {
    const data = await this.workRepository.create(payload)
    return { success: true, data }
  }

  /** 删除 */
  async deleteWork(id: string) {
    const data = await this.workRepository.delete(id)
    return { success: true, data }
  }

  /** 更新 */
  async updateWork(id: string, payload: Partial<{ name: string; data: string }>) {
    const data = await this.workRepository.update(id, payload)
    return { success: true, data }
  }

  /** 条件查询 */
  async queryWorks(filters: Partial<{ id: string; name: string; data: string }>) {
    const data = await this.workRepository.query(filters)
    return { success: true, data }
  }

  /** 查询全部 */
  async listWorks() {
    const data = await this.workRepository.query({})
    return { success: true, data }
  }
}
