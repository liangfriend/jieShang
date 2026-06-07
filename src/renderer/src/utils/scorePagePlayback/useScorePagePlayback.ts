import type { MusicScore } from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import type { Ref as VueRef } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
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
 * dr-play / dr-play-highlight 为平级扩展，此处负责页面级粘合。
 */
export function useScorePagePlayback(
  musicScore: VueRef<MusicScore>,
  options: UseScorePagePlaybackOptions = {}
): ScorePagePlaybackController {
  const playStore = usePlayStore()
  const { playbackState, playDisabled, pauseDisabled, stopDisabled, bpm } = storeToRefs(playStore)

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

  onBeforeUnmount(() => {
    if (progressStartSubId) playStore.unsubscribeProgressStart(progressStartSubId)
    if (onEndSubId) playStore.unsubscribeOnEnd(onEndSubId)
    if (waterfallEndSubId) playStore.unsubscribeOnEnd(waterfallEndSubId)
  })

  async function handlePlay() {
    const sequence = toPlaySequence(musicScore.value)
    if (sequence.length === 0) {
      ElMessage.warning('当前曲谱没有可播放的内容')
      return
    }

    await playStore.waitReady()

    if (playbackState.value !== 'paused') {
      playStore.setPlaySequence(sequence)
    }

    waterfall()?.play()
    await playStore.play()
  }

  function handlePause() {
    playStore.pause()
    highlight?.handlePlaybackPause()
    waterfall()?.pause()
  }

  function handleStop() {
    playStore.stop()
    highlight?.handlePlaybackStop()
    waterfall()?.stop()
    waterfall()?.clearActiveParts()
  }

  return {
    playbackState,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    handlePlay,
    handlePause,
    handleStop,
    handleRenderMusicScore: highlight?.handleRenderMusicScore,
    setHighlightBpm: highlight?.setBpm
  }
}
