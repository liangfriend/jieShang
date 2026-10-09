import { app } from 'electron'
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

const LOCKED_FILE_CODES = new Set(['EBUSY', 'EPERM', 'EACCES'])
const UNLINK_RETRY_DELAYS_MS = [100, 300, 800]
const pendingUnlinks = new Set<string>()
let quitHookInstalled = false

function flushPendingUnlinks() {
  for (const filePath of pendingUnlinks) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch {
      // 退出时仍被占用则留作孤儿文件
    }
  }
  pendingUnlinks.clear()
}

function deferUnlinkUntilQuit(filePath: string) {
  pendingUnlinks.add(filePath)
  if (quitHookInstalled) return
  quitHookInstalled = true
  app.on('will-quit', flushPendingUnlinks)
}

/** Windows 下 <video> 流式读取会占用文件句柄，删除需重试，仍失败则推迟到退出时 */
async function removeMediaFileIfExists(kind: MediaKind, url: string) {
  const fileName = path.basename(url)
  const filePath = pathManager.resolveResourceFileName(kind, fileName)
  if (path.resolve(url) !== filePath) {
    return
  }
  for (let attempt = 0; ; attempt++) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      return
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? ''
      if (!LOCKED_FILE_CODES.has(code)) throw error
      const delay = UNLINK_RETRY_DELAYS_MS[attempt]
      if (delay == null) {
        deferUnlinkUntilQuit(filePath)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
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

    const data = await this.repository.delete(id)
    await removeMediaFileIfExists(this.kind, (row as { url: string }).url)
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
