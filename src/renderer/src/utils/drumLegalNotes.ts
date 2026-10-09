/**
 * 鼓谱合法音符一览：对照 dr-play DEFAULT_DRUM_PLAY_MAP，为每个 region+headType 生成单音符预览曲谱。
 */
import {
  ClefTypeEnum,
  DrumHeadTypeEnum,
  MusicScoreTypeEnum,
  type MusicScore
} from '@deciphony/renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createSingleStaff,
  insertDrumNote,
  type DrumVoice
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  DEFAULT_DRUM_PLAY_MAP,
  drumPlayMapKey,
  type DrumPlayMapKey
} from '@deciphony/extensions/dr-play'

export type DrumLegalNoteLabel = {
  zh: string
  en: string
  ja: string
}

/** 与 DEFAULT_DRUM_PLAY_MAP 注释一致的乐器名 */
export const DRUM_LEGAL_NOTE_LABELS: Record<DrumPlayMapKey, DrumLegalNoteLabel> = {
  [drumPlayMapKey(11, DrumHeadTypeEnum.Cross)]: {
    zh: '强音镲 2',
    en: 'Crash 2',
    ja: 'クラッシュ 2'
  },
  [drumPlayMapKey(11, DrumHeadTypeEnum.CircledCross)]: {
    zh: '中国镲',
    en: 'Chinese cymbal',
    ja: 'チャイニーズシンバル'
  },
  [drumPlayMapKey(10, DrumHeadTypeEnum.Cross)]: {
    zh: '强音镲 1',
    en: 'Crash 1',
    ja: 'クラッシュ 1'
  },
  [drumPlayMapKey(9, DrumHeadTypeEnum.CircledCross)]: {
    zh: '踩镲（开）',
    en: 'Hi-hat (open)',
    ja: 'ハイハット（オープン）'
  },
  [drumPlayMapKey(9, DrumHeadTypeEnum.CircledSlash)]: {
    zh: '踩镲（半开）',
    en: 'Hi-hat (half-open)',
    ja: 'ハイハット（ハーフオープン）'
  },
  [drumPlayMapKey(9, DrumHeadTypeEnum.Cross)]: {
    zh: '踩镲（合）',
    en: 'Hi-hat (closed)',
    ja: 'ハイハット（クローズ）'
  },
  [drumPlayMapKey(9, DrumHeadTypeEnum.Normal)]: {
    zh: '高音通鼓',
    en: 'High tom',
    ja: 'ハイタム'
  },
  [drumPlayMapKey(9, DrumHeadTypeEnum.Triangle)]: {
    zh: '牛铃',
    en: 'Cowbell',
    ja: 'カウベル'
  },
  [drumPlayMapKey(8, DrumHeadTypeEnum.Cross)]: {
    zh: '叮叮镲',
    en: 'Ride cymbal',
    ja: 'ライドシンバル'
  },
  [drumPlayMapKey(8, DrumHeadTypeEnum.Diamond)]: {
    zh: '叮叮镲帽',
    en: 'Ride bell',
    ja: 'ライドベル'
  },
  [drumPlayMapKey(7, DrumHeadTypeEnum.Normal)]: {
    zh: '通鼓 1（中高通鼓）',
    en: 'Tom 1 (hi-mid)',
    ja: 'タム 1（ハイミッド）'
  },
  [drumPlayMapKey(6, DrumHeadTypeEnum.Normal)]: {
    zh: '通鼓 2（中筒鼓）',
    en: 'Tom 2 (mid)',
    ja: 'タム 2（ミッド）'
  },
  [drumPlayMapKey(5, DrumHeadTypeEnum.Normal)]: {
    zh: '军鼓',
    en: 'Snare',
    ja: 'スネア'
  },
  [drumPlayMapKey(5, DrumHeadTypeEnum.Cross)]: {
    zh: '鼓边侧击',
    en: 'Side stick',
    ja: 'サイドスティック'
  },
  [drumPlayMapKey(5, DrumHeadTypeEnum.CircledSlash)]: {
    zh: '军鼓边',
    en: 'Rim shot',
    ja: 'リムショット'
  },
  [drumPlayMapKey(3, DrumHeadTypeEnum.Normal)]: {
    zh: '通鼓 3（落地通鼓）',
    en: 'Tom 3 (floor)',
    ja: 'タム 3（フロア）'
  },
  [drumPlayMapKey(1, DrumHeadTypeEnum.Normal)]: {
    zh: '底鼓',
    en: 'Bass drum',
    ja: 'バスドラム'
  },
  [drumPlayMapKey(-1, DrumHeadTypeEnum.Cross)]: {
    zh: '脚踩踩镲',
    en: 'Pedal hi-hat',
    ja: 'ペダルハイハット'
  },
  [drumPlayMapKey(-1, DrumHeadTypeEnum.Normal)]: {
    zh: '脚踩踩镲',
    en: 'Pedal hi-hat',
    ja: 'ペダルハイハット'
  }
}

export type DrumLegalNoteEntry = {
  key: DrumPlayMapKey
  region: number
  headType: DrumHeadTypeEnum
  midi: number
  volume?: number
  label: DrumLegalNoteLabel
  /** 编辑快捷键（小写字母），超出 26 个时为 null */
  shortcut: string | null
  score: MusicScore
}

export type DrumLegalNoteShortcut = {
  key: DrumPlayMapKey
  region: number
  headType: DrumHeadTypeEnum
  shortcut: string
}

function resolveVoice(region: number): DrumVoice {
  return region <= 3 ? 'down' : 'up'
}

function buildPreviewScore(region: number, headType: DrumHeadTypeEnum): MusicScore {
  const score = createMusicScore({
    type: MusicScoreTypeEnum.DrumNotation,
    width: 240,
    height: 200,
    topSpaceHeight: 36,
    title: '',
    description: ''
  })
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    linkedStaff: false,
    uSpace: 0,
    dSpace: 0
  })
  const staff = createSingleStaff({
    withDefaultMeasure: false,
    notationType: MusicScoreTypeEnum.DrumNotation,
    uSpaceI: 48,
    dSpaceI: 48,
    uSpaceO: 8,
    dSpaceO: 8
  })
  const measure = createMeasure({
    clef: ClefTypeEnum.Percussion,
    voices: true,
    widthRatioForMeasure: 1
  })
  insertDrumNote(measure, resolveVoice(region), 0, {
    region,
    headType,
    chronaxie: 64
  })
  staff.measures.push(measure)
  grandStaff.staves.push(staff)
  score.grandStaffs.push(grandStaff)
  return score
}

function parseMapKey(key: string): { region: number; headType: DrumHeadTypeEnum } | null {
  const sep = key.lastIndexOf('-')
  if (sep <= 0) return null
  const region = Number(key.slice(0, sep))
  const headType = key.slice(sep + 1) as DrumHeadTypeEnum
  if (!Number.isFinite(region)) return null
  if (!Object.values(DrumHeadTypeEnum).includes(headType)) return null
  return { region, headType }
}

function shortcutForIndex(index: number): string | null {
  return index < 26 ? String.fromCharCode(97 + index) : null
}

function listMapEntries() {
  const out: { key: DrumPlayMapKey; region: number; headType: DrumHeadTypeEnum; midi: number; volume?: number }[] = []
  for (const [rawKey, entry] of Object.entries(DEFAULT_DRUM_PLAY_MAP)) {
    if (!entry) continue
    const parsed = parseMapKey(rawKey)
    if (!parsed) continue
    out.push({ key: rawKey as DrumPlayMapKey, ...parsed, midi: entry.midi, volume: entry.volume })
  }
  return out
}

/** 合法音符快捷键：按 DEFAULT_DRUM_PLAY_MAP 顺序依次分配 a、b、c… */
export const DRUM_LEGAL_NOTE_SHORTCUTS: DrumLegalNoteShortcut[] = listMapEntries().flatMap(
  ({ key, region, headType }, index) => {
    const shortcut = shortcutForIndex(index)
    return shortcut ? [{ key, region, headType, shortcut }] : []
  }
)

export function findDrumLegalNoteByShortcut(letter: string): DrumLegalNoteShortcut | null {
  const lower = letter.toLowerCase()
  return DRUM_LEGAL_NOTE_SHORTCUTS.find((item) => item.shortcut === lower) ?? null
}

/** 按 DEFAULT_DRUM_PLAY_MAP 顺序生成合法音符卡片数据 */
export function listDrumLegalNotes(): DrumLegalNoteEntry[] {
  return listMapEntries().map(({ key, region, headType, midi, volume }, index) => ({
    key,
    region,
    headType,
    midi,
    ...(volume != null ? { volume } : {}),
    label: DRUM_LEGAL_NOTE_LABELS[key] ?? { zh: key, en: key, ja: key },
    shortcut: shortcutForIndex(index),
    score: buildPreviewScore(region, headType)
  }))
}

export function drumLegalNoteDisplayName(label: DrumLegalNoteLabel, locale: string): string {
  if (locale.startsWith('ja')) return label.ja
  if (locale.startsWith('en')) return label.en
  return label.zh
}
