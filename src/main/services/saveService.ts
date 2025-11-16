import { SaveRepository } from '../repositories/saveRepository'

export class SaveService {
  private saveRepository: SaveRepository

  constructor({ saveRepository }) {
    this.saveRepository = saveRepository
  }

  /** 创建 */
  async createSave(payload: { game_id: number; name: string; data: string }) {
    return await this.saveRepository.create(payload)
  }

  /** 删除 */
  async deleteSave(id: string) {
    return await this.saveRepository.delete(id)
  }

  /** 更新 */
  async updateSave(id: string, payload: Partial<{ game_id: number; name: string; data: string }>) {
    return await this.saveRepository.update(id, payload)
  }

  /** 条件查询 */
  async querySaves(filters: Partial<{ id: string; game_id: number; name: string; data: string }>) {
    return await this.saveRepository.query(filters)
  }

  /** 查询全部 */
  async listSaves() {
    return await this.saveRepository.query({})
  }
}
