import { randomUUID } from 'node:crypto'
import { CUSTOM_SYMBOL_KINDS, type CustomSymbolKind } from '../models/CustomSymbolModel'
import { CustomSymbolRepository } from '../repositories/customSymbolRepository'

const NAME_MAX_LENGTH = 100
const CONTENT_MAX_LENGTH = 1024 * 1024

function normalizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.trim().slice(0, NAME_MAX_LENGTH)
  return name || null
}

function normalizeKind(raw: unknown): CustomSymbolKind | null {
  return CUSTOM_SYMBOL_KINDS.includes(raw as CustomSymbolKind) ? (raw as CustomSymbolKind) : null
}

/** 只校验皮肤必填字段（content / w / h），规则字段由渲染进程按 renderer 缺省值补齐 */
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
  const { content, w, h } = obj as { content?: unknown; w?: unknown; h?: unknown }
  if (typeof content !== 'string' || !content.trim() || content.length > CONTENT_MAX_LENGTH) return null
  for (const v of [w, h]) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null
  }
  return JSON.stringify(obj)
}

export class CustomSymbolService {
  private customSymbolRepository: CustomSymbolRepository

  constructor({ customSymbolRepository }) {
    this.customSymbolRepository = customSymbolRepository
  }

  /** custom_ 前缀避开内置符号名 / 皮肤键 */
  private async generateSkinKey(): Promise<string> {
    for (;;) {
      const key = `custom_${randomUUID().replace(/-/g, '').slice(0, 16)}`
      if (!(await this.customSymbolRepository.existsSkinKey(key))) return key
    }
  }

  async create(payload: { name?: unknown; kind?: unknown; data?: unknown }) {
    const name = normalizeName(payload?.name)
    if (!name) return { success: false, error: 'name is required' }
    const kind = normalizeKind(payload?.kind)
    if (!kind) return { success: false, error: 'invalid custom symbol kind' }
    const data = normalizeData(payload?.data)
    if (!data) return { success: false, error: 'invalid custom symbol data' }
    const skin_key = await this.generateSkinKey()
    const row = await this.customSymbolRepository.create({ name, kind, skin_key, data })
    return { success: true, data: row }
  }

  /** 种类与 skinKey 创建后不可改 */
  async update(id: string | number, payload: { name?: unknown; data?: unknown }) {
    const row = await this.customSymbolRepository.findById(id)
    if (!row) return { success: false, error: 'custom symbol not found' }
    const update: { name?: string; data?: string } = {}
    if (payload?.name !== undefined) {
      const name = normalizeName(payload.name)
      if (!name) return { success: false, error: 'name is required' }
      update.name = name
    }
    if (payload?.data !== undefined) {
      const data = normalizeData(payload.data)
      if (!data) return { success: false, error: 'invalid custom symbol data' }
      update.data = data
    }
    if (Object.keys(update).length === 0) return { success: true, data: row }
    const data = await this.customSymbolRepository.update(id, update)
    return { success: true, data }
  }

  async delete(id: string | number) {
    const row = await this.customSymbolRepository.findById(id)
    if (!row) return { success: false, error: 'custom symbol not found' }
    const data = await this.customSymbolRepository.delete(id)
    return { success: true, data }
  }

  async list(kind?: unknown) {
    const data = await this.customSymbolRepository.list(normalizeKind(kind) ?? undefined)
    return { success: true, data }
  }
}
