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
