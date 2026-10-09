import { computed, unref, type MaybeRef } from 'vue'
import type { MusicScore } from '@deciphony/renderer'
import { drLyrics, type LyricsMode } from '@deciphony/extensions/dr-lyrics'
import { drInstrumentName } from '@deciphony/extensions/dr-instrument-name'
import { SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { SCORE_INSTRUMENT_NAME_GAP } from '@renderer/utils/scoreGdSlotHeight'
import {
  readScoreSlotHeights,
  readShowInstrumentName
} from '@renderer/utils/scoreSpacingDefaults'

/**
 * 曲谱歌词 + 音色名扩展（对齐 @deciphony/test renderLyricsTest）。
 * 展示页 mode='show'；编辑页 mode='edit'。
 *
 * g-d / t 高度、s-l / s-r 宽度、歌词字号与字体读 musicScore.data
 *（gdSlotH / tSlotH / sLSlotW / sRSlotW / lyricsFontSize / lyricsFontFamily / titleFontFamily）；s-d 固定为 0。
 * data.showInstrumentName 为 true 时在 s-l 挂 dr-instrument-name。
 * 宿主若自定义 `#g-d`，需手动渲染 LyricsSlot，并继续传入 extensions。
 * 不渲染 `#t` 的单行模式（练习 / 新手 / 唱歌）传 showTitle: false，t 区高度为 0。
 */
export function createScoreLyricsExtension(
  mode: MaybeRef<LyricsMode> = 'show',
  musicScore: MaybeRef<MusicScore>,
  options: { showTitle?: boolean } = {}
) {
  const showTitle = options.showTitle ?? true
  const slotHeights = computed(() => readScoreSlotHeights(unref(musicScore)))
  const extension = drLyrics({
    mode,
    fontSize: computed(() => slotHeights.value.lyricsFontSize),
    fontFamily: computed(() => slotHeights.value.lyricsFontFamily || undefined)
  })
  const instrumentNameExtension = drInstrumentName({ gap: SCORE_INSTRUMENT_NAME_GAP })
  const slotProps = computed(() => {
    const raw = extension.props
    return typeof raw === 'function' ? raw() : (raw ?? {})
  })
  const extensions = computed(() =>
    readShowInstrumentName(unref(musicScore))
      ? [extension, instrumentNameExtension]
      : [extension]
  )
  const slotConfig = computed(() => {
    const { gdSlotH, tSlotH, sLSlotW, sRSlotW } = slotHeights.value
    return {
      ...SCORE_SLOT_CONFIG,
      's-l': { w: sLSlotW },
      's-r': { w: sRSlotW },
      t: { h: showTitle ? tSlotH : 0 },
      'g-d': { h: gdSlotH }
    }
  })
  /** 标题区左右内边距：与 s-l / s-r 对齐，标题居中于谱表区 */
  const titlePadding = computed(() => ({
    left: slotHeights.value.sLSlotW,
    right: slotHeights.value.sRSlotW
  }))
  const titleFontFamily = computed(() => slotHeights.value.titleFontFamily || undefined)
  return { extension, extensions, slotProps, slotConfig, titlePadding, titleFontFamily }
}
