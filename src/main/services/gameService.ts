import { GameRepository } from '../repositories/gameRepository'

export class GameService {
  private gameRepository: GameRepository

  constructor({ gameRepository }) {
    this.gameRepository = gameRepository
  }

  /** 创建 */
  async createGame(payload: { name: string; data: string }) {
    return await this.gameRepository.create(payload)
  }

  /** 删除 */
  async deleteGame(id: string) {
    return await this.gameRepository.delete(id)
  }

  /** 更新 */
  async updateGame(id: string, payload: Partial<{ name: string; data: string }>) {
    return await this.gameRepository.update(id, payload)
  }

  /** 条件查询 */
  async queryGames(filters: Partial<{ id: string; name: string; data: string }>) {
    return await this.gameRepository.query(filters)
  }

  /** 查询全部 */
  async listGames() {
    return await this.gameRepository.query({})
  }
}
