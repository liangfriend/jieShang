import { MPlayer, activeContext, startJPlayer } from 'deciphony-player'
import type { TimeSignature } from 'deciphony-player'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normal } from '@renderer/toneColor/metronomeColor'
import { PLAY_BPM_MAX, PLAY_BPM_MIN, PLAY_DEFAULT_BPM } from '@renderer/constant/play'

export const METRONOME_COLOR_NAME = 'normal'

const METRONOME_VOLUME_MIN = 0
const METRONOME_VOLUME_MAX = 1
const METRONOME_DEFAULT_VOLUME = 0.8

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** 全局节拍器播放器（MPlayer），开机即加载 normal 音色 */
export const useMetronomeStore = defineStore('metronome', () => {
  const ready = ref(false)
  const volume = ref(METRONOME_DEFAULT_VOLUME)
  const bpm = ref(PLAY_DEFAULT_BPM)
  const beatUnit = ref(4)
  const timeSignature = ref<TimeSignature>('4/4')

  let mplayer: MPlayer | null = null
  let initPromise: Promise<void> | null = null

  async function init() {
    if (ready.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      startJPlayer()
      mplayer = new MPlayer({ checkTime: 50, checkDuration: 500 })
      await mplayer.addMetronomeColor(METRONOME_COLOR_NAME, normal)
      mplayer.metronomeColor = METRONOME_COLOR_NAME
      mplayer.volume = volume.value
      mplayer.bpm = bpm.value
      mplayer.beatUnit = beatUnit.value
      mplayer.timeSignature = timeSignature.value
      ready.value = true
    })()

    return initPromise
  }

  async function waitReady() {
    await init()
  }

  /** 进入练习模式时同步谱子的 bpm / beatUnit / timeSignature */
  function syncScore(options: {
    bpm?: number
    beatUnit?: number
    timeSignature?: TimeSignature
  }) {
    if (options.timeSignature != null) {
      timeSignature.value = options.timeSignature
      if (mplayer) mplayer.timeSignature = options.timeSignature
    }
    if (options.beatUnit != null) {
      beatUnit.value = options.beatUnit
      if (mplayer) mplayer.beatUnit = options.beatUnit
    }
    if (options.bpm != null) {
      setBpm(options.bpm)
    }
  }

  function setVolume(value: number) {
    const next = clamp(value, METRONOME_VOLUME_MIN, METRONOME_VOLUME_MAX)
    volume.value = next
    if (mplayer) mplayer.volume = next
  }

  function setBpm(value: number) {
    const next = clamp(value, PLAY_BPM_MIN, PLAY_BPM_MAX)
    bpm.value = next
    if (mplayer) mplayer.bpm = next
  }

  /** 打一小节预备拍，结束后 resolve */
  async function playCountIn(): Promise<void> {
    await waitReady()
    if (!mplayer) return
    await activeContext()

    const player = mplayer
    player.stop()
    player.loop = false
    player.sequenceGenOption = { copyCount: 1 }

    await new Promise<void>((resolve) => {
      player.onEnd = () => {
        player.onEnd = () => {}
        resolve()
      }
      void player.play()
    })
  }

  /** 播放过程中持续循环节拍器 */
  async function startLoop(): Promise<void> {
    await waitReady()
    if (!mplayer) return
    await activeContext()
    mplayer.onEnd = () => {}
    mplayer.loop = true
    void mplayer.play()
  }

  function stop() {
    mplayer?.stop()
  }

  return {
    ready,
    volume,
    bpm,
    beatUnit,
    timeSignature,
    init,
    waitReady,
    syncScore,
    setVolume,
    setBpm,
    playCountIn,
    startLoop,
    stop
  }
})
