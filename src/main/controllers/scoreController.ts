import { ipcMain } from 'electron'
import { ScoreService } from '../services/scoreService'

export class ScoreController {
  private scoreService: ScoreService

  constructor({ scoreService }) {
    this.scoreService = scoreService
  }

  register() {
    ipcMain.handle('score:create', (_, payload) => this.scoreService.createScore(payload))
    ipcMain.handle('score:delete', (_, id) => this.scoreService.deleteScore(id))
    ipcMain.handle('score:update', (_, id, payload) => this.scoreService.updateScore(id, payload))
    ipcMain.handle('score:get', (_, id) => this.scoreService.getScore(id))
    ipcMain.handle('score:query', (_, filters) => this.scoreService.queryScores(filters))
    ipcMain.handle('score:list', () => this.scoreService.listScores())
    ipcMain.handle('score:searchByName', (_, name) => this.scoreService.searchByName(name))
  }
}
