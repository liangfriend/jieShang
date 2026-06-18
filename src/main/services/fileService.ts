// src/main/services/fileService.ts
import fs from 'fs'
import path from 'path'
import { BrowserWindow, dialog } from 'electron'
import pathManager from '../utils/pathManager'

const SJ_FILTER = [{ name: 'SJ 曲谱', extensions: ['sj'] }] as const
const MUSICXML_FILTER = [{ name: 'MusicXML', extensions: ['xml', 'musicxml'] }] as const

export class FileService {
  /**
   * 保存文件到 userData/resources/{type}，返回 app-image 虚拟路径
   */
  async saveResource(
    fileBuffer: Buffer,
    originalName: string,
    type: 'image' | 'audio' | 'video',
    displayName: string
  ) {
    const targetDir = pathManager.getResourceDir(type)
    const ext = path.extname(originalName) || ''
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const finalPath = path.join(targetDir, safeName)

    fs.writeFileSync(finalPath, fileBuffer)

    const url = pathManager.toAppImageUrl(`${type}/${safeName}`)

    return {
      name: displayName,
      type,
      url
    }
  }

  /** 按 app-image 虚拟路径删除磁盘文件 */
  async deleteResourceByUrl(url: string) {
    const rel = pathManager.fromAppImageUrl(url)
    const filePath = pathManager.resolveResourceRelative(rel)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return { success: true }
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

  /** 通过系统对话框导入 MusicXML 文件 */
  async importMusicXml(window?: BrowserWindow | null) {
    const parent = window ?? BrowserWindow.getFocusedWindow() ?? undefined
    const { canceled, filePaths } = await dialog.showOpenDialog(parent, {
      title: '导入 MusicXML',
      filters: [...MUSICXML_FILTER],
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

  /** 通过系统对话框导出 MusicXML 文件 */
  async exportMusicXml(content: string, defaultName = '未命名曲谱', window?: BrowserWindow | null) {
    const parent = window ?? BrowserWindow.getFocusedWindow() ?? undefined
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名曲谱'
    const { canceled, filePath } = await dialog.showSaveDialog(parent, {
      title: '导出 MusicXML',
      defaultPath: `${safeName}.musicxml`,
      filters: [...MUSICXML_FILTER]
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
