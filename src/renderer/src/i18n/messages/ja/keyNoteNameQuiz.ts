export default {
  keyNoteNameQuiz: {
    title: '鍵盤の音名',
    setup: {
      heading: 'テスト設定',
      scale: '音名の範囲',
      scaleOptions: {
        pentatonic: '五音（宮・商・角・徴・羽）',
        diatonic: '七音',
        chromatic: '十二音'
      },
      labelMode: '選択肢の表示',
      labelModeOptions: {
        noteName: '音名',
        solfege: '階名',
        number: '数字',
        mixed: 'ミックス'
      },
      rounds: '出題数',
      countdown: '制限時間（秒）',
      start: 'テスト開始'
    },
    question: {
      hint: 'ハイライトされた鍵盤の音名を選んでください',
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
