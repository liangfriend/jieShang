export default {
  notePractice: {
    title: '練習モード',
    setup: {
      heading: '練習の設定',
      notation: '譜面',
      notationOptions: {
        staff: '五線譜',
        jianpu: '数字譜'
      },
      clefs: '音部記号',
      clefOptions: {
        treble: 'ト音記号',
        alto: 'ハ音記号（アルト）',
        bass: 'ヘ音記号'
      },
      staffRangeHint: '各音部記号で出題できる音域：ト音記号 {treble}、ハ音記号 {alto}、ヘ音記号 {bass}',
      keySignatures: '調号',
      keyAll: 'すべて',
      keyOnlyC: 'C のみ',
      accidentals: '臨時記号',
      accidentalOptions: {
        none: 'なし',
        single: 'シャープ / フラット',
        double: 'ダブルシャープ / ダブルフラットを含む'
      },
      jianpuDoubleHint: '数字譜にはダブルシャープ / ダブルフラットの表記がありません',
      range: '音域',
      candidateCount: '現在の設定で出題できる音は {count} 個です',
      noCandidates: '現在の設定では出題できる音がありません。音域・音部記号・調号を広げてください',
      count: '音符の数',
      infinite: '無制限',
      playTargetSound: '出題時にその音を鳴らす',
      keySound: '弾いたときにアプリで発音する',
      showPiano: 'バーチャルピアノを表示',
      start: '練習を始める'
    },
    play: {
      hint: 'MIDI キーボードか下のピアノでこの音を弾いてください',
      hintNoPiano: 'MIDI キーボードでこの音を弾いてください',
      completed: '完了 {count}',
      wrong: 'ミス {count}',
      elapsed: '経過 {time}',
      finish: '練習を終える',
      abort: '中止'
    },
    final: {
      heading: '練習結果',
      accuracy: '一発正解率 {percent}',
      completed: '{count} 音を完了',
      wrong: 'ミスタッチ {count} 回',
      avgResponse: '1 音あたり平均 {ms} ミリ秒',
      bestStreak: '最長連続一発正解 {count} 音',
      elapsed: '合計時間 {time}',
      playAgain: 'もう一度練習',
      reset: '設定し直す'
    }
  }
} as const
