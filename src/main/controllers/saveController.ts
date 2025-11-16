import { ipcMain } from 'electron'
import { SaveService } from '../services/saveService'

export class SaveController {
  private saveService: SaveService

  constructor({ saveService }) {
    this.saveService = saveService
  }

  register() {
    console.log('Save controller registered')

    ipcMain.handle('save:create', (_, payload) => this.createSave(payload))
    ipcMain.handle('save:delete', (_, id) => this.deleteSave(id))
    ipcMain.handle('save:update', (_, id, payload) => this.updateSave(id, payload))
    ipcMain.handle('save:query', (_, filters) => this.querySaves(filters))
    ipcMain.handle('save:list', () => this.listSaves())
  }

  async createSave(payload) {
    return await this.saveService.createSave(payload)
  }

  async deleteSave(id: string) {
    return await this.saveService.deleteSave(id)
  }

  async updateSave(id: string, payload) {
    return await this.saveService.updateSave(id, payload)
  }

  async querySaves(filters) {
    return await this.saveService.querySaves(filters)
  }

  async listSaves() {
    return await this.saveService.listSaves()
  }
}
