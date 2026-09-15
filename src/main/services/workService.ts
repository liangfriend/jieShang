import fs from 'fs'
import path from 'path'
import { WorkRepository } from '../repositories/workRepository'
import pathManager from '../utils/pathManager'

export type WorkCreatePayload = {
  name: string
  /** .sjw 文件二进制 */
  file: ArrayBuffer | Buffer | Uint8Array
  score_id?: number | null
  originalName?: string
}

export type WorkUpdatePayload = Partial<{
  name: string
  score_id: number | null
  file: ArrayBuffer | Buffer | Uint8Array
}>

function toBuffer(file: ArrayBuffer | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(file)) return file
  if (file instanceof ArrayBuffer) return Buffer.from(file)
  return Buffer.from(file.buffer, file.byteOffset, file.byteLength)
}

function createUniqueSjwFileName(originalName?: string): string {
  const ext = path.extname(originalName ?? '').toLowerCase() || '.sjw'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
}

/** 仅删除落在 sjw 目录内的文件 */
function removeSjwFileIfExists(url: string) {
  if (!url?.trim()) return
  const fileName = path.basename(url)
  const filePath = pathManager.resolveSjwFileName(fileName)
  if (path.resolve(url) !== filePath) {
    return
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export class WorkService {
  private workRepository: WorkRepository

  constructor({ workRepository }) {
    this.workRepository = workRepository
  }

  /**
   * 保存 .sjw 到 resources/sjw，写入库记录。
   * name 为展示名；url 为自动生成唯一文件名后的绝对路径。
   */
  async createWork(payload: WorkCreatePayload) {
    const name = payload.name?.trim()
    if (!name) {
      return { success: false, error: 'name is required' }
    }
    if (!payload.file) {
      return { success: false, error: 'file is required' }
    }

    const fileName = createUniqueSjwFileName(payload.originalName)
    const absPath = pathManager.resolveSjwFileName(fileName)
    const buffer = toBuffer(payload.file)

    fs.writeFileSync(absPath, buffer)

    try {
      const data = await this.workRepository.create({
        name,
        score_id: payload.score_id ?? null,
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

  /** 软删除库记录，并删除磁盘上对应 .sjw */
  async deleteWork(id: string | number) {
    const row = await this.workRepository.findById(id)
    if (!row) {
      return { success: false, error: 'work not found' }
    }

    removeSjwFileIfExists(row.url)

    const data = await this.workRepository.delete(id)
    return { success: true, data }
  }

  /**
   * 可改 name / score_id；若带 file 则覆盖（或补写）磁盘 .sjw。
   */
  async updateWork(id: string | number, payload: WorkUpdatePayload) {
    const row = await this.workRepository.findById(id)
    if (!row) {
      return { success: false, error: 'work not found' }
    }

    const updateData: Partial<{ name: string; score_id: number | null; url: string }> = {}

    if (payload.name !== undefined) {
      const name = payload.name.trim()
      if (!name) {
        return { success: false, error: 'name is required' }
      }
      updateData.name = name
    }

    if (payload.score_id !== undefined) {
      updateData.score_id = payload.score_id
    }

    if (payload.file) {
      const buffer = toBuffer(payload.file)
      let absPath = row.url
      const fileName = path.basename(absPath || '')
      const expected = fileName ? pathManager.resolveSjwFileName(fileName) : ''
      if (!absPath || path.resolve(absPath) !== expected) {
        absPath = pathManager.resolveSjwFileName(createUniqueSjwFileName(`${id}.sjw`))
        updateData.url = absPath
      }
      fs.writeFileSync(absPath, buffer)
    }

    const data = await this.workRepository.update(id, updateData)
    return { success: true, data }
  }

  async getWork(id: string | number, includeScore = false) {
    const data = await this.workRepository.findById(id, includeScore)
    return { success: true, data }
  }

  async queryWorks(filters: Partial<{ id: string | number; name: string; score_id: number }>) {
    const data = await this.workRepository.query(filters)
    return { success: true, data }
  }

  async listWorks() {
    const data = await this.workRepository.query({})
    return { success: true, data }
  }

  async searchByName(name: string) {
    const data = await this.workRepository.searchByName(name)
    return { success: true, data }
  }

  async extractScore(workId: string | number) {
    const data = await this.workRepository.extractScore(workId)
    return { success: true, data }
  }
}
