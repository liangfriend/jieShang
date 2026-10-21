/**
 * 标准模式：录入音符（键盘 / 鼠标 / MIDI）后小节总时值超出拍号时，把新加的音挪到下一小节末尾并选中下一小节，
 * 原小节剩余时值补休止符；音符本身比整小节还长时提示时值不正确、不写入。
 * 下一小节按方向键「右」的顺序找（同一单谱表往后，行末到下一复谱表同下标单谱表的第一小节）。
 */
import {
  MusicScoreTypeEnum,
  isMeasureNoteVoices,
  timeSignatureTypeToBeats,
  type Chronaxie,
  type Measure,
  type MeasureNoteSlot,
  type MusicScore,
  type SlotData
} from '@deciphony/renderer'
import {
  DRUM_MAX_CHRONAXIE,
  type DrumVoice,
  chronaxieWithDots,
  createDrumRest,
  createNoteNumber,
  createNoteRest,
  createTabRest,
  resolveAutoBeamType
} from '@deciphony/extensions/dr-edit/score-builder'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import i18n from '@renderer/i18n'
import { isTabNotationType } from '@renderer/utils/isTabNotation'
import { resolveNeighborMeasureSlot } from './renderEditMeasureNavigate'
import { resolveTimeSignatureAtMeasure } from './renderEditRhythmPattern'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'

const STORAGE_KEY = 'editor.standardMode'

function loadStandardMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** 工具栏开关，跨编辑会话记住 */
export const standardModeEnabled = ref(loadStandardMode())
watch(standardModeEnabled, (on) => {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* noop */
  }
})

type DurationHolder = {
  chronaxie?: number
  augmentationDot?: { count?: number }
  beamType?: unknown
}

function voiceSlots(measure: Measure, voice: DrumVoice): MeasureNoteSlot[] {
  const notes = measure.notes
  if (!isMeasureNoteVoices(notes)) return notes
  notes[voice] ??= []
  return notes[voice]!
}

function slotHolders(slot: MeasureNoteSlot): DurationHolder[] {
  const body = slot.symbol as unknown as DurationHolder & { notesInfo?: DurationHolder[] }
  return Array.isArray(body.notesInfo) && body.notesInfo.length ? body.notesInfo : [body]
}

function slotDuration(slot: MeasureNoteSlot): number {
  const lead = slotHolders(slot)[0]
  if (!lead || typeof lead.chronaxie !== 'number') return 0
  return chronaxieWithDots(lead.chronaxie, lead.augmentationDot?.count ?? 0)
}

function totalDuration(slots: MeasureNoteSlot[]): number {
  return slots.reduce((sum, slot) => sum + slotDuration(slot), 0)
}

/** 小节应有的时值（256 = 全音符） */
function measureCapacity(selected: SlotData & { measure: Measure }): number {
  const type = resolveTimeSignatureAtMeasure(selected.musicScore, selected.singleStaff, selected.measure)
  const { beats, beatType } = timeSignatureTypeToBeats(type)
  return (beats * 256) / beatType
}

const REST_CHRONAXIES: readonly Chronaxie[] = [256, 128, 64, 32, 16, 8, 4, 2, 1]

function createRest(musicScore: MusicScore, chronaxie: Chronaxie, voice: DrumVoice, onset: number) {
  const type = musicScore.type
  if (type === MusicScoreTypeEnum.NumberNotation) {
    return createNoteNumber({ syllable: 0, chronaxie, beamOnset: onset })
  }
  if (type === MusicScoreTypeEnum.DrumNotation) return createDrumRest({ chronaxie, voice })
  if (isTabNotationType(type)) return createTabRest({ chronaxie })
  return createNoteRest({ chronaxie })
}

/** 从 onset 起用休止符补满 length（每次取放得下的最长时值） */
function fillRests(
  musicScore: MusicScore,
  slots: MeasureNoteSlot[],
  voice: DrumVoice,
  onset: number,
  length: number
) {
  const max = musicScore.type === MusicScoreTypeEnum.DrumNotation ? DRUM_MAX_CHRONAXIE : 256
  let pos = onset
  let left = length
  while (left > 0) {
    const chronaxie = REST_CHRONAXIES.find((c) => c <= max && c <= left)
    if (!chronaxie) break
    slots.push(createRest(musicScore, chronaxie, voice, pos))
    pos += chronaxie
    left -= chronaxie
  }
}

/** 挪到新位置后按新 onset 重算符杠 */
function rebeam(slots: MeasureNoteSlot[], onset: number) {
  let pos = onset
  for (const slot of slots) {
    for (const holder of slotHolders(slot)) {
      if ('beamType' in holder && typeof holder.chronaxie === 'number') {
        holder.beamType = resolveAutoBeamType(pos, holder.chronaxie)
      }
    }
    pos += slotDuration(slot)
  }
}

function warn(key: string) {
  ElMessage.warning(i18n.global.t(key))
}

type MeasureTarget = SlotData & { measure: Measure }

/** 从 start 往后找第一个放得下 length 的小节；途经的小节需要补的休止符一并返回 */
function findPlacement(
  start: MeasureTarget,
  voice: DrumVoice,
  length: number
): { target: MeasureTarget; passed: { target: MeasureTarget; gap: number }[] } | null {
  const passed: { target: MeasureTarget; gap: number }[] = []
  let cur: MeasureTarget | null = resolveNeighborMeasureSlot(start, 'right') as MeasureTarget | null
  while (cur) {
    if (cur.measure.longRest) return null
    const capacity = measureCapacity(cur)
    if (length > capacity) return null
    const used = totalDuration(voiceSlots(cur.measure, voice))
    if (used + length <= capacity) return { target: cur, passed }
    passed.push({ target: cur, gap: Math.max(0, capacity - used) })
    cur = resolveNeighborMeasureSlot(cur, 'right') as MeasureTarget | null
  }
  return null
}

/**
 * 包一层录入动作。没开标准模式或没超出时原样返回 add 的结果；
 * 新音被挪走（选中下一小节）或被拦下时返回 null，调用方据此跳过「选中新音符」之类的后续动作。
 */
export function runStandardModeAdd<T>(
  selected: SlotData | null,
  voice: DrumVoice,
  add: () => T,
  selectMeasure: (slot: SlotData) => void
): T | null {
  if (!standardModeEnabled.value || !isMeasureAddMode(selected) || selected.measure.longRest) {
    return add()
  }
  const current = selected as MeasureTarget
  const beforeIds = new Set(voiceSlots(current.measure, voice).map((slot) => slot.id))
  const result = add()
  if (!result) return result

  const slots = voiceSlots(current.measure, voice)
  const capacity = measureCapacity(current)
  if (totalDuration(slots) <= capacity) return result
  const added = slots.filter((slot) => !beforeIds.has(slot.id))
  if (!added.length) return result

  const addedLength = totalDuration(added)
  const removeAdded = () => {
    for (const slot of added) slots.splice(slots.indexOf(slot), 1)
  }
  if (addedLength > capacity) {
    removeAdded()
    warn('editor.standardMode.durationInvalid')
    return null
  }
  const placement = findPlacement(current, voice, addedLength)
  if (!placement) {
    removeAdded()
    warn('editor.standardMode.noNextMeasure')
    return null
  }

  removeAdded()
  const used = totalDuration(slots)
  fillRests(current.musicScore, slots, voice, used, capacity - used)
  for (const { target, gap } of placement.passed) {
    const list = voiceSlots(target.measure, voice)
    fillRests(current.musicScore, list, voice, totalDuration(list), gap)
  }
  const targetSlots = voiceSlots(placement.target.measure, voice)
  const onset = totalDuration(targetSlots)
  targetSlots.push(...added)
  rebeam(added, onset)
  selectMeasure(placement.target)
  return null
}
