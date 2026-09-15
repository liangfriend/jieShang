export default {
  chordRecognitionQuiz: {
    title: '和弦识别',
    qualities: {
      major: '大三',
      minor: '小三',
      dom7: '属七',
      maj7: '大七',
      min7: '小七'
    },
    setup: {
      heading: '测试设置',
      qualities: '和弦范围（可多选）',
      soundRange: '声音范围',
      soundRangeOptions: {
        standard: '标准音（中央 C 附近）',
        full: '全音（21–108）'
      },
      showPiano: '显示钢琴',
      rounds: '轮次',
      countdown: '答题倒计时（秒）',
      start: '开始测试'
    },
    question: {
      replayHint: '点击重播',
      replayAria: '重播当前和弦',
      abort: '中止'
    },
    result: {
      correct: '正确',
      wrong: '错误',
      timeout: '超时'
    },
    final: {
      heading: '测试完成',
      accuracy: '正确率 {percent}',
      counts: '正确 {correct} · 错误 {wrong} · 超时 {timeout} / 共 {total} 轮',
      avgResponse: '平均作答 {ms} ms',
      bestStreak: '最长连对 {count} 轮',
      qualityAccuracy: '{quality} 正确率 {percent}',
      playAgain: '再来一次',
      reset: '重新设置'
    }
  }
} as const
