export default {
  clSheet: {
    untitled: '未命名弹唱谱',
    titlePlaceholder: '歌名',
    authorPlaceholder: '作者 / 演唱',
    descriptionPlaceholder: '描述，如 1=C 4/4',
    unsaved: '未保存',
    emptyEdit: '还没有歌词：点下方「＋ 添加一行」开始写，或在右侧粘贴和弦文本导入',
    emptyShow: '还没有歌词，切到「编辑」开始写吧',
    mode: {
      show: '展示',
      edit: '编辑'
    },
    font: {
      default: '默认',
      song: '宋体',
      kai: '楷体',
      hei: '黑体'
    },
    style: {
      title: '样式',
      reset: '恢复默认',
      width: '纸张宽度',
      fontSize: '歌词字号',
      lineGap: '行距',
      font: '字体',
      color: '歌词颜色',
      chordColor: '和弦颜色',
      addLyricColor: '新加歌词',
      addChordColor: '新加和弦',
      addColorHint: '「新加歌词 / 新加和弦」只给之后新加的字和和弦上色，不影响已有内容；清空则跟随上面的默认颜色。'
    },
    chordLyrics: {
      title: '和弦歌词',
      desc: '一次修改所有带和弦的字（共 {count} 个），没有和弦的字不变。颜色不一致时取色器显示为空，清空颜色则恢复为默认歌词颜色。',
      empty: '还没有带和弦的字',
      underline: '加下划线',
      color: '改颜色'
    },
    embedded: {
      title: '顶部曲谱',
      desc: '从打好的曲谱里选一首添加到弹唱谱最上方，比如节奏型。添加时会复制一份存进弹唱谱，之后原曲谱修改或删除都不影响这里。编辑时拖动展示区下边缘可调节高度。',
      placeholder: '选择曲谱添加',
      replace: '选择曲谱替换当前',
      remove: '移除',
      height: '区域高度',
      scale: '曲谱缩放',
      onlyChordName: '和弦只显示名称',
      loadFailed: '曲谱读取失败',
      resizeHint: '拖动调节高度'
    },
    text: {
      title: '和弦文本',
      desc: "和弦写在方括号里，放在对应的字前面，如 [C]好一朵美丽的[Am]茉莉花。{'{'}#e6553a{'}'} 写在字前是歌词颜色、写在 [和弦] 前是和弦颜色，{'{'}u{'}'} 是下划线。",
      placeholder: '[C]好一朵美丽的[Am]茉莉[C]花\n[F]好一朵美丽的[C]茉莉[G]花',
      import: '导入到曲谱',
      importConfirm: '导入会替换当前全部歌词与和弦，确定吗？',
      copy: '复制文本',
      copied: '已复制',
      copyFailed: '复制失败'
    },
    tips: {
      title: '操作说明',
      select: '点字：选中并设置和弦、颜色、下划线；← → ↑ ↓ 切换，Delete 删除和弦，Esc 取消',
      editLine: '双击或 Enter：改整行文字；Enter 拆行，行首 Backspace 合并；行尾要放和弦就打空格',
      dragChord: '拖动和弦换位置，按住 Ctrl 拖动是复制',
      save: 'Ctrl + S 保存'
    },
    file: {
      import: '导入',
      export: '导出',
      importConfirm: '导入会用文件内容替换当前弹唱谱（保存后才写入），确定吗？',
      importSuccess: '已导入 {fileName}，记得保存',
      importFailed: '导入失败',
      exportSuccess: '导出成功',
      exportFailed: '导出失败',
      invalid: '不是有效的和弦弹唱谱文件'
    },
    messages: {
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      loadFailed: '和弦弹唱谱加载失败',
      discardConfirm: '当前弹唱谱有未保存的改动，确定离开吗？'
    }
  }
} as const
