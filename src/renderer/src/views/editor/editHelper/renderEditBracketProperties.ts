import { BracketTypeEnum } from '@deciphony/renderer'
import type { Bracket, GrandStaff, MusicScore, SlotData } from '@deciphony/renderer'
import { createBracket } from '@deciphony/extensions/dr-edit/score-builder'

export type BracketEditSlot = SlotData & {
  self: Bracket
  grandStaff: GrandStaff
}

export const BRACKET_TYPE_VALUES: BracketTypeEnum[] = [
  BracketTypeEnum.Bracket,
  BracketTypeEnum.Brace,
  BracketTypeEnum.Square
]

/** 选择器选项（含「无」= 删除连谱号） */
export const BRACKET_TYPE_SELECT_VALUES: (BracketTypeEnum | '')[] = ['', ...BRACKET_TYPE_VALUES]

/** 当前选中项是否为连谱号 */
export function isBracketSelected(
  selected: SlotData | null
): selected is BracketEditSlot {
  const self = selected?.self
  const bracket = selected?.grandStaff?.bracket
  return self != null && bracket != null && (self as unknown) === bracket
}

export function setBracketType(bracket: Bracket, type: BracketTypeEnum): void {
  bracket.type = type
}

/** 删除复谱表上的连谱号 */
export function removeBracket(grandStaff: GrandStaff): boolean {
  if (!grandStaff.bracket) return false
  delete grandStaff.bracket
  return true
}

/**
 * 设置复谱表连谱号类型；type 为 '' / null 时清除。
 * 新建时默认从第 0 个单谱表起。
 */
export function setGrandStaffBracketType(
  grandStaff: GrandStaff,
  type: BracketTypeEnum | '' | null
): void {
  if (type === '' || type == null) {
    removeBracket(grandStaff)
    return
  }
  if (grandStaff.bracket) {
    grandStaff.bracket.type = type
    return
  }
  grandStaff.bracket = createBracket(type, 0)
}

/** 把连谱号（类型、起始单谱表）套到整首曲谱所有复谱表；source 为空时全部清除 */
export function applyBracketToAllGrandStaves(score: MusicScore, source: Bracket | undefined): void {
  for (const grandStaff of score.grandStaffs ?? []) {
    if (!source) {
      removeBracket(grandStaff)
      continue
    }
    if (grandStaff.bracket === source) continue
    if (grandStaff.bracket) {
      grandStaff.bracket.type = source.type
      grandStaff.bracket.startSingleStaffIndex = source.startSingleStaffIndex
    } else {
      grandStaff.bracket = createBracket(source.type, source.startSingleStaffIndex)
    }
  }
}
