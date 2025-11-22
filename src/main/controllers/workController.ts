import { ipcMain } from 'electron'
import { WorkService } from '../services/workService'

export class WorkController {
  private workService: WorkService

  constructor({ workService }) {
    this.workService = workService
  }

  register() {
    console.log('Work controller registered')

    ipcMain.handle('work:create', (_, payload) => this.createWork(payload))
    ipcMain.handle('work:delete', (_, id) => this.deleteWork(id))
    ipcMain.handle('work:update', (_, id, payload) => this.updateWork(id, payload))
    ipcMain.handle('work:query', (_, filters) => this.queryWorks(filters))
    ipcMain.handle('work:list', () => this.listWorks())
  }

  async createWork(payload) {
    return await this.workService.createWork(payload)
  }

  async deleteWork(id: string) {
    return await this.workService.deleteWork(id)
  }

  async updateWork(id: string, payload) {
    return await this.workService.updateWork(id, payload)
  }

  async queryWorks(filters) {
    return await this.workService.queryWorks(filters)
  }

  async listWorks() {
    return await this.workService.listWorks()
  }
}
