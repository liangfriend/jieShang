import { computed, onUnmounted, reactive, ref } from 'vue'

export type VideoPlaybackState = {
  videoId: number | null
  playing: boolean
  currentTime: number
  duration: number
}

/** 多卡片各自挂载 video 元素，同一时刻只播一个 */
export function useVideoListPlayer() {
  const state = reactive<VideoPlaybackState>({
    videoId: null,
    playing: false,
    currentTime: 0,
    duration: 0
  })

  const seeking = ref(false)
  const elements = new Map<number, HTMLVideoElement>()
  const cleanups = new Map<number, () => void>()

  function bindElement(id: number, el: HTMLVideoElement | null) {
    const prevCleanup = cleanups.get(id)
    prevCleanup?.()
    cleanups.delete(id)
    elements.delete(id)
    if (!el) return

    const onTime = () => {
      if (state.videoId !== id || seeking.value) return
      state.currentTime = el.currentTime || 0
    }
    const onMeta = () => {
      if (state.videoId !== id) return
      if (Number.isFinite(el.duration)) state.duration = el.duration
    }
    const onPlay = () => {
      if (state.videoId !== id) return
      state.playing = true
    }
    const onPause = () => {
      if (state.videoId !== id) return
      state.playing = false
    }
    const onEnded = () => {
      if (state.videoId !== id) return
      state.playing = false
      state.currentTime = 0
      el.currentTime = 0
    }

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)

    elements.set(id, el)
    cleanups.set(id, () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    })
  }

  function pauseOthers(exceptId: number) {
    elements.forEach((el, id) => {
      if (id === exceptId) return
      el.pause()
    })
  }

  async function play(videoId: number) {
    const el = elements.get(videoId)
    if (!el) throw new Error('video element missing')
    pauseOthers(videoId)
    state.videoId = videoId
    if (Number.isFinite(el.duration)) state.duration = el.duration
    state.currentTime = el.currentTime || 0
    await el.play()
  }

  function pause() {
    const id = state.videoId
    if (id == null) return
    elements.get(id)?.pause()
  }

  async function toggle(videoId: number) {
    if (state.videoId === videoId && state.playing) {
      pause()
      return
    }
    await play(videoId)
  }

  function stop() {
    const id = state.videoId
    if (id == null) return
    const el = elements.get(id)
    if (!el) return
    el.pause()
    el.currentTime = 0
    state.currentTime = 0
    state.playing = false
  }

  function seek(ratio: number) {
    const id = state.videoId
    if (id == null) return
    const el = elements.get(id)
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
    const next = Math.min(1, Math.max(0, ratio)) * el.duration
    el.currentTime = next
    state.currentTime = next
    if (Number.isFinite(el.duration)) state.duration = el.duration
  }

  function beginSeek() {
    seeking.value = true
  }

  function endSeek(ratio: number) {
    seek(ratio)
    seeking.value = false
  }

  async function ensureActive(videoId: number) {
    if (state.videoId === videoId) return
    const el = elements.get(videoId)
    if (!el) throw new Error('video element missing')
    pauseOthers(videoId)
    state.videoId = videoId
    state.playing = false
    state.currentTime = el.currentTime || 0
    state.duration = Number.isFinite(el.duration) ? el.duration : 0
  }

  function isActive(videoId: number) {
    return state.videoId === videoId
  }

  const progress = computed(() => {
    if (!state.duration) return 0
    return Math.min(1, Math.max(0, state.currentTime / state.duration))
  })

  function dispose() {
    cleanups.forEach((fn) => fn())
    cleanups.clear()
    elements.clear()
    state.videoId = null
    state.playing = false
    state.currentTime = 0
    state.duration = 0
  }

  onUnmounted(dispose)

  return {
    state,
    progress,
    seeking,
    bindElement,
    play,
    pause,
    toggle,
    stop,
    seek,
    beginSeek,
    endSeek,
    ensureActive,
    isActive,
    dispose
  }
}
