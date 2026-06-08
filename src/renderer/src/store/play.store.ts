import type { MusicScore } from 'deciphony-renderer'
import type { PlaySequence } from 'deciphony-player'
import { NPlayer, activeContext, startJPlayer } from 'deciphony-player'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import piano from '@renderer/toneColor/accoustic_grand_piano'
import { DEFAULT_TONE_COLOR_ID, TONE_COLOR_MAP } from '@renderer/constant/toneColor'
import { WHITEBOARD_NOTE_HOLD_DURATION_SEC } from '@renderer/constant/whiteboard'
import type { ToneColorId } from '@renderer/types/toneColor'
import {
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_DEFAULT_BPM,
  PLAY_DEFAULT_VOLUME,
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN,
  resolvePlayBpm
} from '@renderer/constant/play'

export type PlaybackState = 'stopped' | 'playing' | 'paused'

export type ProgressListener = (progress: number, data: unknown) => void
export type EndListener = () => void

export const PIANO_TONE_COLOR_NAME = 'piano'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export const usePlayStore = defineStore('play', () => {
  const playbackState = ref<PlaybackState>('stopped')
  const ready = ref(false)
  const volume = ref(PLAY_DEFAULT_VOLUME)
  const bpm = ref(PLAY_DEFAULT_BPM)
  const toneColorId = ref<ToneColorId>('accoustic_grand_piano')

  let nplayer: NPlayer | null = null
  let initPromise: Promise<void> | null = null
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
      console.log('chicken', nplayer)
      bindPlayerCallbacks(nplayer)
      await nplayer.addToneColor(PIANO_TONE_COLOR_NAME, piano)
      syncPlayerSettings()
      ready.value = true
    })()

    return initPromise
  }

  async function waitReady() {
    await init()
  }

  function syncPlayerSettings() {
    if (!nplayer) return
    volume.value = nplayer.volume
    bpm.value = nplayer.bpm
  }

  function setVolume(value: number) {
    const next = clamp(value, PLAY_VOLUME_MIN, PLAY_VOLUME_MAX)
    volume.value = next
    if (nplayer) nplayer.volume = next
  }

  function setBpm(value: number) {
    const next = clamp(value, PLAY_BPM_MIN, PLAY_BPM_MAX)
    bpm.value = next
    if (nplayer) nplayer.bpm = next
  }

  async function setToneColor(id: ToneColorId) {
    await waitReady()
    if (!nplayer) return
    const meta = TONE_COLOR_MAP[id]
    if (!meta) return
    const module = await meta.loader()
    const toneData = module.default ?? module
    await nplayer.addToneColor(PIANO_TONE_COLOR_NAME, toneData)
    toneColorId.value = id
  }

  async function resetToneColorToDefault() {
    await setToneColor(DEFAULT_TONE_COLOR_ID)
  }

  async function triggerNote(midi: number) {
    await waitReady()
    if (!nplayer || heldNoteIds.has(midi)) return
    await activeContext()
    const id = `whiteboard-${midi}`
    nplayer.trigger({
      id,
      midi,
      toneColor: PIANO_TONE_COLOR_NAME,
      volume: volume.value,
      duration: WHITEBOARD_NOTE_HOLD_DURATION_SEC
    })
    heldNoteIds.set(midi, id)
  }

  function releaseNote(midi: number) {
    if (!nplayer) return
    const id = heldNoteIds.get(midi)
    if (!id) return
    nplayer.release({ id })
    heldNoteIds.delete(midi)
  }

  function releaseAllHeldNotes() {
    nplayer?.releaseAll()
    heldNoteIds.clear()
  }

  async function restorePlaybackDefaults(musicScore: MusicScore) {
    await waitReady()
    setVolume(PLAY_DEFAULT_VOLUME)
    setBpm(resolvePlayBpm(musicScore.bpm))
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
    await nplayer.play()
    playbackState.value = 'playing'
  }

  function pause() {
    nplayer?.pause()
    if (playbackState.value === 'playing') {
      playbackState.value = 'paused'
    }
  }

  function stop() {
    if (!nplayer) {
      playbackState.value = 'stopped'
      return
    }
    nplayer.stop()
  }

  return {
    playbackState,
    ready,
    volume,
    bpm,
    toneColorId,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    init,
    waitReady,
    setVolume,
    setBpm,
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
