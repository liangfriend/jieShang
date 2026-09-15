export default {
  instrumentSim: {
    title: '模拟乐器',
    locked: '尚未拥有对应音色，无法进入',
    guide: '使用指南',
    guitar: {
      name: '吉他',
      desc: '数字键按和弦，右侧键拨弦',
      title: '模拟吉他',
      selectScore: '选择曲谱',
      noScore: '未选择曲谱',
      play: '播放',
      pause: '暂停',
      stop: '停止',
      shortcutSettings: '快捷和弦设置',
      manageChords: '和弦符号管理',
      currentChord: '当前和弦',
      none: '无',
      toneLocked: '音色已锁定为尼龙弦吉他',
      pickHint: '拨弦：小键盘 1~6 或点击琴弦（1=细弦）',
      chordHint: '和弦：主键盘 1~9（快捷和弦）',
      guideTitle: '吉他使用指南',
      guideBody:
        '左侧功能区可选曲谱并播放（尼龙弦吉他音色）。主键盘数字 1~9 切换快捷和弦，左手虚拟指法会移到对应品位；小键盘 1~6（或点击右侧琴弦）拨对应弦并发声。可在「快捷和弦设置」绑定和弦，「和弦符号管理」中增删改指法。'
    },
    harmonica: {
      name: '口琴',
      desc: '鼠标跟随，左键吹 / 右键吸',
      title: '模拟口琴',
      selectScore: '选择曲谱',
      noScore: '未选择曲谱',
      play: '播放',
      pause: '暂停',
      stop: '停止',
      model: '口琴种类',
      mouthSize: '嘴部大小',
      toneLocked: '音色已锁定为口琴',
      playHint: '鼠标移入口琴区跟随；左键吹气，右键吸气；红色框内孔位才会发声并高亮',
      idle: '移入口琴区，左键吹 / 右键吸',
      toneLoading: '音色加载中…',
      blowing: '吹气中…',
      drawing: '吸气中…',
      guideTitle: '口琴使用指南',
      guideBody:
        '上方为口琴正视图。鼠标进入展示区后口琴会横向跟随光标，离开则回正。舞台中央红色框表示嘴部范围，可调「嘴部大小」。左键按住吹气、右键按住吸气，框内孔位高亮并发声。右侧可选曲谱播放，音色锁定为口琴；种类可选 10 孔 C 调布鲁斯或 24 孔 C 调复音。',
      models: {
        blues10: '10 孔 C 调布鲁斯',
        tremolo24: '24 孔 C 调复音'
      }
    },
    xiao: {
      name: '萧',
      desc: '即将开放',
      soon: '开发中'
    },
    violin: {
      name: '小提琴',
      desc: '即将完善',
      soon: '开发中'
    },
    chords: {
      title: '和弦符号',
      search: '搜索和弦名',
      add: '添加和弦',
      edit: '编辑和弦',
      name: '名称',
      save: '保存',
      delete: '删除',
      deleteConfirm: '确定删除和弦「{name}」吗？',
      empty: '暂无和弦',
      saved: '已保存',
      deleted: '已删除'
    },
    shortcuts: {
      title: '快捷和弦设置',
      key: '按键 {n}',
      unbound: '未绑定',
      save: '保存',
      saved: '快捷键已保存'
    }
  }
} as const
