import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'

const path = require('node:path')
const url = require('node:url')
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initShortcut } from './utils/shortcutManager'
import { setupContainer } from './container'
import { registerController } from './register'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })
  mainWindow.webContents.openDevTools({ mode: 'bottom', activate: true })
  initShortcut(mainWindow)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const isDev = process.env.NODE_ENV === 'development'
const VITE_DEV_SERVER_URL = isDev ? 'http://localhost:5173/' : undefined
process.env.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL

app.whenReady().then(async () => {
  await registerController()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
