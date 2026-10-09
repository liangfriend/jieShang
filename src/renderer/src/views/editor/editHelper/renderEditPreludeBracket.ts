import {
  SingleSlotAffiliatedSymbolNameEnum,
  type MusicScore,
  type SingleSlotAffiliatedSymbol,
  type SlotData,
} from '@deciphony/renderer'
import {findSlotAffiliatedSymbol, isSlotAffiliatedSymbol} from './renderEditSlotAffiliated'

const PRELUDE_BRACKET_NAMES = new Set<string>([
  SingleSlotAffiliatedSymbolNameEnum.Prelude_bracket_left,
  SingleSlotAffiliatedSymbolNameEnum.Prelude_bracket_right,
])

/** 选中项是否为前奏括号（单 slot 附属） */
export function isPreludeBracketSelected(
  selected: SlotData | null,
): selected is SlotData & {self: SingleSlotAffiliatedSymbol} {
  const self = selected?.self
  return isSlotAffiliatedSymbol(self) && PRELUDE_BRACKET_NAMES.has(String(self.name))
}

export function findPreludeBracketSymbol(
  musicScore: MusicScore,
  symbolId: string,
): SingleSlotAffiliatedSymbol | null {
  const sym = findSlotAffiliatedSymbol(musicScore, symbolId)
  return sym && PRELUDE_BRACKET_NAMES.has(String(sym.name)) ? sym : null
}

export function isPreludeBracketLeft(sym: SingleSlotAffiliatedSymbol): boolean {
  return String(sym.name) === SingleSlotAffiliatedSymbolNameEnum.Prelude_bracket_left
}
