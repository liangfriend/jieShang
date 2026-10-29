export default {
  editor: {
    menu: {
      file: 'ファイル',
      edit: '編集',
      view: '表示',
      score: '楽譜',
      play: '再生',
      help: 'ヘルプ'
    },
    toolbar: {
      playMode: '再生モード',
      playSettings: '再生設定',
      timeOffset: '譜面と音声の同期',
      linkedStaffMode: '連結譜表モード',
      rhythmPatternMode: 'リズムパターン',
      slurStyle: 'スラーの形',
      structureEdit: '構造ボタン',
      lyricsEdit: '歌詞',
      showInstrumentName: '音色を表示',
      layout: 'レイアウト調整',
      notice: '注意事項',
      legalNotes: '使用可能な音符一覧',
      quickInput: 'クイック入力',
      pianoRecord: 'ピアノ入力',
      import: '読み込む',
      export: '書き出す',
      formatSj: '解熵楽譜 (.sj)',
      formatMusicXml: 'MusicXML',
      formatMusicXmlMs4: 'MusicXML(ms4)',
      formatMusicXmlMs3: 'MusicXML(ms3)',
      formatMidi: 'MIDI',
      formatWork: '作品',
      scoreImage: '画像から楽譜(数字譜)',
      save: '保存',
      notationType: '楽譜の種類',
      transpose: '移調',
      targetKey: '移調先の調',
      applyTranspose: '移調',
      raiseSemitone: '半音上げる',
      lowerSemitone: '半音下げる'
    },
    drumLegalNotes: {
      title: '使用可能な音符一覧',
      lead: 'ドラム譜のデフォルト再生マップに含まれる合法音符（線位置 + 符頭）です。各カードは記譜と対応する楽器音を示します。編集中に小節を選択し、楽器名の前の文字キーを押すと、その音符を小節の末尾に追加できます（声部・音価・付点はツールバーの設定を使用）。',
      meta: '線位置 {region} · 符頭 {headType}',
      shortcut: 'ショートカット：{key}',
      play: '試聴',
      toneLoadFailed: '打楽器音色の読み込みに失敗しました'
    },
    scoreToWork: {
      title: '作品として書き出す',
      template: 'ページテンプレート',
      custom: 'カスタム',
      pageSize: 'ページサイズ',
      scoreWidth: '楽譜の幅',
      topMargin: '楽譜の上余白',
      hint: '楽譜はこの幅に合わせて拡大縮小し、左右中央・上余白の位置から配置します。ページに収まらない大譜表は行ごと次のページへ移り、下にも同じ余白を残します。確定すると新しい作品を作成して作品編集を開きます。保存するまで「マイ作品」には追加されません。'
    },
    rhythmPattern: {
      title: 'リズムパターン',
      heading: 'リズムパターン（{mode}） · {timeSignature} · {count} 音',
      hint: 'よく使うものが先頭。カードのキーで適用、矢印キー + Enter / スペースで選択中のカードを適用、Tab でモード切替、Esc で閉じる。マウスを動かしても候補は変わらない',
      empty: 'この拍子でこれらの音が収まるリズムパターンはありません',
      emptyBeat: 'これらの音ではちょうど 1 拍になりません',
      modeMeasure: '小節単位',
      modeBeat: '拍単位',
      skipped: '1 拍に収まるのは末尾の音までです。前の {count} 音は対象外になりました'
    },
    standardMode: {
      label: '標準モード',
      hint: 'オンにすると、入力した音符が小節の拍子を超える場合は次の小節へ移して選択し、この小節の残りは休符で埋めます',
      durationInvalid: '音価が正しくありません',
      noNextMeasure: '最後の小節のため、次の小節がありません'
    },
    lyricsMatch: {
      button: '歌詞割り当て',
      title: '歌詞スマート割り当て',
      grandStaff: '{n} 段目',
      placeholder: 'この段の歌詞を入力すると音符に自動で割り当てます',
      placeholderMulti: '単譜表は {n} 個：1 行目が 1 つ目、改行で次の単譜表',
      overflow: '{staff} つ目の単譜表で {n} 文字が余って入りませんでした',
      extraLines: '{n} 行が余っています（対応する単譜表がありません）',
      hint: '入力欄 1 つが複譜表 1 つ、改行で次の単譜表になります。休符とスラーで覆われた音は飛ばします。日中韓の文字は 1 字 1 音、その他の文字はスペースで単語に分け、- で音節を区切り、_ で 1 音を空けます。歌詞の 1 行目に入ります。'
    },
    noticeDialog: {
      title: '編集の注意事項',
      selectionTitle: '選択と削除',
      selectionItems: [
        '楽譜上の要素をクリックすると選択できます。小節を選択するとキーボードで音符を入力できます。',
        '音符に付いている一部の記号は譜面上で直接選択できません。右側の音符プロパティパネルから削除してください。',
        '反復括弧（volta）とスラー（slur）は選択して削除できますが、記号そのものを正確にクリックする必要があります。',
        '小節・単譜表・大譜表は、それぞれ最後の 1 つになると削除できません（対応する削除ボタンがグレー表示になります）。'
      ],
      commonShortcutTitle: '共通ショートカット（すべての楽譜）',
      commonShortcutItems: [
        { keys: ['Esc'], desc: '選択を解除します。' },
        { keys: ['Delete', 'Backspace'], desc: '選択中の項目（音符・小節・譜表・複数音符にまたがる記号など）を削除します。小節を選択中は Backspace で最後の音符 / 休符だけを削除し、Delete で小節全体を削除します。' },
        { keys: ['<', '>'], desc: '音符（または小節、その最後の音。音符を先にクリックする必要はありません）を選択中：> は現在の音から次の音へスラーを付けます。現在の音がすでにスラーの始点なら、そのスラーを右へ 1 音広げます。< は前の音から現在の音へ付け、現在の音がすでにスラーの終点なら左へ 1 音広げます。休符は飛ばします。Shift なしでカンマ / ピリオドキーを押しても同じで、日本語・中国語入力中でも使えます。' },
        { keys: ['/'], desc: '選択中の音符（または小節の最後の音）を始点・終点とするスラーをすべて削除します。' },
        { keys: [';', "'"], desc: '音符（または小節、その最後の音）を選択中：; で前打音、\' で後打音を追加します。デフォルトは 16 分音符。Shift なしでセミコロン / 引用符キーでも同じです。' },
        { keys: ['L'], desc: '選択中の音符（または小節の最後の音）の前打音・後打音をすべて削除します。' },
        { keys: ['O'], desc: '主音符 / 休符の音価を循環：64 分 → 32 分 → 16 分 → 8 分 → 4 分 → 2 分 → 全音符 → …（例：4 分で O を押すと 2 分）。音符や休符を選択中ならそれを変更し、小節を選択中なら最後のものを変更し、装飾音を選択中なら宿主の主音符を変更します。' },
        { keys: ['{', '}'], desc: '小節を選択中：{ で前置小節線（なし・リピート開始・逆向き）、} で後置小節線（8 種類）を順に切り替えます。Shift なしで [ / ] キーを押しても同じです。' },
        { keys: ['Ctrl+Z'], desc: '元に戻します。最大約 20 ステップまで保持され、編集画面を離れるとクリアされます。' },
        { keys: ['Ctrl+Y', 'Ctrl+Shift+Z'], desc: '元に戻した操作をやり直します。' },
        { keys: ['↑', '↓', '←', '→'], desc: '小節を選択中に、上下左右の隣の小節へ移動します。連続入力に便利です。' },
        { keys: ['*'], desc: '現在の単譜表の下に単譜表を追加します。未選択なら最後の単譜表の下に追加します。' },
        { keys: ['-'], desc: '現在の大譜表の下に大譜表を追加します。未選択なら最後の大譜表の下に追加します。' },
        { keys: ['スペース'], desc: '音符のある小節を選択中に押すと、リズムパターンのポップアップを開きます。音名はそのままで、選んだリズムに置き換えます。編集画面上部の「リズムパターン」でモードを切り替えます（ポップアップ表示中は Tab でも可）。「小節単位」は小節全体を置き換え、「拍単位」は末尾のまだまとめていない音だけを 1 拍にまとめ、最後の音に印を付けます。次にスペースを押すと、その印より後の新しい音から始まります。ポップアップではカードの数字 / 文字キー（足りない分はテンキー）で適用、矢印キー + Enter またはスペースで選択中のカードを適用し、Esc で閉じます。マウスをカード上に動かしても候補は変わりません。' },
        { keys: ['P'], desc: '小節を選択中に、その小節の音符を次の小節にコピー（既存の音符は置き換え）し、次の小節を選択します。続けて押すと先へ先へとコピーできます。行末では次の大譜表の同じ単譜表の最初の小節へ進みます。' },
        { keys: ['Tab'], desc: '歌詞の入力欄で次の音の歌詞へ移動します。現在の音がスラーの始点なら、スラーの終点の次の音へ移動します。' }
      ],
      standardModeTitle: '標準モード',
      standardModeItems: [
        '編集画面右上の「標準モード」スイッチ。オンのとき、キーボード・マウス・MIDI で入力した音符で小節が拍子より長くなる場合、その音符を次の小節の末尾へ移して次の小節を選択し、この小節の残りを休符で埋めます。',
        '音符そのものが 1 小節より長い場合は「音価が正しくありません」と表示し、書き込みません。',
        '次の小節は → キーと同じ順です。行末では次の大譜表の同じ単譜表の最初の小節へ進み、次の小節がなければ案内を表示して書き込みません。'
      ],
      commonShortcutNote: 'Ctrl / Alt を押している間や入力欄で文字を入力している間は、単一キーのショートカットは無効です。',
      shortcutTitle: '楽譜の種類別ショートカット',
      shortcutGroups: {
        number: {
          title: '数字譜',
          lead: '数字譜はメインキーボード（文字キーの上の列）の数字と 3 列の文字キーで音符を直接入力するため、音価の切り替えはテンキーを使います。',
          items: [
            { keys: ['1–7'], desc: 'メインキーボード：選択中の小節の末尾に中音の ド レ ミ ファ ソ ラ シ を追加します。音価はツールバーの設定を使い、ツールバーの音符 / 休符の選択には影響されません。' },
            { keys: ['Q W E R T Y U'], desc: '高音の 1–7（オクターブ点 1 つ上）を順に追加します。' },
            { keys: ['A S D F G H J'], desc: '中音の 1–7 を順に追加します。' },
            { keys: ['Z X C V B N M'], desc: '低音の 1–7（オクターブ点 1 つ下）を順に追加します。' },
            { keys: ['0', '~', 'I', 'K'], desc: 'メインキーボード：選択中の小節の末尾に休符を追加します。音価はツールバーの設定を使います。I / K は中段の文字キーで空いているキーです。' },
            { keys: ['Num 1–8'], desc: 'テンキー：ツールバーの音価を切り替えます。1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 百二十八分。' },
            { keys: ['Num 0'], desc: 'テンキー：ツールバーの音符 / 休符を切り替えます（マウスでの追加に反映）。' },
            { keys: ['8', '9'], desc: 'メインキーボード：8 でツールバーのオクターブ点を 1 つ下げ、9 で 1 つ上げます（-3 〜 +3）。マウスでの追加に反映されます。' },
            { keys: ['MIDI キーボード'], desc: '小節を選択して鍵盤を押すと、その音高の音符を小節の末尾に追加します。音価はツールバーの設定を使います。' },
            { keys: ['Ctrl+S'], desc: '「数字譜クイック入力」ドロワー内：テキストからプレビューを更新します。' }
          ]
        },
        staff: {
          title: '五線譜',
          lead: '五線譜も数字譜と同じく、メインキーボードの数字と 3 列の文字キーで階名どおりに音符を入力します（小節の調号に合わせた移動ド。ト音記号の中音は C4–B4、ヘ音記号は 1 オクターブ下）。音価の切り替えはテンキーを使います。小節を選択して小節内をクリックして追加することもできます。',
          items: [
            { keys: ['1–7'], desc: 'メインキーボード：選択中の小節の末尾に中音の ド レ ミ ファ ソ ラ シ を追加します。音価はツールバーの設定を使い、ツールバーの音符 / 休符の選択には影響されません。' },
            { keys: ['Q W E R T Y U'], desc: '1 オクターブ上の 1–7 を順に追加します。' },
            { keys: ['A S D F G H J'], desc: '中音の 1–7 を順に追加します。' },
            { keys: ['Z X C V B N M'], desc: '1 オクターブ下の 1–7 を順に追加します。' },
            { keys: ['0', '~', 'I', 'K'], desc: 'メインキーボード：選択中の小節の末尾に休符を追加します。音価はツールバーの設定を使います。I / K は中段の文字キーで空いているキーです。' },
            { keys: ['Num 1–8'], desc: 'テンキー：ツールバーの音価を切り替えます。1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 百二十八分。' },
            { keys: ['Num 0'], desc: 'テンキー：ツールバーの音符 / 休符を切り替えます（マウスでの追加に反映）。' },
            { keys: ['MIDI キーボード'], desc: '小節を選択して鍵盤を押すと、その音高の音符を小節の末尾に追加します。音価はツールバーの設定を使います。' }
          ]
        },
        drum: {
          title: 'ドラム譜',
          lead: 'ドラム譜は文字キーで入力します。各文字が 1 つの合法音符（線の位置 + 符頭）に対応します。ツールバーの「使用可能な音符一覧」カードの文字を参照してください。',
          items: [
            { keys: ['A–T'], desc: '小節を選択中に、対応する合法音符を現在の声部の末尾に追加します（P は次の小節へのコピーのため飛ばします）。声部・音価・付点はツールバーの設定を使い、音符 / 休符の選択には影響されません。IME が日本語・中国語入力の状態でも使えます。' },
            { keys: ['3–8'], desc: 'ツールバーの音価を切り替えます。3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 百二十八分。ドラム譜は四分音符までなので 1・2 は無効です。' },
            { keys: ['0'], desc: 'ツールバーの音符 / 休符を切り替えます。' },
            { keys: ['MIDI キーボード'], desc: 'ドラム譜は MIDI キーボード入力に未対応です。' }
          ]
        },
        tab: {
          title: 'TAB 譜（ギター / ウクレレ / ベース）',
          lead: '文字キーでフレットを選び、マウスで弦と位置を指します。キーボードでは音価と標準音 / 休符も切り替えます。',
          items: [
            { keys: ['A–Z'], desc: '順に 0–24 フレット（P は飛ばすので Q が 15 フレット）：ツールバーのフレットを変え、小節を選択してマウスが小節内にあるときは、マウス位置の弦と位置にも書き込みます。' },
            { keys: ['1–8'], desc: 'メインキーボード・テンキーどちらでも：ツールバーの音価を切り替えます。1 全音符、2 二分、3 四分、4 八分、5 十六分、6 三十二分、7 六十四分、8 百二十八分。' },
            { keys: ['0'], desc: 'ツールバーの標準音 / 休符を切り替えます。' },
            { keys: ['MIDI キーボード'], desc: 'TAB 譜は MIDI キーボード入力に未対応です。' }
          ]
        }
      },
      midiTitle: 'MIDI',
      midiItems: ['midi を読み込むと、常に五線譜になります'],
      tabTitle: 'TAB 譜',
      tabItems: [
        'ギター / ウクレレ / ベースの奏法は非常に複雑なため、再生機能はまだ十分ではありません。申し訳ありません。'
      ]
    },
    convertDialog: {
      title: '楽譜の種類を切り替え',
      message: '切り替え後も再生情報はできるだけ維持されますが、譜面のスタイルや一部の記譜の詳細が失われる場合があります。Ctrl+Z で切り替えを元に戻せます。'
    },
    transposeDialog: {
      title: '移調',
      message:
        '移調では最初の調号を現在の調として扱います。楽譜内で複数の異なる調号を使用している場合、音符の音高が失われることがあるのでご注意ください'
    },
    layoutDialog: {
      title: 'レイアウト調整',
      currentPanel: '現在の楽譜レイアウト',
      currentPanelHint:
        '変更はすぐに現在の楽譜へ書き込まれます。「デフォルトに同期」で現在のレイアウトをソフトの既定にします。',
      defaultPanel: 'デフォルトレイアウト',
      defaultPanelHint: '変更は自動保存され、新規楽譜と追加譜表に影響します。「適用」で現在の楽譜へコピーできます。',
      defaultNoPageSizeHint: '全体の幅 / 高さはデフォルトに含まれません。新規楽譜はテンプレートのページサイズを使います。',
      page: 'ページ',
      pageWidth: '全体の幅',
      sLSlotW: '左余白',
      sLSlotWHint: '譜表の左側の空白の幅です。「音色を表示」をオンにすると、ここに音色名が表示されます。',
      instrumentNameFont: '音色名フォント',
      sRSlotW: '右余白',
      sRSlotWHint: '譜表の右側の空白の幅です。スラーが次の行へ続くとき、行末側の部分がここに描かれます。',
      preview: 'プレビュー',
      previewUntitled: '無題の楽譜',
      pageHeight: '全体の高さ',
      pageHeightHint: '楽譜が途中で切れる場合は大きくしてください。現在の楽譜のみに適用され、デフォルトには保存されません。',
      titleArea: 'タイトル領域',
      tSlotH: '高さ',
      titleFont: 'フォント',
      lyricsArea: '歌詞',
      lyricsFont: 'フォント',
      lyricsFontSize: '文字サイズ',
      lyricsFontSizeHint: '歌詞の文字の大きさです。行間も比例して変わります。歌詞は各単譜表の下、下外側余白の中に描かれます。歌詞の行が多いときや文字が大きいときは下外側余白を広げてください。',
      fontDefault: 'システム既定',
      grandStaff: '大譜表の余白',
      singleStaff: '単譜表の余白',
      uSpace: '上余白',
      dSpace: '下余白',
      uSpaceO: '上外側余白',
      uSpaceI: '上内側余白',
      dSpaceI: '下内側余白',
      dSpaceO: '下外側余白',
      apply: '適用',
      setDefault: 'デフォルトに同期',
      setDefaultHint: '現在の楽譜レイアウト（ページサイズ除く）を新規楽譜のデフォルトに同期します',
      setDefaultSuccess: '現在のレイアウトをデフォルトに同期しました',
      applyDefault: 'デフォルトを適用',
      applyDefaultHint:
        'デフォルト（譜表間隔・タイトル領域・左右余白・フォント・歌詞の文字サイズ）をこの楽譜に適用します。ページサイズは変わりません',
      applyDefaultSuccess: 'デフォルトのレイアウトをこの楽譜に適用しました'
    },
    endpointOffset: {
      title: '始点 / 終点の位置',
      start: '始点',
      end: '終点'
    },
    slurApply: {
      centerControl: '制御点を中央に',
      title: '現在の位置を適用',
      scope: {
        measure: '小節',
        singleStaff: '単譜表',
        grandStaff: '大譜表',
        score: '楽譜全体'
      },
      applied: '{n} 本のスラーに適用しました',
      none: '範囲内に他のスラーはありません'
    },
    multiNote: {
      summary: '{n} 個の音符を選択中',
      summaryWithRests: '音符 {notes} 個・休符 {rests} 個を選択中',
      summaryRests: '{n} 個の休符を選択中',
      restsSkipPitch: '休符は移調の対象外です',
      pitch: '音高',
      lower: '下げる',
      raise: '上げる',
      duration: '音価',
      double: '音価 ×2',
      halve: '音価 ÷2',
      stem: '符幹',
      actions: '操作',
      delete: '選択項目を削除',
      nothingChanged: '移調できる音符がありません',
      alreadyLongest: '選択した音符はすでに最長の音価です',
      alreadyShortest: '選択した音符はすでに最短の音価です'
    },
    propertyPanel: {
      title: 'プロパティ',
      multiNote: '複数の音符',
      measure: '小節のプロパティ',
      noteHead: '音符のプロパティ',
      grace: '装飾音のプロパティ',
      rest: '休符のプロパティ',
      slur: 'スラーのプロパティ',
      pitch: 'オッターヴァ記号のプロパティ',
      volta: 'Volta のプロパティ',
      bend: 'チョーキングのプロパティ',
      bracket: '括弧のプロパティ',
      noteMark: '記号のプロパティ',
      measureMark: '小節記号のプロパティ',
      trillLine: 'トリル線のプロパティ',
      pedal: 'ペダルのプロパティ',
      arpeggio: 'アルペジオのプロパティ',
      strumming: 'ストロークのプロパティ',
      preludeBracket: '前奏括弧のプロパティ',
      hairpin: 'クレッシェンド / ディミヌエンドのプロパティ',
      guzhengLian: '古箏連続指法のプロパティ',
      placeholder: '楽譜上の小節・音符・休符・スラー・記号・オッターヴァ記号・Volta・括弧を選択すると、ここに編集可能なプロパティが表示されます'
    },
    panelTab: {
      basic: '基本',
      marks: '記号',
      span: 'ライン'
    },
    panelGroup: {
      rhythm: 'リズム',
      pitch: '音高',
      position: '位置',
      structure: '小節操作',
      barline: '小節線',
      front: '小節の頭',
      back: '小節の終わり',
      repeat: '反復'
    },
    addNote: {
      add: '追加',
      note: '音符',
      rest: '休符',
      duration: '音価',
      octaveDot: 'オクターブ点'
    },
    addTab: {
      fret: 'フレット',
      regionStart: '開始弦 {n}',
      regionEnd: '終了弦 {n}',
      kind: {
        normal: '通常音',
        harmonic: 'ハーモニクス',
        arpeggio: 'アルペジオ',
        strumming: 'ストローク',
        rest: '休符'
      }
    },
    tabNote: {
      chord: 'コードダイアグラム',
      chordNone: 'なし',
      technique: 'テクニック',
      slap: 'スラップ',
      bend: 'チョーキング',
      addBend: 'チョーキングを追加',
      removeBend: 'チョーキングを削除',
      bendType: 'チョーキングの種類',
      offset: '位置オフセット',
      resetPosition: '位置をリセット',
      stage: '段階 {n}',
      stageInterval: '段階 {n} の音程',
      bendTypes: {
        bend: 'チョーキング',
        bendRelease: 'チョーキング＆リリース',
        prebend: 'プリベンド',
        prebendRelease: 'プリベンド＆リリース',
        prebendBend: 'プリベンド＆チョーキング'
      },
      slurType: '種類',
      slurTypes: {
        H: 'ハンマリング H',
        S: 'スライド S',
        P: 'プリング P',
        HP: 'ハンマリング＆プリング HP'
      }
    },
    drum: {
      voice: '声部',
      voiceUp: '第1声部（上向き）',
      voiceDown: '第2声部（下向き）',
      head: '符頭',
      headType: {
        normal: '通常',
        cross: 'バツ',
        circledCross: '丸囲みバツ',
        circledSlash: '丸囲みスラッシュ',
        triangle: '三角形',
        diamond: 'ひし形'
      },
      region: '線位置（0 = 第1線 · 8 = 第5線）',
      durationWhole: '音価（音符全体）',
      center: '中央'
    },
    contextMenu: {
      delete: '削除',
      copyNotes: '小節の音符をコピー',
      pasteNotes: '小節の音符を貼り付け',
      clearNotes: '音符をクリア',
      copyStaff: '単譜表をコピー',
      pasteStaff: '単譜表を貼り付け',
      copyGrandStaff: '大譜表をコピー',
      pasteGrandStaff: '大譜表を貼り付け',
      setToneColor: '音色を設定',
      setVolume: '音量を設定',
      longRest: '長休符',
      cancelLongRest: '長休符を解除',
      copy: 'コピー',
      paste: '貼り付け',
      measure: '小節',
      staff: '単譜表',
      grandStaff: '大譜表',
      addMeasure: '小節を追加',
      left: '左',
      right: '右',
      deleteStaffRow: 'すべての大譜表から同じ段の単譜表を削除'
    },
    toneColorDialog: {
      title: '音色を設定',
      hint: 'この小節が属する単譜表の音色を設定します。現在とそれ以降の大譜表で同じ段の単譜表にも同時に設定され、それより前の大譜表は変更されません。再生時に音色で「楽譜の設定」を選ぶとこの音色が使われ、「音色を表示」をオンにすると譜表の左側に音色名が表示されます。',
      search: '音色を検索',
      empty: '一致する音色がありません',
      otherFamily: 'その他',
      clear: '音色をクリア',
      confirm: 'OK'
    },
    staffVolumeDialog: {
      title: '音量を設定',
      hint: 'この小節が属する単譜表の再生音量（パーセント、既定値 100）を設定します。すべての大譜表で同じ段の単譜表にも同時に設定されます。',
      reset: '100 に戻す',
      confirm: 'OK'
    },
    measure: {
      actions: '小節の操作',
      insertBefore: '前に小節を挿入',
      insertAfter: '後ろに小節を挿入',
      barlineBack: '後方の小節線',
      barlineFront: '前方の小節線',      clefFront: '前方の音部記号',
      clefBack: '後方の音部記号',
      keySignatureFront: '前方の調号',
      keySignatureBack: '後方の調号',
      timeSignatureFront: '前方の拍子記号',
      timeSignatureBack: '後方の拍子記号',
      fieldClef: '音部記号',
      fieldKeySignature: '調号',
      fieldTimeSignature: '拍子',
      startRepeat: '小節前の反復',
      endRepeat: '小節後の反復',
      volta: '反復括弧 (Volta)',
      removeVolta: 'Volta を削除',
      barline: {
        single_barline: '単縦線',
        double_barline: '複縦線',
        startRepeat_barline: '反復開始',
        endRepeat_barline: '反復終了',
        dashed_barline: '破線',
        final_barline: '終止線',
        dotted_barline: '点線',
        reverse_barline: '逆終止線',
        heavy_barline: '太線',
        heavy_double_barline: '太い複縦線',
        start_end_repeat_barline: '反復開始・終了'
      },
      clef: {
        treble: 'ト音記号',
        bass: 'ヘ音記号',
        alto: 'アルト記号',
        tenor: 'テノール記号',
        tab: 'TAB 記号'
      },
      keySignature: {
        C: 'ハ長調 (C)',
        G: 'ト長調 (G)',
        D: 'ニ長調 (D)',
        A: 'イ長調 (A)',
        E: 'ホ長調 (E)',
        B: 'ロ長調 (B)',
        F_sharp: '嬰ヘ長調 (F♯)',
        C_sharp: '嬰ハ長調 (C♯)',
        F: 'ヘ長調 (F)',
        B_flat: '変ロ長調 (B♭)',
        E_flat: '変ホ長調 (E♭)',
        A_flat: '変イ長調 (A♭)',
        D_flat: '変ニ長調 (D♭)',
        G_flat: '変ト長調 (G♭)',
        C_flat: '変ハ長調 (C♭)'
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
      duration: '音価',
      noteClef: '音符前の音部記号',
      beam: '連桁',
      stemDirection: '符幹の向き',
      accidental: '臨時記号',
      augmentationDot: '付点',
      relativeX: '横方向オフセット',
      slur: 'スラー',
      grace: '装飾音',
      graceBefore: '前打音',
      graceAfter: '後打音',
      graceBeforeItem: '前打音 {n}',
      graceAfterItem: '後打音 {n}',
      addGraceBefore: '前打音を追加',
      addGraceAfter: '後打音を追加',
      slotSymbols: '列の記号',
      arpeggio: 'アルペジオ',
      strumming: 'ストローク',
      preludeBracketLeft: '前奏括弧（左）',
      preludeBracketRight: '前奏括弧（右）',
      addArpeggio: 'アルペジオを追加',
      addStrumming: 'ストロークを追加',
      addPreludeBracketLeft: '前奏括弧（を追加',
      addPreludeBracketRight: '前奏括弧）を追加',
      pedal: 'ペダル',
      pitch: 'オッターヴァ記号',
      addPedal: 'ペダルを追加',
      addPitchUp: '8va を追加',
      addPitchDown: '8vb を追加',
      syllable: '階名',
      octaveDotLabel: 'オクターブ点',
      addVoiceNote: '多声部の音符を追加',
      addVoiceNoteAction: '同じ位置に追加',
      sameSlotNoteIndex: '下から {n} 番目',
      beamConnection: '下線の連結',
      rhythmGroupEnd: 'まとめ印',
      durationShort: {
        '256': '全',
        '128': '2分',
        '64': '4分',
        '32': '8分',
        '16': '16分',
        '8': '32分',
        '4': '64分',
        '2': '128分'
      },
      augmentationDotShort: {
        '0': 'なし',
        '1': '·',
        '2': '··',
        '3': '···'
      },
      durationValue: {
        '256': '全音符',
        '128': '2分音符',
        '64': '4分音符',
        '32': '8分音符',
        '16': '16分音符',
        '8': '32分音符',
        '4': '64分音符',
        '2': '128分音符'
      },
      restDurationValue: {
        '256': '全休符',
        '128': '2分休符',
        '64': '4分休符',
        '32': '8分休符',
        '16': '16分休符',
        '8': '32分休符',
        '4': '64分休符',
        '2': '128分休符'
      },
      beamType: {
        Combined: '両側連結',
        OnlyRight: '右側のみ連結',
        None: 'なし'
      },
      stem: {
        up: '上向き',
        down: '下向き'
      },
      accidentalType: {
        Sharp: 'シャープ ♯',
        Flat: 'フラット ♭',
        double_sharp: 'ダブルシャープ 𝄪',
        double_flat: 'ダブルフラット 𝄫',
        natural: 'ナチュラル ♮'
      },
      augmentationDotCount: {
        '0': 'なし',
        '1': '付点',
        '2': '複付点',
        '3': '三重付点'
      },
      syllableOption: {
        '1': '1 (do)',
        '2': '2 (re)',
        '3': '3 (mi)',
        '4': '4 (fa)',
        '5': '5 (sol)',
        '6': '6 (la)',
        '7': '7 (si)',
        X: 'リズム X'
      },
      octaveDotOption: {
        '-3': '3 オクターブ下',
        '-2': '2 オクターブ下',
        '-1': '1 オクターブ下',
        '0': 'なし',
        '1': '1 オクターブ上',
        '2': '2 オクターブ上',
        '3': '3 オクターブ上'
      }
    },
    slur: {
      thickness: '線の太さ',
      style: '形',
      styleValue: {
        default: 'デフォルト',
        rounded: '丸み',
        sharp: 'シャープ'
      },
      notes: '始点・終点の音',
      startNote: '始点の音',
      endNote: '終点の音',
      tailAnchor: '終端アンカー',
      moveEarlier: '終端を前へ移動',
      moveLater: '終端を後ろへ移動'
    },
    volta: {
      text: 'テキスト',
      textPlaceholder: '例：1.',
      value: '反復回',
      span: '適用範囲',
      expandLeft: '左へ拡張',
      expandRight: '右へ拡張',
      shrinkLeft: '左を縮小',
      shrinkRight: '右を縮小',
      resetAlignment: '位置揃えをリセット',
      closure: '端の形状',
      closeLeft: '左端を閉じる',
      closeRight: '右端を閉じる',
      valueEditor: {
        keepOne: '少なくとも 1 項目は残してください',
        add: '追加',
        hint: '何回目の演奏時に通過するかを表します（1 から）'
      }
    },
    bracket: {
      type: '括弧の種類',
      applyToAll: 'すべての段に適用',
      appliedToAll: '括弧をすべての段に適用しました',
      typeOption: {
        Bracket: '標準ブラケット',
        Brace: '波括弧（ブレース）',
        Square: '角括弧'
      }
    },
    pitch: {
      type: 'オクターブ'
    },
    arpeggio: {
      style: 'スタイル',
      type: '形状',
      typeNormal: '波線',
      typeStraight: '直線',
      arrow: '矢印',
      resetPosition: '位置をリセット',
      dragHint: '上下のハンドルで長さを、中央のハンドルで左右の位置を調整できます'
    },
    customSymbol: {
      title: 'カスタム記号',
      add: 'カスタム記号を作成',
      manage: '管理',
      edit: '編集',
      export: '設定を書き出し',
      exportTitle: 'カスタム記号の設定を書き出し',
      exported: '設定を書き出しました',
      import: '設定を読み込み',
      importTitle: 'カスタム記号の設定を読み込み',
      imported: '{count} 個の記号を読み込みました',
      importInvalid: '設定ファイルが無効か、使える記号がありません',
      empty: 'カスタム記号はまだありません。+ から SVG をアップロードしてください',
      hint: '記号をクリックすると選択中の項目に追加、もう一度クリックで削除',
      createTitle: 'カスタム記号を作成',
      editTitle: 'カスタム記号を編集',
      managerTitle: 'カスタム記号の管理',
      managerHint:
        'ライブラリの記号を編集・削除しても、すでに使っている他の楽譜には影響しません。編集内容は現在の楽譜の同じ記号に反映されます。「書き出し / 読み込み」で記号ライブラリをバックアップできます。',
      emptyList: 'カスタム記号はありません',
      kind: {
        note: '音符記号',
        measure: '小節記号',
        slot: 'スロット記号'
      },
      svg: 'SVG',
      upload: 'SVG をアップロード',
      reupload: 'SVG を差し替え',
      svgInvalid: 'SVG を読み込めないか、サイズがありません',
      svgRequired: '先に SVG をアップロードしてください',
      name: '名前',
      namePlaceholder: '記号の名前',
      nameRequired: '名前を入力してください',
      size: 'サイズ',
      keepRatio: '比率を固定',
      sizeHint: '幅 × 高さ（ピクセル）。標準の小節の高さは 45',
      sizeInvalid: '幅と高さは 0 より大きくしてください',
      position: '位置',
      positionOptions: {
        upper: '小節の上',
        lower: '小節の下'
      },
      placement: '横の基準',
      placementOptions: {
        start: '小節の左端',
        center: '小節の中央',
        end: '小節の右端'
      },
      align: '揃え',
      alignOptions: {
        left: '左端を合わせる',
        center: '中央',
        right: '右端を合わせる'
      },
      vertical: '縦オフセット（1=小節の高さ）',
      horizontal: '横オフセット（1=小節の高さ）',
      offsetHint: {
        note: 'オフセット 1 = 小節の高さ（約 45 px）。符頭の中心から。縦は負で上、正で下',
        measure: 'オフセット 1 = 小節の高さ（約 45 px）。縦は小節から離れる距離、横は正で右',
        slot: 'オフセット 1 = 小節の高さ（約 45 px）。音符列の始点と小節の下端から'
      },
      anchor: '数字譜の基準',
      anchorAuto: '自動（縦オフセットから）',
      anchorOptions: {
        top: '数字の上',
        bottom: '数字の下',
        left: '数字の左',
        right: '数字の右'
      },
      anchorHint: '数字譜のみ：オクターブ点・下線を含む数字の外枠を基準にします',
      previewHint: '目安のプレビューです。実際の位置は楽譜で確認してください',
      dragHint: '点線枠の横の移動ボタンをドラッグして位置を微調整できます。Delete で削除',
      missing: 'この記号の定義が楽譜にありません',
      created: 'ライブラリに追加しました',
      saved: '保存しました',
      deleted: '削除しました',
      deleteConfirm: '「{name}」を削除しますか？すでに楽譜に追加した記号には影響しません。'
    },
    preludeBracket: {
      hint: '前奏括弧は現在の音符列の左右に付きます。このパネルから削除できます。'
    },
    noteMark: {
      category: {
        articulation: 'アーティキュレーション',
        technique: '奏法 / ボウイング',
        ornament: '装飾記号',
        dynamic: '強弱記号',
        guzheng: '古箏の指法',
        guzhengTechnique: '古箏の奏法'
      },
      exclusive: '1つのみ',
      dragHint: 'クリックで記号を切り替え。楽譜上の記号を選択し、横の移動ボタンをドラッグすると位置を微調整できます',
      current: '現在の記号',
      replaceWith: '置き換え',
      offset: '位置オフセット',
      resetOffset: '位置をリセット',
      name: {
        acccent_above: 'アクセント',
        staccato_above: 'スタッカート',
        staccatissimo_above: 'スタッカーティッシモ',
        tenuto_above: 'テヌート',
        loure_above: 'ルーレ',
        marcato_above: 'マルカート',
        accent_staccato_above: 'アクセント + スタッカート',
        marcato_staccato_above: 'マルカート + スタッカート',
        marcato_tenuto_above: 'マルカート + テヌート',
        staccatissimo_stroke_above: 'スタッカーティッシモ（縦線）',
        staccatissimo_wedge_above: 'スタッカーティッシモ（楔形）',
        stress_above: 'ストレス',
        tenuto_accent_above: 'テヌート + アクセント',
        unstress_above: 'アンストレス',
        open: '開放',
        muted: 'ミュート',
        harmonic: 'ハーモニクス',
        up_bow: 'アップボウ',
        down_bow: 'ダウンボウ',
        breath: 'ブレス',
        turn: 'ターン',
        invertedTurn: '逆ターン',
        trill: 'トリル',
        shortTrill: 'プラルトリラー',
        mordent: 'モルデント',
        ppp: 'ppp ピアニッシッシモ',
        pp: 'pp ピアニッシモ',
        p: 'p ピアノ',
        mp: 'mp メゾピアノ',
        mf: 'mf メゾフォルテ',
        f: 'f フォルテ',
        ff: 'ff フォルティッシモ',
        fff: 'fff フォルティッシッシモ',
        fp: 'fp フォルテピアノ',
        pf: 'pf ピアノフォルテ',
        sf: 'sf スフォルツァンド',
        sfz: 'sfz スフォルツァート',
        sff: 'sff',
        sffz: 'sffz',
        sfp: 'sfp スフォルツァンドピアノ',
        rfz: 'rfz リンフォルツァンド',
        rf: 'rf リンフォルツァンド',
        fz: 'fz フォルツァンド',
        guzheng_mo: '抹（人差し指）',
        guzheng_tiao: '挑（人差し指）',
        guzheng_gou: '勾（中指）',
        guzheng_ti1: '剔（中指）',
        guzheng_pi: '劈（親指）',
        guzheng_tuo: '托（親指）',
        guzheng_da: '打（薬指）',
        guzheng_zhai: '摘（薬指）',
        guzheng_ti2: '提',
        guzheng_bo: '撥',
        guzheng_xiao_cuo: '小撮',
        guzheng_da_cuo: '大撮',
        guzheng_sao: '掃',
        guzheng_yao: '揺指'
      }
    },
    spanSymbol: {
      slurEnd: 'スラーの終点',
      coverage: '適用範囲',
      expandLeft: '左へ拡張',
      expandRight: '右へ拡張',
      shrinkLeft: '左を縮小',
      shrinkRight: '右を縮小',
      resetAlignment: '位置揃えをリセット',
      add: '複数音符にまたがる記号を追加',
      span: '範囲',
      spanValue: '{n} 個',
      spanHint: '範囲はこの音符から右へ覆う音符の数です。スラーは 2 個以上',
      slotSymbolHint: 'アルペジオはこの音符の列だけに付き、1 列に 1 つまでです',
      notEnoughNotes: '後ろの音符が足りないため、現在の範囲では追加できません（この小節と次の小節のみ検索します）。範囲を小さくするか、先に音符を追加してください',
      existing: 'この音符から開始',
      empty: 'なし',
      pitchUp: '8va（1 オクターブ上）',
      pitchDown: '8vb（1 オクターブ下）',
      trill: 'トリル線',
      crescendo: 'クレッシェンド',
      diminuendo: 'ディミヌエンド',
      guzhengLian: '古箏の連続指法'
    },
    line: {
      trillType: '開始記号',
      trillTypeOption: {
        trill: 'tr',
        upprall: '上行トリル',
        downprall: '下行トリル',
        prallprall: '長いトリル'
      },
      hairpinStyle: 'スタイル',
      hairpinType: {
        crescendo_hairpin: 'クレッシェンド（松葉）',
        diminuendo_hairpin: 'ディミヌエンド（松葉）',
        crescendo_line: 'クレッシェンド（cresc.）',
        diminuendo_line: 'ディミヌエンド（dim.）'
      },
      height: '開き幅',
      guzhengLianType: '指法',
      guzhengLianTypeOption: {
        tuo: '連托',
        pi: '連劈',
        mo: '連抹',
        tiao: '連挑',
        gou: '連勾',
        ti: '連剔',
        da: '連打',
        zhai: '連摘'
      },
      dragHint: '両端をドラッグして範囲を変更、中央をドラッグして上下に移動'
    },
    staff: {
      grandStaff: '大譜表'
    },
    titleFields: {
      title: 'タイトル',
      subTitle: 'サブタイトル',
      author: '作者'
    },
    timeOffset: {
      title: '譜面と音声の同期',
      timeProp: '時間プロパティ',
      vocalPerformance: '模範歌唱',
      accompaniment: '伴奏',
      pxPerSecond: 'px/s',
      sampleRate: 'サンプルレート',
      selectAudio: '音声を選択',
      bindVocal: '模範歌唱を関連付け',
      bindAccompaniment: '伴奏を関連付け',
      audioPlaceholder: 'マイオーディオから選択'
    },
    pianoRecord: {
      title: 'ピアノ入力',
      needMidi: 'ピアノ入力には MIDI キーボードが必要です。接続してからもう一度お試しください',
      midiUnsupported: 'この環境は MIDI に対応していません',
      device: 'MIDI デバイス',
      noDevice: '未接続',
      bpm: 'テンポ',
      timeSignature: '拍子',
      start: '録音開始',
      stop: '録音終了',
      restart: 'もう一度録音',
      syncToScore: '楽譜に反映',
      metronomeDuringRecord: '録音中にメトロノームを鳴らす',
      metronomeVolume: 'メトロノーム音量',
      tolerance: '録音設定',
      beatSnap: '拍スナップ（拍）',
      beatSnapHint:
        '打鍵が拍からこの範囲内なら、そのまま拍の位置に置きます。現在のテンポでは {ms} ミリ秒以内の遅れは拍どおりとみなします。0.25 以下なら本当の裏拍の 16 分音符は吸い寄せられません。0 でオフ。',
      minRest: '最短の休符',
      minRestOptions: {
        0: '結合しない（すべての隙間を休符にする）',
        16: '16 分音符',
        32: '8 分音符（デフォルト）',
        64: '4 分音符'
      },
      minRestHint:
        '同じ手の 2 つの音の隙間がこれより短いと、休符を書かずに前の音へ結合します。短い休符を書きたいときは、この長さ以上止めてください。',
      latencyMs: '遅延補正（ミリ秒）',
      latencyMsHint:
        'すべての打鍵時刻からこの値を引きます。全体が一定して遅れるとき（メトロノームの出力遅延など）に使います。大きくしすぎると、早めに離した鍵の隙間が広がり、かえって休符が増えます。',
      toleranceReset: 'デフォルトに戻す',
      idleHint: '「録音開始」を押すと 1 小節の予備拍が鳴り、終わった時点から計時します。拍に合わせて MIDI キーボードを弾いてください。左右の手は自動で振り分けられ、右手は高音部譜表、左手は低音部譜表に書き込まれます。',
      countInHint: '予備拍… この小節が終わってから弾き始めてください。',
      recordingHint: '録音中… テンポに合わせて 16 分音符単位でクオンタイズします。弾き終えたら「録音終了」を押してください。',
      doneHint: '録音が完了しました（音符グループ {count} 個）。「楽譜に反映」で現在の楽譜を録音結果に置き換えます。',
      emptyHint: '音符が録音されていません。もう一度録音してください。',
      syncConfirmTitle: '楽譜に反映',
      syncConfirmMessage: 'ピアノ入力の結果で現在の楽譜の内容（高音部 + 低音部譜表）をすべて上書きします。続けますか？',
      synced: '楽譜に反映しました',
      syncFailed: '反映に失敗しました'
    },
    quickInput: {
      title: '数字譜クイック入力',
      scoreToText: '楽譜をテキストに変換',
      updatePreview: 'プレビューを更新',
      syncToScore: 'プレビューを楽譜に反映',
      rules: 'ルール',
      textTitle: 'テキスト',
      previewTitle: 'プレビュー',
      warningsTitle: 'ヒント（{count}）',
      textPlaceholder: 'ここに数字譜を入力し、Ctrl+S または「プレビューを更新」で確認します。書き方は「ルール」を参照してください。',
      textFromScore: '現在の楽譜をテキストに変換しました',
      scoreToTextFailed: '楽譜をテキストに変換できませんでした',
      syncConfirmTitle: 'プレビューを楽譜に反映',
      syncConfirmMessage:
        'テキストのルールではすべての記号（臨時記号、歌詞など）を表せないため、現在の楽譜のそれらの情報が失われる可能性があります。プレビューで現在の楽譜を上書きしますか？',
      synced: 'プレビューを楽譜に反映しました',
      syncFailed: '反映に失敗しました',
      rulesTitle: 'クイック入力のルール',
      ruleSections: [
        {
          title: '構成',
          items: [
            { syntax: '1 行', desc: 'テキスト 1 行が 1 つの譜表になります' },
            { syntax: '空行', desc: '連続した空でない行が 1 つの大譜表になり、空行で新しい大譜表を始めます' },
            { syntax: 'スペース', desc: '音符はスペースで区切ります' }
          ]
        },
        {
          title: '音符',
          items: [
            { syntax: '1 ~ 7', desc: '階名 ド ~ シ' },
            { syntax: '0', desc: '休符' },
            { syntax: 'X', desc: 'リズム音（音高なし）' },
            { syntax: '.5', desc: '数字の前の点：1 オクターブ上、点の数だけ上がります' },
            { syntax: '5.', desc: '数字の後の点：1 オクターブ下、点の数だけ下がります' }
          ]
        },
        {
          title: '音価',
          items: [
            { syntax: '5/', desc: '/ 1 本ごとに音価が半分：5/ は八分音符、5// は十六分音符' },
            { syntax: '5-', desc: '延長線：5- 二分音符、5-- 付点二分音符、5--- 全音符' },
            { syntax: '5,', desc: '付点。複数書けます' },
            { syntax: '- と /', desc: '同時には使えません。小節の音価が拍子と合わないとヒントが出ます' }
          ]
        },
        {
          title: '組み合わせ',
          items: [
            { syntax: '5(1)', desc: '音符の直後の () は同じ位置に重ねる和音。複数続けて書けます' },
            { syntax: '[3]5  5[3]', desc: '[] を音符の前に書くと前打音、後に書くと後打音。中で / とオクターブ点が使えます' },
            { syntax: '<5  >3', desc: '< はスラーの始まり、> は終わり。どちらも音符の前に書きます' }
          ]
        },
        {
          title: '小節線',
          items: [
            { syntax: '|', desc: '小節線。小節の終わりに書きます。スペースで区切った | ごとに 1 小節が閉じます' },
            { syntax: '| |', desc: '前に音符がない | は空の小節です。これは空の小節 2 つ、1 | | | | は 4 小節になります' },
            { syntax: '行頭の |', desc: '前小節線には対応していません。行頭の | も空の小節になるので、各行は音符から書き始めてください' },
            { syntax: '|1|2', desc: 'スペースなしで続けた小節線は 1 本として扱い、後のものが優先されます' },
            {
              syntax: '|N',
              desc: '小節線の種類：|1 リピート開始、|2 リピート終了、|3 終止線、|4 両側リピート、|5 複縦線、|6 破線、|7 点線、|8 逆終止線、|9 太線、|10 太い複縦線'
            }
          ]
        },
        {
          title: 'その他',
          items: [
            { syntax: 'メタ情報', desc: 'タイトル・調号・拍子・テンポは現在の楽譜を引き継ぎます' },
            { syntax: '非対応', desc: '臨時記号・前小節線・歌詞などはテキストで表せないため、変換時に省略しヒントに表示します' }
          ]
        }
      ],
      ruleExampleTitle: '例',
      ruleExample: [
        '5. 4. <7. >6. .5(.6) | .7 .5 .5/ 5- |4',
        '',
        '[1/2/]3 3/ 2/ <1, >2/ | 3(5) 0 .1- |2',
        '1 1 5. 5. | 6.(1) 6. 5.- |2'
      ]
    },
    scoreImageDialog: {
      title: '画像から楽譜',
      noticeTitle: '数字譜のみ認識できます',
      noticeItems: [
        '認識できるのは数字譜（簡譜）のみです。五線譜・ギタータブ譜・ドラム譜には対応していません',
        '複数ページの場合はページ順に並べてください。リストの順に各ページの段をつなげて 1 つの楽譜にします',
        '画像はできるだけ鮮明でまっすぐに、数字が小さすぎないようにしてください。タイトルや歌詞は認識されません',
        '生成した楽譜は現在の楽譜を上書きします。Ctrl+Z で元に戻せます'
      ],
      dropHint: 'クリックまたはドラッグで数字譜の画像を追加（複数可）',
      formats: 'PNG / JPG / WebP / BMP に対応',
      count: '全 {n} 枚（順番につなげます）',
      add: '追加',
      sortByName: 'ファイル名順',
      clear: 'すべて削除',
      moveUp: '上へ',
      moveDown: '下へ',
      remove: '削除',
      statusPending: '待機中',
      statusRunning: '認識中…',
      itemSummary: '{rows} 段 · {measures} 小節 · {key} · {time}',
      keyInherited: '{key}（前ページを継承）',
      keyAssumed: '{key}（調号を認識できず）',
      warnings: '注意 {n} 件',
      errorBadImage: '画像を読み込めません',
      errorNoNotation: '数字譜が見つかりません',
      errorInternal: '認識エラー',
      unsupportedSkipped: '対応していないファイル {n} 件をスキップしました',
      progressRecognizing: '{current} / {total} 枚目を認識中：{name}',
      progressMerging: '楽譜をつなげています…',
      failedHint: '{n} 枚の認識に失敗しました。差し替えまたは削除して再試行してください',
      skipFailed: '失敗分を除いた {n} 枚で生成',
      generate: '生成する',
      retry: '失敗した画像を再試行',
      stop: '停止',
      generateFailed: '楽譜の生成に失敗しました'
    },
    messages: {
      notationTypeSwitched: '楽譜の種類を切り替えました',
      notationTypeSwitchFailed: '楽譜の種類の切り替えに失敗しました',
      transposed: '移調しました',
      transposeFailed: '移調に失敗しました',
      transposeSameKey: '移調先の調が現在の調と同じです',
      semitoneRaised: '半音上げました',
      semitoneLowered: '半音下げました',
      semitoneShiftFailed: '半音の上げ下げに失敗しました',
      importSuccess: '{fileName} を読み込みました',
      importFailed: '読み込みに失敗しました',
      importMusicXmlFailed: 'MusicXML の読み込みに失敗しました',
      importMidiFailed: 'MIDI の読み込みに失敗しました',
      importMidiWarnings: 'MIDI の一部の内容を保持できませんでした：{detail}',
      scoreImageGenerated: '{pages} 枚の画像から楽譜を生成しました',
      scoreImageGeneratedWithWarnings:
        '{pages} 枚の画像から楽譜を生成しました。認識に関する注意が {n} 件あります（小節の長さが拍子と合わない等）。楽譜を確認してください',
      exportSuccess: '書き出しました',
      exportFailed: '書き出しに失敗しました',
      exportMusicXmlFailed: 'MusicXML の書き出しに失敗しました',
      exportMidiFailed: 'MIDI の書き出しに失敗しました',
      saveSuccess: '保存しました',
      saveFailed: '保存に失敗しました',
      scoreLoadFailed: '楽譜の読み込みに失敗しました'
    }
  }
} as const
