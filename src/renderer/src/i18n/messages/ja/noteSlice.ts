export default {
  noteSlice: {
    modes: {
      arcade: 'アーケードモード',
      endless: 'エンドレスモード',
      extreme: 'エクストリームモード'
    },
    difficulty: {
      easy: 'かんたん',
      standard: 'ふつう',
      hard: 'むずかしい',
      suffix: 'モード'
    },
    hud: {
      livesAria: '残りライフ',
      combo: '{n} コンボ',
      slowDown: 'スロー',
      doubleScore: '×2'
    },
    countdown: {
      start: 'スタート!'
    },
    gameOver: {
      timeUp: 'タイムアップ',
      outOfLives: 'ライフがなくなりました',
      challengeEnd: 'チャレンジ終了',
      default: 'ゲームオーバー',
      newPr: '自己ベスト更新',
      scoreThisRound: '今回のスコア',
      survivalThisRound: '今回の生存時間',
      bestScore: 'ハイスコア',
      bestSurvival: '最長生存時間',
      achievementsTitle: '今回獲得した実績',
      newBadge: 'NEW',
      reward: '報酬：{reward}',
      playAgain: 'もう一度プレイ',
      goHome: 'ホームに戻る'
    }
  }
} as const
