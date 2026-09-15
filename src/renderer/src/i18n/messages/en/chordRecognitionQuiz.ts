export default {
  chordRecognitionQuiz: {
    title: 'Chord recognition',
    qualities: {
      major: 'Major',
      minor: 'Minor',
      dom7: 'Dom7',
      maj7: 'Maj7',
      min7: 'Min7'
    },
    setup: {
      heading: 'Test settings',
      qualities: 'Chord types (multi-select)',
      soundRange: 'Sound range',
      soundRangeOptions: {
        standard: 'Standard (near middle C)',
        full: 'Full (MIDI 21–108)'
      },
      showPiano: 'Show piano',
      rounds: 'Rounds',
      countdown: 'Answer time (sec)',
      start: 'Start test'
    },
    question: {
      replayHint: 'Tap to replay',
      replayAria: 'Replay current chord',
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
      qualityAccuracy: '{quality} accuracy {percent}',
      playAgain: 'Play again',
      reset: 'Reset settings'
    }
  }
} as const
