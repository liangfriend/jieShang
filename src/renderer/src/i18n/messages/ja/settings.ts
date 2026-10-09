export default {
  settings: {
    title: '設定',
    language: {
      label: '表示言語',
      zh: '中文',
      en: 'English',
      ja: '日本語'
    },
    gameDifficulty: {
      label: 'アーケード/エンドレスモードの難易度：',
      easy: 'かんたん',
      easyDesc: 'MIDI 38–83、ト音/ヘ音記号、ダブルシャープ・ダブルフラットなし',
      standard: 'ふつう',
      standardDesc: 'MIDI 38–83、3 種類の音部記号、ダブルシャープ・ダブルフラットなし、リズムが速め',
      hard: 'むずかしい',
      hardDesc: 'MIDI 38–83、3 種類の音部記号、すべての臨時記号、ブロックの速度と出現が速め'
    },
    gameNotation: {
      label: 'ゲームの楽譜モード：',
      staff: '五線譜',
      jianpu: '数字譜'
    },
    noteBlockSound: {
      label: '音符ブロックの音'
    },
    practice: {
      difficulty: {
        beginner: '初心者',
        beginnerDesc: '判定幅が広く、入門向け',
        intermediate: '経験者',
        intermediateDesc: '標準の判定、日々の練習向け',
        master: 'マスター',
        masterDesc: '判定が厳しく、限界に挑戦'
      }
    }
  }
} as const
