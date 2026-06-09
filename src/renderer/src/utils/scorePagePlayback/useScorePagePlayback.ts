import type { MusicScore } from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import type { Ref as VueRef } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePlayHighlight,
  type PlayHighlightProgressData
} from '@renderer/dr-extensions/dr-play-highlight'
import { usePlayStore } from '@renderer/store/play.store'
import { toPlaySequence } from './toPlaySequence'
import type { ScorePagePlaybackController, UseScorePagePlaybackOptions } from './types'

/**
 * 曲谱播放页编排：Pinia NPlayer + 可选 dr-play-highlight。
 * play / practice 等页面共用，与具体页面解耦。
 */
export function useScorePagePlayback(
  musicScore: VueRef<MusicScore>,
  options: UseScorePagePlaybackOptions = {}
): ScorePagePlaybackController {
  const playStore = usePlayStore()
  const {
    playbackState,
    playDisabled: storePlayDisabled,
    pauseDisabled: storePauseDisabled,
    stopDisabled: storeStopDisabled,
    bpm
  } = storeToRefs(playStore)

  const countingIn = ref(false)
  let countInAborted = false

  const playDisabled = computed(() => storePlayDisabled.value || countingIn.value)
  const pauseDisabled = computed(() => storePauseDisabled.value || countingIn.value)
  const stopDisabled = computed(() => storeStopDisabled.value && !countingIn.value)

  const highlight = options.musicScoreRef
    ? usePlayHighlight({
        musicScoreRef: options.musicScoreRef,
        getBpm: () => bpm.value,
        getBeatUnit: () => 4,
        getRate: () => 1
      })
    : null

  let progressStartSubId: string | null = null
  let onEndSubId: string | null = null
  let waterfallEndSubId: string | null = null
  let stoppedSubId: string | null = null

  const waterfall = () => options.waterfallRef?.value ?? null

  if (highlight) {
    progressStartSubId = playStore.subscribeProgressStart((_progress, data) => {
      highlight.handleProgressStart(data as PlayHighlightProgressData)
    })
    onEndSubId = playStore.subscribeOnEnd(() => {
      highlight.handlePlaybackEnd()
    })
    watch(bpm, (value) => {
      highlight.setBpm(value)
    })
  }

  if (options.waterfallRef) {
    waterfallEndSubId = playStore.subscribeOnEnd(() => {
      waterfall()?.stop()
    })
  }

  if (options.onPlaybackStopped) {
    stoppedSubId = playStore.subscribeOnEnd(() => {
      options.onPlaybackStopped?.()
    })
  }

  onBeforeUnmount(() => {
    if (progressStartSubId) playStore.unsubscribeProgressStart(progressStartSubId)
    if (onEndSubId) playStore.unsubscribeOnEnd(onEndSubId)
    if (waterfallEndSubId) playStore.unsubscribeOnEnd(waterfallEndSubId)
    if (stoppedSubId) playStore.unsubscribeOnEnd(stoppedSubId)
  })

  async function handlePlay() {
    const sequence = options.getPlaySequence?.() ?? toPlaySequence(musicScore.value)
    if (sequence.length === 0) {
      ElMessage.warning('当前曲谱没有可播放的内容')
      return
    }

    await playStore.waitReady()

    if (playbackState.value !== 'paused') {
      playStore.setPlaySequence(sequence)

      if (options.countIn) {
        countInAborted = false
        countingIn.value = true
        try {
          await options.countIn()
        } finally {
          countingIn.value = false
        }
        if (countInAborted) {
          countInAborted = false
          return
        }
      }
    }

    waterfall()?.play()
    await playStore.play()
    options.onPlayStarted?.()
  }

  function handlePause() {
    playStore.pause()
    highlight?.handlePlaybackPause()
    waterfall()?.pause()
    options.onPlaybackPaused?.()
  }

  function handleStop() {
    if (countingIn.value) countInAborted = true
    playStore.stop()
    highlight?.handlePlaybackStop()
    waterfall()?.stop()
    options.onPlaybackStopped?.()
  }

  function handleClearPlayData() {
    waterfall()?.clearActiveParts()
    options.onClearPlayData?.()
  }

  const hasClearPlayData = Boolean(options.waterfallRef || options.onClearPlayData)

  return {
    playbackState,
    countingIn,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    handlePlay,
    handlePause,
    handleStop,
    handleClearPlayData: hasClearPlayData ? handleClearPlayData : undefined,
    handleRenderMusicScore: highlight?.handleRenderMusicScore,
    setHighlightBpm: highlight?.setBpm,
    subscribeProgressStart: playStore.subscribeProgressStart,
    unsubscribeProgressStart: playStore.unsubscribeProgressStart,
    subscribeOnEnd: playStore.subscribeOnEnd,
    unsubscribeOnEnd: playStore.unsubscribeOnEnd
  }
}
