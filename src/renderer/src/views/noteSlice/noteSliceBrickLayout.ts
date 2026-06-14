import type { KeySignatureTypeEnum, MusicScore } from 'deciphony-renderer'
import { KEY_ALTERATION } from '@renderer/dr-extensions/scoreUtil'

/** C 调下单小节音符块的谱宽（实测） */
export const NOTE_SLICE_BRICK_SCORE_WIDTH_C = 150

/** 调号每多一个变音号，谱宽增加量（可按皮肤微调） */
export const NOTE_SLICE_BRICK_SCORE_WIDTH_PER_KEY_ACC = 10

/** musicScore 上下留白（topSpaceHeight；底部由总高度减去内容区与顶留白实现） */
export const NOTE_SLICE_BRICK_SCORE_SPACE = 30

/** 五线谱内容区高度（不含 musicScore 上下留白） */
export const NOTE_SLICE_BRICK_STAFF_CONTENT_HEIGHT = 60

/** 音符块谱高 = 内容区 + 上下留白 */
export const NOTE_SLICE_BRICK_SCORE_HEIGHT =
  NOTE_SLICE_BRICK_STAFF_CONTENT_HEIGHT + NOTE_SLICE_BRICK_SCORE_SPACE * 2

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
