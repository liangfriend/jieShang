export default {
  rhythmSenseTest: {
    title: '节奏感测试',
    setup: {
      heading: '测试设置',
      beats: '拍数',
      beatsOption: '{count} 拍',
      rounds: '轮次',
      start: '开始测试'
    },
    listen: {
      kicker: '仔细听拍',
      hint: '即将播放 {count} 拍，请记住速度'
    },
    tap: {
      kicker: '开始敲击',
      hint: '点击圆环或按空格键敲击',
      aria: '敲击圆环'
    },
    roundResult: {
      kicker: '本轮结果',
      avgDeviation: '平均偏差 {ms} ms',
      nextHint: '稍候进入下一轮…'
    },
    final: {
      heading: '测试完成',
      avgDeviation: '平均偏差 {ms} ms',
      bestRound: '最佳单轮：第 {round} 轮 · BPM {bpm} · 偏差 {ms} ms',
      playAgain: '再来一次',
      reset: '重新设置'
    }
  }
} as const
