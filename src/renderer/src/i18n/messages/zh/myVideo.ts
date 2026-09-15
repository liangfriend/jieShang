export default {
  myVideo: {
    title: '我的视频',
    searchPlaceholder: '搜索视频名称',
    empty: '还没有视频，点右上角添加吧～',
    emptyFiltered: '没有找到匹配的视频',
    add: '添加视频',
    uploading: '上传中…',
    uploadSuccess: '已添加 {n} 个视频',
    uploadFailed: '上传失败',
    play: '播放',
    pause: '暂停',
    stop: '停止',
    seek: '拖拽进度',
    deleteTitle: '删除视频',
    deleteMessage: '确定要删除这个视频吗？',
    deleteWarning: '此操作不可恢复。',
    deleteSuccess: '视频已删除',
    deleteAria: '删除视频',
    detail: {
      title: '视频详情',
      duration: '时长',
      dimensions: '分辨率',
      dimensionsValue: '{w} × {h}',
      size: '文件大小',
      format: '格式',
      createdAt: '添加时间',
      probeFailed: '无法解析视频信息'
    }
  }
} as const
