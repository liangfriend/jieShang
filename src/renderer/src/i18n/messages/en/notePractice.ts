export default {
  notePractice: {
    title: 'Practice mode',
    setup: {
      heading: 'Practice settings',
      notation: 'Notation',
      notationOptions: {
        staff: 'Staff',
        jianpu: 'Number notation'
      },
      clefs: 'Clefs',
      clefOptions: {
        treble: 'Treble clef',
        alto: 'Alto clef',
        bass: 'Bass clef'
      },
      staffRangeHint: 'Range each clef can show: treble {treble}, alto {alto}, bass {bass}',
      keySignatures: 'Key signatures',
      keyAll: 'All',
      keyOnlyC: 'C only',
      accidentals: 'Accidentals',
      accidentalOptions: {
        none: 'None',
        single: 'Sharps / flats',
        double: 'Including double sharps / flats'
      },
      jianpuDoubleHint: 'Number notation has no double sharps or flats',
      range: 'Range',
      candidateCount: '{count} notes can appear with these settings',
      noCandidates: 'No notes can appear with these settings. Widen the range, clefs, or key signatures.',
      count: 'Number of notes',
      infinite: 'Unlimited',
      playTargetSound: 'Play each new note',
      keySound: 'Play sound when you press a key',
      showPiano: 'Show virtual piano',
      start: 'Start practice'
    },
    play: {
      hint: 'Play this note on your MIDI keyboard or the piano below',
      hintNoPiano: 'Play this note on your MIDI keyboard',
      completed: 'Done {count}',
      wrong: 'Wrong {count}',
      elapsed: 'Time {time}',
      finish: 'Finish',
      abort: 'Stop'
    },
    final: {
      heading: 'Practice results',
      accuracy: 'First-try accuracy {percent}',
      completed: '{count} notes completed',
      wrong: '{count} wrong presses',
      avgResponse: 'Average {ms} ms per note',
      bestStreak: 'Longest first-try streak: {count}',
      elapsed: 'Total time {time}',
      playAgain: 'Practice again',
      reset: 'Change settings'
    }
  }
} as const
