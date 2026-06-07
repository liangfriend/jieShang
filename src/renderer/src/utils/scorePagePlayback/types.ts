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
  /** 正式播放前的预备拍（练习模式打一小节节拍器），结束后 resolve */
  countIn?: () => Promise<void>
  /** 正式播放开始后回调（如开启循环节拍器） */
  onPlayStarted?: () => void
  /** 暂停时回调（如暂停节拍器） */
  onPlaybackPaused?: () => void
  /** 播放停止时回调（如停止节拍器） */
  onPlaybackStopped?: () => void
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
  /** 是否处于预备拍阶段 */
  countingIn: Ref<boolean>
  playDisabled: ComputedRef<boolean>
  pauseDisabled: ComputedRef<boolean>
  stopDisabled: ComputedRef<boolean>
  handlePlay: () => Promise<void>
  handlePause: () => void
  handleStop: () => void
  /** 清空瀑布流激活样式与评分（不停止播放） */
  handleClearPlayData?: () => void
  handleRenderMusicScore?: (list: VDom[]) => void
  setHighlightBpm?: (bpm: number) => void
}

export const scorePagePlaybackKey: InjectionKey<ScorePagePlaybackController> =
  Symbol('scorePagePlayback')

/** 工具栏 inject 沿用此 key */
export const scorePlaybackKey = scorePagePlaybackKey
