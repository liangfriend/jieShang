export default {
  play: {
    toolbar: {
      editMode: '编辑模式',
      play: '播放',
      pause: '暂停',
      stop: '停止',
      volume: '音量',
      bpm: 'BPM',
      practiceMode: '练习模式',
      beginnerMode: '新手模式',
      notationType: '曲谱类型'
    },
    messages: {
      notationTypeSwitchFailed: '曲谱类型切换失败',
      noPlayableContent: '当前曲谱没有可播放的内容',
      grandStaffMismatch: '各复谱表的单谱表行数须一致，无法进入练习/新手模式'
    },
    toneColor: {
      label: '音色',
      loadFailed: '音色加载失败',
      switchFailed: '音色切换失败',
      notFound: '音色不存在',
      unavailable: '音色不可用',
      defaultLoadFailed: '默认音色加载失败'
    }
  }
} as const
