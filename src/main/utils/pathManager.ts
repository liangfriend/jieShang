import { app } from 'electron'
import path from 'path'
import fs from 'fs'

class PathManager {
  private isDev: boolean
  private userDataPath: string
  private basePath: string

  constructor() {
    this.isDev = !app.isPackaged

    if (this.isDev) {
      // 🔥 开发环境：使用项目根目录下的 .dev-data
      this.userDataPath = path.join(process.cwd(), '.dev-data')
    } else {
      // 生产环境：仍然使用系统 userData
      this.userDataPath = app.getPath('userData')
    }

    // 开发环境：使用项目根目录作为基础
    // 生产环境：使用打包后的 resourcesPath
    this.basePath = this.isDev ? process.cwd() : process.resourcesPath

    this.ensureBaseDirectories()
  }

  /** 项目根路径 */
  getProjectRoot() {
    return this.basePath
  }

  /** 获取数据库路径 */
  getDatabasePath() {
    const dbDir = path.join(this.userDataPath, 'database')
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

    return path.join(dbDir, 'app.db')
  }

  /** 藏品缩略图目录：userData/resources/image/collection */
  getCollectionThumbnailDir() {
    const dir = path.join(this.getResourceDir('image'), 'collection')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  /** 安装包内置缩略图源目录 */
  getBundledThumbnailsDir() {
    return this.isDev
      ? path.join(process.cwd(), 'resources/collection-thumbnails')
      : path.join(process.resourcesPath, 'collection-thumbnails')
  }

  /** 相对 userData/resources 的路径 → 绝对路径（防目录穿越） */
  resolveResourceRelative(rel: string) {
    const base = path.resolve(this.getResourceDir('all'))
    const normalized = rel.replace(/\\/g, '/').replace(/^\/+/, '')
    const abs = path.resolve(base, normalized)
    if (abs !== base && !abs.startsWith(base + path.sep)) {
      throw new Error(`Invalid resource path: ${rel}`)
    }
    return abs
  }

  /** 相对 resources/image 的路径 → 绝对路径（防目录穿越） */
  resolveImageRelative(rel: string) {
    const base = path.resolve(this.getResourceDir('image'))
    const normalized = rel.replace(/\\/g, '/').replace(/^\/+/, '')
    const abs = path.resolve(base, normalized)
    if (abs !== base && !abs.startsWith(base + path.sep)) {
      throw new Error(`Invalid image path: ${rel}`)
    }
    return abs
  }

  toAppImageUrl(rel: string) {
    const normalized = rel.replace(/\\/g, '/').replace(/^\/+/, '')
    return `app-image://${normalized}`
  }

  fromAppImageUrl(url: string) {
    return decodeURIComponent(url.replace(/^app-image:\/\//, ''))
  }

  /** 资源目录路径 images/audio/video */
  getResourceDir(type: 'image' | 'audio' | 'video' | 'all') {
    const base = path.join(this.userDataPath, 'resources')

    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true })
    if (type === 'all') return base

    const sub = path.join(base, type)
    if (!fs.existsSync(sub)) fs.mkdirSync(sub, { recursive: true })
    return sub
  }

  /** 日志目录 */
  getLogDir() {
    const logDir = path.join(this.userDataPath, 'logs')
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    return logDir
  }

  /** 临时目录 */
  getTempDir() {
    const temp = path.join(this.userDataPath, 'temp')
    if (!fs.existsSync(temp)) fs.mkdirSync(temp, { recursive: true })
    return temp
  }

  /** 是否开发环境 */
  isDevelopment() {
    return this.isDev
  }

  /** 配置文件目录 */
  getConfigPath() {
    const configDir = path.join(this.userDataPath, 'config')
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })

    return path.join(configDir, 'settings.json')
  }

  /** 自动创建基础目录 */
  private ensureBaseDirectories() {
    const dirs = ['resources', 'database', 'logs', 'temp', 'config']

    for (const dir of dirs) {
      const fullPath = path.join(this.userDataPath, dir)
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true })
    }
  }
}

export const pathManager = new PathManager()
export default pathManager
