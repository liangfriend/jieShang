// src/main/controllers/resourceController.ts
import { ipcMain } from 'electron'

export class ResourceController {
  private resourceService

  constructor({ resourceService }) {
    this.resourceService = resourceService
  }

  register() {
    console.log('Resource controller registered')

    ipcMain.handle('resource:create', (_, payload) => this.createResource(payload))
    ipcMain.handle('resource:delete', (_, id) => this.deleteResource(id))
    ipcMain.handle('resource:update', (_, id, payload) => this.updateResource(id, payload))
    ipcMain.handle('resource:query', (_, filters) => this.queryResources(filters))
    ipcMain.handle('resource:list', () => this.listResources())
  }

  async createResource(payload) {
    return await this.resourceService.createResource(payload)
  }

  async deleteResource(id: string) {
    return await this.resourceService.deleteResource(id)
  }

  async updateResource(id: string, payload) {
    return await this.resourceService.updateResource(id, payload)
  }

  async queryResources(filters) {
    return await this.resourceService.queryResources(filters)
  }

  async listResources() {
    return await this.resourceService.listResources()
  }
}
