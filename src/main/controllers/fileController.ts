import { BrowserWindow, ipcMain } from 'electron'

export class FileController {
  private fileService
  private resourceService

  constructor({ fileService, resourceService }) {
    this.fileService = fileService
    this.resourceService = resourceService
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

    ipcMain.handle('file:delete', (_, id) => {
      return this.fileService.deleteResource(id)
    })

    ipcMain.handle('file:query', (_, query) => {
      return this.fileService.queryResources(query)
    })

    ipcMain.handle('file:importSj', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.importSj(window)
    })

    ipcMain.handle('file:exportSj', (event, content: string, defaultName?: string) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      return this.fileService.exportSj(content, defaultName, window)
    })
  }
}
