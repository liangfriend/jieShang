export default {
  practice: {
    toolbar: {
      settings: '設定',
      play: '再生',
      demoPlay: 'デモ再生',
      stopDemo: 'デモ停止',
      pause: '一時停止',
      stop: '停止',
      clearPlayData: '演奏データをクリア',
      hideScore: '楽譜を隠す',
      showScore: '楽譜を表示'
    },
    settings: {
      title: '練習設定',
      desc: '練習の体験を調整します（機能は順次追加予定）',
      display: '表示',
      showNoteResult: '音符の判定をリアルタイム表示',
      showNoteResultHint: '正解・早い・遅い・弾き漏れを色分けして表示します（弾き漏れは赤）',
      coverWaterfall: 'ウォーターフォールを隠す',
      coverWaterfallHint: 'かわいい背景画像でウォーターフォールを隠し、耳だけで練習します',
      volumeAndSpeed: '音量とテンポ',
      scoreVolume: '楽譜の音量',
      metronomeVolume: 'メトロノームの音量',
      bpm: 'BPM',
      metronomeDuringPlay: '再生中にメトロノームを鳴らす',
      staffSelection: '声部の選択',
      staffSelectionHint: '演奏する声部を選択',
      singleStaff: '譜表 {n}',
      noSingleStaff: 'この楽譜には単一の譜表がありません',
      difficulty: '難易度',
      difficultyBeginner: '初心者',
      difficultyBeginnerDesc: '判定幅が広めで、入門向け',
      difficultyIntermediate: '経験者',
      difficultyIntermediateDesc: '標準の判定で、日々の練習向け',
      difficultyMaster: 'マスター',
      difficultyMasterDesc: '判定が厳しく、限界に挑戦',
      appendix: '付録：色の意味',
      noteColors: '音符の色'
    },
    result: {
      perfect: 'パーフェクト',
      good: 'グレート',
      pass: '合格',
      early: '早い',
      late: '遅い',
      miss: '弾き漏れ',
      wrong: '音違い',
      'high-midi': '高め',
      'low-midi': '低め',
      'quick-end': '終わりが早い',
      'slow-end': '終わりが遅い'
    },
    stats: {
      totalNotes: '総音符数',
      realScore: 'リアルタイムスコア',
      totalScore: '進捗'
    },
    coverText: '強者の目隠し',
    messages: {
      notationTypeSwitchFailed: '楽譜タイプの切り替えに失敗しました',
      noPracticeNotes: 'この楽譜には練習できる音符がありません'
    }
  }
} as const
