import { ipcMain } from 'electron'
import { WorkService } from '../services/workService'

export class WorkController {
  private workService: WorkService

  constructor({ workService }) {
    this.workService = workService
  }

  register() {
    ipcMain.handle('work:create', (_, payload) => this.workService.createWork(payload))
    ipcMain.handle('work:delete', (_, id) => this.workService.deleteWork(id))
    ipcMain.handle('work:update', (_, id, payload) => this.workService.updateWork(id, payload))
    ipcMain.handle('work:get', (_, id, includeScore) => this.workService.getWork(id, includeScore))
    ipcMain.handle('work:query', (_, filters) => this.workService.queryWorks(filters))
    ipcMain.handle('work:list', () => this.workService.listWorks())
    ipcMain.handle('work:searchByName', (_, name) => this.workService.searchByName(name))
    ipcMain.handle('work:extractScore', (_, id) => this.workService.extractScore(id))
  }
}
