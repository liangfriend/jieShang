export default {
  clSheet: {
    untitled: '無題の弾き語り譜',
    titlePlaceholder: '曲名',
    authorPlaceholder: '作者 / 歌手',
    descriptionPlaceholder: '説明（例：1=C 4/4）',
    unsaved: '未保存',
    emptyEdit: 'まだ歌詞がありません：下の「＋ 添加一行」から書き始めるか、右側にコード付きテキストを貼り付けて取り込みましょう',
    emptyShow: 'まだ歌詞がありません。「編集」に切り替えて書き始めましょう',
    mode: {
      show: '表示',
      edit: '編集'
    },
    font: {
      default: 'デフォルト',
      song: '明朝体',
      kai: '楷書体',
      hei: 'ゴシック体'
    },
    style: {
      title: 'スタイル',
      reset: '初期値に戻す',
      width: '用紙の幅',
      fontSize: '歌詞サイズ',
      lineGap: '行間',
      font: 'フォント',
      color: '歌詞の色',
      chordColor: 'コードの色',
      addLyricColor: '追加する歌詞',
      addChordColor: '追加するコード',
      addColorHint: '「追加する歌詞 / 追加するコード」は、これから追加する文字とコードにだけ色を付けます。既存の内容は変わりません。クリアすると上の既定の色に従います。'
    },
    chordLyrics: {
      title: 'コード付きの歌詞',
      desc: 'コードが付いている文字（全 {count} 文字）をまとめて変更します。コードのない文字は変わりません。色がそろっていないときはカラーピッカーが空になり、色をクリアすると既定の歌詞の色に戻ります。',
      empty: 'コードが付いている文字はまだありません',
      underline: '下線を引く',
      color: '色を変える'
    },
    embedded: {
      title: '上部の楽譜',
      desc: '作成済みの楽譜から 1 つ選んで、弾き語り譜の一番上に追加します（リズムパターンなど）。追加時にコピーが弾き語り譜に保存されるため、元の楽譜を変更・削除してもここには影響しません。編集中は表示エリアの下端をドラッグして高さを調整できます。',
      placeholder: '追加する楽譜を選択',
      replace: '差し替える楽譜を選択',
      remove: '削除',
      height: 'エリアの高さ',
      scale: '楽譜の拡大率',
      onlyChordName: 'コード名だけ表示',
      loadFailed: '楽譜を読み込めませんでした',
      resizeHint: 'ドラッグで高さを調整'
    },
    text: {
      title: 'コード付きテキスト',
      desc: "コードは角かっこで囲み、対応する文字の前に置きます。例：[C]Twinkle, twinkle, [F]little [C]star。{'{'}#e6553a{'}'} を文字の前に書くと歌詞の色、[コード] の前に書くとコードの色、{'{'}u{'}'} は下線です。",
      placeholder: '[C]Twinkle, twinkle, [F]little [C]star,\n[F]How I [C]wonder [G7]what you [C]are.',
      import: '譜面に取り込む',
      importConfirm: '取り込むと現在の歌詞とコードがすべて置き換わります。よろしいですか？',
      copy: 'テキストをコピー',
      copied: 'コピーしました',
      copyFailed: 'コピーに失敗しました'
    },
    tips: {
      title: '操作方法',
      select: '文字をクリック：コード・色・下線を設定。← → ↑ ↓ で移動、Delete でコード削除、Esc でキャンセル',
      editLine: 'ダブルクリックまたは Enter：行全体を編集。Enter で分割、行頭の Backspace で結合。行末にコードを置くにはスペースを入力',
      dragChord: 'コードをドラッグで移動、Ctrl を押しながらでコピー',
      save: 'Ctrl + S で保存'
    },
    file: {
      import: 'インポート',
      export: 'エクスポート',
      importConfirm:
        'インポートすると、現在の弾き語り譜がファイルの内容に置き換わります（保存するまで反映されません）。よろしいですか？',
      importSuccess: '{fileName} をインポートしました。保存を忘れずに',
      importFailed: 'インポートに失敗しました',
      exportSuccess: 'エクスポートしました',
      exportFailed: 'エクスポートに失敗しました',
      invalid: '有効な弾き語り譜ファイルではありません'
    },
    messages: {
      saveSuccess: '保存しました',
      saveFailed: '保存に失敗しました',
      loadFailed: '弾き語り譜の読み込みに失敗しました',
      discardConfirm: '未保存の変更があります。移動してもよろしいですか？'
    }
  }
} as const
