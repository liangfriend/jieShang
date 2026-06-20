export default {
  editor: {
    toolbar: {
      playMode: 'Play mode',
      linkedStaffMode: 'Linked staves',
      notice: 'Notice',
      importMusicXml: 'Import MusicXML',
      exportMusicXml: 'Export MusicXML',
      importSj: 'Import SJ',
      exportSj: 'Export SJ',
      save: 'Save',
      notationType: 'Score type'
    },
    noticeDialog: {
      title: 'Editing notice',
      selectionTitle: 'Selection & deletion',
      selectionItems: [
        'Click an element on the score to select it; press Esc to deselect.',
        'Press Delete or Backspace to remove the selected item.',
        'Some symbols on notes cannot be selected on the score — remove them in the note property panel.',
        'Voltas and slurs can be selected and deleted, but you must click precisely on the symbol.',
        'The last measure, single staff, or grand staff cannot be deleted (the delete button is disabled).'
      ],
      importTitle: 'Import MusicXML as score',
      importLead:
        'MusicXML files are rich; not everything can be parsed yet. Currently supported symbols:',
      importItems: [
        'Measure clefs, key signatures, time signatures',
        'Notes, rests, accidentals',
        'Barlines, voltas, slurs'
      ],
      exportTitle: 'Export score as MusicXML',
      exportItems: [
        'Measure clefs, key signatures, time signatures',
        'Notes, rests, accidentals',
        'Barlines, voltas, slurs'
      ]
    },
    convertDialog: {
      title: 'Switch score type',
      message:
        'Playback data will be preserved as much as possible, but layout and some notation details may be lost. This cannot be undone.'
    },
    propertyPanel: {
      title: 'Properties',
      measure: 'Measure properties',
      noteHead: 'Note properties',
      rest: 'Rest properties',
      slur: 'Slur properties',
      volta: 'Volta properties',
      placeholder:
        'Select a measure, note, rest, slur, or volta on the score to edit its properties here'
    },
    addNote: {
      add: 'Add',
      note: 'Note',
      rest: 'Rest',
      duration: 'Duration'
    },
    measure: {
      actions: 'Measure actions',
      insertBefore: 'Insert before',
      insertAfter: 'Insert after',
      barlineBack: 'Trailing barline',
      barlineFront: 'Leading barline',
      clefFront: 'Leading clef',
      clefBack: 'Trailing clef',
      keySignatureFront: 'Leading key signature',
      keySignatureBack: 'Trailing key signature',
      timeSignatureFront: 'Leading time signature',
      timeSignatureBack: 'Trailing time signature',
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
        tenor: 'Tenor clef'
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
      syllable: 'Syllable',
      octaveDotLabel: 'Octave dots',
      beamConnection: 'Beam connection',
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
        '-2': 'Two octaves lower',
        '-1': 'One octave lower',
        '0': 'None',
        '1': 'One octave higher',
        '2': 'Two octaves higher'
      }
    },
    slur: {
      thickness: 'Line width',
      tailAnchor: 'Tail anchor',
      moveEarlier: 'Move tail earlier',
      moveLater: 'Move tail later'
    },
    volta: {
      text: 'Text',
      textPlaceholder: 'e.g. 1.',
      value: 'Repeat values',
      valueEditor: {
        keepOne: 'Keep at least one',
        add: 'Add',
        hint: 'Which playback pass uses this volta (starting at 1)'
      }
    },
    staff: {
      grandStaff: 'Grand staff'
    },
    titleFields: {
      title: 'Title',
      subTitle: 'Subtitle',
      author: 'Author'
    },
    messages: {
      notationTypeSwitched: 'Score type switched',
      notationTypeSwitchFailed: 'Failed to switch score type',
      importSuccess: 'Imported {fileName}',
      importFailed: 'Import failed',
      importMusicXmlFailed: 'MusicXML import failed',
      exportSuccess: 'Export successful',
      exportFailed: 'Export failed',
      exportMusicXmlFailed: 'MusicXML export failed',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed',
      scoreLoadFailed: 'Failed to load score'
    }
  }
} as const
