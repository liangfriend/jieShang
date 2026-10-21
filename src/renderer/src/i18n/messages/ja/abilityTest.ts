export default {
  abilityTest: {
    title: '能力テスト',
    rhythm: {
      title: 'リズム感テスト',
      desc: 'リズムを聴き取って叩き、リズム感をチェック'
    },
    absolutePitch: {
      title: '音感テスト',
      desc: '音を聴いて音名を当て、絶対音感をチェック'
    },
    keyNoteName: {
      title: '鍵盤の音名',
      desc: '鍵盤の位置を見て、対応する音名を選択'
    },
    chordRecognition: {
      title: 'コード聴き取り',
      desc: '和音を聴いて、コード名を選択'
    },
    notePractice: {
      title: '練習モード',
      desc: 'カスタマイズできる読譜練習。大きな音符ブロックが 1 つずつ出て、正しく弾くと次へ進みます'
    }
  }
} as const
