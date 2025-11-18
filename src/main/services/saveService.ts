import { SaveRepository } from '../repositories/saveRepository'

export class SaveService {
  private saveRepository: SaveRepository

  constructor({ saveRepository }) {
    this.saveRepository = saveRepository
  }

  /** 创建 */
  async createSave(payload: { game_id: number; name: string; data: string }) {
    const data = await this.saveRepository.create(payload)
    return { success: true, data }
  }

  /** 删除 */
  async deleteSave(id: string) {
    const data = await this.saveRepository.delete(id)
    return { success: true, data }
  }

  /** 更新 */
  async updateSave(id: string, payload: Partial<{ game_id: number; name: string; data: string }>) {
    const data = await this.saveRepository.update(id, payload)
    return { success: true, data }
  }

  /** 条件查询 */
  async querySaves(filters: Partial<{ id: string; game_id: number; name: string; data: string }>) {
    const data = await this.saveRepository.query(filters)
    return { success: true, data }
  }

  /** 查询全部 */
  async listSaves() {
    const data = await this.saveRepository.query({})
    return { success: true, data }
  }
}
