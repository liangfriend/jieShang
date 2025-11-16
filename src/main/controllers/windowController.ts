import { ipcMain } from 'electron'
import { windowManager } from '../utils/windowManager'

export class WindowController {
  register() {
    ipcMain.handle('window:open', (_, name: string, route: string, options = {}) => {
      return windowManager.create(name, route, options)
    })

    ipcMain.handle('window:close', (_, name: string) => {
      windowManager.close(name)
    })

    ipcMain.handle('window:focus', (_, name: string) => {
      windowManager.focus(name)
    })

    ipcMain.handle('window:get', (_, name: string) => {
      const win = windowManager.get(name)
      return !!win
    })
  }
}
