export default {
  tools: {
    title: 'Tools',
    mic: {
      title: 'Microphone check',
      desc: 'Grant access to see live waveform and level',
      controls: 'Device & controls',
      device: 'Input device',
      unnamedDevice: 'Unnamed microphone',
      start: 'Start',
      stop: 'Stop',
      refresh: 'Refresh devices',
      waveform: 'Live waveform',
      level: 'Level',
      hint: 'Speak into the mic — waveform and level should move',
      unsupported: 'Microphone capture is not supported here'
    },
    midi: {
      title: 'MIDI device check',
      desc: 'Inspect I/O devices, 88-key piano, and control signals',
      devices: 'Devices',
      inputs: 'Inputs',
      outputs: 'Outputs',
      noInputs: 'No MIDI inputs',
      noOutputs: 'No MIDI outputs',
      deviceConnected: 'Connected',
      deviceDisconnected: 'Disconnected',
      unsupported: 'Web MIDI is not supported here',
      noAccess: 'MIDI access not granted — allow and retry',
      signalsTitle: 'Signal monitor',
      pianoTitle: '88-key piano',
      pianoHint: 'Click keys to play, or use a MIDI keyboard and watch the lamps',
      resetSignals: 'Reset signals',
      signals: {
        activity: 'Activity',
        noteOn: 'Notes held',
        sustain: 'Sustain',
        soft: 'Soft',
        sostenuto: 'Sostenuto',
        pitchBend: 'Pitch bend',
        modulation: 'Mod wheel',
        expression: 'Expression',
        volume: 'Volume CC7',
        channelPressure: 'Channel pressure',
        polyAftertouch: 'Poly aftertouch',
        polyAftertouchNote: 'Aftertouch note',
        lastCc: 'Last CC',
        channel: 'Channel',
        program: 'Program',
        lastNote: 'Last note',
        velocity: 'Velocity',
        heldNotes: 'Held notes',
        input: 'Source',
        raw: 'Raw bytes'
      }
    }
  }
} as const
