export default {
  absolutePitchTest: {
    title: '音感测试',
    setup: {
      heading: '测试设置',
      scale: '音名范围',
      scaleOptions: {
        pentatonic: '五音（宫商角徵羽）',
        diatonic: '七音',
        chromatic: '十二音'
      },
      soundRange: '声音范围',
      soundRangeOptions: {
        standard: '标准音（中央 C 八度）',
        full: '全音（21–108）'
      },
      labelMode: '琴键文本',
      labelModeOptions: {
        noteName: '音名',
        solfege: '唱名',
        number: '数字'
      },
      rounds: '轮次',
      countdown: '答题倒计时（秒）',
      start: '开始测试'
    },
    question: {
      replayHint: '点击重播',
      replayAria: '重播当前音',
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
      playAgain: '再来一次',
      reset: '重新设置'
    }
  }
} as const
