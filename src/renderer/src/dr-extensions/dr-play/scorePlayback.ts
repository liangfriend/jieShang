import type { MusicScore } from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import type { PlaySequence } from 'deciphony-player'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { Ref as VueRef } from 'vue'
import { storeToRefs } from 'pinia'
import { PIANO_TONE_COLOR_NAME, usePlayStore, type PlaybackState } from '@renderer/store/play.store'
import { getDrPlaySequence } from './play-util'

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
}

export const scorePlaybackKey: InjectionKey<ScorePlaybackController> = Symbol('scorePlayback')

/** 绑定当前页曲谱到全局 NPlayer；播放时再生成序列 */
export function useScorePlayback(musicScore: VueRef<MusicScore>): ScorePlaybackController {
  const playStore = usePlayStore()
  const { playbackState, playDisabled, pauseDisabled, stopDisabled } = storeToRefs(playStore)

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

  return {
    playbackState,
    playDisabled,
    pauseDisabled,
    stopDisabled,
    handlePlay,
    handlePause: () => playStore.pause(),
    handleStop: () => playStore.stop()
  }
}
