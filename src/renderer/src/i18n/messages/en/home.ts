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
      musicEncyclopedia: 'Encyclopedia',
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
    settingsAria: 'Settings'
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
    templateDialog: {
      title: 'Choose a template',
      desc: 'Pick a template to start editing your score',
      staff: 'Staff',
      jianpu: 'Number notation',
      empty: 'Empty',
      single: 'Single staff',
      double: 'Double staff'
    }
  }
} as const
