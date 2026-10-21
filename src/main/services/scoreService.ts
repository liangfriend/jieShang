import type { ScoreType } from '../models/ScoreModel'
import { ScoreRepository } from '../repositories/scoreRepository'

export class ScoreService {
  private scoreRepository: ScoreRepository

  constructor({ scoreRepository }) {
    this.scoreRepository = scoreRepository
  }

  async createScore(payload: { name: string; data?: string; type?: ScoreType }) {
    const data = await this.scoreRepository.create(payload)
    return { success: true, data }
  }

  async deleteScore(id: string | number) {
    const data = await this.scoreRepository.delete(id)
    return { success: true, data }
  }

  async updateScore(id: string | number, payload: Partial<{ name: string; data: string }>) {
    const data = await this.scoreRepository.update(id, payload)
    return { success: true, data }
  }

  async getScore(id: string | number) {
    const data = await this.scoreRepository.findById(id)
    return { success: true, data }
  }

  async queryScores(filters: Partial<{ id: string | number; name: string; type: ScoreType }>) {
    const data = await this.scoreRepository.query(filters)
    return { success: true, data }
  }

  async listScores(type?: ScoreType) {
    const data = await this.scoreRepository.listSummaries(type)
    return { success: true, data }
  }

  async searchByName(name: string, type?: ScoreType) {
    const data = await this.scoreRepository.searchByName(name, type)
    return { success: true, data }
  }
}
