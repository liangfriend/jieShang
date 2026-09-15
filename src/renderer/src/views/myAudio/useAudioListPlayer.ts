import { computed, onUnmounted, reactive, ref } from 'vue'
import { toPlayableAudioUrl } from '@renderer/utils/fileHelper/audioFile'

export type AudioPlaybackState = {
  audioId: number | null
  playing: boolean
  currentTime: number
  duration: number
  ready: boolean
}

export function useAudioListPlayer() {
  const state = reactive<AudioPlaybackState>({
    audioId: null,
    playing: false,
    currentTime: 0,
    duration: 0,
    ready: false
  })

  const seeking = ref(false)
  let element: HTMLAudioElement | null = null

  function ensureElement() {
    if (element) return element
    const el = new Audio()
    el.preload = 'metadata'
    el.addEventListener('timeupdate', () => {
      if (seeking.value) return
      state.currentTime = el.currentTime || 0
    })
    el.addEventListener('loadedmetadata', () => {
      state.duration = Number.isFinite(el.duration) ? el.duration : 0
      state.ready = true
    })
    el.addEventListener('durationchange', () => {
      if (Number.isFinite(el.duration)) state.duration = el.duration
    })
    el.addEventListener('play', () => {
      state.playing = true
    })
    el.addEventListener('pause', () => {
      state.playing = false
    })
    el.addEventListener('ended', () => {
      state.playing = false
      state.currentTime = 0
      el.currentTime = 0
    })
    el.addEventListener('error', () => {
      state.playing = false
      state.ready = false
    })
    element = el
    return el
  }

  async function load(audioId: number, url: string) {
    const el = ensureElement()
    const playable = toPlayableAudioUrl(url)
    if (!playable) throw new Error('invalid audio url')

    if (state.audioId === audioId && el.src) {
      return el
    }

    el.pause()
    state.audioId = audioId
    state.playing = false
    state.currentTime = 0
    state.duration = 0
    state.ready = false
    el.src = playable
    el.load()
    return el
  }

  async function play(audioId: number, url: string) {
    const el = await load(audioId, url)
    await el.play()
  }

  function pause() {
    element?.pause()
  }

  async function toggle(audioId: number, url: string) {
    if (state.audioId === audioId && state.playing) {
      pause()
      return
    }
    await play(audioId, url)
  }

  function stop() {
    const el = element
    if (!el) return
    el.pause()
    el.currentTime = 0
    state.currentTime = 0
    state.playing = false
  }

  function seek(ratioOrTime: number, asRatio = true) {
    const el = element
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
    const next = asRatio
      ? Math.min(1, Math.max(0, ratioOrTime)) * el.duration
      : Math.min(el.duration, Math.max(0, ratioOrTime))
    el.currentTime = next
    state.currentTime = next
  }

  function beginSeek() {
    seeking.value = true
  }

  function endSeek(ratio: number) {
    seek(ratio, true)
    seeking.value = false
  }

  function isActive(audioId: number) {
    return state.audioId === audioId
  }

  const progress = computed(() => {
    if (!state.duration) return 0
    return Math.min(1, Math.max(0, state.currentTime / state.duration))
  })

  function dispose() {
    if (!element) return
    element.pause()
    element.removeAttribute('src')
    element.load()
    element = null
    state.audioId = null
    state.playing = false
    state.currentTime = 0
    state.duration = 0
    state.ready = false
  }

  onUnmounted(dispose)

  return {
    state,
    progress,
    seeking,
    play,
    pause,
    toggle,
    stop,
    seek,
    beginSeek,
    endSeek,
    isActive,
    load,
    dispose
  }
}
