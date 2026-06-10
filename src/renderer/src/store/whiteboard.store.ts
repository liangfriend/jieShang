import { KeySignatureTypeEnum } from 'deciphony-renderer'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  WHITEBOARD_CLEF_OPTIONS,
  WHITEBOARD_DEFAULT_ADD_NOTE,
  WHITEBOARD_DEFAULT_CLEF,
  WHITEBOARD_DEFAULT_KEY_COUNT,
  WHITEBOARD_DEFAULT_KEY_SIGNATURE,
  WHITEBOARD_DEFAULT_PITCH_NOTATION,
  WHITEBOARD_DEFAULT_WIDTH_TYPE,
  WHITEBOARD_KEY_COUNT_OPTIONS,
  WHITEBOARD_KEY_HEIGHT_DEFAULT,
  WHITEBOARD_KEY_HEIGHT_MAX,
  WHITEBOARD_KEY_HEIGHT_MIN,
  WHITEBOARD_KEY_SIGNATURE_OPTIONS,
  WHITEBOARD_NOTE_BPM_DEFAULT,
  WHITEBOARD_NOTE_BPM_MAX,
  WHITEBOARD_NOTE_BPM_MIN,
  WHITEBOARD_PITCH_NOTATION_OPTIONS,
  WHITEBOARD_STORAGE_KEY,
  WHITEBOARD_WHITE_KEY_WIDTH_DEFAULT,
  WHITEBOARD_WHITE_KEY_WIDTH_MAX,
  WHITEBOARD_WHITE_KEY_WIDTH_MIN,
  resolveWhiteboardMidiRange,
  type WhiteboardClef,
  type WhiteboardKeyCount,
  type WhiteboardPitchNotation,
  type WhiteboardWidthType
} from '@renderer/constant/whiteboard'

interface WhiteboardSettings {
  keyCount: WhiteboardKeyCount
  keyHeight: number
  widthType: WhiteboardWidthType
  whiteKeyWidth: number
  pitchNotation: WhiteboardPitchNotation
  groupEnabled: boolean
  chordBoxEnabled: boolean
  intervalRulerEnabled: boolean
  addNoteEnabled: boolean
  targetClef: WhiteboardClef
  noteInputBpm: number
  keySignature: KeySignatureTypeEnum
}

const DEFAULT_SETTINGS: WhiteboardSettings = {
  keyCount: WHITEBOARD_DEFAULT_KEY_COUNT,
  keyHeight: WHITEBOARD_KEY_HEIGHT_DEFAULT,
  widthType: WHITEBOARD_DEFAULT_WIDTH_TYPE,
  whiteKeyWidth: WHITEBOARD_WHITE_KEY_WIDTH_DEFAULT,
  pitchNotation: WHITEBOARD_DEFAULT_PITCH_NOTATION,
  groupEnabled: false,
  chordBoxEnabled: false,
  intervalRulerEnabled: false,
  addNoteEnabled: WHITEBOARD_DEFAULT_ADD_NOTE,
  targetClef: WHITEBOARD_DEFAULT_CLEF,
  noteInputBpm: WHITEBOARD_NOTE_BPM_DEFAULT,
  keySignature: WHITEBOARD_DEFAULT_KEY_SIGNATURE
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isWhiteboardKeyCount(value: unknown): value is WhiteboardKeyCount {
  return WHITEBOARD_KEY_COUNT_OPTIONS.some((item) => item.value === value)
}

function isWhiteboardPitchNotation(value: unknown): value is WhiteboardPitchNotation {
  return WHITEBOARD_PITCH_NOTATION_OPTIONS.some((item) => item.value === value)
}

function isWhiteboardClef(value: unknown): value is WhiteboardClef {
  return WHITEBOARD_CLEF_OPTIONS.some((item) => item.value === value)
}

function isWhiteboardKeySignature(value: unknown): value is KeySignatureTypeEnum {
  return WHITEBOARD_KEY_SIGNATURE_OPTIONS.some((item) => item.value === value)
}

function loadSettings(): WhiteboardSettings {
  try {
    const raw = localStorage.getItem(WHITEBOARD_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<WhiteboardSettings>
    return {
      keyCount: isWhiteboardKeyCount(parsed.keyCount) ? parsed.keyCount : DEFAULT_SETTINGS.keyCount,
      keyHeight: clamp(
        parsed.keyHeight ?? DEFAULT_SETTINGS.keyHeight,
        WHITEBOARD_KEY_HEIGHT_MIN,
        WHITEBOARD_KEY_HEIGHT_MAX
      ),
      widthType:
        parsed.widthType === 'custom' || parsed.widthType === 'fillParent'
          ? parsed.widthType
          : DEFAULT_SETTINGS.widthType,
      whiteKeyWidth: clamp(
        parsed.whiteKeyWidth ?? DEFAULT_SETTINGS.whiteKeyWidth,
        WHITEBOARD_WHITE_KEY_WIDTH_MIN,
        WHITEBOARD_WHITE_KEY_WIDTH_MAX
      ),
      pitchNotation: isWhiteboardPitchNotation(parsed.pitchNotation)
        ? parsed.pitchNotation
        : DEFAULT_SETTINGS.pitchNotation,
      groupEnabled: parsed.groupEnabled ?? DEFAULT_SETTINGS.groupEnabled,
      chordBoxEnabled: parsed.chordBoxEnabled ?? DEFAULT_SETTINGS.chordBoxEnabled,
      intervalRulerEnabled: parsed.intervalRulerEnabled ?? DEFAULT_SETTINGS.intervalRulerEnabled,
      addNoteEnabled: parsed.addNoteEnabled ?? DEFAULT_SETTINGS.addNoteEnabled,
      targetClef: isWhiteboardClef(parsed.targetClef)
        ? parsed.targetClef
        : DEFAULT_SETTINGS.targetClef,
      noteInputBpm: clamp(
        parsed.noteInputBpm ?? DEFAULT_SETTINGS.noteInputBpm,
        WHITEBOARD_NOTE_BPM_MIN,
        WHITEBOARD_NOTE_BPM_MAX
      ),
      keySignature: isWhiteboardKeySignature(parsed.keySignature)
        ? parsed.keySignature
        : DEFAULT_SETTINGS.keySignature
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveSettings(settings: WhiteboardSettings) {
  localStorage.setItem(WHITEBOARD_STORAGE_KEY, JSON.stringify(settings))
}

export const useWhiteboardStore = defineStore('whiteboard', () => {
  const initial = loadSettings()

  const keyCount = ref<WhiteboardKeyCount>(initial.keyCount)
  const keyHeight = ref(initial.keyHeight)
  const widthType = ref<WhiteboardWidthType>(initial.widthType)
  const whiteKeyWidth = ref(initial.whiteKeyWidth)
  const pitchNotation = ref<WhiteboardPitchNotation>(initial.pitchNotation)
  const groupEnabled = ref(initial.groupEnabled)
  const chordBoxEnabled = ref(initial.chordBoxEnabled)
  const intervalRulerEnabled = ref(initial.intervalRulerEnabled)
  const addNoteEnabled = ref(initial.addNoteEnabled)
  const targetClef = ref<WhiteboardClef>(initial.targetClef)
  const noteInputBpm = ref(initial.noteInputBpm)
  const keySignature = ref<KeySignatureTypeEnum>(initial.keySignature)

  const isCustomWidth = computed(() => widthType.value === 'custom')
  const pianoLayoutMode = computed(() =>
    widthType.value === 'fillParent' ? 'fillParent' : 'whiteKeyWidth'
  )
  const midiRange = computed(() => resolveWhiteboardMidiRange(keyCount.value))
  const pianoHeight = computed(() => `${keyHeight.value}px`)
  const pianoWhiteKeyWidth = computed(() => `${whiteKeyWidth.value}px`)

  function persist() {
    saveSettings({
      keyCount: keyCount.value,
      keyHeight: keyHeight.value,
      widthType: widthType.value,
      whiteKeyWidth: whiteKeyWidth.value,
      pitchNotation: pitchNotation.value,
      groupEnabled: groupEnabled.value,
      chordBoxEnabled: chordBoxEnabled.value,
      intervalRulerEnabled: intervalRulerEnabled.value,
      addNoteEnabled: addNoteEnabled.value,
      targetClef: targetClef.value,
      noteInputBpm: noteInputBpm.value,
      keySignature: keySignature.value
    })
  }

  function setKeyCount(value: WhiteboardKeyCount) {
    keyCount.value = value
  }

  function setKeyHeight(value: number) {
    keyHeight.value = clamp(value, WHITEBOARD_KEY_HEIGHT_MIN, WHITEBOARD_KEY_HEIGHT_MAX)
  }

  function setWidthType(value: WhiteboardWidthType) {
    widthType.value = value
  }

  function setWhiteKeyWidth(value: number) {
    whiteKeyWidth.value = clamp(
      value,
      WHITEBOARD_WHITE_KEY_WIDTH_MIN,
      WHITEBOARD_WHITE_KEY_WIDTH_MAX
    )
  }

  function setPitchNotation(value: WhiteboardPitchNotation) {
    pitchNotation.value = value
  }

  function toggleGroup() {
    groupEnabled.value = !groupEnabled.value
  }

  function toggleChordBox() {
    chordBoxEnabled.value = !chordBoxEnabled.value
  }

  function toggleIntervalRuler() {
    intervalRulerEnabled.value = !intervalRulerEnabled.value
  }

  function toggleAddNote() {
    addNoteEnabled.value = !addNoteEnabled.value
  }

  function setTargetClef(value: WhiteboardClef) {
    targetClef.value = value
  }

  function setNoteInputBpm(value: number) {
    noteInputBpm.value = clamp(value, WHITEBOARD_NOTE_BPM_MIN, WHITEBOARD_NOTE_BPM_MAX)
  }

  function setKeySignature(value: KeySignatureTypeEnum) {
    keySignature.value = value
  }

  watch(
    [
      keyCount,
      keyHeight,
      widthType,
      whiteKeyWidth,
      pitchNotation,
      groupEnabled,
      chordBoxEnabled,
      intervalRulerEnabled,
      addNoteEnabled,
      targetClef,
      noteInputBpm,
      keySignature
    ],
    persist
  )

  return {
    keyCount,
    keyHeight,
    widthType,
    whiteKeyWidth,
    pitchNotation,
    groupEnabled,
    chordBoxEnabled,
    intervalRulerEnabled,
    addNoteEnabled,
    targetClef,
    noteInputBpm,
    keySignature,
    isCustomWidth,
    pianoLayoutMode,
    midiRange,
    pianoHeight,
    pianoWhiteKeyWidth,
    setKeyCount,
    setKeyHeight,
    setWidthType,
    setWhiteKeyWidth,
    setPitchNotation,
    toggleGroup,
    toggleChordBox,
    toggleIntervalRuler,
    toggleAddNote,
    setTargetClef,
    setNoteInputBpm,
    setKeySignature
  }
})
