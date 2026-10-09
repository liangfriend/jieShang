export default {
  absolutePitchTest: {
    title: '音感テスト',
    setup: {
      heading: 'テスト設定',
      scale: '音名の範囲',
      scaleOptions: {
        pentatonic: '五音（宮・商・角・徴・羽）',
        diatonic: '七音',
        chromatic: '十二音'
      },
      soundRange: '音域',
      soundRangeOptions: {
        standard: '標準（中央 C のオクターブ）',
        full: '全音域（21–108）'
      },
      labelMode: '鍵盤の表示',
      labelModeOptions: {
        noteName: '音名',
        solfege: '階名',
        number: '数字'
      },
      rounds: '出題数',
      countdown: '制限時間（秒）',
      start: 'テスト開始'
    },
    question: {
      replayHint: 'クリックで再生',
      replayAria: '現在の音を再生',
      abort: '中止'
    },
    result: {
      correct: '正解',
      wrong: '不正解',
      timeout: '時間切れ'
    },
    final: {
      heading: 'テスト完了',
      accuracy: '正答率 {percent}',
      counts: '正解 {correct} · 不正解 {wrong} · 時間切れ {timeout} / 全 {total} 問',
      avgResponse: '平均回答時間 {ms} ms',
      bestStreak: '最大連続正解 {count} 問',
      playAgain: 'もう一度',
      reset: '設定し直す'
    }
  }
} as const
