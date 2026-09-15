import fs from 'fs'
import path from 'path'
import { AudioRepository } from '../repositories/audioRepository'
import pathManager from '../utils/pathManager'

export type AudioCreatePayload = {
  /** 用户展示名称 */
  name: string
  /** 文件二进制内容 */
  file: ArrayBuffer | Buffer | Uint8Array
  /** 原始文件名（仅用于取扩展名） */
  originalName?: string
}

function toBuffer(file: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(file)) return file
  if (file instanceof ArrayBuffer) return Buffer.from(file)
  return Buffer.from(file.buffer, file.byteOffset, file.byteLength)
}

function createUniqueFileName(originalName?: string): string {
  const ext = path.extname(originalName ?? '').toLowerCase()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
}

/** 仅删除落在音频目录内的文件 */
function removeAudioFileIfExists(url: string) {
  const fileName = path.basename(url)
  const filePath = pathManager.resolveAudioFileName(fileName)
  if (path.resolve(url) !== filePath) {
    return
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export class AudioService {
  private audioRepository: AudioRepository

  constructor({ audioRepository }) {
    this.audioRepository = audioRepository
  }

  /**
   * 保存音频文件到 resources/audio，写入库记录。
   * name 为展示名；url 为自动生成唯一文件名后的绝对路径。
   */
  async createAudio(payload: AudioCreatePayload) {
    const name = payload.name?.trim()
    if (!name) {
      return { success: false, error: 'name is required' }
    }
    if (!payload.file) {
      return { success: false, error: 'file is required' }
    }

    const fileName = createUniqueFileName(payload.originalName)
    const absPath = pathManager.resolveAudioFileName(fileName)
    const buffer = toBuffer(payload.file)

    fs.writeFileSync(absPath, buffer)

    try {
      const data = await this.audioRepository.create({
        name,
        url: absPath
      })
      return { success: true, data }
    } catch (error) {
      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath)
      }
      throw error
    }
  }

  /** 软删除库记录，并删除磁盘上对应文件（若存在） */
  async deleteAudio(id: string | number) {
    const row = await this.audioRepository.findById(id)
    if (!row) {
      return { success: false, error: 'audio not found' }
    }

    removeAudioFileIfExists(row.url)

    const data = await this.audioRepository.delete(id)
    return { success: true, data }
  }

  /** 仅允许改展示名 name */
  async updateAudio(id: string | number, payload: Partial<{ name: string }>) {
    const updateData: Partial<{ name: string }> = {}
    if (payload.name !== undefined) {
      const name = payload.name.trim()
      if (!name) {
        return { success: false, error: 'name is required' }
      }
      updateData.name = name
    }
    const data = await this.audioRepository.update(id, updateData)
    return { success: true, data }
  }

  async getAudio(id: string | number) {
    const data = await this.audioRepository.findById(id)
    return { success: true, data }
  }

  async queryAudios(filters: Partial<{ id: string | number; name: string }>) {
    const data = await this.audioRepository.query(filters)
    return { success: true, data }
  }

  async listAudios() {
    const data = await this.audioRepository.list()
    return { success: true, data }
  }

  async searchByName(name: string) {
    const data = await this.audioRepository.searchByName(name)
    return { success: true, data }
  }
}
