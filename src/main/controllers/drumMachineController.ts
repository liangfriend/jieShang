import { ipcMain } from 'electron'
import { DrumMachineService } from '../services/drumMachineService'

export class DrumMachineController {
  private drumMachineService: DrumMachineService

  constructor({ drumMachineService }) {
    this.drumMachineService = drumMachineService
  }

  register() {
    ipcMain.handle('drumMachine:create', (_, payload) => this.drumMachineService.create(payload))
    ipcMain.handle('drumMachine:delete', (_, id) => this.drumMachineService.delete(id))
    ipcMain.handle('drumMachine:update', (_, id, payload) =>
      this.drumMachineService.update(id, payload)
    )
    ipcMain.handle('drumMachine:get', (_, id) => this.drumMachineService.get(id))
    ipcMain.handle('drumMachine:list', (_, keyword) => this.drumMachineService.list(keyword))
  }
}
