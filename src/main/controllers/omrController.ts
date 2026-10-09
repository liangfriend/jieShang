import { app, ipcMain } from 'electron'
import { OmrService } from '../services/omrService'

export class OmrController {
  private omrService: OmrService

  constructor({ omrService }) {
    this.omrService = omrService
  }

  register() {
    ipcMain.handle('omr:recognize', (_, image: Uint8Array) =>
      this.omrService.recognize(Buffer.from(image))
    )
    app.on('before-quit', () => void this.omrService.terminate())
  }
}
