import { WorkRepository } from '../repositories/workRepository'

export class WorkService {
  private workRepository: WorkRepository

  constructor({ workRepository }) {
    this.workRepository = workRepository
  }

  async createWork(payload: { name: string; score_id?: number | null; data?: string }) {
    const data = await this.workRepository.create(payload)
    return { success: true, data }
  }

  async deleteWork(id: string | number) {
    const data = await this.workRepository.delete(id)
    return { success: true, data }
  }

  async updateWork(
    id: string | number,
    payload: Partial<{ name: string; score_id: number | null; data: string }>
  ) {
    const data = await this.workRepository.update(id, payload)
    return { success: true, data }
  }

  async getWork(id: string | number, includeScore = false) {
    const data = await this.workRepository.findById(id, includeScore)
    return { success: true, data }
  }

  async queryWorks(filters: Partial<{ id: string | number; name: string; score_id: number }>) {
    const data = await this.workRepository.query(filters)
    return { success: true, data }
  }

  async listWorks() {
    const data = await this.workRepository.query({})
    return { success: true, data }
  }

  async searchByName(name: string) {
    const data = await this.workRepository.searchByName(name)
    return { success: true, data }
  }

  async extractScore(workId: string | number) {
    const data = await this.workRepository.extractScore(workId)
    return { success: true, data }
  }
}
