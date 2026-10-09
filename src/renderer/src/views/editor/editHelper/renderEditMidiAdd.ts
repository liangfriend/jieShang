import {
  AccidentalTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  MusicScoreTypeEnum,
  getMeasureNoteList,
  type Chronaxie,
  type Measure,
  type MusicScore,
  type NotesNumberInfo,
  type SingleStaff,
  type SlotData
} from '@deciphony/renderer'
import {
  createNoteNumber,
  createNoteSymbol,
  computeMeasureOnsetBefore,
  createTabNote
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  getNoteRegionAndAccidental,
  getOctaveAndSyllable
} from '@deciphony/extensions/score-util'
import { resolveOpenMidiForScoreType, fretboardStringCount } from '@renderer/constant/fretboardScoreType'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'
import { isTabNotationType } from '@renderer/utils/isTabNotation'

/** 走到目标小节「开头」时的谱号 / 调号（与 dr-play：遇目标只吃 _f） */
export function resolveClefAndKeyAtMeasure(
  musicScore: MusicScore,
  singleStaff: SingleStaff | null | undefined,
  measure: Measure
): { clef: ClefTypeEnum; key: KeySignatureTypeEnum } {
  let clef = ClefTypeEnum.Treble
  let key = musicScore.keySignature ?? KeySignatureTypeEnum.C
  if (!singleStaff) return { clef, key }
  for (const m of singleStaff.measures) {
    if (m.clef_f) clef = m.clef_f.type
    if (m.keySignature_f) key = m.keySignature_f.type
    if (m.id === measure.id) break
    if (m.clef_b) clef = m.clef_b.type
    if (m.keySignature_b) key = m.keySignature_b.type
  }
  return { clef, key }
}

function defaultDirection(region: number): 'up' | 'down' {
  return region > 4 ? 'down' : 'up'
}

function clampOctaveDot(n: number): NotesNumberInfo['octaveDot'] {
  return Math.max(-5, Math.min(6, Math.round(n))) as NotesNumberInfo['octaveDot']
}

function openMidiForScore(type: MusicScoreTypeEnum): readonly number[] {
  return resolveOpenMidiForScoreType(type)
}

/** MIDI → 最近空弦 + 品位（优先低品位） */
function midiToTabPlacement(
  midi: number,
  openMidi: readonly number[]
): { region: number; fret: number } | null {
  let best: { region: number; fret: number; score: number } | null = null
  for (let region = 0; region < openMidi.length; region++) {
    const open = openMidi[region]!
    const fret = midi - open
    if (fret < 0 || fret > 24) continue
    const score = fret * 10 + region
    if (!best || score < best.score) best = { region, fret, score }
  }
  return best ? { region: best.region, fret: best.fret } : null
}

/**
 * MIDI note-on → 在选中小节末尾追加音符（时值取当前添加面板 chronaxie）。
 * 仅小节选中态生效。
 */
export function applyMidiNoteToSelectedMeasure(
  selected: SlotData | null,
  midi: number,
  chronaxie: Chronaxie
): boolean {
  if (!isMeasureAddMode(selected)) return false
  if (!Number.isFinite(midi) || midi < 0 || midi > 127) return false

  const measure = selected.measure
  const musicScore = selected.musicScore
  const notes = getMeasureNoteList(measure)
  const beamOnset = computeMeasureOnsetBefore(measure, notes.length)

  if (isTabNotationType(musicScore.type)) {
    const openMidi = openMidiForScore(musicScore.type)
    const placement = midiToTabPlacement(midi, openMidi)
    if (!placement) return false
    notes.push(
      createTabNote({
        kind: 'normal',
        chronaxie,
        region: placement.region,
        value: placement.fret,
        stringCount: fretboardStringCount(musicScore.type),
        beamOnset
      })
    )
    return true
  }

  const { clef, key } = resolveClefAndKeyAtMeasure(musicScore, selected.singleStaff, measure)

  if (musicScore.type === MusicScoreTypeEnum.NumberNotation) {
    const { octave, syllable, accidental } = getOctaveAndSyllable(
      midi,
      AccidentalTypeEnum.Sharp,
      key
    )
    if (syllable < 1 || syllable > 7) return false
    notes.push(
      createNoteNumber({
        syllable: syllable as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        chronaxie,
        octaveDot: clampOctaveDot(octave),
        accidental: accidental ?? undefined,
        beamOnset
      })
    )
    return true
  }

  const { region, accidental } = getNoteRegionAndAccidental(
    clef,
    midi,
    key,
    AccidentalTypeEnum.Sharp
  )
  notes.push(
    createNoteSymbol({
      region,
      chronaxie,
      direction: defaultDirection(region),
      accidental: accidental ?? undefined,
      beamOnset
    })
  )
  return true
}
