export default {
  home: {
    brand: {
      title: '解熵',
      subtitle: '助力你的音乐梦想',
      logoAlt: '解熵'
    },
    gameModes: {
      arcade: {
        title: '街机模式',
        desc: '60 秒限时，冲高分'
      },
      endless: {
        title: '无限模式',
        desc: '三条命，看你能撑多久'
      },
      extreme: {
        title: '极限模式',
        desc: '不准漏音，挑战存活'
      }
    },
    actions: {
      collection: '藏品',
      compose: '曲谱制作',
      scores: '我的曲谱',
      whiteboard: '教学白板',
      achievements: '成就'
    },
    templateDialog: {
      title: '选择模版',
      desc: '选好模版后，就可以进入曲谱编辑啦',
      staff: '线谱',
      jianpu: '简谱',
      empty: '空',
      single: '单声部',
      double: '双声部'
    },
    midi: {
      connected: 'MIDI 琴已连接',
      disconnected: 'MIDI 琴未连接'
    },
    settingsAria: '设置'
  },
  scores: {
    title: '我的曲谱',
    searchPlaceholder: '搜索曲谱名称',
    empty: '还没有曲谱，先去制作一个吧～',
    emptyFiltered: '没有找到匹配的曲谱',
    deleteTitle: '删除曲谱',
    deleteConfirm: '确定删除曲谱「{name}」吗？此操作不可恢复。',
    deleteSuccess: '曲谱已删除',
    deleteAria: '删除曲谱'
  }
} as const
