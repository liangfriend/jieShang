// src/main/services/fileService.ts
import fs from 'fs'
import path from 'path'
import { BrowserWindow, dialog } from 'electron'
import pathManager from '../utils/pathManager'
import { ResourceService } from './resourceService'

const SJ_FILTER = [{ name: 'SJ 曲谱', extensions: ['sj'] }] as const

export class FileService {
  private resourceService: ResourceService

  constructor({ resourceService }: { resourceService: ResourceService }) {
    this.resourceService = resourceService
  }

  /**
   * 保存文件到磁盘 + 创建 resource 记录
   */
  async saveResource(
    fileBuffer: Buffer,
    originalName: string, // file.name，例如 "test.png"
    type: 'image' | 'audio' | 'video',
    displayName: string // 例如 "背景图1"
  ) {
    const targetDir = pathManager.getResourceDir(type)

    // 正确解析用户实际上传文件的扩展名
    const ext = path.extname(originalName) || ''

    // 随机生成文件名（不会覆盖）
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const finalPath = path.join(targetDir, safeName)

    fs.writeFileSync(finalPath, fileBuffer)

    const url = `file://${finalPath}`

    // 写入数据库使用展示名
    const record = (
      await this.resourceService.createResource({
        name: displayName,
        type,
        url
      })
    ).data

    return {
      id: record.id,
      name: record.name,
      type: record.type,
      url: record.url
    }
  }

  /**
   * 删除资源文件 + 删除 resource 表记录
   */
  async deleteResource(id: number) {
    // 用 ResourceService 查询
    const list = await this.resourceService.queryResources({ id: String(id) })
    const record = list[0]
    if (!record) return false

    const filePath = record.url.replace('file://', '')

    // 删除文件
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // 删除数据库记录
    const res = await this.resourceService.deleteResource(String(id))

    return { success: true, data: res }
  }

  /**
   * 仅查询资源（调用 ResourceService）
   */
  async queryResources(condition: any) {
    const res = await this.resourceService.queryResources(condition)
    return { success: true, data: res }
  }

  /**
   * 更新资源记录（不修改文件）
   */
  async updateResource(id: number, data: any) {
    const res = await this.resourceService.updateResource(String(id), data)
    return { success: true, data: res }
  }

  /** 通过系统对话框导入 .sj 曲谱文件 */
  async importSj(window?: BrowserWindow | null) {
    const parent = window ?? BrowserWindow.getFocusedWindow() ?? undefined
    const { canceled, filePaths } = await dialog.showOpenDialog(parent, {
      title: '导入 SJ 曲谱',
      filters: [...SJ_FILTER],
      properties: ['openFile']
    })

    if (canceled || !filePaths[0]) {
      return { canceled: true as const }
    }

    const filePath = filePaths[0]
    const content = fs.readFileSync(filePath, 'utf-8')

    return {
      canceled: false as const,
      filePath,
      fileName: path.basename(filePath),
      content
    }
  }

  /** 通过系统对话框导出 .sj 曲谱文件 */
  async exportSj(content: string, defaultName = '未命名曲谱', window?: BrowserWindow | null) {
    const parent = window ?? BrowserWindow.getFocusedWindow() ?? undefined
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名曲谱'
    const { canceled, filePath } = await dialog.showSaveDialog(parent, {
      title: '导出 SJ 曲谱',
      defaultPath: `${safeName}.sj`,
      filters: [...SJ_FILTER]
    })

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      canceled: false as const,
      filePath
    }
  }
}
