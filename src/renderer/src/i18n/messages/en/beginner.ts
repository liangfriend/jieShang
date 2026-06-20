export default {
  beginner: {
    toolbar: {
      settings: 'Settings',
      startPractice: 'Start practice',
      stop: 'Stop',
      volume: 'Volume'
    },
    settings: {
      title: 'Beginner mode settings',
      desc: 'Play colorful MIDI blocks at your own pace',
      display: 'Display',
      coverMidiBox: 'Cover MIDI blocks',
      coverMidiBoxHint: 'Hide colorful blocks with a cute background and practice by ear',
      metronome: 'Metronome',
      metronomeVolume: 'Metronome volume',
      bpm: 'BPM',
      metronomeDuringPlay: 'Metronome during practice',
      staffSelection: 'Staff selection',
      staffSelectionHint: 'Disabled staves become transparent',
      singleStaff: 'Staff {n}',
      noSingleStaff: 'No single staves in this score'
    },
    coverText: 'Cover of champions',
    messages: {
      notationTypeSwitchFailed: 'Failed to switch score type',
      noPracticeableNotes: 'No notes to practice in this score'
    }
  }
} as const
