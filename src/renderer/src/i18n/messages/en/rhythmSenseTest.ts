export default {
  rhythmSenseTest: {
    title: 'Rhythm sense test',
    setup: {
      heading: 'Test settings',
      beats: 'Beats',
      beatsOption: '{count} beats',
      beatUnit: 'Beat unit',
      beatUnitOption: {
        1: 'Whole note',
        2: 'Half note',
        4: 'Quarter note',
        8: 'Eighth note'
      },
      bpmRange: 'BPM range: {min} - {max}',
      bpmHint: 'Each round picks a random tempo in this range (BPM counts quarter notes)',
      rounds: 'Rounds',
      start: 'Start test'
    },
    listen: {
      kicker: 'Listen carefully',
      hint: '{count} beats coming — remember the tempo'
    },
    tap: {
      kicker: 'Tap the beat',
      hint: 'Click the ring or press Space',
      aria: 'Tap ring'
    },
    roundResult: {
      kicker: 'Round result',
      avgDeviation: 'Avg deviation {ms} ms',
      nextHint: 'Next round starting…'
    },
    final: {
      heading: 'Finished',
      avgDeviation: 'Avg deviation {ms} ms',
      bestRound: 'Best round: #{round} · BPM {bpm} · {ms} ms',
      playAgain: 'Play again',
      reset: 'Reset settings'
    }
  }
} as const
