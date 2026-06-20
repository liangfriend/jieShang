import i18n from '@renderer/i18n'
import type { AchievementDefinition } from '@renderer/constant/achievements'
import type { CollectionRecord } from '@renderer/types/collection'
import type { NoteScoreResult } from '@renderer/types/types'
import type { GameDifficulty } from '@renderer/constant/gameSettings'
import type {
  WhiteboardClef,
  WhiteboardKeyCount,
  WhiteboardPitchNotation,
  WhiteboardWidthType
} from '@renderer/constant/whiteboard'
import type { AddNoteSlotKind } from '@renderer/views/editor/editHelper/renderEditAddNoteState'
import type { AddNumberSlotKind } from '@renderer/views/editor/editHelper/numberNotation/renderEditNumberAddState'
import type { Chronaxie, NotesNumberInfo } from 'deciphony-renderer'
import {
  AccidentalTypeEnum,
  BarlineTypeEnum,
  BeamTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  MeasureEndRepeatEnum,
  MeasureStartRepeatEnum,
  MusicScoreTypeEnum,
  TimeSignatureTypeEnum,
  timeSignatureTypeToLabel
} from 'deciphony-renderer'

export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params ?? {})
}

export function te(key: string, params?: Record<string, unknown>): string {
  const value = i18n.global.t(key, params ?? {})
  return value === key ? '' : value
}

export function resolveNotationTypeLabel(type: MusicScoreTypeEnum): string {
  if (type === MusicScoreTypeEnum.StandardStaff) return t('notation.staff')
  if (type === MusicScoreTypeEnum.NumberNotation) return t('notation.jianpu')
  return t('notation.unknown')
}

export function resolveGameDifficultyLabel(value: GameDifficulty): string {
  return t(`settings.gameDifficulty.${value}`)
}

export function resolveGameDifficultyDesc(value: GameDifficulty): string {
  return t(`settings.gameDifficulty.${value}Desc`)
}

export function resolveNoteResultLabel(result: NoteScoreResult): string {
  return t(`practice.result.${result}`)
}

export function resolveAchievementName(def: Pick<AchievementDefinition, 'key' | 'name'>): string {
  return te(`achievements.items.${def.key}.name`) || def.name
}

export function resolveAchievementDescription(
  def: Pick<AchievementDefinition, 'key' | 'description'>
): string {
  return te(`achievements.items.${def.key}.description`) || def.description
}

export function resolveAchievementReward(def: Pick<AchievementDefinition, 'key' | 'reward'>): string {
  const translated = te(`achievements.items.${def.key}.reward`)
  if (translated) return translated
  if (def.reward === '无') return t('common.none')
  return def.reward
}

export function resolveCollectionField(
  record: CollectionRecord,
  field: 'name' | 'description' | 'howToGet'
): string {
  const key = `collection.byId.${record.id}.${field}`
  const translated = te(key)
  if (translated) return translated
  return ''
}

export function resolveBarlineLabel(value: BarlineTypeEnum): string {
  return t(`editor.measure.barline.${value}`)
}

export function resolveClefLabel(value: ClefTypeEnum): string {
  return t(`editor.measure.clef.${value}`)
}

export function resolveKeySignatureLabel(value: KeySignatureTypeEnum): string {
  return t(`editor.measure.keySignature.${value}`)
}

export function resolveTimeSignatureLabel(value: TimeSignatureTypeEnum): string {
  const key = `editor.measure.timeSignature.${value}`
  const translated = te(key)
  return translated || timeSignatureTypeToLabel(value)
}

export function resolveStartRepeatLabel(value: MeasureStartRepeatEnum): string {
  return t(`editor.measure.startRepeatOption.${value}`)
}

export function resolveEndRepeatLabel(value: MeasureEndRepeatEnum): string {
  return t(`editor.measure.endRepeatOption.${value}`)
}

export function resolveAddNoteKindLabel(value: AddNoteSlotKind | AddNumberSlotKind): string {
  if (value === 'note') return t('editor.addNote.note')
  if (value === 'rest') return t('editor.addNote.rest')
  return String(value)
}

export function resolveNoteDurationLabel(chronaxie: Chronaxie): string {
  return t(`editor.note.durationValue.${chronaxie}`)
}

export function resolveRestDurationLabel(chronaxie: Chronaxie): string {
  return t(`editor.note.restDurationValue.${chronaxie}`)
}

export function resolveBeamTypeLabel(value: BeamTypeEnum): string {
  return t(`editor.note.beamType.${value}`)
}

export function resolveStemDirectionLabel(value: 'up' | 'down'): string {
  return t(`editor.note.stem.${value}`)
}

export function resolveAccidentalLabel(value: AccidentalTypeEnum): string {
  return t(`editor.note.accidentalType.${value}`)
}

export function resolveAccidentalSelectLabel(value: AccidentalTypeEnum | ''): string {
  if (value === '') return t('common.none')
  return resolveAccidentalLabel(value)
}

export function resolveClefSelectLabel(value: ClefTypeEnum | ''): string {
  if (value === '') return t('common.none')
  return resolveClefLabel(value)
}

export function resolveAugmentationDotLabel(value: 0 | 1 | 2 | 3): string {
  return t(`editor.note.augmentationDotCount.${value}`)
}

export function resolveSyllableLabel(value: NotesNumberInfo['syllable']): string {
  return t(`editor.note.syllableOption.${value}`)
}

export function resolveOctaveDotLabel(value: NotesNumberInfo['octaveDot']): string {
  return t(`editor.note.octaveDotOption.${String(value ?? 0)}`)
}

export function resolveWhiteboardKeyCountLabel(keyCount: WhiteboardKeyCount): string {
  return t(`whiteboard.keyCount.${keyCount}`)
}

export function resolveWhiteboardWidthTypeLabel(widthType: WhiteboardWidthType): string {
  return t(`whiteboard.widthType.${widthType}`)
}

export function resolveWhiteboardPitchNotationLabel(notation: WhiteboardPitchNotation): string {
  return t(`whiteboard.pitchNotation.${notation}`)
}

export function resolveWhiteboardClefLabel(clef: WhiteboardClef): string {
  return t(`whiteboard.clef.${clef}`)
}

export function resolveWhiteboardKeySignatureLabel(key: KeySignatureTypeEnum): string {
  return t(`whiteboard.keySignature.${key}`)
}
