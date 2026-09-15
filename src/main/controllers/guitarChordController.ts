import { ipcMain } from 'electron'
import { GuitarChordService } from '../services/guitarChordService'

export class GuitarChordController {
  private guitarChordService: GuitarChordService

  constructor({ guitarChordService }) {
    this.guitarChordService = guitarChordService
  }

  register() {
    ipcMain.handle('guitarChord:create', (_, payload) =>
      this.guitarChordService.createChord(payload)
    )
    ipcMain.handle('guitarChord:delete', (_, id) => this.guitarChordService.deleteChord(id))
    ipcMain.handle('guitarChord:update', (_, id, payload) =>
      this.guitarChordService.updateChord(id, payload)
    )
    ipcMain.handle('guitarChord:get', (_, id) => this.guitarChordService.getChord(id))
    ipcMain.handle('guitarChord:list', () => this.guitarChordService.listChords())
    ipcMain.handle('guitarChord:searchByName', (_, name) =>
      this.guitarChordService.searchByName(name)
    )
  }
}
