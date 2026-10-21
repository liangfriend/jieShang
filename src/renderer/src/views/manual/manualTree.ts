import type { AppLocale } from '@renderer/i18n/locale'

export interface ManualNode {
  id: string
  children?: ManualNode[]
}

/** 每个节点对应 `pages/<locale>/<id>.md`，标题见 `MANUAL_TITLES` */
export const MANUAL_TREE: ManualNode = {
  id: 'jieshang',
  children: [
    {
      id: 'game',
      children: [{ id: 'game-arcade' }, { id: 'game-endless' }, { id: 'game-extreme' }]
    },
    {
      id: 'scores',
      children: [
        { id: 'score-manage' },
        {
          id: 'score-edit',
          children: [
            { id: 'edit-structure' },
            { id: 'edit-top' },
            { id: 'edit-import-export' },
            { id: 'edit-piano-record' },
            { id: 'edit-quick-number' },
            { id: 'edit-context-menu' },
            { id: 'edit-measure' },
            { id: 'edit-symbols' },
            { id: 'edit-box-select' },
            { id: 'edit-sync' },
            { id: 'edit-staff', children: [{ id: 'edit-staff-note' }] },
            { id: 'edit-number', children: [{ id: 'edit-number-note' }] },
            { id: 'edit-drum', children: [{ id: 'edit-drum-note' }] },
            { id: 'edit-tab', children: [{ id: 'edit-tab-note' }] }
          ]
        },
        {
          id: 'score-play',
          children: [
            { id: 'play-features' },
            { id: 'play-practice' },
            { id: 'play-beginner' },
            { id: 'play-singing' }
          ]
        },
        { id: 'cl-sheet' }
      ]
    },
    {
      id: 'works',
      children: [
        { id: 'work-manage' },
        { id: 'work-show', children: [{ id: 'work-show-features' }, { id: 'work-show-elements' }] },
        { id: 'work-edit', children: [{ id: 'work-edit-features' }] }
      ]
    },
    { id: 'whiteboard' },
    { id: 'chords' },
    {
      id: 'ability',
      children: [
        { id: 'ability-rhythm' },
        { id: 'ability-pitch' },
        { id: 'ability-key-note' },
        { id: 'ability-chord' },
        { id: 'ability-practice' }
      ]
    },
    { id: 'instruments' },
    { id: 'media' },
    {
      id: 'tools',
      children: [
        { id: 'tool-tune' },
        { id: 'tool-metronome' },
        { id: 'tool-pitch' },
        { id: 'tool-mic' },
        { id: 'tool-midi' }
      ]
    },
    { id: 'collection' },
    { id: 'achievements' }
  ]
}

const MANUAL_TITLES: Record<AppLocale, Record<string, string>> = {
  zh: {
    jieshang: '解熵',
    game: '主线游戏',
    'game-arcade': '街机模式',
    'game-endless': '无限模式',
    'game-extreme': '极限模式',
    scores: '我的曲谱',
    'score-manage': '曲谱管理',
    'score-edit': '编辑模式',
    'edit-structure': '曲谱结构',
    'edit-top': '顶部功能',
    'edit-import-export': '导入导出',
    'edit-piano-record': '线谱录制录入',
    'edit-quick-number': '简谱快速录入',
    'edit-context-menu': '右键',
    'edit-measure': '小节',
    'edit-symbols': '其它符号',
    'edit-box-select': '框选音符',
    'edit-sync': '谱音同步',
    'edit-staff': '五线谱编辑',
    'edit-staff-note': '音符',
    'edit-number': '简谱',
    'edit-number-note': '音符',
    'edit-drum': '架子鼓谱',
    'edit-drum-note': '音符',
    'edit-tab': 'Tab谱',
    'edit-tab-note': '音符',
    'score-play': '播放模式',
    'play-features': '功能',
    'play-practice': '练习模式',
    'play-beginner': '新手模式',
    'play-singing': '演唱模式',
    'cl-sheet': '和弦弹唱谱',
    works: '我的作品',
    'work-manage': '作品管理',
    'work-show': '展示模式',
    'work-show-features': '功能',
    'work-show-elements': '元素功能',
    'work-edit': '编辑模式',
    'work-edit-features': '功能',
    whiteboard: '教学白板',
    chords: '和弦管理',
    ability: '能力测试',
    'ability-rhythm': '节奏感测试',
    'ability-pitch': '音感测试',
    'ability-key-note': '琴键音名识别',
    'ability-chord': '和弦识别',
    'ability-practice': '练习模式',
    instruments: '模拟乐器',
    media: '图片/音频/视频管理',
    tools: '工具',
    'tool-tune': '调弦',
    'tool-metronome': '节拍器',
    'tool-pitch': '音高检测',
    'tool-mic': '麦克风检测',
    'tool-midi': 'midi检测',
    collection: '藏品',
    achievements: '成就'
  },
  en: {
    jieshang: 'Decipher',
    game: 'Main game',
    'game-arcade': 'Arcade mode',
    'game-endless': 'Endless mode',
    'game-extreme': 'Extreme mode',
    scores: 'My scores',
    'score-manage': 'Managing scores',
    'score-edit': 'Edit mode',
    'edit-structure': 'Score structure',
    'edit-top': 'Top toolbar',
    'edit-import-export': 'Import and export',
    'edit-piano-record': 'Staff input by recording',
    'edit-quick-number': 'Quick number-notation input',
    'edit-context-menu': 'Right-click menu',
    'edit-measure': 'Measures',
    'edit-symbols': 'Other symbols',
    'edit-box-select': 'Box-selecting notes',
    'edit-sync': 'Score-audio sync',
    'edit-staff': 'Staff editing',
    'edit-staff-note': 'Notes',
    'edit-number': 'Number notation',
    'edit-number-note': 'Notes',
    'edit-drum': 'Drum kit score',
    'edit-drum-note': 'Notes',
    'edit-tab': 'Tab',
    'edit-tab-note': 'Notes',
    'score-play': 'Play mode',
    'play-features': 'Features',
    'play-practice': 'Practice mode',
    'play-beginner': 'Beginner mode',
    'play-singing': 'Singing mode',
    'cl-sheet': 'Chord & lyric sheet',
    works: 'My works',
    'work-manage': 'Managing works',
    'work-show': 'Presentation mode',
    'work-show-features': 'Features',
    'work-show-elements': 'Element features',
    'work-edit': 'Edit mode',
    'work-edit-features': 'Features',
    whiteboard: 'Teaching whiteboard',
    chords: 'Chord manager',
    ability: 'Ability tests',
    'ability-rhythm': 'Rhythm sense test',
    'ability-pitch': 'Pitch sense test',
    'ability-key-note': 'Key note name quiz',
    'ability-chord': 'Chord recognition quiz',
    'ability-practice': 'Practice mode',
    instruments: 'Instrument simulator',
    media: 'Images / audio / videos',
    tools: 'Tools',
    'tool-tune': 'Tuner',
    'tool-metronome': 'Metronome',
    'tool-pitch': 'Pitch detection',
    'tool-mic': 'Microphone check',
    'tool-midi': 'MIDI device check',
    collection: 'Collection',
    achievements: 'Achievements'
  },
  ja: {
    jieshang: '解熵',
    game: 'メインゲーム',
    'game-arcade': 'アーケードモード',
    'game-endless': 'エンドレスモード',
    'game-extreme': 'エクストリームモード',
    scores: 'マイ楽譜',
    'score-manage': '楽譜の管理',
    'score-edit': '編集モード',
    'edit-structure': '楽譜の構成',
    'edit-top': '上部の機能',
    'edit-import-export': 'インポートとエクスポート',
    'edit-piano-record': '五線譜の録音入力',
    'edit-quick-number': '数字譜のクイック入力',
    'edit-context-menu': '右クリックメニュー',
    'edit-measure': '小節',
    'edit-symbols': 'その他の記号',
    'edit-box-select': '音符の範囲選択',
    'edit-sync': '譜面と音声の同期',
    'edit-staff': '五線譜の編集',
    'edit-staff-note': '音符',
    'edit-number': '数字譜',
    'edit-number-note': '音符',
    'edit-drum': 'ドラムセット譜',
    'edit-drum-note': '音符',
    'edit-tab': 'TAB譜',
    'edit-tab-note': '音符',
    'score-play': '再生モード',
    'play-features': '機能',
    'play-practice': '練習モード',
    'play-beginner': '初心者モード',
    'play-singing': '歌唱モード',
    'cl-sheet': 'コード弾き語り譜',
    works: 'マイ作品',
    'work-manage': '作品の管理',
    'work-show': 'プレゼンモード',
    'work-show-features': '機能',
    'work-show-elements': '要素の機能',
    'work-edit': '編集モード',
    'work-edit-features': '機能',
    whiteboard: '授業用ホワイトボード',
    chords: 'コード管理',
    ability: '能力テスト',
    'ability-rhythm': 'リズム感テスト',
    'ability-pitch': '音感テスト',
    'ability-key-note': '鍵盤の音名当て',
    'ability-chord': 'コード聴き取り',
    'ability-practice': '練習モード',
    instruments: '楽器シミュレーター',
    media: '画像・オーディオ・動画の管理',
    tools: 'ツール',
    'tool-tune': 'チューナー',
    'tool-metronome': 'メトロノーム',
    'tool-pitch': 'ピッチ検出',
    'tool-mic': 'マイクチェック',
    'tool-midi': 'MIDI デバイスチェック',
    collection: 'コレクション',
    achievements: '実績'
  }
}

const PAGE_SOURCES = import.meta.glob('./pages/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

export function getManualTitle(id: string, locale: AppLocale): string {
  return MANUAL_TITLES[locale][id] ?? MANUAL_TITLES.zh[id] ?? id
}

/** 缺少该语言的页面时退回中文 */
export function getManualPageSource(id: string, locale: AppLocale): string {
  return PAGE_SOURCES[`./pages/${locale}/${id}.md`] ?? PAGE_SOURCES[`./pages/zh/${id}.md`] ?? ''
}

/** 先序遍历，即目录从上到下的阅读顺序 */
export const MANUAL_FLAT: ManualNode[] = (() => {
  const out: ManualNode[] = []
  const walk = (node: ManualNode): void => {
    out.push(node)
    node.children?.forEach(walk)
  }
  walk(MANUAL_TREE)
  return out
})()

const NODE_BY_ID = new Map(MANUAL_FLAT.map((n) => [n.id, n]))

const PARENT_BY_ID = (() => {
  const map = new Map<string, ManualNode>()
  for (const node of MANUAL_FLAT) node.children?.forEach((c) => map.set(c.id, node))
  return map
})()

export function findManualNode(id: string): ManualNode | undefined {
  return NODE_BY_ID.get(id)
}

/** 从根到该节点父级的祖先链 */
export function getManualAncestors(id: string): ManualNode[] {
  const chain: ManualNode[] = []
  let parent = PARENT_BY_ID.get(id)
  while (parent) {
    chain.unshift(parent)
    parent = PARENT_BY_ID.get(parent.id)
  }
  return chain
}

/** 页面第一段正文，作为子章节卡片的简介；英文按字符数放宽一倍 */
export function getManualPageSummary(id: string, locale: AppLocale): string {
  const maxLength = locale === 'en' ? 120 : 60
  const lines = getManualPageSource(id, locale).replace(/\r\n?/g, '\n').split('\n')
  const first = lines.find((line) => {
    const s = line.trim()
    return s && !/^(#|>|-|\*|\||\d+\.|```|!\[)/.test(s)
  })
  if (!first) return ''
  const plain = first
    .trim()
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(#[\w-]+\)/g, '$1')
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain
}
