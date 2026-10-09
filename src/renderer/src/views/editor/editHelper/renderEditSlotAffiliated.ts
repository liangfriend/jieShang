import {getMeasureSlots, SingleSlotAffiliatedSymbolNameEnum} from '@deciphony/renderer'
import type {MeasureNoteSlot, MusicScore, SingleSlotAffiliatedSymbol} from '@deciphony/renderer'
import {locateSlotAffiliatedSymbolById} from '@deciphony/extensions/dr-edit/score-builder'

/** 单 slot 附属（琶音 / 扫弦）挂在宿主 MeasureNoteSlot.affiliatedSymbols，不在 musicScore.affiliatedSymbols */
const SLOT_AFFILIATED_NAMES = new Set<string>(Object.values(SingleSlotAffiliatedSymbolNameEnum))

export function isSlotAffiliatedSymbol(self: unknown): self is SingleSlotAffiliatedSymbol {
  return (
    self != null
    && typeof self === 'object'
    && 'name' in self
    && SLOT_AFFILIATED_NAMES.has(String((self as {name: unknown}).name))
    && !('startId' in self)
  )
}

export function findMeasureSlotById(musicScore: MusicScore, slotId: string): MeasureNoteSlot | null {
  for (const grandStaff of musicScore.grandStaffs) {
    for (const staff of grandStaff.staves) {
      for (const measure of staff.measures) {
        const hit = getMeasureSlots(measure).find((slot) => slot.id === slotId)
        if (hit) return hit
      }
    }
  }
  return null
}

export function findSlotAffiliatedSymbol(
  musicScore: MusicScore,
  symbolId: string,
): SingleSlotAffiliatedSymbol | null {
  return locateSlotAffiliatedSymbolById(musicScore, symbolId)?.symbol ?? null
}

export function listSlotAffiliatedOnSlot(
  musicScore: MusicScore,
  slotId: string,
  names: ReadonlySet<string>,
): SingleSlotAffiliatedSymbol[] {
  const slot = findMeasureSlotById(musicScore, slotId)
  return (slot?.affiliatedSymbols ?? []).filter((sym) => names.has(String(sym.name)))
}

export function addSlotAffiliatedSymbol(slot: MeasureNoteSlot, symbol: SingleSlotAffiliatedSymbol): void {
  if (!Array.isArray(slot.affiliatedSymbols)) slot.affiliatedSymbols = []
  slot.affiliatedSymbols.push(symbol)
}

export function removeSlotAffiliatedSymbol(musicScore: MusicScore, symbolId: string): boolean {
  const located = locateSlotAffiliatedSymbolById(musicScore, symbolId)
  if (!located) return false
  located.slot.affiliatedSymbols!.splice(located.symbolIndex, 1)
  return true
}
