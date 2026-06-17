export type BeginnerMidiBoxNote = {
  midi: number
  info: unknown
}

export type MidiBoxBatchPayload = {
  batchIndex: number
  notes: BeginnerMidiBoxNote[]
}
