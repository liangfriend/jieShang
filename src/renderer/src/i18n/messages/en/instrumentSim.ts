export default {
  instrumentSim: {
    title: 'Instruments',
    locked: 'Tone not owned — locked',
    guide: 'Guide',
    smoothEnvelope: 'Smooth',
    score: {
      selectScore: 'Select score',
      noScore: 'No score selected',
      selectClSheet: 'Chord & lyric sheet',
      noClSheet: 'No chord & lyric sheet selected',
      clSheetLoadFailed: 'Failed to load the chord & lyric sheet',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop'
    },
    guitar: {
      name: 'Guitar',
      desc: 'Number keys for chords, numpad to pick strings',
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
      smoothEnvelope: 'Smooth',
      pickHint: 'Pick: numpad 1–6 or click a string (1 = thinnest). Smooth adds ADSR envelope.',
      chordHint: 'Chords: hold 1–9 to fret; release returns to open strings',
      orientation: {
        horizontal: 'Horizontal',
        vertical: 'Vertical'
      },
      guideTitle: 'Guitar guide',
      guideBody:
        'By default the guitar lies horizontally at the top with the current chord diagram to its right, and the score area is below. Switch to "Vertical" at the top to stand the guitar on the left and give the score area more room. The side panel picks and plays a score with the nylon-guitar tone, and can also show a chord & lyric sheet in the score area; scroll it when it does not fit. Hold main keys 1–9 to switch shortcut chords (left-hand fretting); release to return to open strings. Numpad 1–6 (or click the strings on the guitar) plucks and sounds that string. Smooth adds an ADSR envelope on each pick. Bind chords in Shortcuts; edit shapes in Manage chords.'
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
      smoothEnvelope: 'Smooth',
      toneLocked: 'Tone locked to harmonica',
      playHint:
        'Hover to follow; LMB blow, RMB draw; only holes inside the red mouth box sound and highlight. With Smooth on, notes fade out on release.',
      idle: 'Hover the harp — LMB blow / RMB draw',
      toneLoading: 'Loading tone…',
      blowing: 'Blowing…',
      drawing: 'Drawing…',
      guideTitle: 'Harmonica guide',
      guideBody:
        'The top area shows a front-view harmonica. Moving the pointer slides it horizontally; leaving recenters it. The red box is the mouth window (adjustable). Hold left click to blow, right click to draw — holes inside the box highlight and sound. Smooth adds an ADSR fade on release. Pick a score on the right; tone is locked to harmonica. Models: 10-hole C blues or 24-hole C tremolo.',
      models: {
        blues10: '10-hole C blues',
        tremolo24: '24-hole C tremolo'
      }
    },
    drumMachine: {
      name: 'Drum machine',
      desc: 'Multi-track step sequencer, save & load patterns',
      title: 'Drum machine',
      unnamed: 'Untitled pattern',
      unsaved: 'Unsaved',
      new: 'New',
      open: 'Open',
      saveAs: 'Save as',
      playHint: 'Play / stop (Space)',
      volume: 'Volume',
      swing: 'Swing',
      swingHint:
        'Delays off-beat blocks, turning an even rhythm into a long-short groove; 0% is perfectly even. Unit on the right: time is paired by that unit and the second of each pair is delayed — e.g. 1/4 delays beats 2 and 4, 1/8 the off-beat 8th, 1/16 the 2nd and 4th 16th. Match it to the block length you want to swing. At 60% the delay is 0.6 of that unit.',
      totalBeats: 'Length (beats)',
      barsLabel: '{bars} bar(s) {beats} beat(s)',
      clearAll: 'Clear all',
      clearAllConfirm: 'Turn off every block on all tracks?',
      uniformDuration: 'All blocks',
      uniformMixed: 'Mixed lengths — picking one regrids every track',
      blockDuration: 'Selected block',
      blockSelected: 'Selected block: {duration} beat(s)',
      blockNone: 'Click a block to change its length',
      mouseHint: 'LMB on · RMB off · drag to paint',
      tracks: 'Tracks',
      preview: 'Preview',
      solo: 'Solo',
      mute: 'Mute',
      more: 'More',
      regrid: 'Regrid track to {unit}',
      invert: 'Invert',
      clear: 'Clear track',
      removeTrack: 'Remove track',
      addTrack: 'Add track',
      category: {
        gm: 'GM standard',
        gmExtra: 'Non-GM (unverified)',
        named: 'Extended kit'
      },
      toneFailed: 'Failed to load drum sounds',
      discardConfirm: 'Discard unsaved changes to this pattern?',
      namePrompt: 'Pattern name',
      defaultName: 'My pattern',
      nameInvalid: 'Name must be 1–100 characters',
      saved: 'Saved',
      loaded: 'Loaded "{name}"',
      openTitle: 'Open pattern',
      searchPlaceholder: 'Search by name',
      empty: 'No saved patterns yet',
      columnName: 'Name',
      updatedAt: 'Updated',
      current: 'Current',
      deleteConfirm: 'Delete pattern "{name}"?',
      deleted: 'Deleted',
      guideTitle: 'Drum machine guide',
      guideBody:
        'Each row on the left is a track: change its instrument from the dropdown, click preview to audition, S = solo, M = mute, the slider sets track volume, and the arrow menu regrids the whole track (1/2–1/32), inverts, clears or removes it. "Add track" adds a new instrument.\nOn the right are the step blocks: left click turns a block on, right click turns it off, drag to paint. "All blocks" regrids every track to one length (lit positions are kept); click a block to change just that block under "Selected block" — longer swallows the following blocks, shorter inserts empty blocks of the same length after it.\nThe top bar sets BPM, master volume, swing (delays off-beats on a chosen 1/2–1/32 unit) and the total length in beats. Space plays / stops, Ctrl+S saves, Ctrl+Shift+S saves as; "Open" loads a saved pattern.'
    },
    xiao: {
      name: 'Xiao',
      desc: 'Coming soon',
      soon: 'In development'
    },
    panFlute: {
      name: 'Pan flute',
      desc: 'Mouth follows the pointer — hold LMB to blow',
      title: 'Pan flute simulator',
      model: 'Model',
      toneLocked: 'Tone locked to pan flute',
      toneLoading: 'Loading tone…',
      idle: 'Aim at a pipe and hold left click to blow',
      blowing: 'Blowing {note}',
      guideTitle: 'Pan flute guide',
      guideBody:
        'The pan flute runs from low (left) to high (right); each pipe shows its pitch. The red arrow above the pipes is the mouth pointer — it blows whichever pipe it points at. Hold left click to blow, release to stop; only one pipe sounds at a time, and sliding while holding changes notes legato.\nSmooth is on by default and fades notes in and out.\nThe score below is shown in single-line mode; pick one on the right to play it with the pan-flute tone. Models: 16 or 18 pipes (C major, from G4).',
      models: {
        pipes16: '16 pipes, C',
        pipes18: '18 pipes, C'
      }
    },
    piccolo: {
      name: 'Piccolo',
      desc: 'Cover holes with the keyboard, blow into the mic or hold Space',
      title: 'Piccolo simulator',
      model: 'Model',
      currentNote: 'Current note',
      noMatch: 'No note for this fingering',
      overblowTip: 'Same fingering — blow harder for the higher octave',
      registers: {
        low: 'Low register',
        middle: 'Middle register',
        high: 'High register',
        highest: 'Top register'
      },
      facing: 'Head facing',
      facingLeft: 'Left',
      facingRight: 'Right',
      playHint: '{full} cover the holes, {half} half-cover; or left-click a hole to cover, right-click to half-cover.',
      breathMode: 'Breath',
      breathMic: 'Mic',
      breathSpace: 'Space',
      pressure: 'Pressure',
      micStatus: {
        off: 'Microphone off',
        starting: 'Starting microphone…',
        on: 'Listening — blow into the microphone to play',
        error: 'Could not start the microphone'
      },
      micRetry: 'Retry',
      micFailed: 'Could not start the microphone. Check the permission or switch to Space mode.',
      micHint: 'Blow into the microphone to play; harder is louder. When a fingering has several octaves, more pressure gives the higher one (marks on the pressure bar are the switch points).',
      spaceHint: 'Hold Space to blow, release to stop; when a fingering has several octaves, the lowest one plays.',
      guideTitle: 'Piccolo guide',
      guideBody:
        'The top shows a six-hole G piccolo (dizi); numbers above the holes are the traditional hole numbers (hole 6 is nearest the blow hole).\n"Head facing" follows real playing posture: facing left, the right hand grips reversed — Q W E P O I cover the six finger holes from the blow-hole end and A S D L K J half-cover; facing right, the flute is mirrored and the keys become O I U Q W E (cover) and L K J A S D (half). You can also hold left click on a hole to cover it, or right click to half-cover.\n"Breath" has two modes. Mic mode starts listening as soon as you open the page: blow into the microphone to sound, stop blowing to stop, and blow harder for louder; when a fingering has several octaves, more pressure gives the higher one — with two notes the switch is at 0.7, with three at 0.4 and 0.7. Space mode plays while you hold Space, always on the lowest octave.\nThe panel on the right shows the note for the current fingering (number notation and pitch name); the sounding note is highlighted in orange. Pick a score below to play it with the piccolo tone.',
      models: {
        dizi6G: 'Six-hole, G'
      }
    },
    kalimba: {
      name: 'Kalimba',
      desc: 'Play with letter keys — each hand has its own side',
      title: 'Kalimba simulator',
      model: 'Model',
      toneLocked: 'Tone locked to kalimba',
      toneLoading: 'Loading tone…',
      idle: 'Press the letter shown on a tine to play it; release to stop',
      guideTitle: 'Kalimba guide',
      guideBody:
        'The longest tine in the middle is the lowest note; pitches rise alternately to the left and right. Each tine shows its pitch name and keyboard letter: left-side tines use the left half of the keyboard (F D S A, T R E W …), right-side tines use the right half (H J K L, Y U I O …), and the lowest middle tine is G.\nPress a letter to play, release to stop; you can also hold left click on a tine. Smooth is on by default and adds an envelope.\nPick a score below to play it with the kalimba tone. Models: 17 tines (C4–E6) or 21 tines (F3–E6).',
      models: {
        tines17: '17 tines, C',
        tines21: '21 tines, C'
      }
    },
    chords: {
      title: 'Chord manager',
      search: 'Search by name',
      filterAll: 'All',
      filterTab6: '6-string (guitar)',
      filterTab5: '5-string (bass)',
      filterTab4: '4-string (ukulele)',
      add: 'Add chord',
      edit: 'Edit chord',
      name: 'Name',
      save: 'Save',
      delete: 'Delete',
      deleteConfirm: 'Delete chord "{name}"?',
      empty: 'No chords yet',
      saved: 'Saved',
      deleted: 'Deleted',
      typeLabel: 'Chord type',
      typeLocked: 'Type is locked after creation',
      hand: 'Chord hand',
      handTitle: 'Edit chord hand pose',
      handHint: 'Drag blue roots to move fingers; drag orange joints to rotate. Applied pose is saved with the chord.',
      handReset: 'Reset',
      handCancel: 'Cancel',
      handApply: 'Apply pose',
      handSaved: 'Pose set'
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
