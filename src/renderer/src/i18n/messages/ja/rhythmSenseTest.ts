export default {
  rhythmSenseTest: {
    title: 'リズム感テスト',
    setup: {
      heading: 'テスト設定',
      beats: '拍数',
      beatsOption: '{count} 拍',
      beatUnit: '拍の単位',
      beatUnitOption: {
        1: '全音符',
        2: '二分音符',
        4: '四分音符',
        8: '八分音符'
      },
      bpmRange: 'BPM 範囲：{min} - {max}',
      bpmHint: 'ラウンドごとに範囲内でテンポをランダムに選びます（BPM は四分音符基準）',
      rounds: 'ラウンド数',
      start: 'テスト開始'
    },
    listen: {
      kicker: 'よく聴いて',
      hint: '{count} 拍再生します。テンポを覚えてください'
    },
    tap: {
      kicker: 'タップ開始',
      hint: 'リングをクリックするか、スペースキーでタップ',
      aria: 'タップ用リング'
    },
    roundResult: {
      kicker: 'このラウンドの結果',
      avgDeviation: '平均ずれ {ms} ms',
      nextHint: 'まもなく次のラウンドへ…'
    },
    final: {
      heading: 'テスト完了',
      avgDeviation: '平均ずれ {ms} ms',
      bestRound: 'ベストラウンド：第 {round} ラウンド · BPM {bpm} · ずれ {ms} ms',
      playAgain: 'もう一度',
      reset: '設定し直す'
    }
  }
} as const
