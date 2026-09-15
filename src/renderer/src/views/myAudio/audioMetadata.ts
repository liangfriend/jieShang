import { reactive } from 'vue'
import { toPlayableAudioUrl } from '@renderer/utils/fileHelper/audioFile'

export type AudioFileMetadata = {
  duration: number
  sampleRate: number
  numberOfChannels: number
  byteLength: number
}

const cache = reactive(new Map<number, AudioFileMetadata>())
const inflight = new Map<number, Promise<AudioFileMetadata | null>>()

export function getCachedAudioMetadata(id: number): AudioFileMetadata | null {
  return cache.get(id) ?? null
}

export async function probeAudioMetadata(
  id: number,
  url: string
): Promise<AudioFileMetadata | null> {
  const hit = cache.get(id)
  if (hit) return hit

  const pending = inflight.get(id)
  if (pending) return pending

  const task = (async () => {
    const playable = toPlayableAudioUrl(url)
    if (!playable) return null
    try {
      const res = await fetch(playable)
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      const ctx = new AudioContext()
      try {
        const decoded = await ctx.decodeAudioData(buf.slice(0))
        const meta: AudioFileMetadata = {
          duration: decoded.duration,
          sampleRate: decoded.sampleRate,
          numberOfChannels: decoded.numberOfChannels,
          byteLength: buf.byteLength
        }
        cache.set(id, meta)
        return meta
      } finally {
        await ctx.close().catch(() => undefined)
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

export function forgetAudioMetadata(id: number) {
  cache.delete(id)
  inflight.delete(id)
}

export function formatAudioDuration(seconds: number | null | undefined): string {
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
