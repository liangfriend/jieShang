export default {
  notePractice: {
    title: '练习模式',
    setup: {
      heading: '练习设置',
      notation: '谱面',
      notationOptions: {
        staff: '线谱',
        jianpu: '简谱'
      },
      clefs: '谱号',
      clefOptions: {
        treble: '高音谱号',
        alto: '中音谱号',
        bass: '低音谱号'
      },
      staffRangeHint: '各谱号能出的音域：高音谱号 {treble}，中音谱号 {alto}，低音谱号 {bass}',
      keySignatures: '调号',
      keyAll: '全选',
      keyOnlyC: '仅 C 调',
      accidentals: '临时变音记号',
      accidentalOptions: {
        none: '不出现',
        single: '升号 / 降号',
        double: '含重升 / 重降'
      },
      jianpuDoubleHint: '简谱没有重升 / 重降的写法',
      range: '音域',
      candidateCount: '当前设置下共有 {count} 个音可以出题',
      noCandidates: '当前设置下没有可以出题的音，请放宽音域、谱号或调号',
      count: '音符数量',
      infinite: '无限',
      playTargetSound: '出题时播放这个音',
      keySound: '弹奏时由软件发声',
      showPiano: '显示虚拟钢琴',
      start: '开始练习'
    },
    play: {
      hint: '用 MIDI 键盘或下方的钢琴弹出这个音',
      hintNoPiano: '用 MIDI 键盘弹出这个音',
      completed: '已完成 {count}',
      wrong: '错按 {count}',
      elapsed: '用时 {time}',
      finish: '结束练习',
      abort: '中止'
    },
    final: {
      heading: '练习结果',
      accuracy: '一次弹对率 {percent}',
      completed: '完成 {count} 个音',
      wrong: '错按 {count} 次',
      avgResponse: '平均每个音用时 {ms} 毫秒',
      bestStreak: '最长连续一次弹对 {count} 个',
      elapsed: '总用时 {time}',
      playAgain: '再练一次',
      reset: '重新设置'
    }
  }
} as const
