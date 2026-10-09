export default {
  play: {
    toolbar: {
      editMode: 'Edit mode',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop',
      volume: 'Volume',
      bpm: 'BPM',
      practiceMode: 'Practice mode',
      beginnerMode: 'Beginner mode',
      singingMode: 'Singing mode',
      notationType: 'Score type',
      sourceScore: 'Score',
      sourceVocal: 'Vocal',
      sourceAccompaniment: 'Accompaniment'
    },
    range: {
      title: 'Range',
      tooltip: 'Click notes to pick a start and end, then play only that range',
      pickStart: 'Click a note to set the start',
      pickEnd: 'Click another note to set the end',
      ready: 'Ready: press Play to play the range; click a note to reset the start',
      clear: 'Clear range',
      end: 'Exit range',
      incomplete: 'Pick the start and end notes first'
    },
    messages: {
      notationTypeSwitchFailed: 'Failed to switch score type',
      noPlayableContent: 'This score has no playable content',
      rangeNoPlayableContent: 'No playable notes in the selected range',
      grandStaffMismatch:
        'All grand staves must have the same number of single staves to enter practice or beginner mode',
      tabModeUnavailable: 'Guitar and ukulele tabs do not support practice, beginner, or singing mode yet',
      playOnlyModeUnavailable:
        'Guitar, ukulele, bass, and drum scores do not support practice, beginner, or singing mode yet',
      boundAudioMissing: 'Bound audio not found',
      audioLoadFailed: 'Failed to load audio',
      vocalTimeOffsetMissing:
        'No vocal sync times on this score. In Edit mode, open Score–audio sync, switch the property to Vocal, then align.',
      accompanimentTimeOffsetMissing:
        'No accompaniment sync times on this score. In Edit mode, open Score–audio sync, switch the property to Accompaniment, then align.'
    },
    mark: {
      label: 'Marks',
      none: 'None',
      xiaoGroup: '8-hole xiao',
      fluteGroup: '6-hole dizi',
      xiaoKey: 'Xiao in {key}',
      fluteKey: 'Dizi in {key}',
      fluteLowG: 'low G',
      fluteHighG: 'high G'
    },
    toneColor: {
      label: 'Tone',
      loadFailed: 'Failed to load tone',
      switchFailed: 'Failed to switch tone',
      notFound: 'Tone not found',
      unavailable: 'Tone unavailable',
      defaultLoadFailed: 'Failed to load default tone',
      scoreSetting: 'Score setting',
      loading: 'Loading tones…'
    },
    devToneCache: {
      title: 'Cached tones ({count})',
      collapse: 'Collapse',
      expand: 'Expand',
      clear: 'Clear all tones',
      empty: 'No cached tones'
    }
  }
} as const
