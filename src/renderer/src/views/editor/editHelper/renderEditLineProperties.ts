import type {DoubleSlotAffiliatedSymbol, MusicScore, SlotData} from '@deciphony/renderer'
import {GuzhengLianTypeEnum, HairpinTypeEnum, TrillTypeEnum} from '@deciphony/renderer'
import {findLineSymbol, isLineSelected} from './renderEditLineDrag'

export const GUZHENG_LIAN_TYPE_OPTIONS: GuzhengLianTypeEnum[] = [
  GuzhengLianTypeEnum.Tuo,
  GuzhengLianTypeEnum.Pi,
  GuzhengLianTypeEnum.Mo,
  GuzhengLianTypeEnum.Tiao,
  GuzhengLianTypeEnum.Gou,
  GuzhengLianTypeEnum.Ti,
  GuzhengLianTypeEnum.Da,
  GuzhengLianTypeEnum.Zhai,
]

export const TRILL_TYPE_OPTIONS: TrillTypeEnum[] = [
  TrillTypeEnum.Trill,
  TrillTypeEnum.Upprall,
  TrillTypeEnum.Downprall,
  TrillTypeEnum.Prallprall,
]

export const HAIRPIN_TYPE_OPTIONS: HairpinTypeEnum[] = [
  HairpinTypeEnum.Crescendo_hairpin,
  HairpinTypeEnum.Diminuendo_hairpin,
  HairpinTypeEnum.Crescendo_line,
  HairpinTypeEnum.Diminuendo_line,
]

/** 与 renderer 缺省楔形开口一致 */
export const DEFAULT_HAIRPIN_HEIGHT = 12
export const HAIRPIN_HEIGHT_MIN = 4
export const HAIRPIN_HEIGHT_MAX = 40

const ZERO = () => ({x: 0, y: 0})

export function resolveLineSymbol(editSlot: SlotData): DoubleSlotAffiliatedSymbol | null {
  if (!isLineSelected(editSlot)) return null
  return findLineSymbol(editSlot.musicScore as MusicScore, editSlot.self.id)
}

export function getTrillType(sym: DoubleSlotAffiliatedSymbol): TrillTypeEnum {
  return sym.data?.trill?.type ?? TrillTypeEnum.Trill
}

export function setTrillType(sym: DoubleSlotAffiliatedSymbol, type: TrillTypeEnum): void {
  if (!sym.data) sym.data = {}
  if (!sym.data.trill) {
    sym.data.trill = {relativeStartPoint: ZERO(), relativeEndPoint: ZERO(), type}
    return
  }
  sym.data.trill.type = type
}

export function getHairpinType(sym: DoubleSlotAffiliatedSymbol): HairpinTypeEnum {
  return sym.data?.hairpin?.type ?? HairpinTypeEnum.Crescendo_hairpin
}

export function setHairpinType(sym: DoubleSlotAffiliatedSymbol, type: HairpinTypeEnum): void {
  if (!sym.data) sym.data = {}
  if (!sym.data.hairpin) {
    sym.data.hairpin = {relativeStartPoint: ZERO(), relativeEndPoint: ZERO(), type}
    return
  }
  sym.data.hairpin.type = type
}

/** 楔形开口高度仅对 *_hairpin 生效；cresc. / dim. 文字线无此属性 */
export function isWedgeHairpin(type: HairpinTypeEnum): boolean {
  return type === HairpinTypeEnum.Crescendo_hairpin || type === HairpinTypeEnum.Diminuendo_hairpin
}

export function getHairpinHeight(sym: DoubleSlotAffiliatedSymbol): number {
  return sym.data?.hairpin?.height ?? DEFAULT_HAIRPIN_HEIGHT
}

export function setHairpinHeight(sym: DoubleSlotAffiliatedSymbol, height: number): void {
  if (!sym.data?.hairpin) return
  sym.data.hairpin.height = height
}

export function getGuzhengLianType(sym: DoubleSlotAffiliatedSymbol): GuzhengLianTypeEnum {
  return sym.data?.guzhengLian?.type ?? GuzhengLianTypeEnum.Tuo
}

export function setGuzhengLianType(sym: DoubleSlotAffiliatedSymbol, type: GuzhengLianTypeEnum): void {
  if (!sym.data) sym.data = {}
  if (!sym.data.guzhengLian) {
    sym.data.guzhengLian = {relativeStartPoint: ZERO(), relativeEndPoint: ZERO(), type}
    return
  }
  sym.data.guzhengLian.type = type
}
