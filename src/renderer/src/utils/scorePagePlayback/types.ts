import type { PlaySequence } from '@deciphony/player'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  MusicScoreHighlightExpose,
  usePlayHighlight
} from '@deciphony/extensions/dr-play-highlight'
import type { EndListener, PlaybackState, ProgressListener } from '@renderer/store/play.store'
import type { ScoreScrollFollowApi } from '@renderer/utils/scoreScrollToPlayingNote'

export type { ProgressListener }
import type { WaterfallScoreStats } from '@renderer/types/types'
import type { PlayRange, PlayRangeSelect } from './usePlayRangeSelect'

export type { PlaybackState }

/** 与 music-score 的 renderMusicScore(list, info) 同签名 */
export type RenderMusicScoreHandler = NonNullable<
  NonNullable<ReturnType<typeof usePlayHighlight>['on']>['renderMusicScore']
>

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
  /** 清空弹奏数据时回调（如清除曲谱音符 filter） */
  onClearPlayData?: () => void
  /** 预生成的播放序列（练习模式进入页面时构建，播放时不再重建） */
  getPlaySequence?: () => PlaySequence
  /** 选段播放区间；返回 null 播放整首。与暂停时的区间不同则从选段开头重播 */
  getPlayRange?: () => PlayRange | null
}

export type PianoWaterfallPlaybackExpose = {
  play: () => void
  pause: () => void
  stop: () => void
  clearActiveParts: () => void
  /** 演示播放：按 noteId 强制 perfect 并点亮水柱 */
  perfectHitNote?: (noteId: string) => void
  perfectReleaseNote?: (midi: number, endMs?: number) => void
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
  handleRenderMusicScore?: RenderMusicScoreHandler
  setHighlightBpm?: (bpm: number) => void
  /** 按音符 id 高亮（范唱/伴奏 APlayer 进度对齐用） */
  addNoteHighlight?: (noteId: string) => void
  removeNoteHighlight?: (noteId: string) => void
  clearNoteHighlight?: () => void
  /** 订阅播放进度开始（页面可二次订阅，做滚动等独有逻辑） */
  subscribeProgressStart: (listener: ProgressListener) => string
  unsubscribeProgressStart: (id: string) => void
  /** 订阅播放结束（页面可二次订阅） */
  subscribeOnEnd: (listener: EndListener) => string
  unsubscribeOnEnd: (id: string) => void
}

export const scorePagePlaybackKey: InjectionKey<ScorePagePlaybackController> =
  Symbol('scorePagePlayback')

/** 工具栏 inject 沿用此 key */
export const scorePlaybackKey = scorePagePlaybackKey

/** 选段（play 页提供，工具栏选段按钮使用） */
export const scorePlayRangeKey: InjectionKey<PlayRangeSelect> = Symbol('scorePlayRange')

/** 曲谱/范唱/伴奏跟滚（play 页提供，工具栏音频进度使用） */
export const scoreScrollFollowKey: InjectionKey<ScoreScrollFollowApi> = Symbol('scoreScrollFollow')
