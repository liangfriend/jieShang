export default {
  chordRecognitionQuiz: {
    title: 'コード聴き取り',
    qualities: {
      major: 'メジャー',
      minor: 'マイナー',
      dom7: 'セブンス',
      maj7: 'メジャーセブンス',
      min7: 'マイナーセブンス'
    },
    setup: {
      heading: 'テスト設定',
      qualities: 'コードの種類（複数選択可）',
      soundRange: '音域',
      soundRangeOptions: {
        standard: '標準（中央 C 付近）',
        full: '全音域（21–108）'
      },
      showPiano: '鍵盤を表示',
      rounds: '出題数',
      countdown: '制限時間（秒）',
      start: 'テスト開始'
    },
    question: {
      replayHint: 'クリックで再生',
      replayAria: '現在のコードを再生',
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
      qualityAccuracy: '{quality} の正答率 {percent}',
      playAgain: 'もう一度',
      reset: '設定し直す'
    }
  }
} as const
