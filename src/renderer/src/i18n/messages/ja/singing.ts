export default {
  singing: {
    toolbar: {
      start: '検出開始',
      stop: '停止'
    },
    meta: {
      bpm: 'BPM',
      notes: '音符',
      detecting: '検出中',
      countdown: '準備中',
      currentOffset: '現在のオフセット'
    },
    offset: {
      initial: '初期ピッチオフセット',
      semitone: '半音',
      hint: '保存すると、次回の歌唱はこのオフセットから始まります'
    },
    waterfall: {
      reference: '基準音',
      sung: '歌唱済み',
      livePitch: 'リアルタイムピッチ'
    },
    result: {
      title: '歌唱評価の結果',
      subtitle: '音程・リズム・完成度から総合評価',
      pitch: '音程',
      rhythm: 'リズム',
      completeness: '完成度',
      ok: 'OK',
      gradeS: '素晴らしい！',
      gradeA: 'とても良い',
      gradeB: 'いい感じ',
      gradeC: 'もう少し頑張ろう',
      gradeD: 'もう一度挑戦'
    },
    messages: {
      noSequence: '評価できる音符列がありません',
      notationTypeSwitchFailed: '楽譜タイプの切り替えに失敗しました',
      audioMissing: '再生できる模範歌唱または伴奏のオーディオが見つかりません',
      offsetSaved: 'ピッチオフセットを保存しました'
    }
  }
} as const
