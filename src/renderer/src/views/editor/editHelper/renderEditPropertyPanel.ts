import type {SlotData} from 'deciphony-renderer'
import {isRestSelected} from './renderEditDelete'
import {isNumberHeadSelected} from './numberNotation/renderEditNumberHeadDrag'
import {isNoteHeadSelected} from './standardStaff/renderEditNoteHeadDrag'
import {isSlurSelected} from './renderEditSlurDrag'
import {isVoltaSelected} from './renderEditVoltaDrag'
import {isMeasureAddMode} from './standardStaff/renderEditSymbolAddAction'

/** 右侧属性栏种类；null 表示关闭 */
export type PropertyPanelKind = 'measure' | 'noteHead' | 'numberHead' | 'rest' | 'volta' | 'slur' | null

/**
 * 根据当前选中项决定展示哪一类属性栏。
 * 默认关闭；仅命中已知编辑模式时展开对应面板。
 */
export function resolvePropertyPanelKind(selected: SlotData | null): PropertyPanelKind {
  if (isMeasureAddMode(selected)) return 'measure'
  if (isNumberHeadSelected(selected)) return 'numberHead'
  if (isNoteHeadSelected(selected)) return 'noteHead'
  if (isRestSelected(selected)) return 'rest'
  if (isVoltaSelected(selected)) return 'volta'
  if (isSlurSelected(selected)) return 'slur'
  return null
}
