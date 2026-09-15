import { ipcMain } from 'electron'
import { WorkService } from '../services/workService'

export class WorkController {
  private workService: WorkService

  constructor({ workService }) {
    this.workService = workService
  }

  register() {
    ipcMain.handle('work:create', (_, payload) => {
      const file = payload?.file != null ? Buffer.from(payload.file) : payload?.file
      return this.workService.createWork({
        ...payload,
        file
      })
    })
    ipcMain.handle('work:delete', (_, id) => this.workService.deleteWork(id))
    ipcMain.handle('work:update', (_, id, payload) => {
      const next = { ...payload }
      if (payload?.file != null) {
        next.file = Buffer.from(payload.file)
      }
      return this.workService.updateWork(id, next)
    })
    ipcMain.handle('work:get', (_, id, includeScore) => this.workService.getWork(id, includeScore))
    ipcMain.handle('work:query', (_, filters) => this.workService.queryWorks(filters))
    ipcMain.handle('work:list', () => this.workService.listWorks())
    ipcMain.handle('work:searchByName', (_, name) => this.workService.searchByName(name))
    ipcMain.handle('work:extractScore', (_, id) => this.workService.extractScore(id))
  }
}
