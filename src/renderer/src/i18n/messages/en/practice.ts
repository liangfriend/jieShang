export default {
  practice: {
    toolbar: {
      settings: 'Settings',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      clearPlayData: 'Clear play data'
    },
    settings: {
      title: 'Practice settings',
      desc: 'Tune your practice experience — more features coming soon',
      display: 'Display',
      showNoteResult: 'Show note results in real time',
      showNoteResultHint:
        'Correct, early, late, and missed notes are color-coded (missed notes in red)',
      coverWaterfall: 'Cover waterfall',
      coverWaterfallHint: 'Hide the waterfall with a cute background and practice by ear',
      volumeAndSpeed: 'Volume & tempo',
      scoreVolume: 'Score volume',
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
      miss: 'Miss'
    },
    stats: {
      totalNotes: 'Total notes',
      realScore: 'Live score',
      totalScore: 'Total score'
    },
    coverText: 'Cover of champions',
    messages: {
      notationTypeSwitchFailed: 'Failed to switch score type',
      noPracticeNotes: 'This score has no notes to practice'
    }
  }
} as const
