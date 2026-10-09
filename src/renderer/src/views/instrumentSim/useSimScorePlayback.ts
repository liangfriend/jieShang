import type { MusicScore, VDom } from '@deciphony/renderer'
import type {
  MusicScoreHighlightExpose,
  PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import { computed, onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import { useScorePagePlayback } from '@renderer/utils/scorePagePlayback/useScorePagePlayback'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'

/**
 * 模拟乐器页曲谱播放（页面模式）：播放高亮 + 当前音符跟滚居中 + 播放中锁住手动滚动。
 * 模板需：滚动容器绑 scoreScrollRef 与 scrollLocked，曲谱绑 @renderMusicScore="handleRenderMusicScore"。
 */
export function useSimScorePlayback(
  musicScore: Ref<MusicScore>,
  musicScoreRef: Ref<MusicScoreHighlightExpose | null>
) {
  const scoreScrollRef = ref<HTMLElement | null>(null)
  const vDomList = shallowRef<VDom[]>([])

  const scrollFollow = createScoreScrollToPlayingNote({
    getScrollContainer: () => scoreScrollRef.value,
    getVDomList: () => vDomList.value,
    findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null,
    getMusicScore: () => musicScore.value
  })

  const playback = useScorePagePlayback(musicScore, {
    musicScoreRef,
    onPlaybackStopped: () => scrollFollow.resetScroll()
  })

  const progressSubId = playback.subscribeProgressStart((_progress, data) => {
    scrollFollow.handleProgressStart(data as PlayHighlightProgressData)
  })
  onBeforeUnmount(() => playback.unsubscribeProgressStart(progressSubId))

  function handleRenderMusicScore(list: VDom[]) {
    vDomList.value = list
    playback.handleRenderMusicScore?.(list)
  }

  const scrollLocked = computed(() => playback.playbackState.value !== 'stopped')

  return { playback, scoreScrollRef, scrollLocked, handleRenderMusicScore }
}
