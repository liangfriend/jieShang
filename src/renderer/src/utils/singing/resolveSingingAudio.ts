import type { MusicScore } from '@deciphony/renderer'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { PLAY_SOURCE, type PlaySource } from '@renderer/constant/playSource'
import { getAudioFromDatabase, toPlayableAudioUrl } from '@renderer/utils/fileHelper/audioFile'
import { useTempAudioStore, type TempAudioPayload } from '@renderer/store/tempAudio.store'

export type SingingAudioQueryKeys = {
  vocal: string | null
  accompaniment: string | null
}

export type ResolvedSingingAudio = {
  source: 'store' | 'database'
  /** 可交给 APlayer / decode 的地址；store 仅有 buffer 时可能为空，由调用方 decode */
  url: string
  buffer?: ArrayBuffer
  name?: string
}

function readQueryKey(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  const v = Array.isArray(raw) ? raw[0] : raw
  const s = String(v).trim()
  return s || null
}

/** 路由上范唱/伴奏在 tempAudioMap 中的 key */
export function readSingingAudioQueryKeys(
  route: RouteLocationNormalizedLoaded
): SingingAudioQueryKeys {
  return {
    vocal: readQueryKey(route.query.vocalAudioKey),
    accompaniment: readQueryKey(route.query.accompanimentAudioKey)
  }
}

function readScoreBoundId(
  score: MusicScore,
  key: 'vocalPerformanceId' | 'accompanimentId'
): number | null {
  const data = (score as MusicScore & { data?: Record<string, unknown> }).data
  if (!data || typeof data !== 'object') return null
  const raw = data[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

function payloadToResolved(payload: TempAudioPayload): ResolvedSingingAudio | null {
  // 优先 buffer：作品页传来的 blob: URL 离开页面后会失效
  if (payload.buffer) {
    const mime = payload.mimeType || 'audio/mpeg'
    const blob = new Blob([payload.buffer], { type: mime })
    const url = URL.createObjectURL(blob)
    return { source: 'store', url, buffer: payload.buffer, name: payload.name }
  }
  if (payload.url?.trim()) {
    return {
      source: 'store',
      url: payload.url.trim(),
      name: payload.name
    }
  }
  return null
}

/**
 * 解析演唱音源：先路由 store key，再曲谱 data 本地音频 id。
 */
export async function resolveSingingAudio(options: {
  route: RouteLocationNormalizedLoaded
  musicScore: MusicScore
  playSource: PlaySource
}): Promise<ResolvedSingingAudio | null> {
  const { route, musicScore, playSource } = options
  if (playSource === PLAY_SOURCE.score) return null

  const keys = readSingingAudioQueryKeys(route)
  const storeKey = playSource === PLAY_SOURCE.vocal ? keys.vocal : keys.accompaniment
  if (storeKey) {
    const payload = useTempAudioStore().getTempAudio(storeKey)
    if (payload) {
      const resolved = payloadToResolved(payload)
      if (resolved) return resolved
    }
  }

  const boundId =
    playSource === PLAY_SOURCE.vocal
      ? readScoreBoundId(musicScore, 'vocalPerformanceId')
      : readScoreBoundId(musicScore, 'accompanimentId')
  if (boundId == null) return null

  const row = await getAudioFromDatabase(boundId)
  if (!row) return null
  const url = toPlayableAudioUrl(row.url)
  if (!url) return null
  return { source: 'database', url, name: row.name }
}

/** 是否具备可选范唱/伴奏（store key 命中或本地 id 有效） */
export async function canSelectSingingSource(options: {
  route: RouteLocationNormalizedLoaded
  musicScore: MusicScore
  playSource: typeof PLAY_SOURCE.vocal | typeof PLAY_SOURCE.accompaniment
}): Promise<boolean> {
  const resolved = await resolveSingingAudio(options)
  return resolved != null
}

export function probeSingingSourceAvailabilitySync(options: {
  route: RouteLocationNormalizedLoaded
  musicScore: MusicScore
}): { vocal: boolean; accompaniment: boolean } {
  const keys = readSingingAudioQueryKeys(options.route)
  const store = useTempAudioStore()
  const score = options.musicScore
  const hasVocalStore = Boolean(keys.vocal && store.hasTempAudio(keys.vocal))
  const hasAccompStore = Boolean(keys.accompaniment && store.hasTempAudio(keys.accompaniment))
  const hasVocalId = readScoreBoundId(score, 'vocalPerformanceId') != null
  const hasAccompId = readScoreBoundId(score, 'accompanimentId') != null
  return {
    vocal: hasVocalStore || hasVocalId,
    accompaniment: hasAccompStore || hasAccompId
  }
}
