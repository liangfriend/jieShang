export default {
  play: {
    toolbar: {
      editMode: '編集モード',
      play: '再生',
      pause: '一時停止',
      stop: '停止',
      volume: '音量',
      bpm: 'BPM',
      practiceMode: '練習モード',
      beginnerMode: '初心者モード',
      singingMode: '歌唱モード',
      notationType: '楽譜タイプ',
      sourceScore: '楽譜',
      sourceVocal: '模範歌唱',
      sourceAccompaniment: '伴奏'
    },
    range: {
      title: '区間',
      tooltip: '音符をクリックして開始と終了を選び、その区間だけ再生します',
      pickStart: '音符をクリックして開始位置を設定',
      pickEnd: 'もう一つ音符をクリックして終了位置を設定',
      ready: '「再生」で区間を再生します。音符をクリックすると開始位置を再設定します',
      clear: '区間をクリア',
      end: '区間選択を終了',
      incomplete: '先に開始と終了の音符を選んでください'
    },
    messages: {
      notationTypeSwitchFailed: '楽譜タイプの切り替えに失敗しました',
      noPlayableContent: 'この楽譜には再生できる内容がありません',
      rangeNoPlayableContent: '選択区間に再生できる音符がありません',
      grandStaffMismatch: 'すべての大譜表で単一譜表の段数を揃える必要があるため、練習／初心者モードに入れません',
      tabModeUnavailable: 'ギター譜／ウクレレ譜は、練習・初心者・歌唱モードに未対応です',
      playOnlyModeUnavailable:
        'ギター譜／ウクレレ譜／ベース譜／ドラム譜は、練習・初心者・歌唱モードに未対応です',
      boundAudioMissing: '関連付けられたオーディオが見つかりません',
      audioLoadFailed: 'オーディオの読み込みに失敗しました',
      vocalTimeOffsetMissing:
        'この楽譜には模範歌唱の譜面同期タイミングがまだありません。編集モードの「譜面・音声同期」でプロパティを「模範歌唱」に切り替えてから合わせてください。',
      accompanimentTimeOffsetMissing:
        'この楽譜には伴奏の譜面同期タイミングがまだありません。編集モードの「譜面・音声同期」でプロパティを「伴奏」に切り替えてから合わせてください。'
    },
    mark: {
      label: 'マーク',
      none: 'なし',
      xiaoGroup: '8孔簫',
      fluteGroup: '6孔笛子',
      xiaoKey: '{key}調の簫',
      fluteKey: '{key}調の笛子',
      fluteLowG: '低いG',
      fluteHighG: '高いG'
    },
    toneColor: {
      label: '音色',
      loadFailed: '音色の読み込みに失敗しました',
      switchFailed: '音色の切り替えに失敗しました',
      notFound: '音色が存在しません',
      unavailable: '音色を使用できません',
      defaultLoadFailed: 'デフォルト音色の読み込みに失敗しました',
      scoreSetting: '楽譜の設定',
      loading: '音色を読み込み中…'
    },
    devToneCache: {
      title: 'キャッシュ済み音色（{count}）',
      collapse: '折りたたむ',
      expand: '展開',
      clear: 'すべての音色をクリア',
      empty: 'キャッシュ済みの音色はありません'
    }
  }
} as const
