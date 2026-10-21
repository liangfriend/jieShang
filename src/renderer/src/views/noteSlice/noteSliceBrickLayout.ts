import type { KeySignatureTypeEnum, MusicScore } from '@deciphony/renderer'
import { KEY_ALTERATION } from '@deciphony/extensions/score-util'

/** C 调下单小节音符块的谱宽（实测） */
export const NOTE_SLICE_BRICK_SCORE_WIDTH_C = 150

/** 调号每多一个变音号，谱宽增加量（可按皮肤微调） */
export const NOTE_SLICE_BRICK_SCORE_WIDTH_PER_KEY_ACC = 10

/**
 * 五线谱上方留白（topSpaceHeight）。最高可出到上加二线并带临时记号（如 C♭6），
 * 降号 / 重降号的竖杆还会再高出约 2 个间，少于约 45 会被裁掉。
 */
export const NOTE_SLICE_BRICK_SCORE_SPACE = 60

/** 五线谱下方留白：最低可出到下加二线并带升号（如中音谱号 B♯2），约需 40 */
export const NOTE_SLICE_BRICK_SCORE_BOTTOM_SPACE = 50

/** 五线谱内容区高度：皮肤小节高（measure.h），插槽高度为 0 */
export const NOTE_SLICE_BRICK_STAFF_CONTENT_HEIGHT = 45

/** 音符块谱高 = 上留白 + 内容区 + 下留白 */
export const NOTE_SLICE_BRICK_SCORE_HEIGHT =
  NOTE_SLICE_BRICK_SCORE_SPACE +
  NOTE_SLICE_BRICK_STAFF_CONTENT_HEIGHT +
  NOTE_SLICE_BRICK_SCORE_BOTTOM_SPACE

export const NOTE_SLICE_BRICK_GRAND_STAFF_SPACING = {
  uSpace: 0,
  dSpace: 0
} as const

export const NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING = {
  uSpaceI: 0,
  dSpaceI: 0,
  uSpaceO: 0,
  dSpaceO: 0
} as const

export function resolveNoteSliceBrickScoreWidth(keySignature: KeySignatureTypeEnum): number {
  const keyAccCount = KEY_ALTERATION[keySignature]?.count ?? 0
  return NOTE_SLICE_BRICK_SCORE_WIDTH_C + keyAccCount * NOTE_SLICE_BRICK_SCORE_WIDTH_PER_KEY_ACC
}

export function applyNoteSliceBrickStaffSpacing(score: MusicScore): void {
  score.topSpaceHeight = NOTE_SLICE_BRICK_SCORE_SPACE
  for (const grandStaff of score.grandStaffs) {
    grandStaff.uSpace = NOTE_SLICE_BRICK_GRAND_STAFF_SPACING.uSpace
    grandStaff.dSpace = NOTE_SLICE_BRICK_GRAND_STAFF_SPACING.dSpace
    for (const staff of grandStaff.staves) {
      staff.uSpaceI = NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING.uSpaceI
      staff.dSpaceI = NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING.dSpaceI
      staff.uSpaceO = NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING.uSpaceO
      staff.dSpaceO = NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING.dSpaceO
    }
  }
}

/** 生成后按调号修正 musicScore 尺寸与间距 */
export function applyNoteSliceBrickScoreLayout(
  score: MusicScore,
  keySignature: KeySignatureTypeEnum
): void {
  score.width = resolveNoteSliceBrickScoreWidth(keySignature)
  score.height = NOTE_SLICE_BRICK_SCORE_HEIGHT
  applyNoteSliceBrickStaffSpacing(score)
}

// ---------- 简谱音符块 ----------

/**
 * 简谱单小节音符块谱宽：`1=X` 调号（≈29）+ 拍号（30）+ 数字音符（20）+ 小节线与列间距。
 * 简谱调号宽度不随升降号数量变化，故为常量。
 */
export const NOTE_SLICE_JIANPU_BRICK_SCORE_WIDTH = 130

/** 简谱小节高度（默认皮肤 numberNotation.measure.h = 45；八度点 / 拍号会略超出小节上下沿） */
export const NOTE_SLICE_JIANPU_BRICK_MEASURE_HEIGHT = 45

/**
 * 简谱音符块上下留白：需容纳八度点与 56 高的拍号；练习模式音域可到 MIDI 21–108，八度点会更多。
 * 谱高保持不超过谱宽（130），音符块的缩放比例不受影响。
 */
export const NOTE_SLICE_JIANPU_BRICK_SCORE_SPACE = 40

export const NOTE_SLICE_JIANPU_BRICK_SCORE_HEIGHT =
  NOTE_SLICE_JIANPU_BRICK_MEASURE_HEIGHT + NOTE_SLICE_JIANPU_BRICK_SCORE_SPACE * 2

/** 简谱音符块：固定尺寸（与调号无关），间距与线谱块一致（全部置零，由 topSpaceHeight 控制留白） */
export function applyNoteSliceJianpuBrickScoreLayout(score: MusicScore): void {
  score.width = NOTE_SLICE_JIANPU_BRICK_SCORE_WIDTH
  score.height = NOTE_SLICE_JIANPU_BRICK_SCORE_HEIGHT
  applyNoteSliceBrickStaffSpacing(score)
  score.topSpaceHeight = NOTE_SLICE_JIANPU_BRICK_SCORE_SPACE
}
