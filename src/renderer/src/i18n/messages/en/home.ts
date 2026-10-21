export default {
  home: {
    brand: {
      title: 'Decipher',
      subtitle: 'Fuel your musical dreams',
      logoAlt: 'Decipher'
    },
    gameModes: {
      arcade: {
        title: 'Arcade mode',
        desc: '60-second time limit — chase high scores'
      },
      endless: {
        title: 'Endless mode',
        desc: 'Three lives — see how long you last'
      },
      extreme: {
        title: 'Extreme mode',
        desc: 'No missed notes — survive as long as you can'
      }
    },
    actions: {
      collection: 'Collection',
      scores: 'My scores',
      whiteboard: 'Whiteboard',
      achievements: 'Achievements',
      myWorks: 'My works',
      chordManage: 'Chord manager',
      abilityTest: 'Ability tests',
      myAudio: 'My audio',
      myImage: 'My images',
      myVideo: 'My videos',
      instrumentSim: 'Instruments',
      tools: 'Tools'
    },
    midi: {
      connected: 'MIDI keyboard connected',
      disconnected: 'MIDI keyboard not connected'
    },
    settingsAria: 'Settings',
    community: 'Decipher QQ group 202732106'
  },
  scores: {
    title: 'My scores',
    create: 'New score',
    searchPlaceholder: 'Search scores',
    empty: 'No scores yet — tap New to create one',
    emptyFiltered: 'No matching scores',
    deleteTitle: 'Delete score',
    deleteMessage: 'Delete this score? ',
    deleteWarning: 'This cannot be undone.',
    deleteSuccess: 'Score deleted',
    deleteAria: 'Delete score',
    clSheetBadge: 'Chords',
    templateDialog: {
      title: 'Choose a template',
      desc: 'Pick a template to start editing your score',
      staff: 'Staff',
      jianpu: 'Number notation',
      tab: 'TAB',
      empty: 'Empty',
      single: 'Single staff',
      double: 'Double staff',
      guitar: 'Guitar tab',
      ukulele: 'Ukulele tab',
      bass4: '4-string bass tab',
      bass5: '5-string bass tab',
      bass6: '6-string bass tab',
      drum: 'Drum',
      drumKit: 'Drum kit score',
      clSheet: 'Chord & lyric sheet'
    }
  }
} as const
