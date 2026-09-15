import fs from 'fs'
import path from 'path'
import pathManager from '../utils/pathManager'
import type { MediaLibraryRepository } from '../repositories/mediaLibraryRepository'

export type MediaCreatePayload = {
  name: string
  file: ArrayBuffer | Buffer | Uint8Array
  originalName?: string
}

export type MediaKind = 'image' | 'video'

function toBuffer(file: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(file)) return file
  if (file instanceof ArrayBuffer) return Buffer.from(file)
  return Buffer.from(file.buffer, file.byteOffset, file.byteLength)
}

function createUniqueFileName(originalName?: string): string {
  const ext = path.extname(originalName ?? '').toLowerCase()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
}

function removeMediaFileIfExists(kind: MediaKind, url: string) {
  const fileName = path.basename(url)
  const filePath = pathManager.resolveResourceFileName(kind, fileName)
  if (path.resolve(url) !== filePath) {
    return
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

/** 图片 / 视频同构：写盘 + 入库 */
export class MediaLibraryService {
  constructor(
    private kind: MediaKind,
    private repository: MediaLibraryRepository
  ) {}

  async create(payload: MediaCreatePayload) {
    const name = payload.name?.trim()
    if (!name) {
      return { success: false, error: 'name is required' }
    }
    if (!payload.file) {
      return { success: false, error: 'file is required' }
    }

    const fileName = createUniqueFileName(payload.originalName)
    const absPath = pathManager.resolveResourceFileName(this.kind, fileName)
    const buffer = toBuffer(payload.file)

    fs.writeFileSync(absPath, buffer)

    try {
      const data = await this.repository.create({
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

  async delete(id: string | number) {
    const row = await this.repository.findById(id)
    if (!row) {
      return { success: false, error: `${this.kind} not found` }
    }

    removeMediaFileIfExists(this.kind, (row as { url: string }).url)

    const data = await this.repository.delete(id)
    return { success: true, data }
  }

  async update(id: string | number, payload: Partial<{ name: string }>) {
    const updateData: Partial<{ name: string }> = {}
    if (payload.name !== undefined) {
      const name = payload.name.trim()
      if (!name) {
        return { success: false, error: 'name is required' }
      }
      updateData.name = name
    }
    const data = await this.repository.update(id, updateData)
    return { success: true, data }
  }

  async get(id: string | number) {
    const data = await this.repository.findById(id)
    return { success: true, data }
  }

  async query(filters: Partial<{ id: string | number; name: string }>) {
    const data = await this.repository.query(filters)
    return { success: true, data }
  }

  async list() {
    const data = await this.repository.list()
    return { success: true, data }
  }

  async searchByName(name: string) {
    const data = await this.repository.searchByName(name)
    return { success: true, data }
  }
}
