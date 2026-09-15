export default {
  rhythmSenseTest: {
    title: 'Rhythm sense test',
    setup: {
      heading: 'Test settings',
      beats: 'Beats',
      beatsOption: '{count} beats',
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
