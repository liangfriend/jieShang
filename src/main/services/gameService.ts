import { GameRepository } from '../repositories/gameRepository'

export class GameService {
  private gameRepository: GameRepository

  constructor({ gameRepository }) {
    this.gameRepository = gameRepository
  }

  /** 创建 */
  async createGame(payload: {
    name: string
    data: string
    front_cover: string
    description: string
  }) {
    const result = await this.gameRepository.create(payload)
    return {
      success: true,
      data: result
    }
  }

  /** 删除 */
  async deleteGame(id: string) {
    const result = await this.gameRepository.delete(id)
    return {
      success: true,
      data: result
    }
  }

  /** 更新 */
  async updateGame(
    id: string,
    payload: Partial<{
      name: string
      data: string
      front_cover: string
      description: string
    }>
  ) {
    const result = await this.gameRepository.update(id, payload)
    return {
      success: true,
      data: result
    }
  }

  /** 条件查询 */
  async queryGames(
    filters: Partial<{
      id: string
      name: string
      data: string
      front_cover: string
      description: string
    }>
  ) {
    const result = await this.gameRepository.query(filters)
    return {
      success: true,
      data: result
    }
  }

  /** 查询全部 */
  async listGames() {
    const result = await this.gameRepository.query({})
    return {
      success: true,
      data: result
    }
  }
}
