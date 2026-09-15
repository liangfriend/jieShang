import { onUnmounted, reactive, ref } from 'vue'
import { useMidiStore } from '@renderer/store/midi.store'
import {
  formatMidiBytes,
  MIDI_CC,
  parseMidiMessage,
  type MidiParsedEvent
} from '@renderer/utils/midiMessageParse'

export type MidiSignalState = {
  lastEvent: MidiParsedEvent | null
  lastBytes: string
  lastInputName: string
  activity: boolean
  lastNote: number | null
  lastVelocity: number
  noteOn: boolean
  sustain: boolean
  soft: boolean
  sostenuto: boolean
  modulation: number
  volume: number
  expression: number
  pitchBend: number
  pitchBendNormalized: number
  channelPressure: number
  polyAftertouch: number
  polyAftertouchNote: number | null
  lastCc: number | null
  lastCcValue: number
  program: number
  channel: number
}

const ACTIVITY_MS = 120

export function useMidiDiagnostics() {
  const midiStore = useMidiStore()
  const signals = reactive<MidiSignalState>({
    lastEvent: null,
    lastBytes: '—',
    lastInputName: '—',
    activity: false,
    lastNote: null,
    lastVelocity: 0,
    noteOn: false,
    sustain: false,
    soft: false,
    sostenuto: false,
    modulation: 0,
    volume: 100,
    expression: 127,
    pitchBend: 8192,
    pitchBendNormalized: 0,
    channelPressure: 0,
    polyAftertouch: 0,
    polyAftertouchNote: null,
    lastCc: null,
    lastCcValue: 0,
    program: 0,
    channel: 1
  })

  const heldNotes = ref<number[]>([])
  let activityTimer = 0

  function pulseActivity() {
    signals.activity = true
    if (activityTimer) window.clearTimeout(activityTimer)
    activityTimer = window.setTimeout(() => {
      signals.activity = false
      activityTimer = 0
    }, ACTIVITY_MS)
  }

  function setHeld(midi: number, on: boolean) {
    const set = new Set(heldNotes.value)
    if (on) set.add(midi)
    else set.delete(midi)
    heldNotes.value = [...set].sort((a, b) => a - b)
    signals.noteOn = set.size > 0
  }

  function onMessage(event: MIDIMessageEvent, input: MIDIInput) {
    const data = event.data
    const parsed = parseMidiMessage(data)
    if (!parsed) return

    pulseActivity()
    signals.lastEvent = parsed
    signals.lastBytes = formatMidiBytes(data)
    signals.lastInputName = input?.name?.trim() || '—'

    if ('channel' in parsed && parsed.kind !== 'unknown') {
      signals.channel = parsed.channel
    }

    if (parsed.kind === 'noteOn') {
      signals.lastNote = parsed.midi
      signals.lastVelocity = parsed.velocity
      setHeld(parsed.midi, true)
      return
    }
    if (parsed.kind === 'noteOff') {
      signals.lastNote = parsed.midi
      signals.lastVelocity = parsed.velocity
      setHeld(parsed.midi, false)
      return
    }
    if (parsed.kind === 'cc') {
      signals.lastCc = parsed.controller
      signals.lastCcValue = parsed.value
      if (parsed.controller === MIDI_CC.sustain) signals.sustain = parsed.value >= 64
      else if (parsed.controller === MIDI_CC.soft) signals.soft = parsed.value >= 64
      else if (parsed.controller === MIDI_CC.sostenuto) signals.sostenuto = parsed.value >= 64
      else if (parsed.controller === MIDI_CC.modulation) signals.modulation = parsed.value
      else if (parsed.controller === MIDI_CC.volume) signals.volume = parsed.value
      else if (parsed.controller === MIDI_CC.expression) signals.expression = parsed.value
      return
    }
    if (parsed.kind === 'pitchBend') {
      signals.pitchBend = parsed.value
      signals.pitchBendNormalized = parsed.normalized
      return
    }
    if (parsed.kind === 'channelPressure') {
      signals.channelPressure = parsed.value
      return
    }
    if (parsed.kind === 'polyAftertouch') {
      signals.polyAftertouch = parsed.value
      signals.polyAftertouchNote = parsed.midi
      return
    }
    if (parsed.kind === 'programChange') {
      signals.program = parsed.program
    }
  }

  function start() {
    midiStore.addMessageListener(onMessage)
  }

  function stop() {
    midiStore.removeMessageListener(onMessage)
    if (activityTimer) {
      window.clearTimeout(activityTimer)
      activityTimer = 0
    }
  }

  function resetSignals() {
    heldNotes.value = []
    signals.lastEvent = null
    signals.lastBytes = '—'
    signals.lastInputName = '—'
    signals.activity = false
    signals.lastNote = null
    signals.lastVelocity = 0
    signals.noteOn = false
    signals.sustain = false
    signals.soft = false
    signals.sostenuto = false
    signals.modulation = 0
    signals.volume = 100
    signals.expression = 127
    signals.pitchBend = 8192
    signals.pitchBendNormalized = 0
    signals.channelPressure = 0
    signals.polyAftertouch = 0
    signals.polyAftertouchNote = null
    signals.lastCc = null
    signals.lastCcValue = 0
    signals.program = 0
    signals.channel = 1
  }

  onUnmounted(stop)

  return {
    signals,
    heldNotes,
    start,
    stop,
    resetSignals
  }
}
