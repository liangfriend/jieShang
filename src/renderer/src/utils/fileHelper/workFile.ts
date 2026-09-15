import type { SJW } from '@deciphony/work'
import { createEmptyPage, parseSjw } from '@deciphony/work'

export type WorkListItem = {
  id: number
  name: string
  score_id?: number | null
  url?: string
  created_at?: string
  updated_at?: string
}

export type WorkRecord = {
  id: number
  name: string
  score_id?: number | null
  url: string
}

export function createEmptyWork(partial?: Partial<Pick<SJW, 'name' | 'author'>>): SJW {
  return {
    name: partial?.name?.trim() || '未命名作品',
    author: partial?.author?.trim() || '',
    pages: [createEmptyPage()],
    assetNames: {}
  }
}

export function displayWorkName(name?: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed : '？'
}

/** 磁盘绝对路径 → app-image://sjw/... */
export function toPlayableSjwUrl(url: string): string {
  const trimmed = url?.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('app-image://')) return trimmed
  const normalized = trimmed.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop() || ''
  if (!fileName) return ''
  return `app-image://sjw/${fileName}`
}

/** 按 work.url 拉取 .sjw 并解析 */
export async function loadSjwFromWorkUrl(
  url: string
): Promise<{ work: SJW; blob: Blob }> {
  const playable = toPlayableSjwUrl(url)
  if (!playable) {
    throw new Error('invalid work url')
  }
  const res = await fetch(playable)
  if (!res.ok) {
    throw new Error(`failed to load sjw: ${res.status}`)
  }
  const blob = await res.blob()
  if (!blob.size) {
    throw new Error('sjw file is empty')
  }
  const { data } = await parseSjw(blob)
  return { work: data, blob }
}

export async function searchWorksFromDatabase(keyword = ''): Promise<WorkListItem[]> {
  const res = await window.api.work.searchByName(keyword)
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data as WorkListItem[]
}

export async function loadWorkFromDatabase(id: number | string): Promise<WorkRecord | null> {
  const res = await window.api.work.get(id)
  if (!res.success || !res.data) return null
  return res.data as WorkRecord
}

export async function deleteWorkFromDatabase(id: number): Promise<void> {
  const res = await window.api.work.delete(id)
  if (!res.success) {
    throw new Error(res.error || 'delete work failed')
  }
}

export async function saveWorkToDatabase(payload: {
  name: string
  file: ArrayBuffer | Uint8Array
  workId?: number | string | null
  originalName?: string
}): Promise<WorkRecord> {
  const name = payload.name.trim()
  if (!name) throw new Error('name is required')

  if (payload.workId) {
    const res = await window.api.work.update(payload.workId, {
      name,
      file: payload.file,
      score_id: null
    })
    if (!res.success || !res.data) {
      throw new Error(res.error || 'update work failed')
    }
    return res.data as WorkRecord
  }

  const res = await window.api.work.create({
    name,
    file: payload.file,
    score_id: null,
    originalName: payload.originalName ?? `${name}.sjw`
  })
  if (!res.success || !res.data) {
    throw new Error(res.error || 'create work failed')
  }
  return res.data as WorkRecord
}
