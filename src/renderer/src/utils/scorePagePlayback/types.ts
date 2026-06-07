import type { VDom } from 'deciphony-renderer'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { MusicScoreHighlightExpose } from '@renderer/dr-extensions/dr-play-highlight'
import type { PlaybackState } from '@renderer/store/play.store'
import type { WaterfallScoreStats } from '@renderer/types/types'

export type { PlaybackState }

export type UseScorePagePlaybackOptions = {
  musicScoreRef?: Ref<MusicScoreHighlightExpose | null>
  /** 与曲谱播放同步的瀑布流控制（play / pause / stop） */
  waterfallRef?: Ref<PianoWaterfallPlaybackExpose | null>
}

export type PianoWaterfallPlaybackExpose = {
  play: () => void
  pause: () => void
  stop: () => void
  clearActiveParts: () => void
  stats: WaterfallScoreStats
}

export type ScorePagePlaybackController = {
  playbackState: Ref<PlaybackState>
  playDisabled: ComputedRef<boolean>
  pauseDisabled: ComputedRef<boolean>
  stopDisabled: ComputedRef<boolean>
  handlePlay: () => Promise<void>
  handlePause: () => void
  handleStop: () => void
  handleRenderMusicScore?: (list: VDom[]) => void
  setHighlightBpm?: (bpm: number) => void
}

export const scorePagePlaybackKey: InjectionKey<ScorePagePlaybackController> =
  Symbol('scorePagePlayback')

/** 工具栏 inject 沿用此 key */
export const scorePlaybackKey = scorePagePlaybackKey
