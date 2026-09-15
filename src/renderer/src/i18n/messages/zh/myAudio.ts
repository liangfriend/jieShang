export default {
  myAudio: {
    title: '我的音频',
    searchPlaceholder: '搜索音频名称',
    empty: '还没有音频，点右上角添加吧～',
    emptyFiltered: '没有找到匹配的音频',
    add: '添加音频',
    uploading: '上传中…',
    uploadSuccess: '已添加 {n} 个音频',
    uploadFailed: '上传失败',
    play: '播放',
    pause: '暂停',
    stop: '停止',
    seek: '拖拽进度',
    deleteTitle: '删除音频',
    deleteMessage: '确定要删除这条音频吗？',
    deleteWarning: '此操作不可恢复。',
    deleteSuccess: '音频已删除',
    deleteAria: '删除音频',
    detail: {
      title: '音频详情',
      duration: '时长',
      sampleRate: '采样率',
      sampleRateValue: '{hz} Hz',
      channels: '声道',
      channelsValue: '{n} 声道',
      size: '文件大小',
      format: '格式',
      createdAt: '添加时间',
      probeFailed: '无法解析音频元数据（可能编码不受支持）'
    }
  }
} as const
