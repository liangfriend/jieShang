export default {
  absolutePitchTest: {
    title: 'Pitch sense test',
    setup: {
      heading: 'Test settings',
      scale: 'Pitch set',
      scaleOptions: {
        pentatonic: 'Pentatonic (C D E G A)',
        diatonic: 'Diatonic (7 notes)',
        chromatic: 'Chromatic (12 notes)'
      },
      soundRange: 'Sound range',
      soundRangeOptions: {
        standard: 'Standard (middle-C octave)',
        full: 'Full (MIDI 21–108)'
      },
      labelMode: 'Key labels',
      labelModeOptions: {
        noteName: 'Note names',
        solfege: 'Solfege',
        number: 'Numbers'
      },
      rounds: 'Rounds',
      countdown: 'Answer time (sec)',
      start: 'Start test'
    },
    question: {
      replayHint: 'Tap to replay',
      replayAria: 'Replay current note',
      abort: 'Abort'
    },
    result: {
      correct: 'Correct',
      wrong: 'Wrong',
      timeout: 'Time out'
    },
    final: {
      heading: 'Finished',
      accuracy: 'Accuracy {percent}',
      counts: 'Correct {correct} · Wrong {wrong} · Timeout {timeout} / {total}',
      avgResponse: 'Avg response {ms} ms',
      bestStreak: 'Best streak {count}',
      playAgain: 'Play again',
      reset: 'Reset settings'
    }
  }
} as const
