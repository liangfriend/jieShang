import { is } from '@electron-toolkit/utils'
import { BrowserWindow, globalShortcut } from 'electron'

const DEVTOOLS_DOCK_MODE: Electron.OpenDevToolsOptions['mode'] = 'right'

function toggleDevTools(win: BrowserWindow) {
  const { webContents } = win
  if (webContents.isDevToolsOpened()) {
    webContents.closeDevTools()
  } else {
    webContents.openDevTools({ mode: DEVTOOLS_DOCK_MODE, activate: true })
  }
}

export function initShortcut(win: BrowserWindow) {
  globalShortcut.register('F5', () => {
    if (win) {
      win.reload()
    }
  })

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return

    // 打包后也可用：Ctrl+Shift+L 开关开发者工具
    if (input.control && input.shift && input.code === 'KeyL') {
      event.preventDefault()
      toggleDevTools(win)
      return
    }

    if (!is.dev) {
      if (input.code === 'KeyR' && (input.control || input.meta)) {
        event.preventDefault()
      }
      if (input.code === 'KeyI' && ((input.alt && input.meta) || (input.control && input.shift))) {
        event.preventDefault()
      }
      return
    }

    if (input.code === 'F12') {
      event.preventDefault()
      toggleDevTools(win)
    }
  })
}
