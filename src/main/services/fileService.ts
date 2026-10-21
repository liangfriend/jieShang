// src/main/services/fileService.ts
import fs from 'fs'
import path from 'path'
import { BrowserWindow, dialog } from 'electron'
import pathManager from '../utils/pathManager'

const SJ_FILTER: Electron.FileFilter[] = [{ name: 'SJ 曲谱', extensions: ['sj'] }]
const MUSICXML_FILTER: Electron.FileFilter[] = [
  { name: 'MusicXML', extensions: ['xml', 'musicxml'] }
]
const MIDI_FILTER: Electron.FileFilter[] = [{ name: 'MIDI', extensions: ['mid', 'midi'] }]
const CL_SHEET_FILTER: Electron.FileFilter[] = [{ name: '和弦弹唱谱 JSON', extensions: ['json'] }]
const JSON_FILTER: Electron.FileFilter[] = [{ name: 'JSON', extensions: ['json'] }]
function getDialogParent(window?: BrowserWindow | null): BrowserWindow | null {
  return window ?? BrowserWindow.getFocusedWindow()
}

function showOpenDialog(options: Electron.OpenDialogOptions, window?: BrowserWindow | null) {
  const parent = getDialogParent(window)
  return parent ? dialog.showOpenDialog(parent, options) : dialog.showOpenDialog(options)
}

function showSaveDialog(options: Electron.SaveDialogOptions, window?: BrowserWindow | null) {
  const parent = getDialogParent(window)
  return parent ? dialog.showSaveDialog(parent, options) : dialog.showSaveDialog(options)
}

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
    const { canceled, filePaths } = await showOpenDialog(
      {
        title: '导入 SJ 曲谱',
        filters: SJ_FILTER,
        properties: ['openFile']
      },
      window
    )

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
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名曲谱'
    const { canceled, filePath } = await showSaveDialog(
      {
        title: '导出 SJ 曲谱',
        defaultPath: `${safeName}.sj`,
        filters: [...SJ_FILTER]
      },
      window
    )

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      canceled: false as const,
      filePath
    }
  }

  /** 通过系统对话框导入和弦弹唱谱 .json 文件 */
  async importClSheet(window?: BrowserWindow | null) {
    const { canceled, filePaths } = await showOpenDialog(
      {
        title: '导入和弦弹唱谱',
        filters: CL_SHEET_FILTER,
        properties: ['openFile']
      },
      window
    )

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

  /** 通过系统对话框导出和弦弹唱谱 .json 文件 */
  async exportClSheet(content: string, defaultName = '未命名弹唱谱', window?: BrowserWindow | null) {
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名弹唱谱'
    const { canceled, filePath } = await showSaveDialog(
      {
        title: '导出和弦弹唱谱',
        defaultPath: `${safeName}.json`,
        filters: [...CL_SHEET_FILTER]
      },
      window
    )

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
    const { canceled, filePaths } = await showOpenDialog(
      {
        title: '导入 MusicXML',
        filters: MUSICXML_FILTER,
        properties: ['openFile']
      },
      window
    )

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
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名曲谱'
    const { canceled, filePath } = await showSaveDialog(
      {
        title: '导出 MusicXML',
        defaultPath: `${safeName}.musicxml`,
        filters: [...MUSICXML_FILTER]
      },
      window
    )

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      canceled: false as const,
      filePath
    }
  }

  /** 通过系统对话框导入 MIDI 文件（二进制） */
  async importMidi(window?: BrowserWindow | null) {
    const { canceled, filePaths } = await showOpenDialog(
      {
        title: '导入 MIDI',
        filters: MIDI_FILTER,
        properties: ['openFile']
      },
      window
    )

    if (canceled || !filePaths[0]) {
      return { canceled: true as const }
    }

    const filePath = filePaths[0]
    const buffer = fs.readFileSync(filePath)

    return {
      canceled: false as const,
      filePath,
      fileName: path.basename(filePath),
      content: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    }
  }

  /** 通过系统对话框导入 JSON 文本文件 */
  async importJson(title = '导入 JSON', window?: BrowserWindow | null) {
    const { canceled, filePaths } = await showOpenDialog(
      {
        title,
        filters: [...JSON_FILTER],
        properties: ['openFile']
      },
      window
    )

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

  /** 通过系统对话框导出 JSON 文本文件 */
  async exportJson(content: string, defaultName = 'export', title = '导出 JSON', window?: BrowserWindow | null) {
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || 'export'
    const { canceled, filePath } = await showSaveDialog(
      {
        title,
        defaultPath: `${safeName}.json`,
        filters: [...JSON_FILTER]
      },
      window
    )

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      canceled: false as const,
      filePath
    }
  }

  /** 通过系统对话框导出 MIDI 文件（二进制） */
  async exportMidi(content: Uint8Array, defaultName = '未命名曲谱', window?: BrowserWindow | null) {
    const safeName = defaultName.replace(/[<>:"/\\|?*]/g, '_').trim() || '未命名曲谱'
    const { canceled, filePath } = await showSaveDialog(
      {
        title: '导出 MIDI',
        defaultPath: `${safeName}.mid`,
        filters: [...MIDI_FILTER]
      },
      window
    )

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    fs.writeFileSync(filePath, Buffer.from(content))

    return {
      canceled: false as const,
      filePath
    }
  }
}
