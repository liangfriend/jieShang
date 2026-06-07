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

  onBeforeUnmount(() => {
    if (progressStartSubId) playStore.unsubscribeProgressStart(progressStartSubId)
    if (onEndSubId) playStore.unsubscribeOnEnd(onEndSubId)
  })

  async function handlePlay() {
    const sequence = toPlaySequence(musicScore.value)
    if (sequence.length === 0) {
      ElMessage.warning('当前曲谱没有可播放的内容')
      return
    }

    await playStore.waitReady()
    playStore.setPlaySequence(sequence)
    await playStore.play()
  }

  function handlePause() {
    playStore.pause()
    highlight?.handlePlaybackPause()
  }

  function handleStop() {
    playStore.stop()
    highlight?.handlePlaybackStop()
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
