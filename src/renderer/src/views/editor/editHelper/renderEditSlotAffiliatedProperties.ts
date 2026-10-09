import {ArpeggioTypeEnum, type Measure, type MusicScore, type SingleSlotAffiliatedSymbol} from '@deciphony/renderer'
import {
  DEFAULT_MEASURE_HEIGHT,
  locateSlotAffiliatedSymbolById,
} from '@deciphony/extensions/dr-edit/score-builder'

type SlotGeometry = NonNullable<SingleSlotAffiliatedSymbol['data']['arpeggio' | 'strumming']>

function geometryOf(sym: SingleSlotAffiliatedSymbol): SlotGeometry | null {
  return sym.data.arpeggio ?? sym.data.strumming ?? null
}

export function getSlotAffiliatedArrow(sym: SingleSlotAffiliatedSymbol): boolean {
  return geometryOf(sym)?.arrow !== false
}

export function setSlotAffiliatedArrow(sym: SingleSlotAffiliatedSymbol, arrow: boolean): void {
  const geom = geometryOf(sym)
  if (geom) geom.arrow = arrow
}

export function getArpeggioType(sym: SingleSlotAffiliatedSymbol): ArpeggioTypeEnum {
  return sym.data.arpeggio?.type ?? ArpeggioTypeEnum.Normal
}

export function setArpeggioType(sym: SingleSlotAffiliatedSymbol, type: ArpeggioTypeEnum): void {
  if (sym.data.arpeggio) sym.data.arpeggio.type = type
}

function defaultEndY(musicScore: MusicScore, symbolId: string): number {
  const measure = locateSlotAffiliatedSymbolById(musicScore, symbolId)?.measure as
    | (Measure & {h?: number})
    | undefined
  const h = typeof measure?.h === 'number' && measure.h > 0 ? measure.h : DEFAULT_MEASURE_HEIGHT
  return -h
}

export function hasSlotAffiliatedOffset(musicScore: MusicScore, sym: SingleSlotAffiliatedSymbol): boolean {
  const geom = geometryOf(sym)
  if (!geom) return false
  const {relativeStartPoint: s, relativeEndPoint: e} = geom
  return s.x !== 0 || s.y !== 0 || e.x !== 0 || e.y !== defaultEndY(musicScore, sym.id)
}

/** 恢复为创建时的默认起止点（两端同列锚点，终点上移一个小节高） */
export function resetSlotAffiliatedGeometry(musicScore: MusicScore, sym: SingleSlotAffiliatedSymbol): void {
  const geom = geometryOf(sym)
  if (!geom) return
  geom.relativeStartPoint = {x: 0, y: 0}
  geom.relativeEndPoint = {x: 0, y: defaultEndY(musicScore, sym.id)}
}
