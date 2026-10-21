import { MPlayer, activeContext, startJPlayer } from '@deciphony/player'
import type { TimeSignature } from '@deciphony/player'
import { TimeSignatureTypeEnum } from '@deciphony/renderer'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { normal } from '@renderer/toneColor/metronomeColor'
import { PLAY_BPM_MAX, PLAY_BPM_MIN, PLAY_DEFAULT_BPM } from '@renderer/constant/play'
import { timeSignatureTypeToPlayer } from '@renderer/utils/scoreTimeSignature'
import { startAudioKeepAlive } from '@renderer/utils/audioKeepAlive'

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
  const timeSignatureType = ref<TimeSignatureTypeEnum>(TimeSignatureTypeEnum['4_4'])
  const playing = ref(false)

  let mplayer: MPlayer | null = null
  let initPromise: Promise<void> | null = null

  async function init() {
    if (ready.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      startJPlayer()
      startAudioKeepAlive()
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

  function applyTimeSignature(type: TimeSignatureTypeEnum) {
    const resolved = timeSignatureTypeToPlayer(type)
    timeSignatureType.value = type
    timeSignature.value = resolved.timeSignature
    beatUnit.value = resolved.beatUnit
    if (mplayer) {
      mplayer.timeSignature = resolved.timeSignature
      mplayer.beatUnit = resolved.beatUnit
    }
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
      const [num, den] = String(options.timeSignature).split('/')
      const parsedUnit = Number(den)
      const nextUnit =
        options.beatUnit != null
          ? options.beatUnit
          : Number.isFinite(parsedUnit) && parsedUnit > 0
            ? parsedUnit
            : beatUnit.value
      beatUnit.value = nextUnit
      if (mplayer) mplayer.beatUnit = nextUnit
      const key = `${num}_${den}` as keyof typeof TimeSignatureTypeEnum
      if (key in TimeSignatureTypeEnum) {
        timeSignatureType.value = TimeSignatureTypeEnum[key]
      }
    } else if (options.beatUnit != null) {
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

  /**
   * 设置拍号枚举并写入 MPlayer。
   * 播放中改拍号可能导致停顿，故若正在循环则停后重开。
   */
  async function setTimeSignatureType(type: TimeSignatureTypeEnum) {
    const wasPlaying = playing.value
    if (wasPlaying) stop()
    applyTimeSignature(type)
    if (wasPlaying) await startLoop()
  }

  /** 打一小节预备拍，结束后 resolve */
  async function playCountIn(): Promise<void> {
    await waitReady()
    if (!mplayer) return
    await activeContext()

    const player = mplayer
    player.stop()
    playing.value = true
    player.loop = false
    player.sequenceGenOption = { copyCount: 1 }

    await new Promise<void>((resolve) => {
      player.onEnd = () => {
        player.onEnd = () => {}
        playing.value = false
        resolve()
      }
      void player.play()
    })
  }

  /** 当前 bpm / 拍号下一小节预备拍时长（毫秒），与 playCountIn 一致 */
  function getCountInDurationMs(): number {
    const raw = String(timeSignature.value ?? '4/4').split('/')[0]
    const beats = Math.max(1, Number(raw) || 4)
    const b = bpm.value > 0 ? bpm.value : PLAY_DEFAULT_BPM
    return (beats * 60_000) / b
  }

  /**
   * 按指定拍数播放一小节节拍（如 4 拍 → 4/4），结束后 resolve。
   * 会临时改写 bpm / timeSignature，结束后恢复。
   */
  /** bpmValue 以四分音符计；noteUnit 为每次点击的音符时值（1/2/4/8/16） */
  async function playBeats(beatCount: number, bpmValue: number, noteUnit = 4): Promise<void> {
    await waitReady()
    if (!mplayer) return
    await activeContext()

    const player = mplayer
    const prevBpm = player.bpm
    const prevBeatUnit = player.beatUnit
    const prevTimeSignature = player.timeSignature
    const prevType = timeSignatureType.value
    const beats = Math.max(1, Math.round(beatCount))
    const nextTs = `${beats}/${noteUnit}` as TimeSignature

    player.stop()
    playing.value = true
    player.loop = false
    player.bpm = clamp(bpmValue, PLAY_BPM_MIN, PLAY_BPM_MAX)
    player.beatUnit = 4
    player.timeSignature = nextTs
    player.sequenceGenOption = { copyCount: 1 }
    bpm.value = player.bpm
    beatUnit.value = 4
    timeSignature.value = nextTs

    try {
      await new Promise<void>((resolve) => {
        player.onEnd = () => {
          player.onEnd = () => {}
          resolve()
        }
        void player.play()
      })
    } finally {
      playing.value = false
      player.bpm = prevBpm
      player.beatUnit = prevBeatUnit
      player.timeSignature = prevTimeSignature
      bpm.value = prevBpm
      beatUnit.value = prevBeatUnit
      timeSignature.value = prevTimeSignature
      timeSignatureType.value = prevType
    }
  }

  /** 播放过程中持续循环节拍器 */
  async function startLoop(): Promise<void> {
    await waitReady()
    if (!mplayer) return
    await activeContext()
    mplayer.onEnd = () => {}
    mplayer.loop = true
    playing.value = true
    void mplayer.play()
  }

  function stop() {
    mplayer?.stop()
    playing.value = false
  }

  async function toggleLoop() {
    if (playing.value) {
      stop()
      return
    }
    await startLoop()
  }

  const volumePercent = computed({
    get: () => Math.round(volume.value * 100),
    set: (value: number) => setVolume(value / 100)
  })

  return {
    ready,
    volume,
    volumePercent,
    bpm,
    beatUnit,
    timeSignature,
    timeSignatureType,
    playing,
    init,
    waitReady,
    syncScore,
    setVolume,
    setBpm,
    setTimeSignatureType,
    playCountIn,
    getCountInDurationMs,
    playBeats,
    startLoop,
    stop,
    toggleLoop
  }
})
