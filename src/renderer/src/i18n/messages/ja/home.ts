export default {
  home: {
    brand: {
      title: '解熵',
      subtitle: 'あなたの音楽の夢を応援',
      logoAlt: '解熵'
    },
    gameModes: {
      arcade: {
        title: 'アーケードモード',
        desc: '60 秒の制限時間でハイスコアを狙え'
      },
      endless: {
        title: 'エンドレスモード',
        desc: 'ライフは 3 つ。どこまで耐えられる？'
      },
      extreme: {
        title: 'エクストリームモード',
        desc: '1 音も逃さず、生き残りに挑戦'
      }
    },
    actions: {
      collection: 'コレクション',
      scores: 'マイ楽譜',
      whiteboard: '授業用ホワイトボード',
      achievements: '実績',
      myWorks: 'マイ作品',
      chordManage: 'コード管理',
      abilityTest: '能力テスト',
      myAudio: 'マイオーディオ',
      myImage: 'マイ画像',
      myVideo: 'マイ動画',
      instrumentSim: '楽器シミュレーター',
      tools: 'ツール'
    },
    midi: {
      connected: 'MIDI キーボード接続済み',
      disconnected: 'MIDI キーボード未接続'
    },
    settingsAria: '設定',
    community: '解熵 交流QQグループ 202732106'
  },
  scores: {
    title: 'マイ楽譜',
    create: '新規楽譜',
    searchPlaceholder: '楽譜名で検索',
    empty: 'まだ楽譜がありません。右上から新規作成しましょう～',
    emptyFiltered: '一致する楽譜が見つかりません',
    deleteTitle: '楽譜を削除',
    deleteMessage: 'この楽譜を削除してもよろしいですか？',
    deleteWarning: 'この操作は元に戻せません。',
    deleteSuccess: '楽譜を削除しました',
    deleteAria: '楽譜を削除',
    clSheetBadge: '弾き語り',
    templateDialog: {
      title: 'テンプレートを選択',
      desc: 'テンプレートを選ぶと楽譜の編集を始められます',
      staff: '五線譜',
      jianpu: '数字譜',
      tab: 'TAB譜',
      empty: '空白',
      single: '単声部',
      double: '二声部',
      guitar: 'ギター譜',
      ukulele: 'ウクレレ譜',
      bass4: '4弦ベース譜',
      bass5: '5弦ベース譜',
      bass6: '6弦ベース譜',
      drum: 'ドラム譜',
      drumKit: 'ドラムセット譜',
      clSheet: 'コード弾き語り譜'
    }
  }
} as const
