import type { MusicScore } from 'deciphony-renderer'
import type { ComputedRef, Ref } from 'vue'
import type { InjectionKey } from 'vue'
import { onMounted, watch, type Ref as VueRef } from 'vue'
import { storeToRefs } from 'pinia'
import { PIANO_TONE_COLOR_NAME, usePlayStore, type PlaybackState } from '@renderer/store/play.store'
import { getDrPlaySequence } from './play-util'
import type { PlaySequence } from 'deciphony-player'

/** DR 播放序列 → NPlayer 播放序列 */
export function toPlaySequence(musicScore: MusicScore): PlaySequence {
  const drSeq = getDrPlaySequence(musicScore)
  let endIdx = -1
  let maxEnd = -1
  drSeq.forEach((it, i) => {
    const end = it.playTime + it.duration
    if (end > maxEnd) {
      maxEnd = end
      endIdx = i
    }
  })
  return drSeq.map((it, i) => ({
    id: it.note_id,
    midi: it.midi,
    duration: it.real_duration != null ? it.real_duration : it.duration,
    playTime: it.playTime,
    toneColor: PIANO_TONE_COLOR_NAME,
    data: { note_id: it.note_id },
    end: i === endIdx
  }))
}

export type { PlaybackState }

export type ScorePlaybackController = {
  playbackState: Ref<PlaybackState>
  playDisabled: ComputedRef<boolean>
  pauseDisabled: ComputedRef<boolean>
  stopDisabled: ComputedRef<boolean>
  handlePlay: () => Promise<void>
  handlePause: () => void
  handleStop: () => void
  refreshSequence: () => void
}

export const scorePlaybackKey: InjectionKey<ScorePlaybackController> = Symbol('scorePlayback')

/** 绑定当前页曲谱到全局 NPlayer 播放序列 */
export function useScorePlayback(musicScore: VueRef<MusicScore>): ScorePlaybackController {
  const playStore = usePlayStore()
  const { playbackState, playDisabled, pauseDisabled, stopDisabled } = storeToRefs(playStore)

  function refreshSequence() {
    playStore.refreshSequence(toPlaySequence(musicScore.value))
  }

  onMounted(async () => {
    await playStore.waitReady()
    playStore.setPlaySequence(toPlaySequence(musicScore.value))
  })

  watch(musicScore, () => refreshSequence(), { deep: true })

  return {
    playbackState,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    handlePlay: () => playStore.play(),
    handlePause: () => playStore.pause(),
    handleStop: () => playStore.stop(),
    refreshSequence
  }
}
