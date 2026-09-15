import { APlayer, activeContext, startJPlayer } from '@deciphony/player'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PlaybackState } from '@renderer/store/play.store'
import { PLAY_DEFAULT_VOLUME, PLAY_VOLUME_MAX, PLAY_VOLUME_MIN } from '@renderer/constant/play'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export type AudioProgressListener = (current: number, duration: number) => void
export type AudioEndListener = () => void

/**
 * 全局 APlayer：播放曲谱绑定的范唱 / 伴奏音频文件。
 * 须先 startJPlayer（与 NPlayer 共用 AudioContext）。
 */
export const useAudioPlayerStore = defineStore('audioPlayer', () => {
  const playbackState = ref<PlaybackState>('stopped')
  const loadedAudioId = ref<number | null>(null)
  const ready = ref(false)

  let aplayer: APlayer | null = null
  let initPromise: Promise<void> | null = null
  let progressListener: AudioProgressListener | null = null
  let endListener: AudioEndListener | null = null

  const playDisabled = computed(() => playbackState.value === 'playing' || !ready.value)
  const pauseDisabled = computed(() => playbackState.value !== 'playing')
  const stopDisabled = computed(() => playbackState.value === 'stopped')

  function bindPlayerCallbacks(player: APlayer) {
    player.onProgress = (current, duration) => {
      progressListener?.(current, duration)
    }
    player.onEnd = () => {
      playbackState.value = 'stopped'
      endListener?.()
    }
  }

  async function init() {
    if (aplayer) return
    if (initPromise) return initPromise
    initPromise = (async () => {
      startJPlayer()
      aplayer = new APlayer()
      aplayer.volume = PLAY_DEFAULT_VOLUME
      bindPlayerCallbacks(aplayer)
    })()
    return initPromise
  }

  async function waitReady() {
    await init()
  }

  function setOnProgress(listener: AudioProgressListener | null) {
    progressListener = listener
  }

  function setOnEnd(listener: AudioEndListener | null) {
    endListener = listener
  }

  function setVolume(value: number) {
    const next = clamp(value, PLAY_VOLUME_MIN, PLAY_VOLUME_MAX)
    if (aplayer) aplayer.volume = next
  }

  async function setAudio(audioId: number | null, url: string) {
    await waitReady()
    if (!aplayer) return
    aplayer.stop()
    playbackState.value = 'stopped'
    ready.value = false
    loadedAudioId.value = null
    await aplayer.setAudio(url)
    loadedAudioId.value = audioId
    ready.value = true
  }

  async function play() {
    await waitReady()
    if (!aplayer || !ready.value) return
    await activeContext()
    await aplayer.play()
    playbackState.value = 'playing'
  }

  function pause() {
    if (!aplayer) return
    aplayer.pause()
    if (playbackState.value === 'playing') playbackState.value = 'paused'
  }

  function stop() {
    if (!aplayer) {
      playbackState.value = 'stopped'
      return
    }
    aplayer.stop()
    playbackState.value = 'stopped'
  }

  function clear() {
    stop()
    if (aplayer) aplayer.dispose()
    aplayer = null
    initPromise = null
    loadedAudioId.value = null
    ready.value = false
  }

  return {
    playbackState,
    loadedAudioId,
    ready,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    init,
    waitReady,
    setOnProgress,
    setOnEnd,
    setVolume,
    setAudio,
    play,
    pause,
    stop,
    clear
  }
})
