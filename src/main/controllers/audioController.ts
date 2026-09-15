import { ipcMain } from 'electron'
import { AudioService } from '../services/audioService'

export class AudioController {
  private audioService: AudioService

  constructor({ audioService }) {
    this.audioService = audioService
  }

  register() {
    ipcMain.handle('audio:create', (_, payload) => {
      const file = payload?.file != null ? Buffer.from(payload.file) : payload?.file
      return this.audioService.createAudio({
        ...payload,
        file
      })
    })
    ipcMain.handle('audio:delete', (_, id) => this.audioService.deleteAudio(id))
    ipcMain.handle('audio:update', (_, id, payload) => this.audioService.updateAudio(id, payload))
    ipcMain.handle('audio:get', (_, id) => this.audioService.getAudio(id))
    ipcMain.handle('audio:query', (_, filters) => this.audioService.queryAudios(filters))
    ipcMain.handle('audio:list', () => this.audioService.listAudios())
    ipcMain.handle('audio:searchByName', (_, name) => this.audioService.searchByName(name))
  }
}
