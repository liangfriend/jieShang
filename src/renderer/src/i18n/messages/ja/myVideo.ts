export default {
  myVideo: {
    title: 'マイ動画',
    searchPlaceholder: '動画名で検索',
    empty: '動画がまだありません。右上から追加しましょう～',
    emptyFiltered: '一致する動画が見つかりません',
    add: '動画を追加',
    uploading: 'アップロード中…',
    uploadSuccess: '{n} 件の動画を追加しました',
    uploadFailed: 'アップロードに失敗しました',
    play: '再生',
    pause: '一時停止',
    stop: '停止',
    seek: '再生位置を変更',
    deleteTitle: '動画を削除',
    deleteMessage: 'この動画を削除してもよろしいですか？',
    deleteWarning: 'この操作は元に戻せません。',
    deleteSuccess: '動画を削除しました',
    deleteAria: '動画を削除',
    detail: {
      title: '動画の詳細',
      duration: '長さ',
      dimensions: '解像度',
      dimensionsValue: '{w} × {h}',
      size: 'ファイルサイズ',
      format: '形式',
      createdAt: '追加日時',
      probeFailed: '動画情報を解析できません',
      playFailed: '動画の読み込みに失敗したため、再生できません'
    }
  }
} as const
