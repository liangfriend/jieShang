export default {
  myAudio: {
    title: 'マイオーディオ',
    searchPlaceholder: 'オーディオ名で検索',
    empty: 'オーディオがまだありません。右上から追加しましょう～',
    emptyFiltered: '一致するオーディオが見つかりません',
    add: 'オーディオを追加',
    uploading: 'アップロード中…',
    uploadSuccess: '{n} 件のオーディオを追加しました',
    uploadFailed: 'アップロードに失敗しました',
    play: '再生',
    pause: '一時停止',
    stop: '停止',
    seek: '再生位置を変更',
    deleteTitle: 'オーディオを削除',
    deleteMessage: 'このオーディオを削除してもよろしいですか？',
    deleteWarning: 'この操作は元に戻せません。',
    deleteSuccess: 'オーディオを削除しました',
    deleteAria: 'オーディオを削除',
    detail: {
      title: 'オーディオの詳細',
      duration: '長さ',
      sampleRate: 'サンプルレート',
      sampleRateValue: '{hz} Hz',
      channels: 'チャンネル',
      channelsValue: '{n} チャンネル',
      size: 'ファイルサイズ',
      format: '形式',
      createdAt: '追加日時',
      probeFailed: 'オーディオのメタデータを解析できません（非対応のコーデックの可能性があります）'
    }
  }
} as const
