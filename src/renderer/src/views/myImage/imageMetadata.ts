import { reactive } from 'vue'
import { toPlayableMediaUrl } from '@renderer/utils/fileHelper/mediaFile'

export type ImageFileMetadata = {
  width: number
  height: number
  byteLength: number
}

const cache = reactive(new Map<number, ImageFileMetadata>())
const inflight = new Map<number, Promise<ImageFileMetadata | null>>()

export function getCachedImageMetadata(id: number): ImageFileMetadata | null {
  return cache.get(id) ?? null
}

export async function probeImageMetadata(
  id: number,
  url: string
): Promise<ImageFileMetadata | null> {
  const hit = cache.get(id)
  if (hit) return hit

  const pending = inflight.get(id)
  if (pending) return pending

  const task = (async () => {
    const playable = toPlayableMediaUrl('image', url)
    if (!playable) return null
    try {
      const res = await fetch(playable)
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      const blobUrl = URL.createObjectURL(new Blob([buf]))
      try {
        const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
          img.onerror = () => reject(new Error('image load failed'))
          img.src = blobUrl
        })
        const meta: ImageFileMetadata = {
          width: dims.width,
          height: dims.height,
          byteLength: buf.byteLength
        }
        cache.set(id, meta)
        return meta
      } finally {
        URL.revokeObjectURL(blobUrl)
      }
    } catch {
      return null
    } finally {
      inflight.delete(id)
    }
  })()

  inflight.set(id, task)
  return task
}

export function forgetImageMetadata(id: number) {
  cache.delete(id)
  inflight.delete(id)
}
