import './utils/ensureUtf8Console'
import fs from 'node:fs'
import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'node:url'
import { electronApp, is } from '@electron-toolkit/utils'
import iconPng from '../../resources/icon.png?asset'
import { initShortcut } from './utils/shortcutManager'
import { registerController } from './register'
import pathManager from './utils/pathManager'
import sequelize from './database/connection'
import { enableSteamOverlay, initSteam } from './steam/initSteam'
import { pullCloudSaveIfNeeded, pushCloudSave } from './steam/steamCloudSave'

enableSteamOverlay()

const APP_TITLE = '解熵'

/** Windows 标题栏/任务栏优先 .ico；没有则用 resources/icon.png */
function resolveAppIcon(): string {
  const icoPath = iconPng.replace(/icon\.png$/i, 'icon.ico')
  if (typeof icoPath === 'string' && fs.existsSync(icoPath)) return icoPath
  return iconPng
}

// 注册协议
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app-image',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    }
  }
])

function registerAppImageProtocol() {
  // 协议处理
  protocol.handle('app-image', async (request) => {
    try {
      const rel = pathManager.fromAppImageUrl(request.url)
      const abs = pathManager.resolveResourceRelative(rel)
      if (!fs.existsSync(abs)) {
        return new Response(null, { status: 404, statusText: 'Not Found' })
      }
      return net.fetch(pathToFileURL(abs).href)
    } catch {
      return new Response(null, { status: 400, statusText: 'Bad Request' })
    }
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    title: APP_TITLE,
    icon: resolveAppIcon(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })
  mainWindow.setTitle(APP_TITLE)
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })
  initShortcut(mainWindow)
  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: 'right', activate: true })
  }
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
  initSteam()
  registerAppImageProtocol()
  await pullCloudSaveIfNeeded()
  await registerController()
  app.setName(APP_TITLE)
  electronApp.setAppUserModelId('com.jieshang.app')

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

let cloudSaveOnQuitHandled = false

app.on('before-quit', (event) => {
  if (cloudSaveOnQuitHandled) return

  event.preventDefault()
  cloudSaveOnQuitHandled = true

  void (async () => {
    try {
      await pushCloudSave(sequelize)
    } finally {
      app.exit(0)
    }
  })()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
