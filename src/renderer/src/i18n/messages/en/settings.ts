export default {
  settings: {
    title: 'Settings',
    language: {
      label: 'Language',
      zh: '中文',
      en: 'English'
    },
    gameDifficulty: {
      label: 'Arcade / Endless difficulty:',
      easy: 'Easy',
      easyDesc: 'MIDI 38–83, treble/bass clef, no double sharps or flats',
      standard: 'Standard',
      standardDesc: 'MIDI 38–83, three clefs, no double sharps or flats, faster rhythm',
      hard: 'Hard',
      hardDesc: 'MIDI 38–83, three clefs, all accidentals, faster blocks and spawn rate'
    },
    noteBlockSound: {
      label: 'Note block sound'
    },
    practice: {
      difficulty: {
        beginner: 'Beginner',
        beginnerDesc: 'Wider timing window — good for getting started',
        intermediate: 'Intermediate',
        intermediateDesc: 'Standard timing — good for daily practice',
        master: 'Master',
        masterDesc: 'Strict timing — for a real challenge'
      }
    }
  }
} as const
