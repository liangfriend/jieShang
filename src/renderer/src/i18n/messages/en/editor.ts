export default {
  editor: {
    menu: {
      file: 'File',
      edit: 'Edit',
      view: 'View',
      score: 'Score',
      play: 'Play',
      help: 'Help'
    },
    toolbar: {
      playMode: 'Play mode',
      playSettings: 'Playback settings',
      timeOffset: 'Score-audio sync',
      linkedStaffMode: 'Linked staves',
      rhythmPatternMode: 'Rhythm patterns',
      slurStyle: 'Slur style',
      structureEdit: 'Structure',
      lyricsEdit: 'Lyrics',
      showInstrumentName: 'Show instrument',
      layout: 'Layout',
      notice: 'Notice',
      legalNotes: 'Legal notes',
      quickInput: 'Quick input',
      pianoRecord: 'Piano input',
      import: 'Import',
      export: 'Export',
      formatSj: 'Decipher score (.sj)',
      formatMusicXml: 'MusicXML',
      formatMusicXmlMs4: 'MusicXML(ms4)',
      formatMusicXmlMs3: 'MusicXML(ms3)',
      formatMidi: 'MIDI',
      formatWork: 'Work',
      scoreImage: 'Image to score (number notation)',
      save: 'Save',
      notationType: 'Score type',
      transpose: 'Transpose',
      targetKey: 'Target key',
      applyTranspose: 'Transpose',
      raiseSemitone: 'Up ½',
      lowerSemitone: 'Down ½'
    },
    drumLegalNotes: {
      title: 'Legal drum notes',
      lead: 'These are the legal notes in the default drum play map (staff position + note head). Each card shows one notation and its instrument sound. While editing, select a measure and press the letter before an instrument name to append that note to the end of the measure (voice, duration and dots come from the toolbar).',
      meta: 'Region {region} · Head {headType}',
      shortcut: 'Shortcut: {key}',
      play: 'Preview',
      toneLoadFailed: 'Failed to load percussion tone'
    },
    scoreToWork: {
      title: 'Export as work',
      template: 'Page template',
      custom: 'Custom',
      pageSize: 'Page size',
      scoreWidth: 'Score width',
      topMargin: 'Top margin',
      hint: 'The score is scaled to this width, centered horizontally and placed from the top margin. Grand staves that do not fit move whole to the next page, keeping the same margin at the bottom. Confirming creates a new work and opens it in the work editor; it is not added to My Works until you save.'
    },
    rhythmPattern: {
      title: 'Rhythm patterns',
      heading: 'Rhythm patterns ({mode}) · {timeSignature} · {count} notes',
      hint: 'Most common first; press the key on a card to apply it, arrows + Enter / Space pick the highlighted card, Tab switches mode, Esc closes; hovering does not change the candidate',
      empty: 'No rhythm pattern fits these notes in this time signature',
      emptyBeat: 'These notes cannot fill exactly one beat',
      modeMeasure: 'By measure',
      modeBeat: 'By beat',
      skipped: 'One beat only fits the last notes; the first {count} notes were left out'
    },
    standardMode: {
      label: 'Standard mode',
      hint: 'When on, a note that would overflow the measure\'s time signature moves to the next measure (which gets selected), and the rest of this measure is filled with rests',
      durationInvalid: 'Invalid note duration',
      noNextMeasure: 'This is the last measure; there is no next measure'
    },
    lyricsMatch: {
      button: 'Match lyrics',
      title: 'Smart lyrics matching',
      grandStaff: 'Row {n}',
      placeholder: 'Type this row\'s lyrics; they fill the notes automatically',
      placeholderMulti: '{n} single staves: the first line fills staff 1, press Enter for the next',
      overflow: 'Staff {staff}: {n} extra syllables were not placed',
      extraLines: '{n} extra lines have no matching staff',
      hint: 'Each box is one grand staff; each line (Enter) is the next single staff. Rests and notes under a slur are skipped. CJK characters get one note each; other text is split into words by spaces, use - to split syllables and _ to skip a note. Fills the first lyrics line.'
    },
    noticeDialog: {
      title: 'Editing notice',
      selectionTitle: 'Selection & deletion',
      selectionItems: [
        'Click an element on the score to select it; keyboard note entry works once a measure is selected.',
        'Some symbols on notes cannot be selected on the score — remove them in the note property panel.',
        'Voltas and slurs can be selected and deleted, but you must click precisely on the symbol.',
        'The last measure, single staff, or grand staff cannot be deleted (the delete button is disabled).'
      ],
      commonShortcutTitle: 'Common shortcuts (all score types)',
      commonShortcutItems: [
        { keys: ['Esc'], desc: 'Clear the current selection.' },
        { keys: ['Delete', 'Backspace'], desc: 'Delete the selected item (note, measure, staff, spanning symbol, etc.). With a measure selected, Backspace removes only its last note / rest; Delete removes the whole measure.' },
        { keys: ['<', '>'], desc: 'With a note (or a measure — its last note, no need to click the note first) selected: > adds a slur from this note to the next, or, if this note already starts a slur, extends that slur one note right; < adds a slur from the previous note to this one, or, if this note already ends a slur, extends that slur one note left. Rests are skipped. The comma / period keys work without Shift too, including with a Chinese input method.' },
        { keys: ['/'], desc: 'Remove every slur that starts or ends on the selected note (or the measure\'s last note).' },
        { keys: [';', "'"], desc: 'With a note (or a measure — its last note) selected: ; adds a grace note before it, \' adds one after; default duration is a sixteenth. The semicolon / quote keys work without Shift too.' },
        { keys: ['L'], desc: 'Clear every grace note before / after the selected note (or the measure\'s last note).' },
        { keys: ['O'], desc: 'Cycle the main note / rest duration: 64th → 32nd → 16th → 8th → quarter → half → whole → … (e.g. quarter + O → half). With a note or rest selected, changes that item; with a measure selected, changes the last one; with a grace selected, changes its host note.' },
        { keys: ['{', '}'], desc: 'With a measure selected: { cycles the front barline (none, start repeat, reverse); } cycles the back barline (8 types). The [ / ] keys work without Shift too.' },
        { keys: ['Ctrl+Z'], desc: 'Undo. About 20 steps are kept and cleared when you leave the editor.' },
        { keys: ['Ctrl+Y', 'Ctrl+Shift+Z'], desc: 'Redo an undone action.' },
        { keys: ['↑', '↓', '←', '→'], desc: 'With a measure selected, move to the adjacent measure above, below, left, or right for continuous entry.' },
        { keys: ['*'], desc: 'Add a single staff below the current one; with nothing selected, below the last single staff.' },
        { keys: ['-'], desc: 'Add a grand staff below the current one; with nothing selected, below the last grand staff.' },
        { keys: ['Space'], desc: 'With a measure that has notes selected, open the rhythm pattern popup: pitches stay the same and the notes are re-timed to the chosen pattern. Switch mode with "Rhythm patterns" at the top of the editor (or press Tab while the popup is open): "By measure" re-times the whole measure; "By beat" only groups the trailing notes that are not grouped yet into one beat and marks the last of them, so the next Space starts after that mark. In the popup, press the digit / letter on a card (numpad keys when those run out) to apply it, or arrows + Enter / Space for the highlighted card; Esc closes. Moving the mouse over cards does not change the highlighted candidate.' },
        { keys: ['P'], desc: 'With a measure selected, copy its notes into the next measure (replacing what is there) and select that measure; press repeatedly to keep copying forward. At the end of a line it continues on the first measure of the same single staff in the next grand staff.' },
        { keys: ['Tab'], desc: 'In a lyric field, jump to the next note\'s lyric; when the current note starts a slur, jump to the note after the slur ends.' }
      ],
      standardModeTitle: 'Standard mode',
      standardModeItems: [
        'Toggle "Standard mode" at the top right of the editor. When on, if a note entered by keyboard, mouse or MIDI makes the measure longer than its time signature, it moves to the end of the next measure, that measure gets selected, and the remainder of this measure is filled with rests.',
        'A note longer than a whole measure shows "Invalid note duration" and is not written.',
        'The next measure follows the → key: at the end of a line it goes to the first measure of the same single staff in the next grand staff. If there is none, a hint is shown and nothing is written.'
      ],
      commonShortcutNote: 'Single-key shortcuts are ignored while holding Ctrl / Alt or typing in a text field.',
      shortcutTitle: 'Shortcuts by score type',
      shortcutGroups: {
        number: {
          title: 'Number notation',
          lead: 'Number notation uses the main-row digits (above the letters) and three letter rows to enter notes, so use the numpad to change the duration.',
          items: [
            { keys: ['1–7'], desc: 'Main row: append middle-octave do re mi fa sol la si to the end of the selected measure, using the toolbar duration regardless of the toolbar note / rest option.' },
            { keys: ['Q W E R T Y U'], desc: 'Append high 1–7 (one octave dot above).' },
            { keys: ['A S D F G H J'], desc: 'Append middle 1–7.' },
            { keys: ['Z X C V B N M'], desc: 'Append low 1–7 (one octave dot below).' },
            { keys: ['0', '~', 'I', 'K'], desc: 'Main row: append a rest to the end of the selected measure, using the toolbar duration. I / K are the unused keys on the middle letter row.' },
            { keys: ['Num 1–8'], desc: 'Numpad: set the toolbar duration — 1 whole, 2 half, 3 quarter, 4 eighth, 5 16th, 6 32nd, 7 64th, 8 128th.' },
            { keys: ['Num 0'], desc: 'Numpad: toggle the toolbar between note and rest (used when adding with the mouse).' },
            { keys: ['8', '9'], desc: 'Main keyboard: 8 lowers the toolbar octave dots by one, 9 raises them by one (range -3 to +3); used when adding with the mouse.' },
            { keys: ['MIDI keyboard'], desc: 'With a measure selected, press a key to append that pitch to the end of the measure, using the toolbar duration.' },
            { keys: ['Ctrl+S'], desc: 'In the "Number notation quick input" drawer: refresh the preview from the text.' }
          ]
        },
        staff: {
          title: 'Standard staff',
          lead: 'Like number notation, the staff uses the main-row digits and three letter rows to enter notes by solfège (movable do from the measure key; middle octave is C4–B4 in treble clef, one octave lower in bass clef), so use the numpad to change the duration. You can also select a measure and click inside it to add a note.',
          items: [
            { keys: ['1–7'], desc: 'Main row: append middle-octave do re mi fa sol la si to the end of the selected measure, using the toolbar duration regardless of the toolbar note / rest option.' },
            { keys: ['Q W E R T Y U'], desc: 'Append 1–7 one octave higher.' },
            { keys: ['A S D F G H J'], desc: 'Append middle 1–7.' },
            { keys: ['Z X C V B N M'], desc: 'Append 1–7 one octave lower.' },
            { keys: ['0', '~', 'I', 'K'], desc: 'Main row: append a rest to the end of the selected measure, using the toolbar duration. I / K are the unused keys on the middle letter row.' },
            { keys: ['Num 1–8'], desc: 'Numpad: set the toolbar duration — 1 whole, 2 half, 3 quarter, 4 eighth, 5 16th, 6 32nd, 7 64th, 8 128th.' },
            { keys: ['Num 0'], desc: 'Numpad: toggle the toolbar between note and rest (used when adding with the mouse).' },
            { keys: ['MIDI keyboard'], desc: 'With a measure selected, press a key to append that pitch to the end of the measure, using the toolbar duration.' }
          ]
        },
        drum: {
          title: 'Drum score',
          lead: 'Drum scores are entered with letter keys: each letter is one legal note (line + notehead). See the letters on the toolbar "Legal notes" cards.',
          items: [
            { keys: ['A–T'], desc: 'With a measure selected, append the matching legal note to the end of the current voice (P is skipped — it copies to the next measure), using the toolbar voice, duration and dots regardless of the note / rest option. Works even when the IME is in Chinese mode.' },
            { keys: ['3–8'], desc: 'Set the toolbar duration — 3 quarter, 4 eighth, 5 16th, 6 32nd, 7 64th, 8 128th. Drum notes go up to a quarter note, so 1 and 2 do nothing.' },
            { keys: ['0'], desc: 'Toggle the toolbar between note and rest.' },
            { keys: ['MIDI keyboard'], desc: 'MIDI keyboard entry is not supported for drum scores yet.' }
          ]
        },
        tab: {
          title: 'TAB (guitar / ukulele / bass)',
          lead: 'Letter keys pick the fret while the mouse points at the string and position; the keyboard also switches duration and normal note / rest.',
          items: [
            { keys: ['A–Z'], desc: 'Frets 0–24 in order (P is skipped, so Q is fret 15): sets the toolbar fret, and with a measure selected and the mouse inside it, also writes it at the string and position under the mouse.' },
            { keys: ['1–8'], desc: 'Main row or numpad: set the toolbar duration — 1 whole, 2 half, 3 quarter, 4 eighth, 5 16th, 6 32nd, 7 64th, 8 128th.' },
            { keys: ['0'], desc: 'Toggle the toolbar between normal note and rest.' },
            { keys: ['MIDI keyboard'], desc: 'MIDI keyboard entry is not supported for TAB yet.' }
          ]
        }
      },
      midiTitle: 'MIDI',
      midiItems: ['Imported MIDI always becomes a standard staff score'],
      tabTitle: 'TAB',
      tabItems: [
        'Guitar, ukulele, and bass techniques are complex, so TAB playback is still limited. Sorry about that.'
      ]
    },
    convertDialog: {
      title: 'Switch score type',
      message:
        'Playback data will be preserved as much as possible, but layout and some notation details may be lost. You can undo this switch with Ctrl+Z.'
    },
    transposeDialog: {
      title: 'Transpose',
      message:
        'Transpose uses the first key signature as the current key. If the score uses multiple different keys, note pitches may be lost.'
    },
    layoutDialog: {
      title: 'Layout',
      currentPanel: 'Current score layout',
      currentPanelHint:
        'Changes write to this score immediately. “Sync as default” copies this layout to the software default.',
      defaultPanel: 'Default layout',
      defaultPanelHint:
        'Changes are saved automatically for new scores and new staves. Click “Apply” to copy onto this score.',
      defaultNoPageSizeHint: 'Total width / height are not part of defaults; new scores keep the template page size.',
      page: 'Page',
      pageWidth: 'Total width',
      sLSlotW: 'Left margin',
      sLSlotWHint: 'Blank space to the left of each staff; with “Show instrument” on, the instrument name is drawn here.',
      instrumentNameFont: 'Instrument font',
      sRSlotW: 'Right margin',
      sRSlotWHint: 'Blank space to the right of each staff; when a slur continues onto the next line, its end-of-line part is drawn here.',
      preview: 'Preview',
      previewUntitled: 'Untitled score',
      pageHeight: 'Total height',
      pageHeightHint: 'Increase it if the score is cut off. Applies to this score only and is not saved as default.',
      titleArea: 'Title area',
      tSlotH: 'Height',
      titleFont: 'Font',
      lyricsArea: 'Lyrics',
      lyricsFont: 'Font',
      lyricsFontSize: 'Font size',
      lyricsFontSizeHint: 'Size of the lyrics text; line spacing scales with it. Lyrics are drawn below each single staff in its outer bottom margin, so raise that margin when there are several lyric lines or the text is large.',
      fontDefault: 'System default',
      grandStaff: 'Grand staff margins',
      singleStaff: 'Single staff margins',
      uSpace: 'Top margin',
      dSpace: 'Bottom margin',
      uSpaceO: 'Outer top',
      uSpaceI: 'Inner top',
      dSpaceI: 'Inner bottom',
      dSpaceO: 'Outer bottom',
      apply: 'Apply',
      setDefault: 'Sync as default',
      setDefaultHint: 'Sync this score’s layout (excluding page size) as the default for new scores',
      setDefaultSuccess: 'Current layout synced as default',
      applyDefault: 'Apply defaults',
      applyDefaultHint:
        'Apply the default layout (staff spacing, title area, side margins, fonts, lyrics font size) to this score; page size stays the same',
      applyDefaultSuccess: 'Default layout applied to this score'
    },
    endpointOffset: {
      title: 'Start / end position',
      start: 'Start',
      end: 'End'
    },
    slurApply: {
      centerControl: 'Center control point',
      title: 'Apply current position to',
      scope: {
        measure: 'Measure',
        singleStaff: 'Single staff',
        grandStaff: 'Grand staff',
        score: 'Whole score'
      },
      applied: 'Applied to {n} slurs',
      none: 'No other slurs in range'
    },
    multiNote: {
      summary: '{n} notes selected',
      summaryWithRests: '{notes} notes and {rests} rests selected',
      summaryRests: '{n} rests selected',
      restsSkipPitch: 'Rests are not affected by pitch shifts',
      pitch: 'Pitch',
      lower: 'Lower',
      raise: 'Raise',
      duration: 'Duration',
      double: 'Duration ×2',
      halve: 'Duration ÷2',
      stem: 'Stem',
      actions: 'Actions',
      delete: 'Delete selected',
      nothingChanged: 'No pitched notes to shift',
      alreadyLongest: 'Selected notes are already the longest duration',
      alreadyShortest: 'Selected notes are already the shortest duration'
    },
    propertyPanel: {
      title: 'Properties',
      multiNote: 'Multiple notes',
      measure: 'Measure properties',
      noteHead: 'Note properties',
      grace: 'Grace note properties',
      rest: 'Rest properties',
      slur: 'Slur properties',
      pitch: 'Ottava properties',
      volta: 'Volta properties',
      bend: 'Bend properties',
      bracket: 'Bracket properties',
      noteMark: 'Mark properties',
      measureMark: 'Measure symbol properties',
      trillLine: 'Trill line properties',
      pedal: 'Pedal properties',
      arpeggio: 'Arpeggio properties',
      strumming: 'Strum properties',
      preludeBracket: 'Prelude bracket properties',
      hairpin: 'Hairpin properties',
      guzhengLian: 'Guzheng continuous fingering properties',
      placeholder:
        'Select a measure, note, rest, slur, mark, ottava, volta, or bracket on the score to edit its properties here'
    },
    panelTab: {
      basic: 'Basics',
      marks: 'Marks',
      span: 'Lines'
    },
    panelGroup: {
      rhythm: 'Rhythm',
      pitch: 'Pitch',
      position: 'Position',
      structure: 'Measure',
      barline: 'Barlines',
      front: 'Measure start',
      back: 'Measure end',
      repeat: 'Repeats'
    },
    addNote: {
      add: 'Add',
      note: 'Note',
      rest: 'Rest',
      duration: 'Duration',
      octaveDot: 'Octave'
    },
    addTab: {
      fret: 'Fret',
      regionStart: 'Start string {n}',
      regionEnd: 'End string {n}',
      kind: {
        normal: 'Note',
        harmonic: 'Harmonic',
        arpeggio: 'Arpeggio',
        strumming: 'Strum',
        rest: 'Rest'
      }
    },
    tabNote: {
      chord: 'Chord diagram',
      chordNone: 'None',
      technique: 'Technique',
      slap: 'Slap',
      bend: 'Bend',
      addBend: 'Add bend',
      removeBend: 'Remove bend',
      bendType: 'Bend type',
      offset: 'Offset',
      resetPosition: 'Reset position',
      stage: 'Stage {n}',
      stageInterval: 'Stage {n} interval',
      bendTypes: {
        bend: 'Bend',
        bendRelease: 'Bend and release',
        prebend: 'Pre-bend',
        prebendRelease: 'Pre-bend and release',
        prebendBend: 'Pre-bend and bend'
      },
      slurType: 'Type',
      slurTypes: {
        H: 'Hammer-on H',
        S: 'Slide S',
        P: 'Pull-off P',
        HP: 'Hammer-on/pull-off HP'
      }
    },
    drum: {
      voice: 'Voice',
      voiceUp: 'Voice 1 (up)',
      voiceDown: 'Voice 2 (down)',
      head: 'Note head',
      headType: {
        normal: 'Normal',
        cross: 'Cross',
        circledCross: 'Circled cross',
        circledSlash: 'Circled slash',
        triangle: 'Triangle',
        diamond: 'Diamond'
      },
      region: 'Staff position (0 = bottom line · 8 = top line)',
      durationWhole: 'Duration (entire note)',
      center: 'Center'
    },
    contextMenu: {
      delete: 'Delete',
      copyNotes: 'Copy measure notes',
      pasteNotes: 'Paste measure notes',
      clearNotes: 'Clear notes',
      copyStaff: 'Copy single staff',
      pasteStaff: 'Paste single staff',
      copyGrandStaff: 'Copy grand staff',
      pasteGrandStaff: 'Paste grand staff',
      setToneColor: 'Set tone',
      setVolume: 'Set volume',
      longRest: 'Multi-measure rest',
      cancelLongRest: 'Remove multi-measure rest',
      copy: 'Copy',
      paste: 'Paste',
      measure: 'Measure',
      staff: 'Single staff',
      grandStaff: 'Grand staff',
      addMeasure: 'Add measure',
      left: 'Left',
      right: 'Right',
      deleteStaffRow: 'Delete this staff in every grand staff'
    },
    toneColorDialog: {
      title: 'Set tone',
      hint: 'Sets the tone of the staff this measure belongs to, together with the staff in the same row of this and every following grand staff; earlier grand staves are unchanged. Choosing “Score setting” in playback uses it; with “Show instrument” on, the name is shown left of the staff.',
      search: 'Search tones',
      empty: 'No matching tones',
      otherFamily: 'Other',
      clear: 'Clear tone',
      confirm: 'OK'
    },
    staffVolumeDialog: {
      title: 'Set volume',
      hint: 'Sets the playback volume (percent, default 100) of the staff this measure belongs to, together with the staff in the same row of every grand staff.',
      reset: 'Reset to 100',
      confirm: 'OK'
    },
    measure: {
      actions: 'Measure actions',
      insertBefore: 'Insert before',
      insertAfter: 'Insert after',
      barlineBack: 'Trailing barline',
      barlineFront: 'Leading barline',      clefFront: 'Leading clef',
      clefBack: 'Trailing clef',
      keySignatureFront: 'Leading key signature',
      keySignatureBack: 'Trailing key signature',
      timeSignatureFront: 'Leading time signature',
      timeSignatureBack: 'Trailing time signature',
      fieldClef: 'Clef',
      fieldKeySignature: 'Key',
      fieldTimeSignature: 'Time',
      startRepeat: 'Start repeat',
      endRepeat: 'End repeat',
      volta: 'Volta',
      removeVolta: 'Remove volta',
      barline: {
        single_barline: 'Single barline',
        double_barline: 'Double barline',
        startRepeat_barline: 'Repeat start',
        endRepeat_barline: 'Repeat end',
        dashed_barline: 'Dashed barline',
        final_barline: 'Final barline',
        dotted_barline: 'Dotted barline',
        reverse_barline: 'Reverse barline',
        heavy_barline: 'Heavy barline',
        heavy_double_barline: 'Heavy double barline',
        start_end_repeat_barline: 'Repeat start & end'
      },
      clef: {
        treble: 'Treble clef',
        bass: 'Bass clef',
        alto: 'Alto clef',
        tenor: 'Tenor clef',
        tab: 'TAB clef'
      },
      keySignature: {
        C: 'C major',
        G: 'G major',
        D: 'D major',
        A: 'A major',
        E: 'E major',
        B: 'B major',
        F_sharp: 'F♯ major',
        C_sharp: 'C♯ major',
        F: 'F major',
        B_flat: 'B♭ major',
        E_flat: 'E♭ major',
        A_flat: 'A♭ major',
        D_flat: 'D♭ major',
        G_flat: 'G♭ major',
        C_flat: 'C♭ major'
      },
      startRepeatOption: {
        segno: 'Segno',
        coda: 'Coda'
      },
      endRepeatOption: {
        fine: 'Fine',
        DC: 'D.C.',
        DS: 'D.S.',
        to_coda: 'To Coda',
        dc_al_fine: 'D.C. al Fine',
        dc_al_coda: 'D.C. al Coda',
        ds_al_fine: 'D.S. al Fine',
        ds_al_coda: 'D.S. al Coda'
      },
      timeSignature: {
        '2_4': '2/4',
        '3_4': '3/4',
        '4_4': '4/4',
        '5_4': '5/4',
        '6_4': '6/4',
        '3_8': '3/8',
        '4_8': '4/8',
        '5_8': '5/8',
        '6_8': '6/8',
        '7_8': '7/8',
        '9_8': '9/8',
        '12_8': '12/8',
        common: 'Common time (4/4)',
        cut: 'Cut time (2/2)',
        '2_2': '2/2',
        '3_2': '3/2',
        '4_2': '4/2'
      }
    },
    note: {
      duration: 'Duration',
      noteClef: 'Clef before note',
      beam: 'Beam',
      stemDirection: 'Stem direction',
      accidental: 'Accidental',
      augmentationDot: 'Dot',
      relativeX: 'Horizontal offset',
      slur: 'Slur',
      grace: 'Grace notes',
      graceBefore: 'Acciaccatura (before)',
      graceAfter: 'Grace after',
      graceBeforeItem: 'Grace before {n}',
      graceAfterItem: 'Grace after {n}',
      addGraceBefore: 'Add grace before',
      addGraceAfter: 'Add grace after',
      slotSymbols: 'Column symbols',
      arpeggio: 'Arpeggio',
      strumming: 'Strum',
      preludeBracketLeft: 'Prelude bracket (left)',
      preludeBracketRight: 'Prelude bracket (right)',
      addArpeggio: 'Add arpeggio',
      addStrumming: 'Add strum',
      addPreludeBracketLeft: 'Add prelude bracket (',
      addPreludeBracketRight: 'Add prelude bracket )',
      pedal: 'Pedal',
      pitch: 'Ottava',
      addPedal: 'Add pedal',
      addPitchUp: 'Add ottava alta',
      addPitchDown: 'Add ottava bassa',
      syllable: 'Syllable',
      octaveDotLabel: 'Octave dots',
      addVoiceNote: 'Add voice note',
      addVoiceNoteAction: 'Add at same slot',
      sameSlotNoteIndex: 'No. {n} from bottom',
      beamConnection: 'Beam connection',
      rhythmGroupEnd: 'Group end',
      durationShort: {
        '256': '1',
        '128': '1/2',
        '64': '1/4',
        '32': '1/8',
        '16': '1/16',
        '8': '1/32',
        '4': '1/64',
        '2': '1/128'
      },
      augmentationDotShort: {
        '0': 'None',
        '1': '·',
        '2': '··',
        '3': '···'
      },
      durationValue: {
        '256': 'Whole note',
        '128': 'Half note',
        '64': 'Quarter note',
        '32': 'Eighth note',
        '16': 'Sixteenth note',
        '8': 'Thirty-second note',
        '4': 'Sixty-fourth note',
        '2': 'One-hundred-twenty-eighth note'
      },
      restDurationValue: {
        '256': 'Whole rest',
        '128': 'Half rest',
        '64': 'Quarter rest',
        '32': 'Eighth rest',
        '16': 'Sixteenth rest',
        '8': 'Thirty-second rest',
        '4': 'Sixty-fourth rest',
        '2': 'One-hundred-twenty-eighth rest'
      },
      beamType: {
        Combined: 'Combined',
        OnlyRight: 'Right only',
        None: 'None'
      },
      stem: {
        up: 'Up',
        down: 'Down'
      },
      accidentalType: {
        Sharp: 'Sharp ♯',
        Flat: 'Flat ♭',
        double_sharp: 'Double sharp 𝄪',
        double_flat: 'Double flat 𝄫',
        natural: 'Natural ♮'
      },
      augmentationDotCount: {
        '0': 'None',
        '1': 'Single dot',
        '2': 'Double dot',
        '3': 'Triple dot'
      },
      syllableOption: {
        '1': '1 (do)',
        '2': '2 (re)',
        '3': '3 (mi)',
        '4': '4 (fa)',
        '5': '5 (sol)',
        '6': '6 (la)',
        '7': '7 (si)',
        X: 'Rhythm X'
      },
      octaveDotOption: {
        '-3': 'Three octaves lower',
        '-2': 'Two octaves lower',
        '-1': 'One octave lower',
        '0': 'None',
        '1': 'One octave higher',
        '2': 'Two octaves higher',
        '3': 'Three octaves higher'
      }
    },
    slur: {
      thickness: 'Line width',
      style: 'Shape',
      styleValue: {
        default: 'Default',
        rounded: 'Rounded',
        sharp: 'Sharp'
      },
      notes: 'Start / end notes',
      startNote: 'Start note',
      endNote: 'End note',
      tailAnchor: 'Tail anchor',
      moveEarlier: 'Move tail earlier',
      moveLater: 'Move tail later'
    },
    volta: {
      text: 'Text',
      textPlaceholder: 'e.g. 1.',
      value: 'Repeat values',
      span: 'Coverage',
      expandLeft: 'Expand left',
      expandRight: 'Expand right',
      shrinkLeft: 'Shrink left',
      shrinkRight: 'Shrink right',
      resetAlignment: 'Reset alignment',
      closure: 'Ends',
      closeLeft: 'Close left',
      closeRight: 'Close right',
      valueEditor: {
        keepOne: 'Keep at least one',
        add: 'Add',
        hint: 'Which playback pass uses this volta (starting at 1)'
      }
    },
    bracket: {
      type: 'Bracket type',
      applyToAll: 'Apply to all grand staves',
      appliedToAll: 'Bracket applied to all grand staves',
      typeOption: {
        Bracket: 'Bracket',
        Brace: 'Brace',
        Square: 'Square'
      }
    },
    pitch: {
      type: 'Octave'
    },
    arpeggio: {
      style: 'Style',
      type: 'Shape',
      typeNormal: 'Wavy',
      typeStraight: 'Straight',
      arrow: 'Arrow',
      resetPosition: 'Reset position',
      dragHint: 'Drag the top or bottom handle to change the length; drag the middle to move it sideways'
    },
    customSymbol: {
      title: 'Custom symbols',
      add: 'New custom symbol',
      manage: 'Manage',
      edit: 'Edit',
      export: 'Export config',
      exportTitle: 'Export custom symbol config',
      exported: 'Config exported',
      import: 'Import config',
      importTitle: 'Import custom symbol config',
      imported: 'Imported {count} symbols',
      importInvalid: 'The config file is invalid or has no usable symbols',
      empty: 'No custom symbols yet. Click + to upload an SVG.',
      hint: 'Click a symbol to add it to the selection; click again to remove it',
      createTitle: 'New custom symbol',
      editTitle: 'Edit custom symbol',
      managerTitle: 'Custom symbols',
      managerHint:
        'Editing or deleting a library symbol does not change other scores that already use it. Edits are applied to the same symbol in the current score. Use Export / Import config to back up the symbol library.',
      emptyList: 'No custom symbols',
      kind: {
        note: 'Note symbols',
        measure: 'Measure symbols',
        slot: 'Slot symbols'
      },
      svg: 'SVG',
      upload: 'Upload SVG',
      reupload: 'Replace SVG',
      svgInvalid: 'The SVG could not be read or has no size',
      svgRequired: 'Upload an SVG first',
      name: 'Name',
      namePlaceholder: 'Symbol name',
      nameRequired: 'Enter a name',
      size: 'Size',
      keepRatio: 'Keep ratio',
      sizeHint: 'Width × height in pixels; a standard measure is 45 high',
      sizeInvalid: 'Width and height must be greater than 0',
      position: 'Position',
      positionOptions: {
        upper: 'Above measure',
        lower: 'Below measure'
      },
      placement: 'Anchor',
      placementOptions: {
        start: 'Measure start',
        center: 'Measure center',
        end: 'Measure end'
      },
      align: 'Align',
      alignOptions: {
        left: 'Left edge',
        center: 'Center',
        right: 'Right edge'
      },
      vertical: 'Vertical offset (1 = measure height)',
      horizontal: 'Horizontal offset (1 = measure height)',
      offsetHint: {
        note: 'Offset 1 = one measure height (~45 px) from the note head center; negative is above, positive below',
        measure: 'Offset 1 = one measure height (~45 px); vertical is the distance away from the measure, positive horizontal moves right',
        slot: 'Offset 1 = one measure height (~45 px) from the column start and measure bottom'
      },
      anchor: 'Numbered anchor',
      anchorAuto: 'Auto (from vertical offset)',
      anchorOptions: {
        top: 'Top of number',
        bottom: 'Bottom of number',
        left: 'Left of number',
        right: 'Right of number'
      },
      anchorHint: 'Numbered notation only: positions against the number including octave dots and underlines',
      previewHint: 'Approximate preview; the score shows the actual position',
      dragHint: 'Drag the move button beside the dashed box to fine-tune the position; press Delete to remove it',
      missing: 'This symbol is not defined in the score',
      created: 'Added to the symbol library',
      saved: 'Saved',
      deleted: 'Deleted',
      deleteConfirm: 'Delete "{name}"? Scores that already use it are not affected.'
    },
    preludeBracket: {
      hint: 'Prelude brackets sit on the left or right of the note column. Delete them from this panel.'
    },
    noteMark: {
      category: {
        articulation: 'Articulations',
        technique: 'Techniques / bowing',
        ornament: 'Ornaments',
        dynamic: 'Dynamics',
        guzheng: 'Guzheng fingering',
        guzhengTechnique: 'Guzheng techniques'
      },
      exclusive: 'Pick one',
      dragHint:
        'Click to toggle a mark. Select a mark on the score and drag the move button beside it to fine-tune its position',
      current: 'Current mark',
      replaceWith: 'Replace with',
      offset: 'Offset',
      resetOffset: 'Reset position',
      name: {
        acccent_above: 'Accent',
        staccato_above: 'Staccato',
        staccatissimo_above: 'Staccatissimo',
        tenuto_above: 'Tenuto',
        loure_above: 'Louré',
        marcato_above: 'Marcato',
        accent_staccato_above: 'Accent + staccato',
        marcato_staccato_above: 'Marcato + staccato',
        marcato_tenuto_above: 'Marcato + tenuto',
        staccatissimo_stroke_above: 'Staccatissimo (stroke)',
        staccatissimo_wedge_above: 'Staccatissimo (wedge)',
        stress_above: 'Stress',
        tenuto_accent_above: 'Tenuto + accent',
        unstress_above: 'Unstress',
        open: 'Open',
        muted: 'Muted',
        harmonic: 'Harmonic',
        up_bow: 'Up bow',
        down_bow: 'Down bow',
        breath: 'Breath mark',
        turn: 'Turn',
        invertedTurn: 'Inverted turn',
        trill: 'Trill',
        shortTrill: 'Short trill',
        mordent: 'Mordent',
        ppp: 'ppp (pianississimo)',
        pp: 'pp (pianissimo)',
        p: 'p (piano)',
        mp: 'mp (mezzo-piano)',
        mf: 'mf (mezzo-forte)',
        f: 'f (forte)',
        ff: 'ff (fortissimo)',
        fff: 'fff (fortississimo)',
        fp: 'fp (forte-piano)',
        pf: 'pf (piano-forte)',
        sf: 'sf (sforzando)',
        sfz: 'sfz (sforzato)',
        sff: 'sff',
        sffz: 'sffz',
        sfp: 'sfp (sforzando-piano)',
        rfz: 'rfz (rinforzando)',
        rf: 'rf (rinforzando)',
        fz: 'fz (forzando)',
        guzheng_mo: 'Mo (index finger)',
        guzheng_tiao: 'Tiao (index finger)',
        guzheng_gou: 'Gou (middle finger)',
        guzheng_ti1: 'Ti (middle finger)',
        guzheng_pi: 'Pi (thumb)',
        guzheng_tuo: 'Tuo (thumb)',
        guzheng_da: 'Da (ring finger)',
        guzheng_zhai: 'Zhai (ring finger)',
        guzheng_ti2: 'Ti (lift)',
        guzheng_bo: 'Bo (flick)',
        guzheng_xiao_cuo: 'Small Cuo (pinch)',
        guzheng_da_cuo: 'Big Cuo (pinch)',
        guzheng_sao: 'Sao (sweep)',
        guzheng_yao: 'Yao (tremolo)'
      }
    },
    spanSymbol: {
      slurEnd: 'Slur end',
      coverage: 'Coverage',
      expandLeft: 'Expand left',
      expandRight: 'Expand right',
      shrinkLeft: 'Shrink left',
      shrinkRight: 'Shrink right',
      resetAlignment: 'Reset alignment',
      add: 'Add spanning marks',
      span: 'Span',
      spanValue: '{n}',
      spanHint:
        'Span is the number of notes covered to the right, starting from this note. Slurs need at least 2',
      slotSymbolHint: 'An arpeggio applies only to this note column, at most one per column',
      notEnoughNotes:
        'Not enough notes after this one for the current span (only this and the next measure are searched). Reduce the span or add more notes first',
      existing: 'Starting here',
      empty: 'None',
      pitchUp: 'Ottava 8va',
      pitchDown: 'Ottava 8vb',
      trill: 'Trill line',
      crescendo: 'Crescendo',
      diminuendo: 'Diminuendo',
      guzhengLian: 'Guzheng continuous fingering'
    },
    line: {
      trillType: 'Start symbol',
      trillTypeOption: {
        trill: 'tr',
        upprall: 'Upprall',
        downprall: 'Downprall',
        prallprall: 'Prallprall'
      },
      hairpinStyle: 'Style',
      hairpinType: {
        crescendo_hairpin: 'Crescendo (hairpin)',
        diminuendo_hairpin: 'Diminuendo (hairpin)',
        crescendo_line: 'Crescendo (cresc.)',
        diminuendo_line: 'Diminuendo (dim.)'
      },
      height: 'Opening',
      guzhengLianType: 'Fingering',
      guzhengLianTypeOption: {
        tuo: 'Lian Tuo',
        pi: 'Lian Pi',
        mo: 'Lian Mo',
        tiao: 'Lian Tiao',
        gou: 'Lian Gou',
        ti: 'Lian Ti',
        da: 'Lian Da',
        zhai: 'Lian Zhai'
      },
      dragHint: 'Drag either end to change the range; drag the middle to move it up or down'
    },
    staff: {
      grandStaff: 'Grand staff'
    },
    titleFields: {
      title: 'Title',
      subTitle: 'Subtitle',
      author: 'Author'
    },
    timeOffset: {
      title: 'Score-audio sync',
      timeProp: 'Time property',
      vocalPerformance: 'Vocal',
      accompaniment: 'Accompaniment',
      pxPerSecond: 'px/s',
      sampleRate: 'Sample rate',
      selectAudio: 'Audio',
      bindVocal: 'Bind vocal',
      bindAccompaniment: 'Bind accompaniment',
      audioPlaceholder: 'Select from My Audio'
    },
    pianoRecord: {
      title: 'Piano input',
      needMidi: 'Piano input needs a MIDI keyboard. Please connect one and try again.',
      midiUnsupported: 'MIDI is not supported in this environment',
      device: 'MIDI device',
      noDevice: 'Not connected',
      bpm: 'Tempo',
      timeSignature: 'Time',
      start: 'Start recording',
      stop: 'Stop recording',
      restart: 'Record again',
      syncToScore: 'Apply to score',
      metronomeDuringRecord: 'Metronome while recording',
      metronomeVolume: 'Metronome volume',
      tolerance: 'Recording settings',
      beatSnap: 'Beat snap (beats)',
      beatSnapHint:
        'Notes starting within this distance of a beat land exactly on the beat. At the current tempo, playing up to {ms} ms late still counts as on the beat; at 0.25 or below, real off-beat 16ths are not pulled in. Set 0 to turn off.',
      minRest: 'Shortest rest',
      minRestOptions: {
        0: 'Never merge (every gap becomes a rest)',
        16: '16th note',
        32: '8th note (default)',
        64: 'Quarter note'
      },
      minRestHint:
        'A gap between two notes of the same hand shorter than this is merged into the previous note instead of writing a rest. To write a short rest on purpose, pause at least this long.',
      latencyMs: 'Latency compensation (ms)',
      latencyMsHint:
        'Subtracted from every key time; use it when you are consistently late (e.g. metronome output latency). Keep it small, or early key releases leave bigger gaps and produce extra rests.',
      toleranceReset: 'Reset to defaults',
      idleHint: 'Click "Start recording" to hear one count-in bar; timing starts right after it, so play your MIDI keyboard along with the beat. Hands are split automatically: right hand goes to the treble staff, left hand to the bass staff.',
      countInHint: 'Count-in… start playing after this bar.',
      recordingHint: 'Recording… notes are quantized to 16ths at this tempo. Click "Stop recording" when you are done.',
      doneHint: 'Recording finished with {count} note groups. Click "Apply to score" to replace the current score with the recording.',
      emptyHint: 'No notes were recorded. Please record again.',
      syncConfirmTitle: 'Apply to score',
      syncConfirmMessage: 'This replaces everything in the current score with the piano recording (treble + bass staff). Continue?',
      synced: 'Applied to score',
      syncFailed: 'Failed to apply'
    },
    quickInput: {
      title: 'Number notation quick input',
      scoreToText: 'Score to text',
      updatePreview: 'Update preview',
      syncToScore: 'Apply preview to score',
      rules: 'Rules',
      textTitle: 'Text',
      previewTitle: 'Preview',
      warningsTitle: 'Hints ({count})',
      textPlaceholder: 'Type number notation here, then press Ctrl+S or click "Update preview". See "Rules" for the syntax.',
      textFromScore: 'Current score converted to text',
      scoreToTextFailed: 'Failed to convert the score to text',
      syncConfirmTitle: 'Apply preview to score',
      syncConfirmMessage:
        'The text rules cannot express every symbol (accidentals, lyrics, etc.), so that information in the current score may be lost. Replace the current score with the preview?',
      synced: 'Preview applied to the score',
      syncFailed: 'Failed to apply the preview',
      rulesTitle: 'Quick input rules',
      ruleSections: [
        {
          title: 'Structure',
          items: [
            { syntax: 'Line', desc: 'Each line of text is one staff' },
            { syntax: 'Blank line', desc: 'Consecutive non-empty lines form a grand staff; a blank line starts a new one' },
            { syntax: 'Space', desc: 'Separate notes with spaces' }
          ]
        },
        {
          title: 'Notes',
          items: [
            { syntax: '1 ~ 7', desc: 'Scale degrees do ~ si' },
            { syntax: '0', desc: 'Rest' },
            { syntax: 'X', desc: 'Rhythm note (no pitch)' },
            { syntax: '.5', desc: 'Dots before the digit: octave up, one per dot' },
            { syntax: '5.', desc: 'Dots after the digit: octave down, one per dot' }
          ]
        },
        {
          title: 'Duration',
          items: [
            { syntax: '5/', desc: 'Each / is an underline that halves the duration: 5/ eighth, 5// sixteenth' },
            { syntax: '5-', desc: 'Dashes: 5- half note, 5-- dotted half, 5--- whole note' },
            { syntax: '5,', desc: 'Augmentation dot; you can write several' },
            { syntax: '- and /', desc: 'Cannot be combined; a hint appears when a measure does not match the time signature' }
          ]
        },
        {
          title: 'Combinations',
          items: [
            { syntax: '5(1)', desc: '() right after a note stacks a chord tone on the same slot; several are allowed' },
            { syntax: '[3]5  5[3]', desc: '[] before a note is a grace note before it, after a note a grace note after it; / and octave dots work inside' },
            { syntax: '<5  >3', desc: '< starts a slur and > ends it; both go before the note' }
          ]
        },
        {
          title: 'Barlines',
          items: [
            { syntax: '|', desc: 'Barline, written at the end of a measure; every space-separated | closes one measure' },
            { syntax: '| |', desc: 'A | with no notes before it is an empty measure, so this is 2 empty measures; 1 | | | | is 4 measures' },
            { syntax: 'Leading |', desc: 'Front barlines are not supported: a | at the start of a line also creates an empty measure, so start each line with a note' },
            { syntax: '|1|2', desc: 'Barlines written together without a space count as one; the last one wins' },
            {
              syntax: '|N',
              desc: 'Barline type: |1 start repeat, |2 end repeat, |3 final, |4 start-end repeat, |5 double, |6 dashed, |7 dotted, |8 reverse final, |9 heavy, |10 heavy double'
            }
          ]
        },
        {
          title: 'Other',
          items: [
            { syntax: 'Metadata', desc: 'Title, key, time signature, and tempo come from the current score' },
            { syntax: 'Unsupported', desc: 'Accidentals, front barlines, lyrics, and other symbols cannot be written as text; they are skipped and listed in the hints' }
          ]
        }
      ],
      ruleExampleTitle: 'Example',
      ruleExample: [
        '5. 4. <7. >6. .5(.6) | .7 .5 .5/ 5- |4',
        '',
        '[1/2/]3 3/ 2/ <1, >2/ | 3(5) 0 .1- |2',
        '1 1 5. 5. | 6.(1) 6. 5.- |2'
      ]
    },
    scoreImageDialog: {
      title: 'Image to Score',
      noticeTitle: 'Number notation only',
      noticeItems: [
        'Only number notation (jianpu) can be recognized. Staff, guitar tab and drum notation are not supported',
        'For multi-page scores, order the images by page. Rows from each page are joined in list order into one score',
        'Use clear, upright images with digits that are not too small. Titles and lyrics are not recognized',
        'The generated score replaces the current one. Press Ctrl+Z to undo'
      ],
      dropHint: 'Click or drop number notation images here (multiple allowed)',
      formats: 'PNG / JPG / WebP / BMP',
      count: '{n} image(s), joined in order',
      add: 'Add',
      sortByName: 'Sort by name',
      clear: 'Clear',
      moveUp: 'Move up',
      moveDown: 'Move down',
      remove: 'Remove',
      statusPending: 'Waiting',
      statusRunning: 'Recognizing…',
      itemSummary: '{rows} rows · {measures} measures · {key} · {time}',
      keyInherited: '{key} (from previous page)',
      keyAssumed: '{key} (key not detected)',
      warnings: '{n} notice(s)',
      errorBadImage: 'Cannot read the image',
      errorNoNotation: 'No number notation found',
      errorInternal: 'Recognition error',
      unsupportedSkipped: 'Skipped {n} unsupported file(s)',
      progressRecognizing: 'Recognizing {current} / {total}: {name}',
      progressMerging: 'Joining pages…',
      failedHint: '{n} image(s) failed. Replace or remove them and retry',
      skipFailed: 'Skip failed and generate from the other {n}',
      generate: 'Generate',
      retry: 'Retry failed images',
      stop: 'Stop',
      generateFailed: 'Failed to generate the score'
    },
    messages: {
      notationTypeSwitched: 'Score type switched',
      notationTypeSwitchFailed: 'Failed to switch score type',
      transposed: 'Transposed',
      transposeFailed: 'Failed to transpose',
      transposeSameKey: 'Target key is the same as current key',
      semitoneRaised: 'Raised by a semitone',
      semitoneLowered: 'Lowered by a semitone',
      semitoneShiftFailed: 'Failed to shift pitch',
      importSuccess: 'Imported {fileName}',
      importFailed: 'Import failed',
      importMusicXmlFailed: 'MusicXML import failed',
      importMidiFailed: 'MIDI import failed',
      importMidiWarnings: 'Some MIDI content was not kept: {detail}',
      scoreImageGenerated: 'Score generated from {pages} image(s)',
      scoreImageGeneratedWithWarnings:
        'Score generated from {pages} image(s) with {n} recognition notice(s) (e.g. measure length not matching the time signature). Please check the score',
      exportSuccess: 'Export successful',
      exportFailed: 'Export failed',
      exportMusicXmlFailed: 'MusicXML export failed',
      exportMidiFailed: 'MIDI export failed',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed',
      scoreLoadFailed: 'Failed to load score'
    }
  }
} as const
