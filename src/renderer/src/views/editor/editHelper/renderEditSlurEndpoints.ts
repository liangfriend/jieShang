import { AccidentalTypeEnum, MusicScoreTypeEnum, getMeasureSlots, slotSymbol } from '@deciphony/renderer'
import type { MusicScore, NotesInfo, NotesNumberInfo } from '@deciphony/renderer'
import type { PanelSegmentedOption } from './components/panel/types'

type Translate = (key: string, named: Record<string, unknown>) => string

const ACCIDENTAL_TEXT: Record<AccidentalTypeEnum, string> = {
  [AccidentalTypeEnum.Sharp]: '♯',
  [AccidentalTypeEnum.Flat]: '♭',
  [AccidentalTypeEnum.Double_sharp]: '𝄪',
  [AccidentalTypeEnum.Double_flat]: '𝄫',
  [AccidentalTypeEnum.Natural]: '♮'
}

/** 简谱音高文字：变音 + 数字 + 组合附加点（上方 U+0307 / 下方 U+0323） */
function numberPitchText(info: NotesNumberInfo): string {
  const octave = info.octaveDot ?? 0
  const dots = (octave > 0 ? '\u0307' : '\u0323').repeat(Math.abs(octave))
  const accidental = info.accidental ? ACCIDENTAL_TEXT[info.accidental.type] ?? '' : ''
  return `${accidental}${info.syllable}${dots}`
}

function findColumnInfos(musicScore: MusicScore, infoId: string): (NotesInfo | NotesNumberInfo)[] {
  for (const grandStaff of musicScore.grandStaffs) {
    for (const staff of grandStaff.staves) {
      for (const measure of staff.measures) {
        for (const measureSlot of getMeasureSlots(measure)) {
          const infos = (slotSymbol(measureSlot) as { notesInfo?: (NotesInfo | NotesNumberInfo)[] })
            .notesInfo
          if (Array.isArray(infos) && infos.some((info) => info.id === infoId)) return infos
        }
      }
    }
  }
  return []
}

/**
 * 连音线端点可选的音：infoId 所在列（同一 NoteSymbol / NoteNumber）的全部音，自下而上。
 * 简谱 label 为音高，线谱 label 为序号；吉他 / 鼓谱等不支持换音，返回空。
 */
export function slurColumnOptions(
  musicScore: MusicScore,
  infoId: string,
  t: Translate
): PanelSegmentedOption<string>[] {
  if (musicScore.type === MusicScoreTypeEnum.NumberNotation) {
    return (findColumnInfos(musicScore, infoId) as NotesNumberInfo[])
      .filter((info) => info.syllable !== 0)
      .map((info, index) => ({
        value: info.id,
        label: numberPitchText(info),
        title: t('editor.note.sameSlotNoteIndex', { n: index + 1 })
      }))
  }
  if (musicScore.type === MusicScoreTypeEnum.StandardStaff) {
    return [...(findColumnInfos(musicScore, infoId) as NotesInfo[])]
      .sort((a, b) => a.region - b.region)
      .map((info, index) => ({
        value: info.id,
        label: String(index + 1),
        title: t('editor.note.sameSlotNoteIndex', { n: index + 1 })
      }))
  }
  return []
}
