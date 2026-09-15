export type MidiParsedEvent =
  | {
      kind: 'noteOn'
      channel: number
      midi: number
      velocity: number
    }
  | {
      kind: 'noteOff'
      channel: number
      midi: number
      velocity: number
    }
  | {
      kind: 'cc'
      channel: number
      controller: number
      value: number
    }
  | {
      kind: 'pitchBend'
      channel: number
      value: number
      normalized: number
    }
  | {
      kind: 'channelPressure'
      channel: number
      value: number
    }
  | {
      kind: 'polyAftertouch'
      channel: number
      midi: number
      value: number
    }
  | {
      kind: 'programChange'
      channel: number
      program: number
    }
  | {
      kind: 'unknown'
      status: number
      data: number[]
    }

/** CC 常用控制器 */
export const MIDI_CC = {
  modulation: 1,
  volume: 7,
  expression: 11,
  sustain: 64,
  sostenuto: 66,
  soft: 67
} as const

export function parseMidiMessage(data: Uint8Array | null | undefined): MidiParsedEvent | null {
  if (!data || data.length < 1) return null
  const status = data[0]!
  const type = status & 0xf0
  const channel = (status & 0x0f) + 1

  if (type === 0x90) {
    const midi = data[1] ?? 0
    const velocity = data[2] ?? 0
    if (velocity > 0) return { kind: 'noteOn', channel, midi, velocity }
    return { kind: 'noteOff', channel, midi, velocity: 0 }
  }
  if (type === 0x80) {
    return {
      kind: 'noteOff',
      channel,
      midi: data[1] ?? 0,
      velocity: data[2] ?? 0
    }
  }
  if (type === 0xb0) {
    return {
      kind: 'cc',
      channel,
      controller: data[1] ?? 0,
      value: data[2] ?? 0
    }
  }
  if (type === 0xe0) {
    const lsb = data[1] ?? 0
    const msb = data[2] ?? 0
    const value = (msb << 7) | lsb
    return {
      kind: 'pitchBend',
      channel,
      value,
      normalized: (value - 8192) / 8192
    }
  }
  if (type === 0xa0) {
    return {
      kind: 'polyAftertouch',
      channel,
      midi: data[1] ?? 0,
      value: data[2] ?? 0
    }
  }
  if (type === 0xd0) {
    return { kind: 'channelPressure', channel, value: data[1] ?? 0 }
  }
  if (type === 0xc0) {
    return { kind: 'programChange', channel, program: data[1] ?? 0 }
  }
  return { kind: 'unknown', status, data: [...data] }
}

export function formatMidiBytes(data: Uint8Array | null | undefined): string {
  if (!data?.length) return '—'
  return [...data].map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}
