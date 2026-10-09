import { DrumMachineRepository } from '../repositories/drumMachineRepository'

const NAME_MAX_LENGTH = 100

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.trim().slice(0, NAME_MAX_LENGTH)
  return name || null
}

/** 只校验外层结构（pattern.tracks 为数组），细节由渲染进程容错解析 */
function normalizeData(raw: unknown): string | null {
  let obj = raw
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj)
    } catch {
      return null
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null
  const pattern = (obj as { pattern?: unknown }).pattern
  if (!pattern || typeof pattern !== 'object') return null
  if (!Array.isArray((pattern as { tracks?: unknown }).tracks)) return null
  return JSON.stringify(obj)
}

export class DrumMachineService {
  private drumMachineRepository: DrumMachineRepository

  constructor({ drumMachineRepository }) {
    this.drumMachineRepository = drumMachineRepository
  }

  async create(payload: { name?: unknown; data?: unknown }) {
    const name = normalizeName(payload?.name)
    if (!name) return { success: false, error: 'name is required' }
    const data = normalizeData(payload?.data)
    if (!data) return { success: false, error: 'invalid drum machine data' }
    const row = await this.drumMachineRepository.create({ name, data })
    return { success: true, data: row }
  }

  async update(id: string | number, payload: { name?: unknown; data?: unknown }) {
    const row = await this.drumMachineRepository.findById(id)
    if (!row) return { success: false, error: 'drum machine not found' }
    const update: { name?: string; data?: string } = {}
    if (payload?.name !== undefined) {
      const name = normalizeName(payload.name)
      if (!name) return { success: false, error: 'name is required' }
      update.name = name
    }
    if (payload?.data !== undefined) {
      const data = normalizeData(payload.data)
      if (!data) return { success: false, error: 'invalid drum machine data' }
      update.data = data
    }
    if (Object.keys(update).length === 0) return { success: true, data: row }
    const data = await this.drumMachineRepository.update(id, update)
    return { success: true, data }
  }

  async delete(id: string | number) {
    const row = await this.drumMachineRepository.findById(id)
    if (!row) return { success: false, error: 'drum machine not found' }
    const data = await this.drumMachineRepository.delete(id)
    return { success: true, data }
  }

  async get(id: string | number) {
    const data = await this.drumMachineRepository.findById(id)
    if (!data) return { success: false, error: 'drum machine not found' }
    return { success: true, data }
  }

  async list(keyword?: string) {
    const data = await this.drumMachineRepository.list(keyword)
    return { success: true, data }
  }
}
