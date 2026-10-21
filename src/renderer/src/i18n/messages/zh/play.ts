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
      singingMode: '演唱模式',
      notationType: '曲谱类型',
      sourceScore: '曲谱',
      sourceVocal: '范唱',
      sourceAccompaniment: '伴奏'
    },
    range: {
      title: '选段',
      tooltip: '点击音符选择起始和结束音符，只播放这一段',
      pickStart: '点击音符设置起始音符',
      pickEnd: '再点击一个音符设置结束音符',
      ready: '已选好，点「播放」播放选段；再点音符会重设起点',
      clear: '清空选段',
      end: '结束选段',
      incomplete: '请先点击音符选择起始和结束音符'
    },
    messages: {
      notationTypeSwitchFailed: '曲谱类型切换失败',
      noPlayableContent: '当前曲谱没有可播放的内容',
      rangeNoPlayableContent: '选段内没有可播放的音符',
      grandStaffMismatch: '各复谱表的单谱表行数不一致，无法合并成单行，暂不能进入练习/新手/演唱模式',
      tabModeUnavailable: '吉他谱 / 尤克里里谱暂不支持练习、新手与演唱模式',
      playOnlyModeUnavailable: '吉他谱 / 尤克里里谱 / 贝斯谱 / 鼓谱暂不支持练习、新手与演唱模式',
      boundAudioMissing: '未找到绑定音频',
      audioLoadFailed: '音频加载失败',
      vocalTimeOffsetMissing:
        '当前曲谱还没有范唱的谱音同步时间。请在编辑模式「谱音同步」中把属性切到「范唱」后再对齐。',
      accompanimentTimeOffsetMissing:
        '当前曲谱还没有伴奏的谱音同步时间。请在编辑模式「谱音同步」中把属性切到「伴奏」后再对齐。'
    },
    mark: {
      label: '标记',
      none: '无',
      xiaoGroup: '八孔箫',
      fluteGroup: '六孔笛',
      xiaoKey: '{key} 调箫',
      fluteKey: '{key} 调笛',
      fluteLowG: '大G',
      fluteHighG: '小G'
    },
    toneColor: {
      label: '音色',
      loadFailed: '音色加载失败',
      switchFailed: '音色切换失败',
      notFound: '音色不存在',
      unavailable: '音色不可用',
      defaultLoadFailed: '默认音色加载失败',
      scoreSetting: '曲谱设定',
      loading: '音色加载中…'
    },
    devToneCache: {
      title: '已缓存音色（{count}）',
      collapse: '收起',
      expand: '展开',
      clear: '清空所有音色',
      empty: '暂无缓存音色'
    }
  }
} as const
