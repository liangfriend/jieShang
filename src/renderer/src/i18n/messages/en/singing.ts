export default {
  singing: {
    toolbar: {
      start: 'Start',
      stop: 'Stop'
    },
    meta: {
      bpm: 'BPM',
      notes: 'Notes',
      detecting: 'Detecting',
      countdown: 'Get ready',
      currentOffset: 'Offset'
    },
    offset: {
      initial: 'Initial pitch offset',
      semitone: 'semitones',
      hint: 'Saved value is used as the starting offset next time'
    },
    waterfall: {
      reference: 'Reference',
      sung: 'Sung',
      livePitch: 'Live pitch'
    },
    result: {
      title: 'Singing result',
      subtitle: 'Based on pitch, rhythm and completeness',
      pitch: 'Pitch',
      rhythm: 'Rhythm',
      completeness: 'Completeness',
      ok: 'Got it',
      gradeS: 'Excellent!',
      gradeA: 'Great',
      gradeB: 'Nice',
      gradeC: 'Keep going',
      gradeD: 'Try again'
    },
    messages: {
      noSequence: 'No evaluable note sequence',
      notationTypeSwitchFailed: 'Failed to switch score type',
      audioMissing: 'No playable vocal or accompaniment audio found',
      offsetSaved: 'Pitch offset saved'
    }
  }
} as const
