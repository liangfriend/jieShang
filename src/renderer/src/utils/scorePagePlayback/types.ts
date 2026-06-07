import type { VDom } from 'deciphony-renderer'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { MusicScoreHighlightExpose } from '@renderer/dr-extensions/dr-play-highlight'
import type { PlaybackState } from '@renderer/store/play.store'

export type { PlaybackState }

export type UseScorePagePlaybackOptions = {
  musicScoreRef?: Ref<MusicScoreHighlightExpose | null>
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
