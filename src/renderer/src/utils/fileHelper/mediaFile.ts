export type MediaKind = 'image' | 'audio' | 'video'

export type MediaListItem = {
  id: number
  name: string
  url: string
  created_at?: string
  updated_at?: string
}

/** 磁盘绝对路径或 app-image URL → app-image://{kind}/... */
export function toPlayableMediaUrl(kind: MediaKind, url: string): string {
  const trimmed = url?.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('app-image://')) return trimmed

  const normalized = trimmed.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop() || ''
  if (!fileName) return ''
  return `app-image://${kind}/${fileName}`
}

export function displayMediaName(name?: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed : '？'
}

export function mediaFileExtension(url: string): string {
  const normalized = url.replace(/\\/g, '/')
  const base = normalized.split('/').pop() || ''
  const decoded = decodeURIComponent(base)
  const idx = decoded.lastIndexOf('.')
  return idx >= 0 ? decoded.slice(idx + 1).toLowerCase() : ''
}

export function nameFromOriginalFile(fileName: string, fallback = '未命名'): string {
  const base = fileName.replace(/\\/g, '/').split('/').pop() || fileName
  const idx = base.lastIndexOf('.')
  const stem = idx > 0 ? base.slice(0, idx) : base
  return stem.trim() || fallback
}

export function formatMediaDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '—'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatByteSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type MediaApi = {
  searchByName(name: string): Promise<any>
  list(): Promise<any>
  create(payload: {
    name: string
    file: ArrayBuffer | Uint8Array
    originalName?: string
  }): Promise<any>
  delete(id: number | string): Promise<any>
  update(id: number | string, payload: Partial<{ name: string }>): Promise<any>
}

function unwrapList(res: any): MediaListItem[] {
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data as MediaListItem[]
}

export function createMediaFileApi(api: MediaApi, fallbackName: string) {
  return {
    async search(keyword = ''): Promise<MediaListItem[]> {
      return unwrapList(await api.searchByName(keyword))
    },
    async list(): Promise<MediaListItem[]> {
      return unwrapList(await api.list())
    },
    async create(payload: {
      name: string
      file: ArrayBuffer | Uint8Array
      originalName?: string
    }): Promise<MediaListItem> {
      const res = await api.create(payload)
      if (!res.success || !res.data) {
        throw new Error(res.error || 'create failed')
      }
      return res.data as MediaListItem
    },
    async delete(id: number): Promise<void> {
      const res = await api.delete(id)
      if (!res.success) {
        throw new Error(res.error || 'delete failed')
      }
    },
    async updateName(id: number, name: string): Promise<MediaListItem> {
      const res = await api.update(id, { name })
      if (!res.success || !res.data) {
        throw new Error(res.error || 'update failed')
      }
      return res.data as MediaListItem
    },
    nameFromFile(fileName: string) {
      return nameFromOriginalFile(fileName, fallbackName)
    }
  }
}
