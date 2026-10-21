import type { MeasureNoteSymbol, SlotData } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import { isDrumNotesInfo, isDrumRestBody } from '@deciphony/extensions/dr-edit'
import { isNumberRestSelected, isRestSelected } from './renderEditDelete'
import { isNumberHeadSelected } from './numberNotation/renderEditNumberHeadDrag'
import { isNoteHeadSelected } from './standardStaff/renderEditNoteHeadDrag'
import { isSlurSelected } from './renderEditSlurDrag'
import { isVoltaSelected } from './renderEditVoltaDrag'
import { isBracketSelected } from './renderEditBracketProperties'
import { isPitchSelected } from './renderEditPitchDrag'
import { isPedalSelected } from './renderEditPedalDrag'
import { isArpeggioSelected } from './renderEditArpeggioDrag'
import { isStrummingSelected } from './renderEditStrummingDrag'
import { isPreludeBracketSelected } from './renderEditPreludeBracket'
import { isLineSelected, lineKeyOfSymbol } from './renderEditLineDrag'
import { isNoteAffiliatedSelected } from './renderEditNoteAffiliatedDrag'
import { isMeasureAffiliatedSelected } from './renderEditMeasureAffiliatedDrag'
import { isGraceNoteSelected } from './renderEditGraceNotes'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'
import { isBendSelected, isTabInfoSelected, isTabScore } from './tab/renderEditTabSelection'

/** 右侧属性栏种类；null 表示关闭 */
export type PropertyPanelKind =
  | 'measure'
  | 'noteHead'
  | 'numberHead'
  | 'grace'
  | 'rest'
  | 'numberRest'
  | 'volta'
  | 'slur'
  | 'bracket'
  | 'pitch'
  | 'noteMark'
  | 'measureMark'
  | 'trillLine'
  | 'hairpin'
  | 'guzhengLian'
  | 'pedal'
  | 'arpeggio'
  | 'strumming'
  | 'preludeBracket'
  | 'tabMeasure'
  | 'tabNote'
  | 'bend'
  | 'drumNote'
  | 'drumRest'
  | null

/**
 * 根据当前选中项决定展示哪一类属性栏。
 * 默认关闭；仅命中已知编辑模式时展开对应面板。
 */
export function resolvePropertyPanelKind(selected: SlotData | null): PropertyPanelKind {
  if (isBracketSelected(selected)) return 'bracket'
  // 单音符附属的 note / info 指向宿主，需先于音符头类判断
  if (isNoteAffiliatedSelected(selected)) return 'noteMark'
  // 单小节附属的 measure 指向宿主小节，需先于小节类判断
  if (isMeasureAffiliatedSelected(selected)) return 'measureMark'
  if (isLineSelected(selected)) {
    const key = lineKeyOfSymbol(selected.self)
    if (key === 'trill') return 'trillLine'
    if (key === 'guzhengLian') return 'guzhengLian'
    return 'hairpin'
  }
  if (isPedalSelected(selected)) return 'pedal'
  if (isArpeggioSelected(selected)) return 'arpeggio'
  if (isStrummingSelected(selected)) return 'strumming'
  if (isPreludeBracketSelected(selected)) return 'preludeBracket'
  if (isGraceNoteSelected(selected)) return 'grace'
  if (selected && isTabScore(selected.musicScore)) {
    if (isBendSelected(selected)) return 'bend'
    if (isSlurSelected(selected)) return 'slur'
    if (isTabInfoSelected(selected)) return 'tabNote'
    if (isMeasureAddMode(selected)) return 'tabMeasure'
  }
  if (selected?.musicScore.type === MusicScoreTypeEnum.DrumNotation) {
    if (isMeasureAddMode(selected)) return 'measure'
    if (selected.measure && isDrumNotesInfo(selected.info) && selected.self === selected.info) {
      return 'drumNote'
    }
    if (selected.measure && isDrumRestBody(selected.self as unknown as MeasureNoteSymbol)) {
      return 'drumRest'
    }
    if (isVoltaSelected(selected)) return 'volta'
    if (isSlurSelected(selected)) return 'slur'
    if (isPitchSelected(selected)) return 'pitch'
    return null
  }
  if (isMeasureAddMode(selected)) return 'measure'
  if (isNumberRestSelected(selected)) return 'numberRest'
  if (isNumberHeadSelected(selected)) return 'numberHead'
  if (isNoteHeadSelected(selected)) return 'noteHead'
  if (isRestSelected(selected)) return 'rest'
  if (isVoltaSelected(selected)) return 'volta'
  if (isSlurSelected(selected)) return 'slur'
  if (isPitchSelected(selected)) return 'pitch'
  return null
}
