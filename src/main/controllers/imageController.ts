import { ipcMain } from 'electron'
import { ImageService } from '../services/imageService'

export class ImageController {
  private imageService: ImageService

  constructor({ imageService }) {
    this.imageService = imageService
  }

  register() {
    ipcMain.handle('image:create', (_, payload) => {
      const file = payload?.file != null ? Buffer.from(payload.file) : payload?.file
      return this.imageService.create({
        ...payload,
        file
      })
    })
    ipcMain.handle('image:delete', (_, id) => this.imageService.delete(id))
    ipcMain.handle('image:update', (_, id, payload) => this.imageService.update(id, payload))
    ipcMain.handle('image:get', (_, id) => this.imageService.get(id))
    ipcMain.handle('image:query', (_, filters) => this.imageService.query(filters))
    ipcMain.handle('image:list', () => this.imageService.list())
    ipcMain.handle('image:searchByName', (_, name) => this.imageService.searchByName(name))
  }
}
