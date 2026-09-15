import { reactive } from 'vue'
import { toPlayableMediaUrl } from '@renderer/utils/fileHelper/mediaFile'

export type VideoFileMetadata = {
  duration: number
  width: number
  height: number
  byteLength: number
}

const cache = reactive(new Map<number, VideoFileMetadata>())
const inflight = new Map<number, Promise<VideoFileMetadata | null>>()

export function getCachedVideoMetadata(id: number): VideoFileMetadata | null {
  return cache.get(id) ?? null
}

export async function probeVideoMetadata(
  id: number,
  url: string
): Promise<VideoFileMetadata | null> {
  const hit = cache.get(id)
  if (hit) return hit

  const pending = inflight.get(id)
  if (pending) return pending

  const task = (async () => {
    const playable = toPlayableMediaUrl('video', url)
    if (!playable) return null
    try {
      const res = await fetch(playable)
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      const blobUrl = URL.createObjectURL(new Blob([buf]))
      try {
        const info = await new Promise<{
          duration: number
          width: number
          height: number
        }>((resolve, reject) => {
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.onloadedmetadata = () => {
            resolve({
              duration: Number.isFinite(video.duration) ? video.duration : 0,
              width: video.videoWidth,
              height: video.videoHeight
            })
          }
          video.onerror = () => reject(new Error('video load failed'))
          video.src = blobUrl
        })
        const meta: VideoFileMetadata = {
          ...info,
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

export function forgetVideoMetadata(id: number) {
  cache.delete(id)
  inflight.delete(id)
}
