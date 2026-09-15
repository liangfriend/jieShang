export type AudioListItem = {
  id: number
  name: string
  url: string
  created_at?: string
  updated_at?: string
}

export type AudioCreateResult = AudioListItem

/** 磁盘绝对路径或 app-image URL → 可播放的 app-image://audio/... */
export function toPlayableAudioUrl(url: string): string {
  const trimmed = url?.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('app-image://')) return trimmed

  const normalized = trimmed.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop() || ''
  if (!fileName) return ''
  return `app-image://audio/${fileName}`
}

export function displayAudioName(name?: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed : '？'
}

export function audioFileExtension(url: string): string {
  const playable = toPlayableAudioUrl(url)
  const base = playable.replace(/^app-image:\/\//, '').split('/').pop() || ''
  const decoded = decodeURIComponent(base)
  const idx = decoded.lastIndexOf('.')
  return idx >= 0 ? decoded.slice(idx + 1).toLowerCase() : ''
}

export function nameFromOriginalFile(fileName: string): string {
  const base = fileName.replace(/\\/g, '/').split('/').pop() || fileName
  const idx = base.lastIndexOf('.')
  const stem = idx > 0 ? base.slice(0, idx) : base
  return stem.trim() || '未命名音频'
}

export async function searchAudiosFromDatabase(keyword = ''): Promise<AudioListItem[]> {
  const res = await window.api.audio.searchByName(keyword)
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data as AudioListItem[]
}

export async function listAudiosFromDatabase(): Promise<AudioListItem[]> {
  const res = await window.api.audio.list()
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data as AudioListItem[]
}

export async function getAudioFromDatabase(id: number): Promise<AudioListItem | null> {
  const res = await window.api.audio.get(id)
  if (!res.success || !res.data) return null
  return res.data as AudioListItem
}

/** 将库内音频拉成 File（作品 addScore 范唱/伴奏入库用） */
export async function fetchAudioAsFile(row: AudioListItem): Promise<File | null> {
  const url = toPlayableAudioUrl(row.url)
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const ext = audioFileExtension(row.url) || 'mp3'
    const mime = blob.type || 'audio/mpeg'
    const stem = displayAudioName(row.name).replace(/[\\/:*?"<>|]/g, '_') || 'audio'
    return new File([blob], `${stem}.${ext}`, { type: mime })
  } catch {
    return null
  }
}

export async function createAudioInDatabase(payload: {
  name: string
  file: ArrayBuffer | Uint8Array
  originalName?: string
}): Promise<AudioListItem> {
  const res = await window.api.audio.create(payload)
  if (!res.success || !res.data) {
    throw new Error(res.error || 'create audio failed')
  }
  return res.data as AudioListItem
}

export async function deleteAudioFromDatabase(id: number): Promise<void> {
  const res = await window.api.audio.delete(id)
  if (!res.success) {
    throw new Error(res.error || 'delete audio failed')
  }
}

export async function updateAudioNameInDatabase(id: number, name: string): Promise<AudioListItem> {
  const res = await window.api.audio.update(id, { name })
  if (!res.success || !res.data) {
    throw new Error(res.error || 'update audio failed')
  }
  return res.data as AudioListItem
}
