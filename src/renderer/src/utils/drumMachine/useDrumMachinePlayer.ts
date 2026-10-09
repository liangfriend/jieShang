import { onBeforeUnmount, ref } from 'vue'
import { NPlayer, _audioContext, activeContext, startJPlayer } from '@deciphony/player'
import type { DrumMachineData } from '@renderer/types/drumMachine'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import { loadOwnedToneColorContent } from '@renderer/utils/collection/toneColorUsage'
import {
  DRUM_BEAT_UNITS,
  DRUM_SCHEDULE_LOOKAHEAD_SEC,
  DRUM_SCHEDULE_TICK_MS,
  DRUM_TONE_COLOR_NAME
} from '@renderer/constant/drumMachine'
import { blockStarts, isTrackAudible, swingOffsetUnits } from './pattern'

/** 一轮循环的时间基准：换轮时才采用新的 BPM / 总时值 */
type LoopAnchor = {
  startSec: number
  secPerUnit: number
  totalUnits: number
}

function secPerUnit(bpm: number): number {
  return 60 / (bpm * DRUM_BEAT_UNITS)
}

/**
 * 电子鼓机播放：独立 NPlayer 装载数据库中的打击乐音色（da-ji-yue），
 * 定时轮询 + 提前量调度，用 trigger({ offset }) 在 AudioContext 时间轴上精确落点。
 * 循环播放；编辑中的谱面在下一次调度时即生效。
 */
export function useDrumMachinePlayer(getData: () => DrumMachineData) {
  const ready = ref(false)
  const loading = ref(false)
  const playing = ref(false)
  /** 当前播放位置（Unit256），停止时为 -1 */
  const positionUnits = ref(-1)

  let player: NPlayer | null = null
  let initPromise: Promise<void> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let rafId = 0
  let anchor: LoopAnchor | null = null
  let prevAnchor: LoopAnchor | null = null
  let scheduledUntil = 0

  function context(): AudioContext | null {
    return _audioContext
  }

  async function init() {
    if (ready.value) return
    if (initPromise) return initPromise
    initPromise = (async () => {
      loading.value = true
      try {
        startJPlayer()
        const tone = await loadOwnedToneColorContent(BUILTIN_COLLECTION_SEED_IDS.toneColor.打击乐)
        if (!tone) throw new Error('drum tone color unavailable')
        player = new NPlayer({ checkTime: 50, checkDuration: 500 })
        await player.addToneColor(DRUM_TONE_COLOR_NAME, tone)
        ready.value = true
      } catch (err) {
        initPromise = null
        throw err
      } finally {
        loading.value = false
      }
    })()
    return initPromise
  }

  function hit(sound: number, volume: number, offsetSec = 0) {
    if (!player || volume <= 0) return
    try {
      player.trigger({
        midi: sound,
        toneColor: DRUM_TONE_COLOR_NAME,
        volume,
        offset: Math.max(0, offsetSec)
      })
    } catch (err) {
      console.warn('[drumMachine] trigger failed', sound, err)
    }
  }

  /** 试听单个音色（不受静音 / 独奏影响） */
  async function preview(sound: number, trackVolume = 1) {
    await init()
    await activeContext()
    hit(sound, getData().volume * trackVolume)
  }

  function scheduleRange(loop: LoopAnchor, fromSec: number, toSec: number, nowSec: number) {
    const data = getData()
    const tracks = data.pattern.tracks
    for (const track of tracks) {
      if (!isTrackAudible(track, tracks)) continue
      const volume = data.volume * track.volume
      const starts = blockStarts(track.blocks)
      track.blocks.forEach((block, i) => {
        if (!block.active) return
        const start = starts[i]!
        if (start >= loop.totalUnits) return
        const t = loop.startSec + (start + swingOffsetUnits(start, data.swing, data.swingUnit)) * loop.secPerUnit
        if (t < fromSec || t >= toSec) return
        hit(track.sound, volume, t - nowSec)
      })
    }
  }

  function tick() {
    const ctx = context()
    if (!ctx || !anchor) return
    const now = ctx.currentTime
    const horizon = now + DRUM_SCHEDULE_LOOKAHEAD_SEC
    // 调度窗口可能跨过循环末尾：逐轮推进
    for (;;) {
      const loopEnd = anchor.startSec + anchor.totalUnits * anchor.secPerUnit
      const segEnd = Math.min(horizon, loopEnd)
      if (segEnd > scheduledUntil) {
        scheduleRange(anchor, scheduledUntil, segEnd, now)
        scheduledUntil = segEnd
      }
      if (horizon < loopEnd) break
      const data = getData()
      prevAnchor = anchor
      anchor = {
        startSec: loopEnd,
        secPerUnit: secPerUnit(data.bpm),
        totalUnits: data.pattern.totalUnits
      }
    }
  }

  function updatePosition() {
    const ctx = context()
    if (!ctx || !anchor || !playing.value) return
    const now = ctx.currentTime
    const loop = now < anchor.startSec && prevAnchor ? prevAnchor : anchor
    const pos = (now - loop.startSec) / loop.secPerUnit
    positionUnits.value = pos < 0 ? -1 : Math.min(pos, loop.totalUnits)
    rafId = requestAnimationFrame(updatePosition)
  }

  async function play() {
    await init()
    await activeContext()
    const ctx = context()
    if (!ctx || playing.value) return
    const data = getData()
    const startSec = ctx.currentTime + 0.05
    anchor = {
      startSec,
      secPerUnit: secPerUnit(data.bpm),
      totalUnits: data.pattern.totalUnits
    }
    prevAnchor = null
    scheduledUntil = startSec
    playing.value = true
    tick()
    tickTimer = setInterval(tick, DRUM_SCHEDULE_TICK_MS)
    rafId = requestAnimationFrame(updatePosition)
  }

  /** 播放中改 BPM / 总时值：保持当前位置，按新速度重建时间基准 */
  function retime() {
    const ctx = context()
    if (!ctx || !anchor || !playing.value) return
    const now = ctx.currentTime
    const loop = now < anchor.startSec && prevAnchor ? prevAnchor : anchor
    const data = getData()
    const total = data.pattern.totalUnits
    const pos = Math.max(0, (now - loop.startSec) / loop.secPerUnit) % total
    const spu = secPerUnit(data.bpm)
    anchor = { startSec: now - pos * spu, secPerUnit: spu, totalUnits: total }
    prevAnchor = null
    // 已排进提前量窗口的击打保留，避免重复触发
    scheduledUntil = Math.max(scheduledUntil, now)
  }

  function stop() {
    if (tickTimer != null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    anchor = null
    prevAnchor = null
    playing.value = false
    positionUnits.value = -1
    // 已排定未发声的击打与长尾音一并掐断
    player?.releaseAll()
  }

  async function toggle() {
    if (playing.value) stop()
    else await play()
  }

  onBeforeUnmount(() => {
    stop()
    player?.dispose()
    player = null
  })

  return { ready, loading, playing, positionUnits, init, preview, play, stop, toggle, retime }
}
