import type { GameService } from '../services/gameService'
import { ipcMain } from 'electron'

export class GameController {
  private gameService: GameService

  constructor({ gameService }) {
    this.gameService = gameService
  }

  register() {
    console.log('Game controller registered')

    ipcMain.handle('game:create', (_, payload) => this.createGame(payload))
    ipcMain.handle('game:delete', (_, id) => this.deleteGame(id))
    ipcMain.handle('game:update', (_, id, payload) => this.updateGame(id, payload))
    ipcMain.handle('game:query', (_, filters) => this.queryGames(filters))
    ipcMain.handle('game:list', () => this.listGames())
  }

  async createGame(payload) {
    return await this.gameService.createGame(payload)
  }

  async deleteGame(id: string) {
    return await this.gameService.deleteGame(id)
  }

  async updateGame(id: string, payload) {
    return await this.gameService.updateGame(id, payload)
  }

  async queryGames(filters) {
    return await this.gameService.queryGames(filters)
  }

  async listGames() {
    return await this.gameService.listGames()
  }
}
