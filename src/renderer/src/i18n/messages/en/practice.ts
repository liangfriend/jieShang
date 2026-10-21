export default {
  practice: {
    toolbar: {
      settings: 'Settings',
      play: 'Play',
      demoPlay: 'Demo play',
      stopDemo: 'Stop demo',
      pause: 'Pause',
      stop: 'Stop',
      clearPlayData: 'Clear play data',
      hideScore: 'Hide score',
      showScore: 'Show score'
    },
    settings: {
      title: 'Practice settings',
      display: 'Display',
      showNoteResult: 'Show note results in real time',
      showNoteResultHint:
        'Correct, early, late, and missed notes are color-coded (missed notes in red)',
      coverWaterfall: 'Cover waterfall',
      coverWaterfallHint: 'Hide the waterfall with a cute background and practice by ear',
      volumeAndSpeed: 'Volume & tempo',
      scoreVolume: 'Score volume',
      pianoVolume: 'Virtual piano volume',
      pianoVolumeHint: 'Sound of the keys you press (keyboard, mouse, MIDI device). Keys are muted when score volume is 0.',
      metronomeVolume: 'Metronome volume',
      bpm: 'BPM',
      metronomeDuringPlay: 'Metronome during playback',
      staffSelection: 'Staff selection',
      staffSelectionHint: 'Choose which staves to play',
      singleStaff: 'Staff {n}',
      noSingleStaff: 'No single staves in this score',
      difficulty: 'Difficulty',
      difficultyBeginner: 'Beginner',
      difficultyBeginnerDesc: 'Wider timing window — good for getting started',
      difficultyIntermediate: 'Intermediate',
      difficultyIntermediateDesc: 'Standard timing — good for daily practice',
      difficultyMaster: 'Master',
      difficultyMasterDesc: 'Strict timing — for a real challenge',
      appendix: 'Appendix: color legend',
      noteColors: 'Note colors'
    },
    result: {
      perfect: 'Perfect',
      good: 'Great',
      pass: 'Pass',
      early: 'Early',
      late: 'Late',
      miss: 'Miss',
      wrong: 'Wrong',
      'high-midi': 'Sharp',
      'low-midi': 'Flat',
      'quick-end': 'Ended early',
      'slow-end': 'Ended late'
    },
    stats: {
      totalNotes: 'Total notes',
      realScore: 'Live score',
      totalScore: 'Progress'
    },
    coverText: 'Cover of champions',
    messages: {
      notationTypeSwitchFailed: 'Failed to switch score type',
      noPracticeNotes: 'This score has no notes to practice'
    }
  }
} as const
