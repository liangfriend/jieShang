import { randomUUID } from 'crypto'
import { GuitarChordRepository } from '../repositories/guitarChordRepository'
import {
  syncBuiltinBass5Chords,
  syncBuiltinGuitarChords,
  syncBuiltinUkuleleChords
} from '../database/guitarChordBuiltinSeed'
import {
  guitarChordStringCount,
  guitarChordTabTypeFromStringCount,
  isGuitarChordTabType,
  type GuitarChordTabType
} from '../models/GuitarChordModel'

function isPoseArray(v: unknown, joints: number): v is number[] {
  return (
    Array.isArray(v) &&
    v.length >= 2 + joints &&
    v.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

function isFingerPoseMap(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    isPoseArray(o.thumbF, 2) &&
    isPoseArray(o.indexF, 3) &&
    isPoseArray(o.middleF, 3) &&
    isPoseArray(o.ringF, 3) &&
    isPoseArray(o.littleF, 3)
  )
}

/** 校验并序列化手型；非法则 null */
function normalizeHandPose(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      return normalizeHandPose(JSON.parse(raw))
    } catch {
      return null
    }
  }
  if (!isFingerPoseMap(raw)) return null
  const o = raw as Record<string, number[]>
  return JSON.stringify({
    thumbF: [...o.thumbF],
    indexF: [...o.indexF],
    middleF: [...o.middleF],
    ringF: [...o.ringF],
    littleF: [...o.littleF]
  })
}

function normalizeTabType(raw: unknown, stringCount: number): GuitarChordTabType {
  if (isGuitarChordTabType(raw)) return raw
  return guitarChordTabTypeFromStringCount(stringCount)
}

function normalizeTabChord(
  raw: unknown,
  tabTypeHint?: unknown
): { name: string; data: string; tab_type: GuitarChordTabType } | null {
  if (!raw || typeof raw !== 'object') return null
  const chord = raw as Record<string, unknown>
  const name = typeof chord.name === 'string' ? chord.name.trim() : ''
  if (!name) return null
  if (!Array.isArray(chord.stringStates)) return null
  const stringCount = Number(chord.stringCount)
  if (!Number.isFinite(stringCount) || stringCount < 4 || stringCount > 8) return null
  const tab_type = normalizeTabType(tabTypeHint, stringCount)
  const lockedCount = guitarChordStringCount(tab_type)
  return {
    name,
    tab_type,
    data: JSON.stringify({
      ...chord,
      name,
      stringCount: lockedCount,
      id: typeof chord.id === 'string' && chord.id ? chord.id : randomUUID()
    })
  }
}

export class GuitarChordService {
  private guitarChordRepository: GuitarChordRepository

  constructor({ guitarChordRepository }) {
    this.guitarChordRepository = guitarChordRepository
  }

  async ensureDefaultChords() {
    await syncBuiltinGuitarChords()
    await syncBuiltinUkuleleChords()
    await syncBuiltinBass5Chords()
  }

  async createChord(payload: { data: unknown; hand_pose?: unknown; tab_type?: unknown }) {
    const normalized = normalizeTabChord(payload?.data, payload?.tab_type)
    if (!normalized) return { success: false, error: 'invalid tabChord data' }
    const data = await this.guitarChordRepository.create({
      ...normalized,
      hand_pose: normalizeHandPose(payload?.hand_pose)
    })
    return { success: true, data }
  }

  async deleteChord(id: string | number) {
    const row = await this.guitarChordRepository.findById(id)
    if (!row) return { success: false, error: 'chord not found' }
    const data = await this.guitarChordRepository.delete(id)
    return { success: true, data }
  }

  async updateChord(
    id: string | number,
    payload: { data?: unknown; hand_pose?: unknown; tab_type?: unknown }
  ) {
    const row = await this.guitarChordRepository.findById(id)
    if (!row) return { success: false, error: 'chord not found' }
    const update: Partial<{
      name: string
      data: string
      hand_pose: string | null
      tab_type: GuitarChordTabType
    }> = {}
    if (payload.data !== undefined) {
      // 创建后类型不可改：沿用库里已有 tab_type
      const normalized = normalizeTabChord(payload.data, row.tab_type ?? 'tab6')
      if (!normalized) return { success: false, error: 'invalid tabChord data' }
      Object.assign(update, {
        name: normalized.name,
        data: normalized.data,
        tab_type: row.tab_type ?? normalized.tab_type
      })
    }
    if (payload.hand_pose !== undefined) {
      update.hand_pose = normalizeHandPose(payload.hand_pose)
    }
    if (Object.keys(update).length === 0) {
      return { success: true, data: row }
    }
    const data = await this.guitarChordRepository.update(id, update)
    return { success: true, data }
  }

  async getChord(id: string | number) {
    const data = await this.guitarChordRepository.findById(id)
    return { success: true, data }
  }

  async listChords(filter?: { keyword?: string; tabType?: GuitarChordTabType | 'all' | null }) {
    await this.ensureDefaultChords()
    const data = await this.guitarChordRepository.list(filter ?? {})
    return { success: true, data }
  }

  async searchByName(name: string, tabType?: GuitarChordTabType | 'all' | null) {
    await this.ensureDefaultChords()
    const data = await this.guitarChordRepository.searchByName(name, tabType)
    return { success: true, data }
  }
}
