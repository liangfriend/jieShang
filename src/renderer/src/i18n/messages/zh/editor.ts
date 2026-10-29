export default {
  editor: {
    menu: {
      file: '文件',
      edit: '编辑',
      view: '视图',
      score: '谱面',
      play: '播放',
      help: '帮助'
    },
    toolbar: {
      playMode: '播放模式',
      playSettings: '播放设置',
      timeOffset: '谱音同步',
      linkedStaffMode: '连谱模式',
      structureEdit: '结构按钮',
      rhythmPatternMode: '音值组合',
      slurStyle: '连音线样式',
      lyricsEdit: '歌词',
      showInstrumentName: '显示音色',
      layout: '布局调整',
      notice: '须知',
      legalNotes: '合法音符一览',
      quickInput: '快速录入',
      pianoRecord: '钢琴录入',
      import: '导入',
      export: '导出',
      formatSj: '解熵曲谱 (.sj)',
      formatMusicXml: 'MusicXML',
      formatMusicXmlMs4: 'MusicXML(ms4)',
      formatMusicXmlMs3: 'MusicXML(ms3)',
      formatMidi: 'MIDI',
      formatWork: '作品',
      scoreImage: '图片转谱(简谱)',
      save: '保存',
      notationType: '曲谱类型',
      transpose: '转调',
      targetKey: '目标调',
      applyTranspose: '转调',
      raiseSemitone: '升半音',
      lowerSemitone: '降半音'
    },
    drumLegalNotes: {
      title: '合法音符一览',
      lead: '以下为鼓谱默认播放映射中的合法音符（线位 + 符头）。每个卡片展示一种记法及其对应乐器声。编辑时选中小节，按乐器名前的字母键即可在小节末尾添加该音符（声部、时值、附点取工具栏设置）。',
      meta: '线位 {region} · 符头 {headType}',
      shortcut: '快捷键：{key}',
      play: '试听',
      toneLoadFailed: '打击乐音色加载失败'
    },
    scoreToWork: {
      title: '导出为作品',
      template: '页面模板',
      custom: '自定义',
      pageSize: '页面宽高',
      scoreWidth: '曲谱宽度',
      topMargin: '曲谱上边距',
      hint: '曲谱按宽度等比缩放、横向居中，从上边距开始排；一页放不下的复谱表整行移到下一页，底部留同样的边距。确认后新建作品并进入作品编辑，保存前不会写入「我的作品」。'
    },
    rhythmPattern: {
      title: '音值组合',
      heading: '音值组合（{mode}） · {timeSignature} · {count} 个音',
      hint: '常用在前；按卡片上的键直接选，方向键 + Enter / 空格选当前卡片，Tab 切换模式，Esc 关闭；鼠标移过不会改候选',
      empty: '该拍号下没有能放下这些音的节奏型',
      emptyBeat: '这些音无法恰好组成一拍',
      modeMeasure: '按小节',
      modeBeat: '按拍',
      skipped: '一拍最多放得下末尾这些音，前面 {count} 个音未参与组合'
    },
    standardMode: {
      label: '标准模式',
      hint: '开启后录入的音符超出小节拍号时值时，自动挪到下一小节并选中它，本小节剩余时值补休止符',
      durationInvalid: '音符时值不正确',
      noNextMeasure: '已经是最后一个小节，没有下一小节'
    },
    lyricsMatch: {
      button: '歌词匹配',
      title: '歌词智能匹配',
      grandStaff: '第 {n} 行',
      placeholder: '输入这一行的歌词，自动填到音符上',
      placeholderMulti: '共 {n} 个单谱表：第一行填第 1 个，回车换行填下一个',
      overflow: '第 {staff} 个单谱表多出 {n} 个字没有填入',
      extraLines: '多出 {n} 行，没有对应的单谱表',
      hint: '每个输入框对应一个复谱表，回车换行代表下一个单谱表。自动跳过休止符和连音线罩住的音；中日韩一字一音，其它文字按空格分词、用 - 拆音节，_ 空过一个音。填的是第一行歌词。'
    },
    noticeDialog: {
      title: '编辑须知',
      selectionTitle: '选中与删除',
      selectionItems: [
        '点击曲谱上的元素即可选中；选中小节后才能用键盘录入音符。',
        '音符上的部分符号无法在谱面上直接选中，请在右侧音符属性栏中删除。',
        '反复房子（volta）和连音线（slur）可以选中并删除，但需要精准点击到符号本身。',
        '小节、单谱表、复谱表在各自只剩最后一个时不允许删除（对应删除按钮会变灰）。'
      ],
      commonShortcutTitle: '通用快捷键（所有谱种）',
      commonShortcutItems: [
        { keys: ['Esc'], desc: '退出当前选中状态。' },
        { keys: ['Delete', 'Backspace'], desc: '删除当前选中项（音符、小节、谱表、跨音符记号等）。选中小节时 Backspace 只删小节最后一个音符 / 休止符，Delete 才删整个小节。' },
        { keys: ['<', '>'], desc: '选中音符（或小节，取小节最后一个音，不必先点音符）时：> 从当前音连到下一个音，当前音已是某条连音线的起点时改为把它往右扩一个音；< 从上一个音连到当前音，当前音已是某条连音线的终点时改为把它往左扩一个音。跳过休止符。不按 Shift 直接按逗号 / 句号键也行，中文输入法下同样有效。' },
        { keys: ['/'], desc: '删除选中音符（或小节最后一个音）上的所有连音线（以它为起点或终点的）。' },
        { keys: [';', "'"], desc: '选中音符（或小节，取小节最后一个音）时：; 添加前倚音，\' 添加后倚音；默认十六分音符。不按 Shift 直接按分号 / 引号键也行。' },
        { keys: ['L'], desc: '清空选中音符（或小节最后一个音）上的全部前 / 后倚音。' },
        { keys: ['O'], desc: '循环切换主音符 / 休止符时值：六十四分 → 三十二分 → 十六分 → 八分 → 四分 → 二分 → 全音符 → …（例如四分按 O 变成二分）。选中音符或休止符则改该项；选中小节则改最后一个；选中倚音则改其宿主主音。' },
        { keys: ['{', '}'], desc: '选中小节时：{ 循环切换前置小节线（无、反复开始、反向），} 循环切换后置小节线（8 种）。不按 Shift 直接按 [ / ] 键也行。' },
        { keys: ['Ctrl+Z'], desc: '撤销。最多保留约 20 步，离开编辑页后清空。' },
        { keys: ['Ctrl+Y', 'Ctrl+Shift+Z'], desc: '恢复被撤销的操作。' },
        { keys: ['↑', '↓', '←', '→'], desc: '选中小节时，切换到上下左右相邻的小节，方便连续录入。' },
        { keys: ['*'], desc: '在当前单谱表下方添加一个单谱表；未选中时加在最后一个单谱表下方。' },
        { keys: ['-'], desc: '在当前复谱表下方添加一个复谱表；未选中时加在最后一个复谱表下方。' },
        { keys: ['空格'], desc: '选中有音符的小节时，弹出音值组合浮窗：音名不变，换成所选节奏型。在编辑页顶部「音值组合」切换模式（浮窗打开时也可按 Tab）：「按小节」把整小节换掉；「按拍」只把末尾尚未组合的音组成一拍，并在最后一个音上打组合标记，下次从标记之后的新音开始。浮窗里按卡片上的数字 / 字母键（不够时用小键盘）直接选择，方向键 + Enter 或空格选当前卡片，Esc 关闭。鼠标移过卡片不会改当前候选。' },
        { keys: ['P'], desc: '选中小节时，把本小节的音符复制到下一小节（替换下一小节原有音符）并选中下一小节，连按可一路往后复制。行末会跳到下一个复谱表同一行单谱表的第一小节。' },
        { keys: ['Tab'], desc: '在歌词输入框里跳到下一个音的歌词；当前音是连音线的起点时，直接跳到连音线终点之后那个音。' }
      ],
      standardModeTitle: '标准模式',
      standardModeItems: [
        '编辑页右上角「标准模式」开关。开启后，键盘、鼠标、MIDI 录入的音符如果让小节总时值超过拍号，会自动挪到下一小节末尾并选中下一小节，本小节剩下的时值用休止符补满。',
        '音符本身比整个小节还长时提示「音符时值不正确」，不会写入。',
        '下一小节与方向键 → 一致：行末跳到下一个复谱表同一行单谱表的第一小节；没有下一小节时提示并不写入。'
      ],
      commonShortcutNote: '按住 Ctrl / Alt，或正在输入框里打字时，单键快捷键不生效。',
      shortcutTitle: '分谱种快捷键',
      shortcutGroups: {
        number: {
          title: '简谱',
          lead: '简谱用主键盘（字母上方那排）的数字和三排字母直接录音符，所以切换时值要改用右侧小键盘。',
          items: [
            { keys: ['1–7'], desc: '主键盘：在选中小节末尾添加中音 do re mi fa sol la si。时值取工具栏设置，不受工具栏「音符 / 休止符」选项影响。' },
            { keys: ['Q W E R T Y U'], desc: '依次添加高音 1–7（上加一个八度点）。' },
            { keys: ['A S D F G H J'], desc: '依次添加中音 1–7。' },
            { keys: ['Z X C V B N M'], desc: '依次添加低音 1–7（下加一个八度点）。' },
            { keys: ['0', '~', 'I', 'K'], desc: '主键盘：在选中小节末尾添加一个休止符，时值取工具栏设置。I / K 是中排字母空出来的键。' },
            { keys: ['Num 1–8'], desc: '小键盘：切换工具栏时值，1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 一百二十八分。' },
            { keys: ['Num 0'], desc: '小键盘：工具栏在「音符」与「休止符」之间切换（影响鼠标点击添加）。' },
            { keys: ['8', '9'], desc: '主键盘：8 把工具栏八度点减一个，9 加一个（范围 -3 到 +3），影响鼠标点击添加。' },
            { keys: ['MIDI 键盘'], desc: '选中小节后按下琴键，在小节末尾添加对应音高的音符，时值取工具栏设置。' },
            { keys: ['Ctrl+S'], desc: '在「简谱快速录入」抽屉里：按文本刷新预览。' }
          ]
        },
        staff: {
          title: '线谱（五线谱）',
          lead: '线谱和简谱一样，用主键盘的数字和三排字母按唱名录音符（按小节调号首调换算，高音谱号中音为 C4–B4，低音谱号低一个八度）；切换时值改用右侧小键盘。也可以选中小节后在小节内用鼠标点击添加。',
          items: [
            { keys: ['1–7'], desc: '主键盘：在选中小节末尾添加中音 do re mi fa sol la si。时值取工具栏设置，不受工具栏「音符 / 休止符」选项影响。' },
            { keys: ['Q W E R T Y U'], desc: '依次添加高八度的 1–7。' },
            { keys: ['A S D F G H J'], desc: '依次添加中音 1–7。' },
            { keys: ['Z X C V B N M'], desc: '依次添加低八度的 1–7。' },
            { keys: ['0', '~', 'I', 'K'], desc: '主键盘：在选中小节末尾添加一个休止符，时值取工具栏设置。I / K 是中排字母空出来的键。' },
            { keys: ['Num 1–8'], desc: '小键盘：切换工具栏时值，1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 一百二十八分。' },
            { keys: ['Num 0'], desc: '小键盘：工具栏在「音符」与「休止符」之间切换（影响鼠标点击添加）。' },
            { keys: ['MIDI 键盘'], desc: '选中小节后按下琴键，在小节末尾添加对应音高的音符，时值取工具栏设置。' }
          ]
        },
        drum: {
          title: '鼓谱',
          lead: '鼓谱用字母键直接录入：每个字母对应一种合法音符（线位 + 符头），对照工具栏「合法音符一览」卡片上的字母。',
          items: [
            { keys: ['A–T'], desc: '选中小节后，在当前声部末尾添加该字母对应的合法音符（跳过 P，P 是复制到下一小节）。声部、时值、附点取工具栏设置，不受「音符 / 休止符」选项影响；输入法处于中文状态时也能用。' },
            { keys: ['3–8'], desc: '切换工具栏时值，3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 一百二十八分。鼓谱最长为四分音符，所以 1、2 无效。' },
            { keys: ['0'], desc: '工具栏在「音符」与「休止符」之间切换。' },
            { keys: ['MIDI 键盘'], desc: '鼓谱暂不支持 MIDI 键盘录入。' }
          ]
        },
        tab: {
          title: 'TAB 谱（吉他 / 尤克里里 / 贝斯）',
          lead: 'TAB 谱用字母键选品位，鼠标指向弦与位置；键盘也负责切换时值和标准音 / 休止符。',
          items: [
            { keys: ['A–Z'], desc: '依次为 0–24 品（跳过 P，Q 是 15 品）：改工具栏品位，选中小节且鼠标停在小节内时，同时写入鼠标所指的弦与位置。' },
            { keys: ['1–8'], desc: '主键盘或小键盘都可以：切换工具栏时值，1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 一百二十八分。' },
            { keys: ['0'], desc: '工具栏在「标准音」与「休止符」之间切换。' },
            { keys: ['MIDI 键盘'], desc: 'TAB 谱暂不支持 MIDI 键盘录入。' }
          ]
        }
      },
      midiTitle: 'MIDI',
      midiItems: ['midi 导入后只会变成五线谱'],
      tabTitle: 'TAB 谱',
      tabItems: [
        '由于吉他 / 尤克里里 / 贝斯的弹奏技巧太复杂，所以播放功能不是很完善。抱歉。'
      ]
    },
    convertDialog: {
      title: '切换曲谱类型',
      message: '切换后播放信息会尽量保持一致，但谱面样式与部分记谱细节可能丢失。可用 Ctrl+Z 撤销本次切换。'
    },
    transposeDialog: {
      title: '转调',
      message:
        '转调会拿取第一个调号作为当前调，如果您的谱子里使用了多个不同调号，请注意会导致音符音高丢失'
    },
    layoutDialog: {
      title: '布局调整',
      currentPanel: '当前曲谱布局',
      currentPanelHint: '修改后立即写入当前曲谱。「同步为默认」把当前布局写入软件默认。',
      defaultPanel: '默认布局',
      defaultPanelHint: '修改后自动保存，影响之后新建的曲谱与新增谱表。点「应用」可套到当前曲谱。',
      defaultNoPageSizeHint: '总宽度 / 总高度不参与默认布局，新建曲谱仍用模板尺寸。',
      page: '页面',
      pageWidth: '总宽度',
      sLSlotW: '左留白',
      sLSlotWHint: '谱表左侧的空白宽度；打开「显示音色」后，音色名显示在这里。',
      instrumentNameFont: '音色名字体',
      sRSlotW: '右留白',
      sRSlotWHint: '谱表右侧的空白宽度；连音线跨到下一行时，行尾的那一段画在这里。',
      preview: '预览',
      previewUntitled: '未命名曲谱',
      pageHeight: '总高度',
      pageHeightHint: '内容显示不全时调大；只作用于当前曲谱，不参与同步为默认。',
      titleArea: '标题区',
      tSlotH: '高度',
      titleFont: '字体',
      lyricsArea: '歌词',
      lyricsFont: '字体',
      lyricsFontSize: '字号',
      lyricsFontSizeHint: '歌词文字大小，行距跟着按比例变化。歌词画在每个单谱表下方，占用单谱表的下外边距，歌词行多或字号大时请调大下外边距。',
      fontDefault: '系统默认',
      grandStaff: '复谱表边距',
      singleStaff: '单谱表边距',
      uSpace: '上边距',
      dSpace: '下边距',
      uSpaceO: '上外边距',
      uSpaceI: '上内边距',
      dSpaceI: '下内边距',
      dSpaceO: '下外边距',
      apply: '应用',
      setDefault: '同步为默认',
      setDefaultHint: '把当前曲谱的布局（不含页面宽高）同步为新建曲谱的默认布局',
      setDefaultSuccess: '已将当前布局同步为默认',
      applyDefault: '应用默认设置',
      applyDefaultHint: '把默认布局（谱表间距、标题区、左右留白、字体、歌词字号）应用到当前曲谱，页面宽高不变',
      applyDefaultSuccess: '已将默认布局应用到当前曲谱'
    },
    endpointOffset: {
      title: '起止点位置',
      start: '起点',
      end: '终点'
    },
    slurApply: {
      centerControl: '居中控制点',
      title: '应用当前位置到',
      scope: {
        measure: '小节',
        singleStaff: '单谱表',
        grandStaff: '复谱表',
        score: '全谱'
      },
      applied: '已应用到 {n} 条连音线',
      none: '范围内没有其它连音线'
    },
    multiNote: {
      summary: '已框选 {n} 个音符',
      summaryWithRests: '已框选 {notes} 个音符、{rests} 个休止符',
      summaryRests: '已框选 {n} 个休止符',
      restsSkipPitch: '休止符不参与升降音',
      pitch: '音高',
      lower: '降音',
      raise: '升音',
      duration: '时值',
      double: '时值 ×2',
      halve: '时值 ÷2',
      stem: '符干',
      actions: '操作',
      delete: '删除选中项',
      nothingChanged: '没有可升降的音符',
      alreadyLongest: '选中音符已是最大时值',
      alreadyShortest: '选中音符已是最小时值'
    },
    propertyPanel: {
      title: '属性',
      multiNote: '多选音符',
      measure: '小节属性',
      noteHead: '音符属性',
      grace: '倚音属性',
      rest: '休止符属性',
      slur: '连音线属性',
      pitch: '八度记号属性',
      volta: 'Volta 属性',
      bend: '推弦属性',
      bracket: '连谱号属性',
      noteMark: '记号属性',
      measureMark: '小节符号属性',
      trillLine: '颤音线属性',
      pedal: '踏板属性',
      arpeggio: '琶音属性',
      strumming: '扫弦属性',
      preludeBracket: '前奏括号属性',
      hairpin: '渐强 / 渐弱属性',
      guzhengLian: '古筝连续指法属性',
      placeholder: '选中曲谱中的小节、音符、休止符、连音线、记号、八度记号、Volta 或连谱号，这里会显示可编辑属性'
    },
    panelTab: {
      basic: '属性',
      marks: '记号',
      span: '连线'
    },
    panelGroup: {
      rhythm: '节奏',
      pitch: '音高',
      position: '位置',
      structure: '小节操作',
      barline: '小节线',
      front: '小节开头',
      back: '小节结尾',
      repeat: '反复'
    },
    addNote: {
      add: '添加',
      note: '音符',
      rest: '休止符',
      duration: '时值',
      octaveDot: '八度点'
    },
    addTab: {
      fret: '品',
      regionStart: '开始弦 {n}',
      regionEnd: '结束弦 {n}',
      kind: {
        normal: '标准音',
        harmonic: '泛音',
        arpeggio: '琶音',
        strumming: '扫弦',
        rest: '休止符'
      }
    },
    tabNote: {
      chord: '和弦图',
      chordNone: '无',
      technique: '技巧',
      slap: '拍弦',
      bend: '推弦',
      addBend: '添加推弦',
      removeBend: '移除推弦',
      bendType: '推弦类型',
      offset: '位置偏移',
      resetPosition: '重置位置',
      stage: '阶段 {n}',
      stageInterval: '阶段 {n} 音程',
      bendTypes: {
        bend: '推弦',
        bendRelease: '推弦再回来',
        prebend: '预推弦',
        prebendRelease: '预推弦再回来',
        prebendBend: '预推弦再升高'
      },
      slurType: '类型',
      slurTypes: {
        H: '击弦 H',
        S: '滑弦 S',
        P: '勾弦 P',
        HP: '击勾弦 HP'
      }
    },
    drum: {
      voice: '声部',
      voiceUp: '一声部（向上）',
      voiceDown: '二声部（向下）',
      head: '音符头',
      headType: {
        normal: '普通',
        cross: '叉号',
        circledCross: '叉号加圆',
        circledSlash: '斜线加圆',
        triangle: '三角形',
        diamond: '菱形'
      },
      region: '线位（0 底线 · 8 顶线）',
      durationWhole: '时值（整个音符）',
      center: '居中'
    },
    contextMenu: {
      delete: '删除',
      copyNotes: '复制小节音符',
      pasteNotes: '粘贴小节音符',
      clearNotes: '清空音符',
      copyStaff: '复制单谱表',
      pasteStaff: '粘贴单谱表',
      copyGrandStaff: '复制复谱表',
      pasteGrandStaff: '粘贴复谱表',
      setToneColor: '设置音色',
      setVolume: '设置音量',
      longRest: '长休止符',
      cancelLongRest: '取消长休止符',
      copy: '复制',
      paste: '粘贴',
      measure: '小节',
      staff: '单谱表',
      grandStaff: '复谱表',
      addMeasure: '增加小节',
      left: '左',
      right: '右',
      deleteStaffRow: '删除此索引所有单谱表'
    },
    toneColorDialog: {
      title: '设置音色',
      hint: '为该小节所在的单谱表设置音色，当前及之后复谱表中同一行的单谱表会一起设置，之前的复谱表不受影响。播放时音色选择「曲谱设定」会使用这里的音色；打开「显示音色」后，谱表左侧会显示音色名。',
      search: '搜索音色',
      empty: '没有匹配的音色',
      otherFamily: '其他',
      clear: '清除音色',
      confirm: '确定'
    },
    staffVolumeDialog: {
      title: '设置音量',
      hint: '设置该小节所在单谱表的播放音量（百分比，默认 100），所有复谱表中同一行的单谱表会一起设置。',
      reset: '恢复 100',
      confirm: '确定'
    },
    measure: {
      actions: '小节操作',
      insertBefore: '前插小节',
      insertAfter: '后插小节',
      barlineBack: '后置小节线',
      barlineFront: '前置小节线',      clefFront: '前置谱号',
      clefBack: '后置谱号',
      keySignatureFront: '前置调号',
      keySignatureBack: '后置调号',
      timeSignatureFront: '前置拍号',
      timeSignatureBack: '后置拍号',
      fieldClef: '谱号',
      fieldKeySignature: '调号',
      fieldTimeSignature: '拍号',
      startRepeat: '小节前反复',
      endRepeat: '小节后反复',
      volta: '反复房子 (Volta)',
      removeVolta: '移除 Volta',
      barline: {
        single_barline: '单小节线',
        double_barline: '双小节线',
        startRepeat_barline: '反复开始',
        endRepeat_barline: '反复结束',
        dashed_barline: '虚线',
        final_barline: '终止线',
        dotted_barline: '点线',
        reverse_barline: '反小节线',
        heavy_barline: '粗线',
        heavy_double_barline: '粗双线',
        start_end_repeat_barline: '反复起止'
      },
      clef: {
        treble: '高音谱号',
        bass: '低音谱号',
        alto: '中音谱号',
        tenor: '次中音谱号',
        tab: 'TAB 谱号'
      },
      keySignature: {
        C: 'C 大调',
        G: 'G 大调',
        D: 'D 大调',
        A: 'A 大调',
        E: 'E 大调',
        B: 'B 大调',
        F_sharp: 'F♯ 大调',
        C_sharp: 'C♯ 大调',
        F: 'F 大调',
        B_flat: 'B♭ 大调',
        E_flat: 'E♭ 大调',
        A_flat: 'A♭ 大调',
        D_flat: 'D♭ 大调',
        G_flat: 'G♭ 大调',
        C_flat: 'C♭ 大调'
      },
      startRepeatOption: {
        segno: 'Segno',
        coda: 'Coda'
      },
      endRepeatOption: {
        fine: 'Fine',
        DC: 'D.C.',
        DS: 'D.S.',
        to_coda: 'To Coda',
        dc_al_fine: 'D.C. al Fine',
        dc_al_coda: 'D.C. al Coda',
        ds_al_fine: 'D.S. al Fine',
        ds_al_coda: 'D.S. al Coda'
      },
      timeSignature: {
        '2_4': '2/4',
        '3_4': '3/4',
        '4_4': '4/4',
        '5_4': '5/4',
        '6_4': '6/4',
        '3_8': '3/8',
        '4_8': '4/8',
        '5_8': '5/8',
        '6_8': '6/8',
        '7_8': '7/8',
        '9_8': '9/8',
        '12_8': '12/8',
        common: 'C（4/4）',
        cut: '¢（2/2）',
        '2_2': '2/2',
        '3_2': '3/2',
        '4_2': '4/2'
      }
    },
    note: {
      duration: '时值',
      noteClef: '音符前谱号',
      beam: '符杠',
      stemDirection: '符干方向',
      accidental: '变音符号',
      augmentationDot: '附点',
      relativeX: '横向偏移',
      slur: '连音线',
      grace: '倚音',
      graceBefore: '前倚音',
      graceAfter: '后倚音',
      graceBeforeItem: '前倚音 {n}',
      graceAfterItem: '后倚音 {n}',
      addGraceBefore: '添加前倚音',
      addGraceAfter: '添加后倚音',
      slotSymbols: '列级符号',
      arpeggio: '琶音',
      strumming: '扫弦',
      preludeBracketLeft: '前奏括号（左）',
      preludeBracketRight: '前奏括号（右）',
      addArpeggio: '添加琶音',
      addStrumming: '添加扫弦',
      addPreludeBracketLeft: '添加前奏括号（',
      addPreludeBracketRight: '添加前奏括号）',
      pedal: '踏板',
      pitch: '八度记号',
      addPedal: '添加踏板',
      addPitchUp: '添加高八度',
      addPitchDown: '添加低八度',
      syllable: '唱名',
      octaveDotLabel: '八度点',
      addVoiceNote: '添加多声部音符',
      addVoiceNoteAction: '添加到同一位置',
      sameSlotNoteIndex: '自下而上第 {n} 个',
      beamConnection: '减时线连接',
      rhythmGroupEnd: '组合标记',
      durationShort: {
        '256': '全',
        '128': '二分',
        '64': '四分',
        '32': '八分',
        '16': '16分',
        '8': '32分',
        '4': '64分',
        '2': '128分'
      },
      augmentationDotShort: {
        '0': '无',
        '1': '·',
        '2': '··',
        '3': '···'
      },
      durationValue: {
        '256': '全音符',
        '128': '二分音符',
        '64': '四分音符',
        '32': '八分音符',
        '16': '十六分音符',
        '8': '三十二分音符',
        '4': '六十四分音符',
        '2': '一百二十八分音符'
      },
      restDurationValue: {
        '256': '全休止符',
        '128': '二分休止符',
        '64': '四分休止符',
        '32': '八分休止符',
        '16': '十六分休止符',
        '8': '三十二分休止符',
        '4': '六十四分休止符',
        '2': '一百二十八分休止符'
      },
      beamType: {
        Combined: '全连',
        OnlyRight: '右连',
        None: '无'
      },
      stem: {
        up: '向上',
        down: '向下'
      },
      accidentalType: {
        Sharp: '升号 ♯',
        Flat: '降号 ♭',
        double_sharp: '重升 𝄪',
        double_flat: '重降 𝄫',
        natural: '还原 ♮'
      },
      augmentationDotCount: {
        '0': '无',
        '1': '单附点',
        '2': '双附点',
        '3': '三附点'
      },
      syllableOption: {
        '1': '1 (do)',
        '2': '2 (re)',
        '3': '3 (mi)',
        '4': '4 (fa)',
        '5': '5 (sol)',
        '6': '6 (la)',
        '7': '7 (si)',
        X: '节奏 X'
      },
      octaveDotOption: {
        '-3': '低三个八度',
        '-2': '低两个八度',
        '-1': '低一个八度',
        '0': '无',
        '1': '高一个八度',
        '2': '高两个八度',
        '3': '高三个八度'
      }
    },
    slur: {
      thickness: '线宽',
      style: '造型',
      styleValue: {
        default: '默认',
        rounded: '圆润',
        sharp: '尖锐'
      },
      notes: '起止音',
      startNote: '起点音',
      endNote: '终点音',
      tailAnchor: '尾部锚点',
      moveEarlier: '尾部前移',
      moveLater: '尾部后移'
    },
    volta: {
      text: '文案',
      textPlaceholder: '如 1.',
      value: '反复值',
      span: '覆盖范围',
      expandLeft: '左扩',
      expandRight: '右扩',
      shrinkLeft: '左缩',
      shrinkRight: '右缩',
      resetAlignment: '重置对齐',
      closure: '开闭样式',
      closeLeft: '左闭合',
      closeRight: '右闭合',
      valueEditor: {
        keepOne: '至少保留一项',
        add: '添加',
        hint: '表示第几遍播放时经过（从 1 起）'
      }
    },
    bracket: {
      type: '连谱号类型',
      applyToAll: '应用到全部行',
      appliedToAll: '连谱号已应用到全部行',
      typeOption: {
        Bracket: '标准连谱号',
        Brace: '花括号',
        Square: '方括号'
      }
    },
    pitch: {
      type: '八度'
    },
    arpeggio: {
      style: '样式',
      type: '造型',
      typeNormal: '波浪线',
      typeStraight: '直线',
      arrow: '箭头',
      resetPosition: '重置位置',
      dragHint: '选中后拖动上下把手调整长度，拖动中间左右平移'
    },
    customSymbol: {
      title: '自定义符号',
      add: '新建自定义符号',
      manage: '管理',
      edit: '编辑',
      export: '导出配置',
      exportTitle: '导出自定义符号配置',
      exported: '已导出配置',
      import: '导入配置',
      importTitle: '导入自定义符号配置',
      imported: '已导入 {count} 个符号',
      importInvalid: '配置文件无效或没有可用符号',
      empty: '还没有自定义符号，点击 + 上传 SVG 创建',
      hint: '点击符号添加到当前选中项，再次点击移除',
      createTitle: '新建自定义符号',
      editTitle: '编辑自定义符号',
      managerTitle: '自定义符号管理',
      managerHint: '删除或修改符号库里的符号，不影响已添加到其他曲谱的符号；修改后当前曲谱里的同一符号会同步更新。可用「导出 / 导入配置」在设备间备份符号库。',
      emptyList: '暂无自定义符号',
      kind: {
        note: '音符符号',
        measure: '小节符号',
        slot: 'Slot 符号'
      },
      svg: 'SVG',
      upload: '上传 SVG',
      reupload: '重新上传',
      svgInvalid: 'SVG 无法解析或没有尺寸',
      svgRequired: '请先上传 SVG',
      name: '名称',
      namePlaceholder: '符号名称',
      nameRequired: '请填写名称',
      size: '尺寸',
      keepRatio: '锁定比例',
      sizeHint: '宽 × 高，单位像素；标准小节高 45',
      sizeInvalid: '宽高必须大于 0',
      position: '位置',
      positionOptions: {
        upper: '小节上方',
        lower: '小节下方'
      },
      placement: '横向锚点',
      placementOptions: {
        start: '小节左边',
        center: '小节中点',
        end: '小节右边'
      },
      align: '对齐',
      alignOptions: {
        left: '左边贴锚点',
        center: '居中',
        right: '右边贴锚点'
      },
      vertical: '纵向偏移（1=小节高）',
      horizontal: '横向偏移（1=小节高）',
      offsetHint: {
        note: '偏移量 1 = 一个小节的高度（约 45 像素），相对音符头中心；纵向负值在上方、正值在下方',
        measure: '偏移量 1 = 一个小节的高度（约 45 像素）；纵向为离开小节的距离，横向正值向右',
        slot: '偏移量 1 = 一个小节的高度（约 45 像素），相对音符列起点与小节底'
      },
      anchor: '简谱锚点',
      anchorAuto: '自动（按纵向偏移）',
      anchorOptions: {
        top: '数字上边',
        bottom: '数字下边',
        left: '数字左边',
        right: '数字右边'
      },
      anchorHint: '只对简谱生效：相对数字及八度点 / 减时线的外框定位',
      previewHint: '示意预览，实际位置以曲谱为准',
      dragHint: '拖动虚线框右侧的移动按钮可微调位置，按 Delete 删除',
      missing: '曲谱里找不到该符号的定义',
      created: '已加入符号库',
      saved: '已保存',
      deleted: '已删除',
      deleteConfirm: '删除「{name}」？已添加到曲谱里的该符号不受影响。'
    },
    preludeBracket: {
      hint: '前奏括号挂在当前音符列两侧（左括号靠左、右括号靠右）。可在属性栏删除。'
    },
    noteMark: {
      category: {
        articulation: '奏法',
        technique: '技巧 / 弓法',
        ornament: '装饰音',
        dynamic: '力度',
        guzheng: '古筝指法',
        guzhengTechnique: '古筝技法'
      },
      exclusive: '单选',
      dragHint: '点击切换记号；选中曲谱上的记号后，拖动右侧的移动按钮可微调位置',
      current: '当前记号',
      replaceWith: '替换为',
      offset: '位置偏移',
      resetOffset: '重置位置',
      name: {
        acccent_above: '重音',
        staccato_above: '断奏（跳音）',
        staccatissimo_above: '短断奏',
        tenuto_above: '保持音',
        loure_above: '次断奏',
        marcato_above: '强重音',
        accent_staccato_above: '重音 + 断奏',
        marcato_staccato_above: '强重音 + 断奏',
        marcato_tenuto_above: '强重音 + 保持音',
        staccatissimo_stroke_above: '短断奏（竖线）',
        staccatissimo_wedge_above: '短断奏（楔形）',
        stress_above: '强调',
        tenuto_accent_above: '保持音 + 重音',
        unstress_above: '弱化',
        open: '开放音',
        muted: '闷音',
        harmonic: '泛音',
        up_bow: '上弓',
        down_bow: '下弓',
        breath: '换气',
        turn: '回音',
        invertedTurn: '逆回音',
        trill: '颤音 tr',
        shortTrill: '短颤音（顺波音）',
        mordent: '波音（逆波音）',
        ppp: 'ppp 最弱',
        pp: 'pp 很弱',
        p: 'p 弱',
        mp: 'mp 中弱',
        mf: 'mf 中强',
        f: 'f 强',
        ff: 'ff 很强',
        fff: 'fff 最强',
        fp: 'fp 强后即弱',
        pf: 'pf 弱后即强',
        sf: 'sf 突强',
        sfz: 'sfz 突强',
        sff: 'sff 突很强',
        sffz: 'sffz 突很强',
        sfp: 'sfp 突强后弱',
        rfz: 'rfz 加强',
        rf: 'rf 加强',
        fz: 'fz 突强',
        guzheng_mo: '抹',
        guzheng_tiao: '挑',
        guzheng_gou: '勾',
        guzheng_ti1: '剔',
        guzheng_pi: '劈',
        guzheng_tuo: '托',
        guzheng_da: '打',
        guzheng_zhai: '摘',
        guzheng_ti2: '提',
        guzheng_bo: '拨',
        guzheng_xiao_cuo: '小撮',
        guzheng_da_cuo: '大撮',
        guzheng_sao: '扫',
        guzheng_yao: '摇指'
      }
    },
    spanSymbol: {
      slurEnd: '连音线终点',
      coverage: '覆盖范围',
      expandLeft: '左扩',
      expandRight: '右扩',
      shrinkLeft: '左缩',
      shrinkRight: '右缩',
      resetAlignment: '重置对齐',
      add: '添加跨音符记号',
      span: '跨度',
      spanValue: '{n} 个',
      spanHint: '跨度为从当前音符起向右覆盖的音符数；连音线至少 2 个',
      slotSymbolHint: '琶音只作用于当前音符所在的这一列，每列最多一个',
      notEnoughNotes: '后面的音符不够，无法按当前跨度添加（只在当前小节和下一小节内查找），请减小跨度或先补充音符',
      existing: '从此音符开始',
      empty: '暂无',
      pitchUp: '高八度 8va',
      pitchDown: '低八度 8vb',
      trill: '颤音线',
      crescendo: '渐强',
      diminuendo: '渐弱',
      guzhengLian: '古筝连续指法'
    },
    line: {
      trillType: '起始符号',
      trillTypeOption: {
        trill: 'tr',
        upprall: '上行颤音',
        downprall: '下行颤音',
        prallprall: '长颤音'
      },
      hairpinStyle: '样式',
      hairpinType: {
        crescendo_hairpin: '渐强（楔形）',
        diminuendo_hairpin: '渐弱（楔形）',
        crescendo_line: '渐强（cresc.）',
        diminuendo_line: '渐弱（dim.）'
      },
      height: '开口高度',
      guzhengLianType: '指法',
      guzhengLianTypeOption: {
        tuo: '连托',
        pi: '连劈',
        mo: '连抹',
        tiao: '连挑',
        gou: '连勾',
        ti: '连剔',
        da: '连打',
        zhai: '连摘'
      },
      dragHint: '拖动两端调整起止位置，拖动中间上下移动'
    },
    staff: {
      grandStaff: '复谱表'
    },
    titleFields: {
      title: '标题',
      subTitle: '副标题',
      author: '作者'
    },
    timeOffset: {
      title: '谱音同步',
      timeProp: '时间属性',
      vocalPerformance: '范唱',
      accompaniment: '伴奏',
      pxPerSecond: 'px/s',
      sampleRate: '采样率',
      selectAudio: '选择音频',
      bindVocal: '绑定范唱',
      bindAccompaniment: '绑定伴奏',
      audioPlaceholder: '从我的音频中选择'
    },
    pianoRecord: {
      title: '钢琴录入',
      needMidi: '钢琴录入需要连接 MIDI 键盘，请连接后再试',
      midiUnsupported: '当前环境不支持 MIDI',
      device: 'MIDI 设备',
      noDevice: '未连接',
      bpm: '速度',
      timeSignature: '拍号',
      start: '开始录制',
      stop: '结束录制',
      restart: '重新录制',
      syncToScore: '同步到曲谱',
      metronomeDuringRecord: '录制中开启节拍器',
      metronomeVolume: '节拍器音量',
      tolerance: '录制设置',
      beatSnap: '拍点吸附（拍）',
      beatSnapHint:
        '起音离拍点在这个范围内，直接落在拍上。当前速度下晚按 {ms} 毫秒以内都算在拍上；不超过 0.25 时，真正的拍后十六分音符不会被吸走。设为 0 关闭。',
      minRest: '最短休止',
      minRestOptions: {
        0: '不合并（每个空档都写休止）',
        16: '十六分音符',
        32: '八分音符（默认）',
        64: '四分音符'
      },
      minRestHint:
        '同一只手两个音之间的空档比这个短，就并进前一个音，不写休止。代价是想写短休止时，要停够这个长度。',
      latencyMs: '延迟补偿（毫秒）',
      latencyMsHint:
        '所有按键时间先减去这个值，适合整体固定偏晚的情况（比如节拍器有输出延迟）。不要设得太大，否则提前松键的空档被拉大，反而多出休止。',
      toleranceReset: '恢复默认',
      idleHint: '点击「开始录制」后先响一小节预备拍，预备拍结束即开始计时，跟着节拍弹奏 MIDI 键盘。系统会自动分配左右手：右手写在高音谱表，左手写在低音谱表。',
      countInHint: '预备拍… 听完这一小节再开始弹奏。',
      recordingHint: '录制中… 按速度量化到十六分音符，弹完点击「结束录制」。',
      doneHint: '录制完成，共 {count} 个音符组。点击「同步到曲谱」用录制结果替换当前曲谱。',
      emptyHint: '没有录到音符，请重新录制。',
      syncConfirmTitle: '同步到曲谱',
      syncConfirmMessage: '将用钢琴录入的结果覆盖当前曲谱的全部内容（高音谱表 + 低音谱表）。确定继续吗？',
      synced: '已同步到曲谱',
      syncFailed: '同步失败'
    },
    quickInput: {
      title: '简谱快速录入',
      scoreToText: '曲谱转换文本',
      updatePreview: '更新预览',
      syncToScore: '同步预览到曲谱',
      rules: '规则须知',
      textTitle: '文本',
      previewTitle: '预览',
      warningsTitle: '提示（{count}）',
      textPlaceholder: '在此输入简谱文本，按 Ctrl+S 或点击「更新预览」查看效果；写法见「规则须知」',
      textFromScore: '已将当前曲谱转换为文本',
      scoreToTextFailed: '曲谱转换文本失败',
      syncConfirmTitle: '同步预览到曲谱',
      syncConfirmMessage:
        '文本录入规则无法解析所有符号（如变音记号、歌词等），同步后当前曲谱中的这部分信息可能会丢失。确定用预览覆盖当前曲谱吗？',
      synced: '已同步到曲谱',
      syncFailed: '同步失败',
      rulesTitle: '快速录入规则',
      ruleSections: [
        {
          title: '结构',
          items: [
            { syntax: '一行', desc: '一行文本对应一个单谱表' },
            { syntax: '空行', desc: '连续的非空行组成一个复谱表，空行开始新的复谱表' },
            { syntax: '空格', desc: '音符之间用空格分隔' }
          ]
        },
        {
          title: '音符',
          items: [
            { syntax: '1 ~ 7', desc: '唱名 do ~ si' },
            { syntax: '0', desc: '休止符' },
            { syntax: 'X', desc: '节奏音（无音高）' },
            { syntax: '.5', desc: '数字前加点：高八度，点越多越高' },
            { syntax: '5.', desc: '数字后加点：低八度，点越多越低' }
          ]
        },
        {
          title: '时值',
          items: [
            { syntax: '5/', desc: '每个 / 是一条减时线，时值减半：5/ 八分音符，5// 十六分音符' },
            { syntax: '5-', desc: '加时线：5- 二分音符，5-- 附点二分音符，5--- 全音符' },
            { syntax: '5,', desc: '附点，可写多个' },
            { syntax: '- 与 /', desc: '不能同时使用；小节时值与拍号不符时会给出提示' }
          ]
        },
        {
          title: '组合',
          items: [
            { syntax: '5(1)', desc: '紧贴在音符后的 () 为同位叠音，可连写多个' },
            { syntax: '[3]5  5[3]', desc: '[] 写在音符前为前倚音，写在音符后为后倚音；倚音内可加 / 和八度点' },
            { syntax: '<5  >3', desc: '< 标记连音线起点，> 标记终点，都写在音符前' }
          ]
        },
        {
          title: '小节线',
          items: [
            { syntax: '|', desc: '小节线，写在小节末尾；每个用空格隔开的 | 都会结束一个小节' },
            { syntax: '| |', desc: '| 前面没有音符就是一个空小节，这里是 2 个空小节；1 | | | | 是 4 个小节' },
            { syntax: '行首 |', desc: '不支持前置小节线：行首的 | 也会生成一个空小节，一行请直接从音符开始写' },
            { syntax: '|1|2', desc: '紧贴连写的小节线只算一个，后者覆盖前者' },
            {
              syntax: '|N',
              desc: '指定小节线类型：|1 反复开始、|2 反复结束、|3 终止线、|4 前后反复、|5 双小节线、|6 虚线、|7 点线、|8 反向终止线、|9 粗线、|10 双粗线'
            }
          ]
        },
        {
          title: '其他',
          items: [
            { syntax: '元信息', desc: '标题、调号、拍号、速度沿用当前曲谱' },
            { syntax: '不支持', desc: '变音记号、前置小节线、歌词等无法用文本表示，转换时会忽略并在提示中列出' }
          ]
        }
      ],
      ruleExampleTitle: '示例',
      ruleExample: [
        '5. 4. <7. >6. .5(.6) | .7 .5 .5/ 5- |4',
        '',
        '[1/2/]3 3/ 2/ <1, >2/ | 3(5) 0 .1- |2',
        '1 1 5. 5. | 6.(1) 6. 5.- |2'
      ]
    },
    scoreImageDialog: {
      title: '图片转谱',
      noticeTitle: '仅支持识别简谱',
      noticeItems: [
        '只能识别简谱（数字谱），五线谱、吉他谱、鼓谱等无法识别',
        '多页曲谱请按页码顺序排列图片，生成时按列表顺序把各页的谱行拼接成一份完整曲谱',
        '图片尽量清晰、端正，数字不要太小；标题、歌词等文字不会被识别',
        '生成的曲谱会覆盖当前曲谱，可按 Ctrl+Z 撤销'
      ],
      dropHint: '点击选择或拖入简谱图片（可多选）',
      formats: '支持 PNG / JPG / WebP / BMP',
      count: '共 {n} 张，按顺序拼接',
      add: '添加',
      sortByName: '按文件名排序',
      clear: '清空',
      moveUp: '上移',
      moveDown: '下移',
      remove: '移除',
      statusPending: '等待识别',
      statusRunning: '识别中…',
      itemSummary: '{rows} 行 · {measures} 小节 · {key} · {time}',
      keyInherited: '{key}（沿用上一页）',
      keyAssumed: '{key}（未识别到调号）',
      warnings: '{n} 条提示',
      errorBadImage: '无法读取图片',
      errorNoNotation: '没有找到简谱',
      errorInternal: '识别出错',
      unsupportedSkipped: '已跳过 {n} 个不支持的文件',
      progressRecognizing: '正在识别第 {current} / {total} 张：{name}',
      progressMerging: '正在拼接曲谱…',
      failedHint: '有 {n} 张图片识别失败，可替换或移除后重试',
      skipFailed: '跳过失败的，用其余 {n} 张生成',
      generate: '开始生成',
      retry: '重试失败的图片',
      stop: '停止',
      generateFailed: '生成曲谱失败'
    },
    messages: {
      notationTypeSwitched: '曲谱类型已切换',
      notationTypeSwitchFailed: '曲谱类型切换失败',
      transposed: '已转调',
      transposeFailed: '转调失败',
      transposeSameKey: '目标调与当前调相同',
      semitoneRaised: '已升高半音',
      semitoneLowered: '已降低半音',
      semitoneShiftFailed: '升降调失败',
      importSuccess: '已导入 {fileName}',
      importFailed: '导入失败',
      importMusicXmlFailed: 'MusicXML 导入失败',
      importMidiFailed: 'MIDI 导入失败',
      importMidiWarnings: 'MIDI 部分内容未能保留：{detail}',
      scoreImageGenerated: '已由 {pages} 张图片生成曲谱',
      scoreImageGeneratedWithWarnings:
        '已由 {pages} 张图片生成曲谱，有 {n} 条识别提示（如小节时值与拍号不符），请核对曲谱',
      exportSuccess: '导出成功',
      exportFailed: '导出失败',
      exportMusicXmlFailed: 'MusicXML 导出失败',
      exportMidiFailed: 'MIDI 导出失败',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      scoreLoadFailed: '曲谱加载失败'
    }
  }
} as const
