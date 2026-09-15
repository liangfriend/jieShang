import { ref } from 'vue'
import {
  LYRICS_PAD_BOTTOM,
  LYRICS_PAD_TOP,
  LYRICS_ROW_GAP
} from '@deciphony/extensions/dr-lyrics'

/** g-d 底部复谱表按钮预留 */
export const SCORE_GD_BTN_RESERVE = 40

/**
 * 默认可容纳约 4 行歌词的 g-d 高度（含底部按钮预留）。
 * 歌词行数变化不再改 g-d，由此常量（及工具栏调节）整体控制。
 */
export const DEFAULT_SCORE_GD_SLOT_H =
  LYRICS_PAD_TOP + 4 * LYRICS_ROW_GAP + LYRICS_PAD_BOTTOM + SCORE_GD_BTN_RESERVE

/** 全局可调的 g-d 高度（像素） */
export const scoreGdSlotHeight = ref(DEFAULT_SCORE_GD_SLOT_H)

export const SCORE_GD_SLOT_H_MIN = 40
export const SCORE_GD_SLOT_H_MAX = 400
export const SCORE_GD_SLOT_H_STEP = 4
