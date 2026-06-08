import type { VDom } from 'deciphony-renderer'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

export type BeginnerPlaybackState = 'stopped' | 'playing'

export type BeginnerPlaybackController = {
  playbackState: Ref<BeginnerPlaybackState>
  countingIn: Ref<boolean>
  playDisabled: ComputedRef<boolean>
  stopDisabled: ComputedRef<boolean>
  handlePlay: () => Promise<void>
  handleStop: () => void
  handleMidiBoxFinished: () => void
  handleRenderMusicScore?: (list: VDom[]) => void
}

export const beginnerPlaybackKey: InjectionKey<BeginnerPlaybackController> =
  Symbol('beginnerPlayback')
