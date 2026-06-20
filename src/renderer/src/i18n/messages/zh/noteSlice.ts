export default {
  noteSlice: {
    modes: {
      arcade: '街机模式',
      endless: '无限模式',
      extreme: '极限模式'
    },
    difficulty: {
      easy: '简单',
      standard: '标准',
      hard: '困难',
      suffix: '难度'
    },
    hud: {
      livesAria: '剩余生命',
      combo: '{n} 连击',
      slowDown: '减速',
      doubleScore: '加倍'
    },
    countdown: {
      start: '开始!'
    },
    gameOver: {
      timeUp: '时间到',
      outOfLives: '命用完了',
      challengeEnd: '挑战结束',
      default: '游戏结束',
      newPr: '新 PR',
      scoreThisRound: '本局得分',
      survivalThisRound: '本局存活',
      bestScore: '历史最高分',
      bestSurvival: '历史最长存活',
      achievementsTitle: '本局获得成就',
      newBadge: '新',
      reward: '奖励：{reward}',
      playAgain: '再来一局',
      goHome: '回到首页'
    }
  }
} as const
