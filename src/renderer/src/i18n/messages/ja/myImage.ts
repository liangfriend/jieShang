export default {
  myImage: {
    title: 'マイ画像',
    searchPlaceholder: '画像名で検索',
    empty: '画像がまだありません。右上から追加しましょう～',
    emptyFiltered: '一致する画像が見つかりません',
    add: '画像を追加',
    uploading: 'アップロード中…',
    uploadSuccess: '{n} 枚の画像を追加しました',
    uploadFailed: 'アップロードに失敗しました',
    deleteTitle: '画像を削除',
    deleteMessage: 'この画像を削除してもよろしいですか？',
    deleteWarning: 'この操作は元に戻せません。',
    deleteSuccess: '画像を削除しました',
    deleteAria: '画像を削除',
    detail: {
      title: '画像の詳細',
      dimensions: 'サイズ',
      dimensionsValue: '{w} × {h}',
      size: 'ファイルサイズ',
      format: '形式',
      createdAt: '追加日時',
      probeFailed: '画像情報を解析できません'
    }
  }
} as const
