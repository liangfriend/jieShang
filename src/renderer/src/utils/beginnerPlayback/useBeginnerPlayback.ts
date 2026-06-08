import type { MusicScore } from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { BeginnerPlaybackController, BeginnerPlaybackState } from './types'

export type PianoMidiBoxExpose = {
  play: () => void
  stop: () => void
  state: BeginnerPlaybackState
}

export type UseBeginnerPlaybackOptions = {
  midiBoxRef: Ref<PianoMidiBoxExpose | null>
  countIn?: () => Promise<void>
  onPlayStarted?: () => void
  onPlaybackStopped?: () => void
  hasSequence?: () => boolean
}

export function useBeginnerPlayback(
  options: UseBeginnerPlaybackOptions
): BeginnerPlaybackController {
  const countingIn = ref(false)
  const sessionActive = ref(false)
  let countInAborted = false

  const playbackState = computed<BeginnerPlaybackState>(() => {
    if (sessionActive.value || countingIn.value) return 'playing'
    return options.midiBoxRef.value?.state ?? 'stopped'
  })

  const playDisabled = computed(() => playbackState.value === 'playing' || countingIn.value)
  const stopDisabled = computed(() => playbackState.value === 'stopped' && !countingIn.value)

  async function handlePlay() {
    if (playDisabled.value) return
    if (options.hasSequence?.() === false) {
      ElMessage.warning('当前曲谱没有可练习的音符')
      return
    }

    countInAborted = false
    sessionActive.value = true

    if (options.countIn) {
      countingIn.value = true
      try {
        await options.countIn()
      } finally {
        countingIn.value = false
      }
      if (countInAborted) {
        countInAborted = false
        sessionActive.value = false
        return
      }
    }

    options.midiBoxRef.value?.play()
    options.onPlayStarted?.()
  }

  function handleStop() {
    if (countingIn.value) countInAborted = true
    sessionActive.value = false
    options.midiBoxRef.value?.stop()
    options.onPlaybackStopped?.()
  }

  /** midi 块全部弹完时由页面回调 */
  function handleMidiBoxFinished() {
    sessionActive.value = false
    options.onPlaybackStopped?.()
  }

  return {
    playbackState,
    countingIn,
    playDisabled,
    stopDisabled,
    handlePlay,
    handleStop,
    handleMidiBoxFinished
  }
}
