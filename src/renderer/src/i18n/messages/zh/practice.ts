export default {
  practice: {
    toolbar: {
      settings: '设置',
      play: '播放',
      pause: '暂停',
      stop: '停止',
      clearPlayData: '清空弹奏数据'
    },
    settings: {
      title: '练习设置',
      desc: '调整练习体验，功能稍后接入',
      display: '显示',
      showNoteResult: '实时显示音符结果',
      showNoteResultHint: '弹对、弹早、弹晚、漏弹以不同颜色标注（漏弹为红色）',
      coverWaterfall: '遮盖瀑布流',
      coverWaterfallHint: '用可爱背景图挡住瀑布流，凭听觉练习',
      volumeAndSpeed: '音量与速度',
      scoreVolume: '曲谱音量',
      metronomeVolume: '节拍器音量',
      bpm: 'BPM',
      metronomeDuringPlay: '播放过程开启节拍器',
      staffSelection: '声部选择',
      staffSelectionHint: '选择参与弹奏的声部',
      singleStaff: '单谱表 {n}',
      noSingleStaff: '当前曲谱暂无单谱表',
      difficulty: '难度',
      difficultyBeginner: '新手',
      difficultyBeginnerDesc: '判定窗口较宽，适合入门',
      difficultyIntermediate: '老手',
      difficultyIntermediateDesc: '标准判定，适合日常练习',
      difficultyMaster: '大师',
      difficultyMasterDesc: '判定严格，挑战极限',
      appendix: '附录：颜色含义',
      noteColors: '音符颜色'
    },
    result: {
      perfect: '完美',
      good: '优秀',
      pass: '及格',
      early: '弹早',
      late: '弹晚',
      miss: '漏弹'
    },
    stats: {
      totalNotes: '音符总数',
      realScore: '实时分',
      totalScore: '总分'
    },
    coverText: '强者之遮挡',
    messages: {
      notationTypeSwitchFailed: '曲谱类型切换失败',
      noPracticeNotes: '当前曲谱没有可练习的音符'
    }
  }
} as const
