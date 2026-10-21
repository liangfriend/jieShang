/**
 * 编辑器键盘快捷键：添加面板时值 / 音符休止符切换、结构增加、简谱数字录入、鼓谱字母录入。
 */
import type {
  Chronaxie,
  DrumHeadTypeEnum,
  GrandStaff,
  Measure,
  NotesNumberInfo,
  SingleStaff,
  SlotData
} from '@deciphony/renderer'
import { ClefTypeEnum, getMeasureNoteList } from '@deciphony/renderer'
import { DRUM_MAX_CHRONAXIE, getDrumVoiceSlots, insertDrumNote } from '@deciphony/extensions/dr-edit'
import {
  computeMeasureOnsetBefore,
  createNoteNumber,
  createNoteRest
} from '@deciphony/extensions/dr-edit/score-builder'
import { getNoteNumberMidi } from '@deciphony/extensions/score-util'
import { applyMidiNoteToSelectedMeasure, resolveClefAndKeyAtMeasure } from './renderEditMidiAdd'
import { CHRONAXIE_VALUES, type AddNoteState } from './renderEditAddNoteState'
import type { AddNumberState } from './numberNotation/renderEditNumberAddState'
import type { AddTabState } from './tab/renderEditTabAddState'
import type { AddDrumState } from './drumNotation/renderEditDrumAddState'
import { addGrandStaffFromSlot, addSingleStaffFromSlot } from './renderEditSlotActions'
import { insertMeasureColumn } from './renderEditMeasureColumn'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'

/** 1–8 → 全音符…一百二十八分音符（与工具栏时值顺序一致） */
export function chronaxieForDigit(digit: number): Chronaxie | null {
  return CHRONAXIE_VALUES[digit - 1] ?? null
}

/** 五线谱 / 简谱：0 切换音符与休止符（简谱节奏音符视为音符） */
export function toggleNoteRestKind<T extends AddNoteState | AddNumberState>(state: T): T {
  return { ...state, kind: state.kind === 'rest' ? 'note' : 'rest' }
}

export function toggleTabRestKind(state: AddTabState): AddTabState {
  return { ...state, kind: state.kind === 'rest' ? 'normal' : 'rest' }
}

export function toggleDrumRestKind(state: AddDrumState): AddDrumState {
  return { ...state, kind: state.kind === 'rest' ? 'note' : 'rest' }
}

/** 鼓谱时值上限为四分，超出的键位不生效 */
export function drumAcceptsChronaxie(chronaxie: Chronaxie): boolean {
  return chronaxie <= DRUM_MAX_CHRONAXIE
}

type StructurePath = {
  grandStaff: GrandStaff
  singleStaff: SingleStaff | null
  measure: Measure | null
}

/** 由选中项定位所在复谱表 / 单谱表 / 小节；未选中时取最后一个复谱表的最后一个单谱表 */
function resolveStructurePath(selected: SlotData | null, fallback: SlotData['musicScore']): StructurePath | null {
  const musicScore = selected?.musicScore ?? fallback
  const measureId = selected?.measure?.id
  const staffId = selected?.singleStaff?.id
  const grandId = selected?.grandStaff?.id
  if (selected) {
    for (const grandStaff of musicScore.grandStaffs) {
      for (const singleStaff of grandStaff.staves) {
        const measure = measureId ? singleStaff.measures.find((m) => m.id === measureId) : undefined
        if (measure) return { grandStaff, singleStaff, measure }
        if (!measureId && staffId && singleStaff.id === staffId) {
          return { grandStaff, singleStaff, measure: null }
        }
      }
      if (!measureId && !staffId && grandId && grandStaff.id === grandId) {
        return { grandStaff, singleStaff: grandStaff.staves.at(-1) ?? null, measure: null }
      }
    }
  }
  const grandStaff = musicScore.grandStaffs.at(-1)
  if (!grandStaff) return null
  return { grandStaff, singleStaff: grandStaff.staves.at(-1) ?? null, measure: null }
}

function slotFromPath(musicScore: SlotData['musicScore'], path: StructurePath): SlotData {
  return {
    musicScore,
    grandStaff: path.grandStaff,
    singleStaff: path.singleStaff,
    measure: path.measure,
    note: null,
    info: null,
    self: path.measure ?? path.singleStaff ?? path.grandStaff
  }
}

/** /：在选中小节后，给复谱表每一行单谱表插入空小节（仅小节选中态） */
export function insertMeasureAfterSelected(selected: SlotData | null): boolean {
  if (!isMeasureAddMode(selected)) return false
  const path = resolveStructurePath(selected, selected.musicScore)
  if (!path?.singleStaff || !path.measure) return false
  insertMeasureColumn(selected.musicScore, path.singleStaff, path.measure, 'after')
  return true
}

/** *：在选中项所在单谱表下方加单谱表 */
export function addSingleStaffFromSelected(
  selected: SlotData | null,
  musicScore: SlotData['musicScore']
): boolean {
  const path = resolveStructurePath(selected, musicScore)
  if (!path?.singleStaff) return false
  addSingleStaffFromSlot(slotFromPath(musicScore, path))
  return true
}

/** -：在选中项所在复谱表下方加复谱表 */
export function addGrandStaffFromSelected(
  selected: SlotData | null,
  musicScore: SlotData['musicScore']
): boolean {
  const path = resolveStructurePath(selected, musicScore)
  if (!path) return false
  addGrandStaffFromSlot(slotFromPath(musicScore, path))
  return true
}

/** 简谱字母键：q–u 高音、a–j 中音、z–m 低音，依次对应 1–7 */
const NUMBER_LETTER_ROWS: { codes: string[]; octaveDot: NotesNumberInfo['octaveDot'] }[] = [
  { codes: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'], octaveDot: 1 },
  { codes: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ'], octaveDot: 0 },
  { codes: ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'], octaveDot: -1 }
]

export function numberNoteForLetterCode(
  code: string
): { syllable: 1 | 2 | 3 | 4 | 5 | 6 | 7; octaveDot: NotesNumberInfo['octaveDot'] } | null {
  for (const row of NUMBER_LETTER_ROWS) {
    const index = row.codes.indexOf(code)
    if (index >= 0) return { syllable: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7, octaveDot: row.octaveDot }
  }
  return null
}

/**
 * 简谱键盘录入：在选中小节末尾追加音符 / 休止符，
 * 时值取添加面板，八度点由按键决定，不看面板当前是音符还是休止符。
 */
export function appendNumberNoteToSelectedMeasure(
  selected: SlotData | null,
  syllable: Exclude<NotesNumberInfo['syllable'], 'X'>,
  state: AddNumberState,
  octaveDot: NotesNumberInfo['octaveDot'] = 0
): boolean {
  if (!isMeasureAddMode(selected)) return false
  const notes = getMeasureNoteList(selected.measure)
  notes.push(
    createNoteNumber({
      syllable,
      chronaxie: state.chronaxie,
      octaveDot: syllable === 0 ? 0 : octaveDot,
      beamOnset: computeMeasureOnsetBefore(selected.measure, notes.length)
    })
  )
  return true
}

/** 中音（octaveDot 0）所在八度：高音谱号等 1 在 4 组，低音谱号低一个八度 */
function staffOctaveBase(clef: ClefTypeEnum): number {
  return clef === ClefTypeEnum.Bass ? -1 : 0
}

/**
 * 线谱键盘录入（与简谱同一套键位）：按选中小节的调号把唱名换算成音高（首调，1 = 主音），
 * 在小节末尾追加音符 / 休止符，时值取添加面板。
 */
export function appendStaffNoteToSelectedMeasure(
  selected: SlotData | null,
  syllable: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
  state: AddNoteState,
  octaveDot: NotesNumberInfo['octaveDot'] = 0
): boolean {
  if (!isMeasureAddMode(selected)) return false
  if (syllable === 0) {
    getMeasureNoteList(selected.measure).push(createNoteRest({ chronaxie: state.chronaxie }))
    return true
  }
  const { clef, key } = resolveClefAndKeyAtMeasure(selected.musicScore, selected.singleStaff, selected.measure)
  const midi = getNoteNumberMidi(
    {
      syllable,
      octaveDot: (octaveDot + staffOctaveBase(clef)) as NotesNumberInfo['octaveDot']
    } as NotesNumberInfo,
    key
  )
  return applyMidiNoteToSelectedMeasure(selected, midi, state.chronaxie)
}

/**
 * 鼓谱字母键：在选中小节当前声部末尾追加一个合法音符，
 * 声部、时值、附点取添加面板，不看面板当前是音符还是休止符。
 */
export function appendDrumNoteToSelectedMeasure(
  selected: SlotData | null,
  note: { region: number; headType: DrumHeadTypeEnum },
  state: AddDrumState
): boolean {
  if (!isMeasureAddMode(selected)) return false
  const measure = selected.measure
  if (measure.longRest) return false
  insertDrumNote(measure, state.voice, getDrumVoiceSlots(measure, state.voice).length, {
    region: note.region,
    headType: note.headType,
    chronaxie: state.chronaxie,
    augmentationDot: state.dot || undefined
  })
  return true
}
