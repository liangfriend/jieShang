export default {
  editor: {
    toolbar: {
      playMode: '播放模式',
      linkedStaffMode: '连谱模式',
      notice: '须知',
      importMusicXml: '导入 musicxml',
      exportMusicXml: '导出 musicxml',
      importSj: '导入 sj',
      exportSj: '导出 sj',
      save: '保存',
      notationType: '曲谱类型'
    },
    noticeDialog: {
      title: '编辑须知',
      selectionTitle: '选中与删除',
      selectionItems: [
        '点击曲谱上的元素即可选中；按 Esc 可退出选中状态。',
        '选中后按 Delete 或 Backspace 可删除当前选中项。',
        '音符上的部分符号无法在谱面上直接选中，请在右侧音符属性栏中删除。',
        '反复房子（volta）和连音线（slur）可以选中并删除，但需要精准点击到符号本身。',
        '小节、单谱表、复谱表在各自只剩最后一个时不允许删除（对应删除按钮会变灰）。'
      ],
      importTitle: 'MusicXML 导入为谱子',
      importLead:
        '由于 musicxml 文件内容丰富，本人没办法一次性完全解析。以下是当前支持的符号内容：',
      importItems: ['小节谱号、调号、拍号', '音符、休止符、变音符号', '小节线、反复房子记号、连音线'],
      exportTitle: '谱子导出为 musicxml',
      exportItems: ['小节谱号、调号、拍号', '音符、休止符、变音符号', '小节线、反复房子记号、连音线']
    },
    convertDialog: {
      title: '切换曲谱类型',
      message: '切换后播放信息会尽量保持一致，但谱面样式与部分记谱细节可能丢失，且此操作不可撤销。'
    },
    propertyPanel: {
      title: '属性',
      measure: '小节属性',
      noteHead: '音符属性',
      rest: '休止符属性',
      slur: '连音线属性',
      volta: 'Volta 属性',
      placeholder: '选中曲谱中的小节、音符、休止符、连音线或 Volta，这里会显示可编辑属性'
    },
    addNote: {
      add: '添加',
      note: '音符',
      rest: '休止符',
      duration: '时值'
    },
    measure: {
      actions: '小节操作',
      insertBefore: '前插小节',
      insertAfter: '后插小节',
      barlineBack: '后置小节线',
      barlineFront: '前置小节线',
      clefFront: '前置谱号',
      clefBack: '后置谱号',
      keySignatureFront: '前置调号',
      keySignatureBack: '后置调号',
      timeSignatureFront: '前置拍号',
      timeSignatureBack: '后置拍号',
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
        tenor: '次中音谱号'
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
      syllable: '唱名',
      octaveDotLabel: '八度点',
      beamConnection: '减时线连接',
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
        '-2': '低两个八度',
        '-1': '低一个八度',
        '0': '无',
        '1': '高一个八度',
        '2': '高两个八度'
      }
    },
    slur: {
      thickness: '线宽',
      tailAnchor: '尾部锚点',
      moveEarlier: '尾部前移',
      moveLater: '尾部后移'
    },
    volta: {
      text: '文案',
      textPlaceholder: '如 1.',
      value: '反复值',
      valueEditor: {
        keepOne: '至少保留一项',
        add: '添加',
        hint: '表示第几遍播放时经过（从 1 起）'
      }
    },
    staff: {
      grandStaff: '复谱表'
    },
    titleFields: {
      title: '标题',
      subTitle: '副标题',
      author: '作者'
    },
    messages: {
      notationTypeSwitched: '曲谱类型已切换',
      notationTypeSwitchFailed: '曲谱类型切换失败',
      importSuccess: '已导入 {fileName}',
      importFailed: '导入失败',
      importMusicXmlFailed: 'MusicXML 导入失败',
      exportSuccess: '导出成功',
      exportFailed: '导出失败',
      exportMusicXmlFailed: 'MusicXML 导出失败',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      scoreLoadFailed: '曲谱加载失败'
    }
  }
} as const
