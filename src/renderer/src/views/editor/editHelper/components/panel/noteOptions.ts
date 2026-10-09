import type { BeamTypeEnum, Chronaxie, NotesNumberInfo } from '@deciphony/renderer'
import { useI18n } from 'vue-i18n'
import {
  resolveAugmentationDotLabel,
  resolveBeamTypeLabel,
  resolveNoteDurationLabel,
  resolveOctaveDotLabel,
  resolveRestDurationLabel,
  resolveStemDirectionLabel,
  resolveSyllableLabel
} from '@renderer/i18n/helpers'
import type { PanelSegmentedOption } from './types'

/** 音符 / 休止符属性栏里各按钮组的选项（短标签 + 完整名称悬停提示） */
export function useNoteSegmentOptions() {
  const { t } = useI18n()

  function durations(values: Chronaxie[], kind: 'note' | 'rest' = 'note'): PanelSegmentedOption<Chronaxie>[] {
    return values.map((value) => ({
      value,
      label: t(`editor.note.durationShort.${value}`),
      title: kind === 'rest' ? resolveRestDurationLabel(value) : resolveNoteDurationLabel(value)
    }))
  }

  function dots(values: (0 | 1 | 2 | 3)[]): PanelSegmentedOption<0 | 1 | 2 | 3>[] {
    return values.map((value) => ({
      value,
      label: t(`editor.note.augmentationDotShort.${value}`),
      title: resolveAugmentationDotLabel(value)
    }))
  }

  function beams(values: BeamTypeEnum[]): PanelSegmentedOption<BeamTypeEnum>[] {
    return values.map((value) => ({ value, label: resolveBeamTypeLabel(value) }))
  }

  function stems(values: ('up' | 'down')[]): PanelSegmentedOption<'up' | 'down'>[] {
    return values.map((value) => ({ value, label: resolveStemDirectionLabel(value) }))
  }

  function syllables(
    values: NotesNumberInfo['syllable'][]
  ): PanelSegmentedOption<NotesNumberInfo['syllable']>[] {
    return values.map((value) => ({
      value,
      label: String(value),
      title: resolveSyllableLabel(value)
    }))
  }

  function octaveDots(
    values: NotesNumberInfo['octaveDot'][]
  ): PanelSegmentedOption<NotesNumberInfo['octaveDot']>[] {
    return values.map((value) => ({
      value,
      label: value > 0 ? `+${value}` : String(value),
      title: resolveOctaveDotLabel(value)
    }))
  }

  return { durations, dots, beams, stems, syllables, octaveDots }
}
