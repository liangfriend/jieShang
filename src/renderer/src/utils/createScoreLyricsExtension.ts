import { computed, unref, type MaybeRef, type Ref } from 'vue'
import type { MusicScore, VDom } from '@deciphony/renderer'
import { drLyrics, type LyricsMode } from '@deciphony/extensions/dr-lyrics'
import { drInstrumentName } from '@deciphony/extensions/dr-instrument-name'
import { SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { activePlayLyrics } from '@renderer/utils/scorePagePlayback/playLyricsHighlight'
import { SCORE_INSTRUMENT_NAME_GAP } from '@renderer/utils/scoreGdSlotHeight'
import {
  readScoreSlotHeights,
  readShowInstrumentName
} from '@renderer/utils/scoreSpacingDefaults'

/** drLyrics 的 props()：宿主自定义 #s-d 时 v-bind 到 LyricsSlot */
type LyricsSlotBindProps = {
  mode: MaybeRef<LyricsMode>
  vDomList: VDom[] | Ref<VDom[]>
} & Record<string, unknown>

/**
 * 曲谱歌词 + 音色名扩展（对齐 @deciphony/test renderLyricsTest）。
 * 展示页 mode='show'；编辑页 mode='edit'。
 *
 * t 高度、s-l / s-r 宽度、歌词字号与字体读 musicScore.data
 *（tSlotH / sLSlotW / sRSlotW / lyricsFontSize / lyricsFontFamily / titleFontFamily / instrumentNameFontFamily）。
 * 歌词挂每个单谱表的 s-d；s-d、g-d 高度固定 0（覆盖扩展默认），歌词往下画进单谱表下外边距。
 * data.showInstrumentName 为 true 时在 s-l 挂 dr-instrument-name。
 * 宿主若自定义 `#s-d`，需手动渲染 LyricsSlot，并继续传入 extensions。
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
    fontFamily: computed(() => slotHeights.value.lyricsFontFamily || undefined),
    activeLyrics: activePlayLyrics
  })
  const instrumentNameExtension = drInstrumentName({
    gap: SCORE_INSTRUMENT_NAME_GAP,
    fontFamily: computed(() => slotHeights.value.instrumentNameFontFamily || undefined)
  })
  const slotProps = computed(() => {
    const raw = extension.props
    return (typeof raw === 'function' ? raw() : (raw ?? {})) as LyricsSlotBindProps
  })
  const extensions = computed(() =>
    readShowInstrumentName(unref(musicScore))
      ? [extension, instrumentNameExtension]
      : [extension]
  )
  const slotConfig = computed(() => {
    const { tSlotH, sLSlotW, sRSlotW } = slotHeights.value
    return {
      ...SCORE_SLOT_CONFIG,
      's-l': { w: sLSlotW },
      's-r': { w: sRSlotW },
      t: { h: showTitle ? tSlotH : 0 }
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
