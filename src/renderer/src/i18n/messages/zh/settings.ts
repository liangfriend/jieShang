export default {
  settings: {
    title: '设置',
    language: {
      label: '界面语言',
      zh: '中文',
      en: 'English'
    },
    gameDifficulty: {
      label: '街机/无限模式难度：',
      easy: '简单',
      easyDesc: 'MIDI 38–83，高/低音谱号，无重升重降',
      standard: '标准',
      standardDesc: 'MIDI 38–83，三种谱号，无重升重降，节奏更快',
      hard: '困难',
      hardDesc: 'MIDI 38–83，三种谱号，全部变音，块速与生成更快'
    },
    noteBlockSound: {
      label: '音符块声音'
    },
    practice: {
      difficulty: {
        beginner: '新手',
        beginnerDesc: '判定窗口较宽，适合入门',
        intermediate: '老手',
        intermediateDesc: '标准判定，适合日常练习',
        master: '大师',
        masterDesc: '判定严格，挑战极限'
      }
    }
  }
} as const
