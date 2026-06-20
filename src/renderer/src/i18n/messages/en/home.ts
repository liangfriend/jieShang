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
      compose: 'Compose',
      scores: 'My scores',
      whiteboard: 'Whiteboard',
      achievements: 'Achievements'
    },
    templateDialog: {
      title: 'Choose a template',
      desc: 'Pick a template to start editing your score',
      staff: 'Staff',
      jianpu: 'Number notation',
      empty: 'Empty',
      single: 'Single staff',
      double: 'Double staff'
    },
    midi: {
      connected: 'MIDI keyboard connected',
      disconnected: 'MIDI keyboard not connected'
    },
    settingsAria: 'Settings'
  },
  scores: {
    title: 'My scores',
    searchPlaceholder: 'Search scores',
    empty: 'No scores yet — create one to get started',
    emptyFiltered: 'No matching scores',
    deleteTitle: 'Delete score',
    deleteMessage: 'Delete this score? ',
    deleteWarning: 'This cannot be undone.',
    deleteSuccess: 'Score deleted',
    deleteAria: 'Delete score'
  }
} as const
