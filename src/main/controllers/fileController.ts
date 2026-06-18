import { BrowserWindow, ipcMain } from 'electron'

export class FileController {
  private fileService

  constructor({ fileService }) {
    this.fileService = fileService
  }

  register() {
    ipcMain.handle('file:upload', async (_, buffer, originalName, type, displayName) => {
      return await this.fileService.saveResource(
        Buffer.from(buffer),
        originalName,
        type,
        displayName
      )
    })

    ipcMain.handle('file:delete', (_, url: string) => {
      return this.fileService.deleteResourceByUrl(url)
    })

    ipcMain.handle('file:importSj', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.importSj(window)
    })

    ipcMain.handle('file:exportSj', (event, content: string, defaultName?: string) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.exportSj(content, defaultName, window)
    })

    ipcMain.handle('file:importMusicXml', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.importMusicXml(window)
    })

    ipcMain.handle('file:exportMusicXml', (event, content: string, defaultName?: string) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.exportMusicXml(content, defaultName, window)
    })
  }
}
