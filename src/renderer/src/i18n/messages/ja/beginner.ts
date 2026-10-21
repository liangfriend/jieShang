export default {
  beginner: {
    toolbar: {
      settings: '設定',
      startPractice: '練習開始',
      stop: '停止',
      volume: '音量',
      hideScore: '楽譜を隠す',
      showScore: '楽譜を表示'
    },
    settings: {
      title: '初心者モード設定',
      desc: '自分のペースでカラフルな MIDI ブロックを演奏しよう',
      display: '表示',
      coverMidiBox: 'MIDI ブロックを隠す',
      coverMidiBoxHint: 'かわいい背景でカラフルなブロックを隠し、耳だけで練習します',
      metronome: 'メトロノーム',
      sound: 'サウンド',
      pianoVolume: '仮想ピアノの音量',
      pianoVolumeHint: '押した鍵盤の音です。ツールバーの「音量」と同じ設定です',
      metronomeVolume: 'メトロノームの音量',
      bpm: 'BPM',
      metronomeDuringPlay: '練習中にメトロノームを鳴らす',
      staffSelection: '声部の選択',
      staffSelectionHint: 'オフにした譜表は透明になります',
      singleStaff: '譜表 {n}',
      noSingleStaff: 'この楽譜には単一の譜表がありません'
    },
    coverText: '強者の目隠し',
    messages: {
      notationTypeSwitchFailed: '楽譜タイプの切り替えに失敗しました',
      noPracticeableNotes: 'この楽譜には練習できる音符がありません'
    }
  }
} as const
