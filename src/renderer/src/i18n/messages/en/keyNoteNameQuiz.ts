export default {
  keyNoteNameQuiz: {
    title: 'Key note names',
    setup: {
      heading: 'Test settings',
      scale: 'Pitch set',
      scaleOptions: {
        pentatonic: 'Pentatonic (C D E G A)',
        diatonic: 'Diatonic (7 notes)',
        chromatic: 'Chromatic (12 notes)'
      },
      labelMode: 'Option labels',
      labelModeOptions: {
        noteName: 'Note names',
        solfege: 'Solfege',
        number: 'Numbers',
        mixed: 'Mixed'
      },
      rounds: 'Rounds',
      countdown: 'Answer time (sec)',
      start: 'Start test'
    },
    question: {
      hint: 'Name the highlighted key',
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
