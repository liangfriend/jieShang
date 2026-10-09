/** 演唱初始音高偏移（半音）持久化 */
export const SINGING_MIDI_FIXED_OFFSET_STORAGE_KEY = 'jieShang.singing.midiFixedOffset'

export const SINGING_MIDI_FIXED_OFFSET_MIN = -48
export const SINGING_MIDI_FIXED_OFFSET_MAX = 48
export const SINGING_MIDI_FIXED_OFFSET_DEFAULT = 0

export function clampSingingMidiFixedOffset(value: number): number {
  const n = Math.round(Number(value) || 0)
  return Math.min(SINGING_MIDI_FIXED_OFFSET_MAX, Math.max(SINGING_MIDI_FIXED_OFFSET_MIN, n))
}

export function loadSingingMidiFixedOffset(): number {
  try {
    const raw = localStorage.getItem(SINGING_MIDI_FIXED_OFFSET_STORAGE_KEY)
    if (raw == null || raw === '') return SINGING_MIDI_FIXED_OFFSET_DEFAULT
    return clampSingingMidiFixedOffset(Number(raw))
  } catch {
    return SINGING_MIDI_FIXED_OFFSET_DEFAULT
  }
}

export function saveSingingMidiFixedOffset(value: number): number {
  const next = clampSingingMidiFixedOffset(value)
  localStorage.setItem(SINGING_MIDI_FIXED_OFFSET_STORAGE_KEY, String(next))
  return next
}
