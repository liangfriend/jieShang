export default {
  beginner: {
    toolbar: {
      settings: '设置',
      startPractice: '开始练习',
      stop: '停止',
      volume: '音量'
    },
    settings: {
      title: '新手模式设置',
      desc: '按自己的节奏弹奏彩色 midi 块',
      display: '显示',
      coverMidiBox: '遮盖 midi 块',
      coverMidiBoxHint: '用可爱背景挡住彩色块，凭听觉练习',
      metronome: '节拍器',
      metronomeVolume: '节拍器音量',
      bpm: 'BPM',
      metronomeDuringPlay: '练习过程开启节拍器',
      staffSelection: '声部选择',
      staffSelectionHint: '关闭后该单谱表会变透明',
      singleStaff: '单谱表 {n}',
      noSingleStaff: '当前曲谱暂无单谱表'
    },
    coverText: '强者之遮挡',
    messages: {
      notationTypeSwitchFailed: '曲谱类型切换失败',
      noPracticeableNotes: '当前曲谱没有可练习的音符'
    }
  }
} as const
