import { computed, type MaybeRef } from 'vue'
import { drLyrics, type LyricsMode } from '@deciphony/extensions/dr-lyrics'
import { SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { scoreGdSlotHeight } from '@renderer/utils/scoreGdSlotHeight'

/**
 * 曲谱歌词扩展（对齐 @deciphony/test renderLyricsTest）。
 * 展示页 mode='show'；编辑页 mode='edit'。
 *
 * g-d 高度由 scoreGdSlotHeight 整体控制，不随歌词行数变化。
 * 宿主若自定义 `#g-d`，需手动渲染 LyricsSlot，并继续传入 extensions。
 */
export function createScoreLyricsExtension(mode: MaybeRef<LyricsMode> = 'show') {
  const extension = drLyrics({ mode })
  const slotProps = computed(() => {
    const raw = extension.props
    return typeof raw === 'function' ? raw() : (raw ?? {})
  })
  const slotConfig = computed(() => ({
    ...SCORE_SLOT_CONFIG,
    'g-d': { h: scoreGdSlotHeight.value }
  }))
  return { extension, extensions: [extension], slotProps, slotConfig }
}
