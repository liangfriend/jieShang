export default {
  clSheet: {
    untitled: 'Untitled chord sheet',
    titlePlaceholder: 'Song title',
    authorPlaceholder: 'Author / artist',
    descriptionPlaceholder: 'Description, e.g. 1=C 4/4',
    unsaved: 'Unsaved',
    emptyEdit: 'No lyrics yet: click "＋ 添加一行" below to start, or paste chord text on the right',
    emptyShow: 'No lyrics yet — switch to Edit to start writing',
    mode: {
      show: 'View',
      edit: 'Edit'
    },
    font: {
      default: 'Default',
      song: 'SimSun',
      kai: 'KaiTi',
      hei: 'YaHei'
    },
    style: {
      title: 'Style',
      reset: 'Reset',
      width: 'Page width',
      fontSize: 'Lyric size',
      lineGap: 'Line gap',
      font: 'Font',
      color: 'Lyric color',
      chordColor: 'Chord color',
      addLyricColor: 'New lyrics',
      addChordColor: 'New chords',
      addColorHint: '"New lyrics / New chords" only color text and chords you add from now on; existing content is unchanged. Clear them to follow the default colors above.'
    },
    chordLyrics: {
      title: 'Lyrics with chords',
      desc: 'Changes every character that has a chord ({count} in total); characters without chords stay as they are. The color picker is empty when their colors differ; clearing the color restores the default lyric color.',
      empty: 'No characters with chords yet',
      underline: 'Underline',
      color: 'Color'
    },
    embedded: {
      title: 'Top score',
      desc: 'Pick one of your scores to add at the top of the sheet, e.g. a strumming pattern. A copy is saved into the sheet, so later edits to or deletion of the original score do not affect it. While editing, drag the bottom edge of the area to resize it.',
      placeholder: 'Choose a score to add',
      replace: 'Choose a score to replace it',
      remove: 'Remove',
      height: 'Area height',
      scale: 'Score zoom',
      onlyChordName: 'Chord names only',
      loadFailed: 'Failed to read the score',
      resizeHint: 'Drag to resize'
    },
    text: {
      title: 'Chord text',
      desc: "Put chords in square brackets before the syllable they belong to, e.g. [C]Twinkle, twinkle, [F]little [C]star. {'{'}#e6553a{'}'} before a word sets the lyric color, before a [chord] sets the chord color; {'{'}u{'}'} underlines.",
      placeholder: '[C]Twinkle, twinkle, [F]little [C]star,\n[F]How I [C]wonder [G7]what you [C]are.',
      import: 'Import to sheet',
      importConfirm: 'Importing replaces all current lyrics and chords. Continue?',
      copy: 'Copy text',
      copied: 'Copied',
      copyFailed: 'Copy failed'
    },
    tips: {
      title: 'How to edit',
      select: 'Click a word to set its chord, color and underline; arrow keys move, Delete removes the chord, Esc cancels',
      editLine: 'Double-click or Enter edits the whole line; Enter splits, Backspace at line start merges; type a space to put a chord at line end',
      dragChord: 'Drag a chord to move it, hold Ctrl to copy',
      save: 'Ctrl + S to save'
    },
    file: {
      import: 'Import',
      export: 'Export',
      importConfirm:
        'Importing replaces the current chord sheet with the file contents (nothing is stored until you save). Continue?',
      importSuccess: 'Imported {fileName}. Remember to save',
      importFailed: 'Import failed',
      exportSuccess: 'Exported',
      exportFailed: 'Export failed',
      invalid: 'Not a valid chord sheet file'
    },
    messages: {
      saveSuccess: 'Saved',
      saveFailed: 'Save failed',
      loadFailed: 'Failed to load chord sheet',
      discardConfirm: 'This chord sheet has unsaved changes. Leave anyway?'
    }
  }
} as const
