import { app, BrowserWindow, globalShortcut } from 'electron'
import path from 'path'
import { initShortcut } from './shortcutManager'
import { getLogger } from './log'
import { is } from '@electron-toolkit/utils'

const logger = getLogger('game-window')

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()

  /**
   * 获取窗口，如果不存在则返回 null
   */
  get(name: string) {
    return this.windows.get(name) || null
  }

  /**
   * 创建窗口，如果存在同名窗口就直接聚焦
   */
  create(name: string, route: string, options: Electron.BrowserWindowConstructorOptions = {}) {
    // 若已存在窗口，则聚焦并返回
    const exist = this.windows.get(name)
    if (exist) {
      if (exist.isMinimized()) exist.restore()
      exist.focus()
      return exist
    }
    logger.info('start')
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      title: name,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
        webSecurity: false
      },
      ...options
    })
    logger.info('start')
    // dev / build 两种模式
    const routeNormalized = route.startsWith('#') ? route.slice(1) : route

    const isDev = is.dev
    const basePath = isDev
      ? process.env.ELECTRON_RENDERER_URL // electron-vite 自动提供
      : `file://${path.join(__dirname, '..', 'renderer', 'index.html')}`

    win.loadURL(`${basePath}#${routeNormalized}`)

    logger.info(`path:${basePath}#${routeNormalized}`)
    // 窗口关闭时删除引用
    win.on('closed', () => {
      this.windows.delete(name)
    })

    this.windows.set(name, win)
    return true
  }

  /**
   * 关闭窗口
   */
  close(name: string) {
    const win = this.windows.get(name)
    if (win) {
      win.close()
      this.windows.delete(name)
    }
  }

  /**
   * 聚焦窗口
   */
  focus(name: string) {
    const win = this.windows.get(name)
    if (win) win.focus()
  }
}

export const windowManager = new WindowManager()
