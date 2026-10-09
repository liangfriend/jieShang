export default {
  instrumentSim: {
    title: '模拟乐器',
    locked: '尚未拥有对应音色，无法进入',
    guide: '使用指南',
    smoothEnvelope: '平缓',
    score: {
      selectScore: '选择曲谱',
      noScore: '未选择曲谱',
      play: '播放',
      pause: '暂停',
      stop: '停止'
    },
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
      smoothEnvelope: '平缓',
      pickHint: '拨弦：小键盘 1~6 或点击琴弦（1=细弦）；开启「平缓」后带包络起止',
      chordHint: '和弦：按住主键盘 1~9 保持按弦，松手回到空弦',
      guideTitle: '吉他使用指南',
      guideBody:
        '左侧功能区可选曲谱并播放（尼龙弦吉他音色）。主键盘数字 1~9 切换快捷和弦，左手虚拟指法会移到对应品位；小键盘 1~6（或点击右侧琴弦）拨对应弦并发声。开启「平缓」后拨弦带 ADSR 包络。可在「快捷和弦设置」绑定和弦，「和弦符号管理」中增删改指法。'
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
      smoothEnvelope: '平缓',
      toneLocked: '音色已锁定为口琴',
      playHint: '鼠标移入口琴区跟随；左键吹气，右键吸气；红色框内孔位才会发声并高亮。开启「平缓」后抬键带包络淡出。',
      idle: '移入口琴区，左键吹 / 右键吸',
      toneLoading: '音色加载中…',
      blowing: '吹气中…',
      drawing: '吸气中…',
      guideTitle: '口琴使用指南',
      guideBody:
        '上方为口琴正视图。鼠标进入展示区后口琴会横向跟随光标，离开则回正。舞台中央红色框表示嘴部范围，可调「嘴部大小」。左键按住吹气、右键按住吸气，框内孔位高亮并发声；开启「平缓」后抬起键时声音会缓慢衰减。右侧可选曲谱播放，音色锁定为口琴；种类可选 10 孔 C 调布鲁斯或 24 孔 C 调复音。',
      models: {
        blues10: '10 孔 C 调布鲁斯',
        tremolo24: '24 孔 C 调复音'
      }
    },
    drumMachine: {
      name: '电子鼓机',
      desc: '多轨步进编排，可保存与载入',
      title: '电子鼓机',
      unnamed: '未命名鼓机',
      unsaved: '未保存',
      new: '新建',
      open: '打开',
      saveAs: '另存为',
      playHint: '播放 / 停止（空格）',
      volume: '总音量',
      swing: '摇摆',
      swingHint:
        '把反拍上的块往后推迟，让均匀的节奏变成“前长后短”的律动；0% 为完全均匀。右侧选择单位：把时间按该单位两两分组，推迟每组第 2 个位置上的块。例如 1/4 推迟每小节第 2、4 拍，1/8 推迟每拍的八分反拍，1/16 推迟每拍第 2、4 个十六分。单位应与想要摇摆的块时值一致。最大 60% 即推迟 0.6 个该单位。',
      totalBeats: '总时值（拍）',
      barsLabel: '{bars} 小节 {beats} 拍',
      clearAll: '全部清空',
      clearAllConfirm: '确定熄灭所有音轨上的块吗？',
      uniformDuration: '整体时值',
      uniformMixed: '当前时值不统一，选择后全部音轨重排为该网格',
      blockDuration: '选中块时值',
      blockSelected: '当前块 {duration} 拍',
      blockNone: '点击任意块后可调整其时值',
      mouseHint: '左键点亮 · 右键熄灭 · 按住拖动连续绘制',
      tracks: '音轨',
      preview: '试听',
      solo: '独奏',
      mute: '静音',
      more: '更多',
      regrid: '整轨网格 {unit}',
      invert: '反选',
      clear: '清空本轨',
      removeTrack: '删除音轨',
      addTrack: '添加音轨',
      category: {
        gm: 'GM 标准',
        gmExtra: 'GM 外（待确认）',
        named: '扩展音色'
      },
      toneFailed: '鼓机音色加载失败',
      discardConfirm: '当前鼓机有未保存的改动，确定放弃吗？',
      namePrompt: '请输入鼓机名称',
      defaultName: '我的鼓机',
      nameInvalid: '名称不能为空且不超过 100 字',
      saved: '已保存',
      loaded: '已载入「{name}」',
      openTitle: '打开鼓机',
      searchPlaceholder: '搜索鼓机名称',
      empty: '还没有保存的鼓机',
      columnName: '名称',
      updatedAt: '更新时间',
      current: '当前',
      deleteConfirm: '确定删除鼓机「{name}」吗？',
      deleted: '已删除',
      guideTitle: '电子鼓机使用指南',
      guideBody:
        '左侧每行是一条音轨：可从下拉框更换乐器、点试听按钮预听，S 为独奏、M 为静音，滑块调轨道音量，右侧箭头菜单可整轨切换网格（1/2~1/32）、反选、清空或删除音轨；底部「添加音轨」增加新乐器。\n右侧为步进块：左键点亮、右键熄灭，按住拖动可连续绘制。「整体时值」把所有音轨统一重排为同一网格（已点亮的位置保留）；点击某个块后，可在「选中块时值」中单独修改它的长度——变长会吞并后面的块，变短会在后面补出同长度的空块。\n顶部可调 BPM、总音量、摇摆（按所选单位 1/2~1/32 延后反拍）以及音轨区总时值（拍）。空格键播放 / 停止，Ctrl+S 保存，Ctrl+Shift+S 另存为；「打开」可载入之前保存的鼓机。'
    },
    xiao: {
      name: '萧',
      desc: '即将开放',
      soon: '开发中'
    },
    panFlute: {
      name: '排箫',
      desc: '嘴位跟随鼠标，左键吹气',
      title: '模拟排箫',
      model: '排箫种类',
      toneLocked: '音色已锁定为排箫',
      toneLoading: '音色加载中…',
      idle: '移动鼠标对准竹管，按住左键吹气',
      blowing: '正在吹 {note}',
      guideTitle: '排箫使用指南',
      guideBody:
        '上方为排箫，从左到右由低到高，每根竹管上标有音高。鼠标移入后，上方红色箭头即嘴位指针，指向哪根管就吹哪根；按住左键吹气，松开停止，一次只能吹一根管，按住左键左右滑动可连续换音。\n「平缓」默认开启，吹气与停止时声音带包络渐入渐出。\n下方曲谱以单行模式展示，可在右侧选曲播放，音色锁定为排箫；种类可选 16 管或 18 管（C 调，G4 起）。',
      models: {
        pipes16: '16 管 C 调',
        pipes18: '18 管 C 调'
      }
    },
    piccolo: {
      name: '短笛',
      desc: '键盘按孔，麦克风吹气或空格发声',
      title: '模拟短笛',
      model: '短笛种类',
      currentNote: '当前音名',
      noMatch: '该指法没有对应的音',
      overblowTip: '同一指法，气息越急音越高',
      registers: {
        low: '低音区',
        middle: '中音区',
        high: '高音区',
        highest: '倍高音区'
      },
      facing: '笛头朝向',
      facingLeft: '朝左',
      facingRight: '朝右',
      playHint: '{full} 按住对应孔位，{half} 半按；也可鼠标左键按孔、右键半按。',
      breathMode: '吹气方式',
      breathMic: '麦克风',
      breathSpace: '空格',
      pressure: '气压',
      micStatus: {
        off: '麦克风未开启',
        starting: '正在开启麦克风…',
        on: '麦克风检测中，对着麦克风吹气发声',
        error: '麦克风开启失败'
      },
      micRetry: '重试',
      micFailed: '麦克风开启失败，请检查麦克风权限或切换为空格模式',
      micHint: '对着麦克风吹气即发声，越用力越响；同一指法有多个八度时，气压越大音越高（气压条上的刻度为换音点）。',
      spaceHint: '按住空格吹气发声，松开停止；同一指法有多个八度时吹最低的那个。',
      guideTitle: '短笛使用指南',
      guideBody:
        '上方为六孔 G 调短笛，孔上方数字为传统孔号（靠近吹孔的是第六孔）。\n「笛头朝向」按真实持笛手法切换：朝左时右手反握，键盘 Q W E P O I 从吹孔一侧起依次按住六个指孔，A S D L K J 半按；朝右时笛子翻转，改为 O I U Q W E 按住、L K J A S D 半按。也可用鼠标左键按住孔位、右键半按。\n「吹气方式」二选一：麦克风模式进入页面即开始检测，对着麦克风吹气即发声、停止吹气即停，气压越大越响；同一指法对应多个八度时，气压越大吹出的音越高：两个音时 0.7 以上换高音，三个音时 0.4、0.7 为换音点。空格模式按住空格发声，固定吹最低的音。\n右侧实时显示当前指法对应的音（简谱与音名），正在发声的音以橙色标出。下方可选曲谱播放，音色锁定为短笛。',
      models: {
        dizi6G: '六孔 G 调'
      }
    },
    kalimba: {
      name: '卡林巴',
      desc: '字母键弹奏，左右手对应左右琴键',
      title: '模拟卡林巴',
      model: '卡林巴种类',
      toneLocked: '音色已锁定为卡林巴',
      toneLoading: '音色加载中…',
      idle: '按下琴键上标注的字母键发声，松开停止',
      guideTitle: '卡林巴使用指南',
      guideBody:
        '上方为卡林巴，中间最长的琴键音最低，向两侧交替升高。每根琴键标有音名和对应的键盘字母：左半边琴键用键盘左手区（F D S A、T R E W …），右半边用右手区（H J K L、Y U I O …），中间最低音为 G。\n按下字母键发声，松开停止；也可用鼠标左键按住琴键。「平缓」默认开启，起音与松开时带包络。\n下方可选曲谱播放，音色锁定为卡林巴；种类可选 17 音（C4–E6）或 21 音（F3–E6）。',
      models: {
        tines17: '17 音 C 调',
        tines21: '21 音 C 调'
      }
    },
    chords: {
      title: '和弦管理',
      search: '搜索和弦名',
      filterAll: '全部',
      filterTab6: '六弦（吉他）',
      filterTab5: '五弦（贝斯）',
      filterTab4: '四弦（尤克里里）',
      add: '添加和弦',
      edit: '编辑和弦',
      name: '名称',
      save: '保存',
      delete: '删除',
      deleteConfirm: '确定删除和弦「{name}」吗？',
      empty: '暂无和弦',
      saved: '已保存',
      deleted: '已删除',
      typeLabel: '和弦类型',
      typeLocked: '类型创建后不可修改',
      hand: '和弦手',
      handTitle: '编辑和弦手型',
      handHint: '拖拽蓝色根点移动手指，拖拽橙色关节点旋转。确认后随和弦一起保存。',
      handReset: '复位',
      handCancel: '取消',
      handApply: '应用手型',
      handSaved: '已设置手型'
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
