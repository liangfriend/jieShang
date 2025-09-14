import { BrowserWindow, globalShortcut } from 'electron'
export function initShortcut(win: BrowserWindow) {
  globalShortcut.register('F5', () => {
    if (win) {
      win.reload()
    }
  })
}
