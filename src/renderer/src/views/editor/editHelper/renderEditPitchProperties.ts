import type {DoubleSlotAffiliatedSymbol, MusicScore, SlotData} from '@deciphony/renderer'
import {PitchTypeEnum} from '@deciphony/renderer'
import {findPitchSymbol, isPitchSelected} from './renderEditPitchDrag'

export type PitchEditSlot = SlotData & {
  self: DoubleSlotAffiliatedSymbol
}

export const PITCH_TYPE_OPTIONS: PitchTypeEnum[] = [
  PitchTypeEnum['8va'],
  PitchTypeEnum['15ma'],
  PitchTypeEnum['22ma'],
]

export function getPitchType(sym: DoubleSlotAffiliatedSymbol): PitchTypeEnum {
  return sym.data?.pitch?.type ?? PitchTypeEnum['8va']
}

export function setPitchType(sym: DoubleSlotAffiliatedSymbol, type: PitchTypeEnum): void {
  if (!sym.data) sym.data = {}
  if (!sym.data.pitch) {
    sym.data.pitch = {
      relativeStartPoint: {x: 0, y: 0},
      relativeEndPoint: {x: 0, y: 0},
      type,
    }
    return
  }
  sym.data.pitch.type = type
}

export function resolvePitchSymbol(editSlot: SlotData): DoubleSlotAffiliatedSymbol | null {
  if (!isPitchSelected(editSlot)) return null
  return findPitchSymbol(editSlot.musicScore as MusicScore, editSlot.self.id)
}
