import { ipcMain } from 'electron'
import { VideoService } from '../services/videoService'

export class VideoController {
  private videoService: VideoService

  constructor({ videoService }) {
    this.videoService = videoService
  }

  register() {
    ipcMain.handle('video:create', (_, payload) => {
      const file = payload?.file != null ? Buffer.from(payload.file) : payload?.file
      return this.videoService.create({
        ...payload,
        file
      })
    })
    ipcMain.handle('video:delete', (_, id) => this.videoService.delete(id))
    ipcMain.handle('video:update', (_, id, payload) => this.videoService.update(id, payload))
    ipcMain.handle('video:get', (_, id) => this.videoService.get(id))
    ipcMain.handle('video:query', (_, filters) => this.videoService.query(filters))
    ipcMain.handle('video:list', () => this.videoService.list())
    ipcMain.handle('video:searchByName', (_, name) => this.videoService.searchByName(name))
  }
}
