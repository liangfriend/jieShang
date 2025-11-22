import type { GroupService } from '../services/groupService'
import { ipcMain } from 'electron'

export class GroupController {
  private groupService: GroupService

  constructor({ groupService }) {
    this.groupService = groupService
  }

  register() {
    console.log('Group controller registered')

    ipcMain.handle('group:create', (_, payload) => this.createGroup(payload))
    ipcMain.handle('group:delete', (_, id) => this.deleteGroup(id))
    ipcMain.handle('group:update', (_, id, payload) => this.updateGroup(id, payload))
    ipcMain.handle('group:query', (_, filters) => this.queryGroups(filters))
    ipcMain.handle('group:list', () => this.listGroups())
  }

  async createGroup(payload) {
    return await this.groupService.createGroup(payload)
  }

  async deleteGroup(id: string) {
    return await this.groupService.deleteGroup(id)
  }

  async updateGroup(id: string, payload) {
    return await this.groupService.updateGroup(id, payload)
  }

  async queryGroups(filters) {
    return await this.groupService.queryGroups(filters)
  }

  async listGroups() {
    return await this.groupService.listGroups()
  }
}
