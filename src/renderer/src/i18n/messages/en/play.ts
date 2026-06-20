export default {
  play: {
    toolbar: {
      editMode: 'Edit mode',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      volume: 'Volume',
      bpm: 'BPM',
      practiceMode: 'Practice mode',
      beginnerMode: 'Beginner mode',
      notationType: 'Score type'
    },
    messages: {
      notationTypeSwitchFailed: 'Failed to switch score type',
      noPlayableContent: 'This score has no playable content',
      grandStaffMismatch:
        'All grand staves must have the same number of single staves to enter practice or beginner mode'
    },
    toneColor: {
      label: 'Tone',
      loadFailed: 'Failed to load tone',
      switchFailed: 'Failed to switch tone',
      notFound: 'Tone not found',
      unavailable: 'Tone unavailable',
      defaultLoadFailed: 'Failed to load default tone'
    }
  }
} as const
