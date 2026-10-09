import type { MusicScore } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import type { PlaySequence, ToneColor } from '@deciphony/player'
import { NPlayer, activeContext, startJPlayer } from '@deciphony/player'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import i18n from '@renderer/i18n'
import piano from '@renderer/toneColor/accoustic_grand_piano.json'
import { DEFAULT_TONE_COLOR_ID, TONE_COLOR_MAP } from '@renderer/constant/toneColor'
import { WHITEBOARD_NOTE_HOLD_DURATION_SEC } from '@renderer/constant/whiteboard'
import type { ToneColorId } from '@renderer/types/toneColor'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import {
  DEFAULT_TONE_COLOR_COLLECTION_ID,
  loadOwnedToneColorContent,
  toneColorIdByKey,
  toneColorKey
} from '@renderer/utils/collection/toneColorUsage'
import { readStaffInstrumentValue } from '@deciphony/extensions/dr-play'
import { readShowInstrumentName } from '@renderer/utils/scoreSpacingDefaults'
import { isFixedToneColorScore } from '@renderer/utils/isTabNotation'
import {
  collectInstrumentToneColorIds
} from '@renderer/utils/instrumentScoreTone'
import { findToneColorCatalogItemByKey } from '@renderer/constant/toneColorCatalog'
import { FretboardScoreType } from '@renderer/constant/fretboardScoreType'
import {
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_DEFAULT_BPM,
  PLAY_DEFAULT_VOLUME,
  PLAY_QUARTER_BEAT_UNIT,
  PLAY_SMOOTH_ENVELOPE,
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN,
  resolvePlayBpm
} from '@renderer/constant/play'

export type PlaybackState = 'stopped' | 'playing' | 'paused'

export type ProgressListener = (progress: number, data: unknown) => void
export type EndListener = () => void

export type TriggerNoteOptions = {
  volume?: number
  duration?: number
  id?: string
  /** 指定音色名；不传则用当前激活藏品音色 */
  toneColor?: string
  /**
   * 按住到 releaseNote 再停（不设 duration）。
   * 否则默认 duration = WHITEBOARD_NOTE_HOLD_DURATION_SEC。
   */
  holdUntilRelease?: boolean
  /** Attack 秒：0→峰值 */
  attack?: number
  /** Decay 秒：峰值→维持音量 */
  decay?: number
  /** 峰值倍率，默认由 NPlayer 处理 */
  peakVolume?: number
  /**
   * 仅当有 duration 时：duration 结束后的淡出秒数。
   * 无 duration 时请用 releaseNote({ release })。
   */
  release?: number
}

export type ReleaseNoteOptions = {
  /** 软释放秒数；0 / 不传 / immediate → 立刻停 */
  release?: number
  immediate?: boolean
}

export const PIANO_TONE_COLOR_NAME = 'piano'

/** 音色选择器「曲谱设定」：按单谱表 data.instrumentValue 播放，未设置的谱表用曲谱类型默认音色 */
export const SCORE_TONE_COLOR_ID = 0

/** 曲谱类型默认音色：鼓打击乐、吉他/尤克里里尼龙弦、贝斯原声贝斯，其余三角钢琴 */
export function defaultToneColorIdForScore(musicScore: MusicScore): number {
  const type = musicScore.type
  if (type === MusicScoreTypeEnum.DrumNotation) return BUILTIN_COLLECTION_SEED_IDS.toneColor.打击乐
  if (type === FretboardScoreType.Guitar || type === FretboardScoreType.Ukulele) {
    return BUILTIN_COLLECTION_SEED_IDS.toneColor.尼龙弦吉他
  }
  if (
    type === FretboardScoreType.Bass4 ||
    type === FretboardScoreType.Bass5 ||
    type === FretboardScoreType.Bass6
  ) {
    return findToneColorCatalogItemByKey('acoustic_bass')?.id ?? DEFAULT_TONE_COLOR_COLLECTION_ID
  }
  return DEFAULT_TONE_COLOR_COLLECTION_ID
}

/** 曲谱各单谱表 instrumentValue（及泛音键）对应的藏品 id（去重；非内置键名忽略） */
export function collectStaffToneColorIds(musicScore: MusicScore): number[] {
  const ids = new Set<number>(collectInstrumentToneColorIds(musicScore))
  // 兼容旧谱：仅有 readStaffInstrumentValue、未写 harmonic 时仍收集基础键
  for (const grandStaff of musicScore.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      const value = readStaffInstrumentValue(staff)
      const id = value ? toneColorIdByKey(value) : undefined
      if (id != null) ids.add(id)
    }
  }
  return [...ids]
}

/**
 * 播放页要加载的单谱表音色。
 * 乐器谱（含 TAB 泛音）必须灌入 staff 上的 instrumentValue / instrumentValue_harmonic；
 * 普通谱同样收集 staff 音色供「曲谱设定」使用。
 */
function playbackStaffToneColorIds(musicScore: MusicScore): number[] {
  return collectStaffToneColorIds(musicScore)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampVolume(value: number): number {
  return clamp(value, PLAY_VOLUME_MIN, PLAY_VOLUME_MAX)
}

export const usePlayStore = defineStore('play', () => {
  const playbackState = ref<PlaybackState>('stopped')
  const ready = ref(false)
  const volume = ref(PLAY_DEFAULT_VOLUME)
  /** 用户可见 / 写入 NPlayer 的 BPM：永远以四分音符为基准 */
  const bpm = ref(PLAY_DEFAULT_BPM)
  /** 与 bpm 配套；播放侧固定为四分音符，避免与拍号分母混用 */
  const beatUnit = ref(PLAY_QUARTER_BEAT_UNIT)
  const toneColorId = ref<ToneColorId>('accoustic_grand_piano')
  /** 音色选择器当前值；SCORE_TONE_COLOR_ID 表示「曲谱设定」 */
  const collectionToneColorId = ref(DEFAULT_TONE_COLOR_COLLECTION_ID)
  const collectionToneColorLoading = ref(false)
  /** 曲谱设定下未设 instrumentValue 的谱表与单音试听使用的音色 */
  const scoreFallbackToneColorId = ref(DEFAULT_TONE_COLOR_COLLECTION_ID)
  /** NPlayer 音色缓存变化计数（NPlayer 本身非响应式） */
  const toneColorCacheVersion = ref(0)
  const isScoreToneColorMode = computed(() => collectionToneColorId.value === SCORE_TONE_COLOR_ID)

  let nplayer: NPlayer | null = null
  /** 「曲谱设定」读取 instrumentValue 的曲谱（restorePlaybackDefaults 时登记） */
  let scoreToneContext: MusicScore | null = null
  /** 按音色名去重的进行中加载 */
  const toneLoadTasks = new Map<string, Promise<void>>()
  let initPromise: Promise<void> | null = null
  let collectionToneColorInitPromise: Promise<void> | null = null
  /** 音色切换序号：后发起的设置优先生效，忽略过期结果 */
  let toneSetEpoch = 0
  /** 进行中的音色加载（含 ensure 触发的默认加载） */
  let toneSetInFlight: Promise<void> | null = null
  let listenerSeq = 0
  const heldNoteIds = new Map<number, string>()

  const progressStartListeners = new Map<string, ProgressListener>()
  const progressEndListeners = new Map<string, ProgressListener>()
  const endListeners = new Map<string, EndListener>()

  const playDisabled = computed(() => playbackState.value === 'playing')
  const pauseDisabled = computed(() => playbackState.value !== 'playing')
  const stopDisabled = computed(() => playbackState.value === 'stopped')

  function nextListenerId(kind: string) {
    listenerSeq += 1
    return `${kind}-${listenerSeq}`
  }

  function emitProgressStart(progress: number, data: unknown) {
    progressStartListeners.forEach((listener) => listener(progress, data))
  }

  function emitProgressEnd(progress: number, data: unknown) {
    progressEndListeners.forEach((listener) => listener(progress, data))
  }

  function emitEnd() {
    endListeners.forEach((listener) => listener())
  }

  function bindPlayerCallbacks(player: NPlayer) {
    player.onProgressStart = (progress, data) => {
      emitProgressStart(progress, data)
    }
    player.onProgressEnd = (progress, data) => {
      emitProgressEnd(progress, data)
    }
    player.onEnd = () => {
      playbackState.value = 'stopped'
      emitEnd()
    }
  }

  function subscribeProgressStart(listener: ProgressListener) {
    const id = nextListenerId('progressStart')
    progressStartListeners.set(id, listener)
    return id
  }

  function unsubscribeProgressStart(id: string) {
    progressStartListeners.delete(id)
  }

  function subscribeProgressEnd(listener: ProgressListener) {
    const id = nextListenerId('progressEnd')
    progressEndListeners.set(id, listener)
    return id
  }

  function unsubscribeProgressEnd(id: string) {
    progressEndListeners.delete(id)
  }

  function subscribeOnEnd(listener: EndListener) {
    const id = nextListenerId('onEnd')
    endListeners.set(id, listener)
    return id
  }

  function unsubscribeOnEnd(id: string) {
    endListeners.delete(id)
  }

  async function init() {
    if (ready.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      startJPlayer()
      nplayer = new NPlayer({ checkTime: 50, checkDuration: 500 })
      bindPlayerCallbacks(nplayer)
      await nplayer.addToneColor(PIANO_TONE_COLOR_NAME, piano as ToneColor)
      toneColorCacheVersion.value += 1
      setVolume(PLAY_DEFAULT_VOLUME)
      bpm.value = nplayer.bpm
      beatUnit.value = nplayer.beatUnit
      ready.value = true
    })()

    return initPromise
  }

  async function waitReady() {
    await init()
  }

  function syncPlayerSettings() {
    if (!nplayer) return
    volume.value = clampVolume(nplayer.volume)
    bpm.value = nplayer.bpm
    beatUnit.value = nplayer.beatUnit
  }

  function setVolume(value: number) {
    const next = clampVolume(value)
    volume.value = next
    if (nplayer) nplayer.volume = next
  }

  /**
   * 实时改 NPlayer 总音量（如吹奏气压控制），不改 volume 设置、可超过 PLAY_VOLUME_MAX；
   * 用完调 restoreMasterVolume 还原
   */
  function setLiveMasterVolume(value: number) {
    if (nplayer) nplayer.volume = Math.max(0, value)
  }

  function restoreMasterVolume() {
    if (nplayer) nplayer.volume = volume.value
  }

  function setBpm(value: number) {
    const next = clamp(value, PLAY_BPM_MIN, PLAY_BPM_MAX)
    bpm.value = next
    if (nplayer) nplayer.bpm = next
  }

  function setBeatUnit(value: number) {
    const next = Math.max(1, Math.round(value) || 4)
    beatUnit.value = next
    if (nplayer) nplayer.beatUnit = next
  }

  async function setToneColor(id: ToneColorId) {
    await waitReady()
    if (!nplayer) return
    const meta = TONE_COLOR_MAP[id]
    if (!meta) return
    const module = await meta.loader()
    const toneData = (module.default ?? module) as ToneColor
    await nplayer.addToneColor(PIANO_TONE_COLOR_NAME, toneData)
    toneColorCacheVersion.value += 1
    toneColorId.value = id
  }

  async function resetToneColorToDefault() {
    await setToneColor(DEFAULT_TONE_COLOR_ID)
  }

  /** 默认音色名：选中具体音色时即该音色；「曲谱设定」时为曲谱类型默认音色 */
  function getActiveToneColorKey() {
    const id = isScoreToneColorMode.value
      ? scoreFallbackToneColorId.value
      : collectionToneColorId.value
    return toneColorKey(id)
  }

  /**
   * 按藏品 id 加载音色，登记到 NPlayer（音色名 = toneColorKey(id)）；已缓存则跳过。
   * 缺失 / 未拥有时不登记，序列里无 buffer 的音按静音占位，不打断播放与 onEnd。
   */
  async function loadToneColorById(id: number): Promise<void> {
    await waitReady()
    const player = nplayer
    if (!player) return
    const key = toneColorKey(id)
    if (player.hasToneColor(key)) return
    const pending = toneLoadTasks.get(key)
    if (pending) return pending

    const task = (async () => {
      const toneData = await loadOwnedToneColorContent(id)
      if (toneData) await player.addToneColor(key, toneData)
    })().finally(() => {
      toneLoadTasks.delete(key)
      toneColorCacheVersion.value += 1
    })
    toneLoadTasks.set(key, task)
    return task
  }

  /** 播放曲谱需要的全部音色：曲谱类型默认音色、当前选中音色、各单谱表 instrumentValue */
  function toneColorIdsForScore(musicScore: MusicScore): number[] {
    const ids = new Set<number>([defaultToneColorIdForScore(musicScore), ...playbackStaffToneColorIds(musicScore)])
    if (!isScoreToneColorMode.value) ids.add(collectionToneColorId.value)
    return [...ids]
  }

  /** 确保曲谱播放用到的音色都已加载（已缓存的直接跳过） */
  async function ensureScoreToneColorsLoaded(musicScore: MusicScore): Promise<void> {
    await Promise.all(toneColorIdsForScore(musicScore).map((id) => loadToneColorById(id)))
  }

  /** 是否还有未缓存的播放音色（用于决定是否显示加载中） */
  function hasPendingScoreToneColors(musicScore: MusicScore): boolean {
    if (!nplayer) return true
    return toneColorIdsForScore(musicScore).some((id) => !nplayer!.hasToneColor(toneColorKey(id)))
  }

  async function setCollectionToneColor(id: number) {
    const epoch = ++toneSetEpoch
    await waitReady()
    if (!nplayer) return

    const run = (async () => {
      collectionToneColorLoading.value = true
      try {
        if (id === SCORE_TONE_COLOR_ID) {
          const ids = new Set([scoreFallbackToneColorId.value])
          if (scoreToneContext) playbackStaffToneColorIds(scoreToneContext).forEach((it) => ids.add(it))
          await Promise.all([...ids].map((it) => loadToneColorById(it)))
        } else {
          await loadToneColorById(id)
        }
        // 已被更新的请求覆盖则丢弃，避免后设的口琴被抢跑的默认钢琴盖掉
        if (epoch !== toneSetEpoch) return
        collectionToneColorId.value = id
        collectionToneColorInitPromise = Promise.resolve()
      } finally {
        if (epoch === toneSetEpoch) collectionToneColorLoading.value = false
      }
    })()

    toneSetInFlight = run.finally(() => {
      if (toneSetInFlight === run) toneSetInFlight = null
    })
    await run
  }

  async function resetCollectionToneColorToDefault() {
    await setCollectionToneColor(DEFAULT_TONE_COLOR_COLLECTION_ID)
  }

  async function ensureCollectionToneColorInitialized() {
    if (toneSetInFlight) await toneSetInFlight
    if (collectionToneColorInitPromise) return collectionToneColorInitPromise

    collectionToneColorInitPromise = (async () => {
      try {
        await setCollectionToneColor(DEFAULT_TONE_COLOR_COLLECTION_ID)
      } catch {
        collectionToneColorInitPromise = null
        throw new Error(i18n.global.t('play.toneColor.defaultLoadFailed'))
      }
    })()

    return collectionToneColorInitPromise
  }

  async function triggerNote(midi: number, options?: TriggerNoteOptions) {
    await waitReady()
    if (!nplayer) return
    const holdUntilRelease = Boolean(options?.holdUntilRelease)
    const isOneShot = options?.duration != null && !holdUntilRelease
    if (!isOneShot && heldNoteIds.has(midi)) return

    let toneColor = options?.toneColor
    if (!toneColor) {
      try {
        // 等页面显式设音色完成，避免抢跑 ensure 灌钢琴
        if (toneSetInFlight) await toneSetInFlight
        await ensureCollectionToneColorInitialized()
        if (toneSetInFlight) await toneSetInFlight
        toneColor = getActiveToneColorKey()
      } catch {
        // 藏品音色未就绪时回退内置 piano，避免无声
        toneColor = PIANO_TONE_COLOR_NAME
      }
    }

    await activeContext()
    const id = options?.id ?? `preview-${midi}`
    const noteVolume = clampVolume(options?.volume ?? volume.value)
    nplayer.trigger({
      id,
      midi,
      toneColor,
      volume: noteVolume,
      ...(holdUntilRelease
        ? {}
        : { duration: options?.duration ?? WHITEBOARD_NOTE_HOLD_DURATION_SEC }),
      ...(options?.attack != null ? { attack: options.attack } : {}),
      ...(options?.decay != null ? { decay: options.decay } : {}),
      ...(options?.peakVolume != null ? { peakVolume: options.peakVolume } : {}),
      ...(options?.release != null ? { release: options.release } : {})
    })
    if (!isOneShot) {
      heldNoteIds.set(midi, id)
    }
  }

  function releaseNote(midi: number, options?: ReleaseNoteOptions) {
    if (!nplayer) return
    const id = heldNoteIds.get(midi)
    if (!id) return
    nplayer.release({
      id,
      release: options?.release,
      immediate: options?.immediate
    })
    heldNoteIds.delete(midi)
  }

  function releaseAllHeldNotes() {
    nplayer?.releaseAll()
    heldNoteIds.clear()
  }

  async function restorePlaybackDefaults(
    musicScore: MusicScore,
    options?: { resetToneColor?: boolean }
  ) {
    await waitReady()
    setVolume(PLAY_DEFAULT_VOLUME)
    setBpm(resolvePlayBpm(musicScore))
    setBeatUnit(PLAY_QUARTER_BEAT_UNIT)
    if (options?.resetToneColor !== false) {
      scoreToneContext = musicScore
      const fallbackId = defaultToneColorIdForScore(musicScore)
      scoreFallbackToneColorId.value = fallbackId
      // 乐器谱音色已写在单谱表上：强制「曲谱设定」；其余开启「显示音色」时用曲谱设定，否则用类型默认音色
      const initialId =
        isFixedToneColorScore(musicScore) || readShowInstrumentName(musicScore)
          ? SCORE_TONE_COLOR_ID
          : fallbackId
      // 默认音色与各单谱表 instrumentValue / 泛音键一起加载，全部就绪后页面才结束加载中
      await Promise.all([
        setCollectionToneColor(initialId),
        ...playbackStaffToneColorIds(musicScore).map((id) => loadToneColorById(id))
      ])
    }
  }

  /** NPlayer 当前已缓存的音色名（依赖 toneColorCacheVersion 刷新） */
  const cachedToneColorNames = computed(() => {
    void toneColorCacheVersion.value
    return nplayer?.getToneColorNames() ?? []
  })

  /** 清空 NPlayer 全部音色缓存（开发调试用）；之后播放 / 切换音色会重新加载 */
  function clearCachedToneColors() {
    stop()
    nplayer?.clearToneColors()
    toneColorCacheVersion.value += 1
  }

  function setPlaySequence(sequence: PlaySequence) {
    nplayer?.setPlaySequence(sequence)
  }

  function refreshSequence(sequence: PlaySequence) {
    setPlaySequence(sequence)
    if (playbackState.value !== 'stopped') {
      nplayer?.stop()
    }
  }

  async function play() {
    await waitReady()
    if (!nplayer) return
    await activeContext()
    await nplayer.play({ ...PLAY_SMOOTH_ENVELOPE })
    playbackState.value = 'playing'
  }

  function pause() {
    nplayer?.pause()
    if (playbackState.value === 'playing') {
      playbackState.value = 'paused'
    }
  }

  function stop() {
    heldNoteIds.clear()
    if (!nplayer) {
      playbackState.value = 'stopped'
      return
    }
    nplayer.releaseAll()
    nplayer.stop()
    playbackState.value = 'stopped'
  }

  return {
    playbackState,
    ready,
    volume,
    bpm,
    beatUnit,
    toneColorId,
    collectionToneColorId,
    collectionToneColorLoading,
    scoreFallbackToneColorId,
    isScoreToneColorMode,
    cachedToneColorNames,
    clearCachedToneColors,
    ensureScoreToneColorsLoaded,
    hasPendingScoreToneColors,
    loadToneColorById,
    getActiveToneColorKey,
    setCollectionToneColor,
    resetCollectionToneColorToDefault,
    ensureCollectionToneColorInitialized,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    init,
    waitReady,
    setVolume,
    setLiveMasterVolume,
    restoreMasterVolume,
    setBpm,
    setBeatUnit,
    setToneColor,
    resetToneColorToDefault,
    triggerNote,
    releaseNote,
    releaseAllHeldNotes,
    restorePlaybackDefaults,
    syncPlayerSettings,
    setPlaySequence,
    refreshSequence,
    play,
    pause,
    stop,
    subscribeProgressStart,
    unsubscribeProgressStart,
    subscribeProgressEnd,
    unsubscribeProgressEnd,
    subscribeOnEnd,
    unsubscribeOnEnd
  }
})
