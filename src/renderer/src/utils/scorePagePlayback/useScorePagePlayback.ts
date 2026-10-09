import type { MusicScore } from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import i18n from '@renderer/i18n'
import type { Ref as VueRef } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePlayHighlight,
  type PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import { usePlayStore } from '@renderer/store/play.store'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
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
    bpm,
    beatUnit
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
        getBeatUnit: () => beatUnit.value,
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
    if (countingIn.value) countInAborted = true
    playStore.stop()
    highlight?.handlePlaybackStop()
    waterfall()?.stop()
    options.onPlaybackStopped?.()
    if (progressStartSubId) playStore.unsubscribeProgressStart(progressStartSubId)
    if (onEndSubId) playStore.unsubscribeOnEnd(onEndSubId)
    if (waterfallEndSubId) playStore.unsubscribeOnEnd(waterfallEndSubId)
    if (stoppedSubId) playStore.unsubscribeOnEnd(stoppedSubId)
  })

  let playingRangeKey = ''

  async function handlePlay() {
    const range = options.getPlayRange?.() ?? null
    const rangeKey = range ? `${range.startNoteId}|${range.endNoteId}` : ''
    if (playbackState.value === 'paused' && rangeKey !== playingRangeKey) handleStop()

    const sequence = options.getPlaySequence?.() ?? toPlaySequence(musicScore.value, { range })
    if (sequence.length === 0) {
      ElMessage.warning(
        i18n.global.t(range ? 'play.messages.rangeNoPlayableContent' : 'play.messages.noPlayableContent')
      )
      return
    }

    await playStore.waitReady()

    if (playbackState.value !== 'paused') {
      playingRangeKey = rangeKey
      if (playStore.hasPendingScoreToneColors(musicScore.value)) {
        await useGlobalLoadingStore().run(i18n.global.t('play.toneColor.loading'), () =>
          playStore.ensureScoreToneColorsLoaded(musicScore.value)
        )
      }
      handleClearPlayData()
      playStore.setPlaySequence(sequence)

      if (options.countIn) {
        countInAborted = false
        countingIn.value = true
        // 预备拍期间启动瀑布流：序列已按预备拍时长延后，结束时正好到首音
        waterfall()?.play()
        try {
          await options.countIn()
        } finally {
          countingIn.value = false
        }
        if (countInAborted) {
          countInAborted = false
          waterfall()?.stop()
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
    handleRenderMusicScore: highlight
      ? (list) => {
          highlight.on?.renderMusicScore?.(list)
        }
      : undefined,
    setHighlightBpm: highlight?.setBpm,
    addNoteHighlight: highlight ? (noteId: string) => highlight.addNoteHighlight(noteId) : undefined,
    removeNoteHighlight: highlight
      ? (noteId: string) => highlight.removeNoteHighlight(noteId)
      : undefined,
    clearNoteHighlight: highlight ? () => highlight.clearHighlight() : undefined,
    subscribeProgressStart: playStore.subscribeProgressStart,
    unsubscribeProgressStart: playStore.unsubscribeProgressStart,
    subscribeOnEnd: playStore.subscribeOnEnd,
    unsubscribeOnEnd: playStore.unsubscribeOnEnd
  }
}
