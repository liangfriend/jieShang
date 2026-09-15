export default {
  instrumentSim: {
    title: 'Instruments',
    locked: 'Tone not owned — locked',
    guide: 'Guide',
    guitar: {
      name: 'Guitar',
      desc: 'Number keys for chords, pick strings on the right',
      title: 'Guitar simulator',
      selectScore: 'Select score',
      noScore: 'No score selected',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      shortcutSettings: 'Chord shortcuts',
      manageChords: 'Manage chords',
      currentChord: 'Current chord',
      none: 'None',
      toneLocked: 'Tone locked to nylon guitar',
      pickHint: 'Pick: numpad 1–6 or click a string (1 = thinnest)',
      chordHint: 'Chords: main keyboard 1–9',
      guideTitle: 'Guitar guide',
      guideBody:
        'Pick a score on the left and play it with the nylon-guitar tone. Main keys 1–9 switch shortcut chords (left-hand fretting). Numpad 1–6 (or click strings) plucks and sounds that string. Bind chords in Shortcuts; edit shapes in Manage chords.'
    },
    harmonica: {
      name: 'Harmonica',
      desc: 'Follow mouse — LMB blow / RMB draw',
      title: 'Harmonica simulator',
      selectScore: 'Select score',
      noScore: 'No score selected',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      model: 'Model',
      mouthSize: 'Mouth size',
      toneLocked: 'Tone locked to harmonica',
      playHint:
        'Hover to follow; LMB blow, RMB draw; only holes inside the red mouth box sound and highlight',
      idle: 'Hover the harp — LMB blow / RMB draw',
      toneLoading: 'Loading tone…',
      blowing: 'Blowing…',
      drawing: 'Drawing…',
      guideTitle: 'Harmonica guide',
      guideBody:
        'The top area shows a front-view harmonica. Moving the pointer slides it horizontally; leaving recenters it. The red box is the mouth window (adjustable). Hold left click to blow, right click to draw — holes inside the box highlight and sound. Pick a score on the right; tone is locked to harmonica. Models: 10-hole C blues or 24-hole C tremolo.',
      models: {
        blues10: '10-hole C blues',
        tremolo24: '24-hole C tremolo'
      }
    },
    xiao: {
      name: 'Xiao',
      desc: 'Coming soon',
      soon: 'In development'
    },
    violin: {
      name: 'Violin',
      desc: 'Coming soon',
      soon: 'In development'
    },
    chords: {
      title: 'Chord symbols',
      search: 'Search by name',
      add: 'Add chord',
      edit: 'Edit chord',
      name: 'Name',
      save: 'Save',
      delete: 'Delete',
      deleteConfirm: 'Delete chord "{name}"?',
      empty: 'No chords yet',
      saved: 'Saved',
      deleted: 'Deleted'
    },
    shortcuts: {
      title: 'Chord shortcuts',
      key: 'Key {n}',
      unbound: 'Unbound',
      save: 'Save',
      saved: 'Shortcuts saved'
    }
  }
} as const
