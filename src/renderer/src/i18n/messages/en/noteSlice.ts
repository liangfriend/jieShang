export default {
  noteSlice: {
    modes: {
      arcade: 'Arcade mode',
      endless: 'Endless mode',
      extreme: 'Extreme mode'
    },
    difficulty: {
      easy: 'Easy',
      standard: 'Standard',
      hard: 'Hard',
      suffix: ' difficulty'
    },
    hud: {
      livesAria: 'Lives remaining',
      combo: '{n} combo',
      slowDown: 'Slow',
      doubleScore: '×2'
    },
    countdown: {
      start: 'Go!'
    },
    gameOver: {
      timeUp: "Time's up",
      outOfLives: 'Out of lives',
      challengeEnd: 'Challenge over',
      default: 'Game over',
      newPr: 'New PR',
      scoreThisRound: 'Score',
      survivalThisRound: 'Survived',
      bestScore: 'Best score',
      bestSurvival: 'Longest survival',
      achievementsTitle: 'Achievements this round',
      newBadge: 'New',
      reward: 'Reward: {reward}',
      playAgain: 'Play again',
      goHome: 'Back to home'
    }
  }
} as const
