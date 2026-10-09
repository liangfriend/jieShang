/**
 * 电子鼓机：打击乐音色对照表与默认参数。
 * 音色为藏品「打击乐」（da-ji-yue，`{ 序号: dataURL }`），序号即 NPlayer 的 midi 键。
 */

/** NPlayer 中鼓机音色名 */
export const DRUM_TONE_COLOR_NAME = 'drum-machine'

/**
 * gm：GM 打击乐库（128-xx），经音频比对确认
 * gmExtra：库号在 GM 映射之外，按音频特征推断（可信度中低）
 * named：源文件即拼音名，直接翻译
 */
export type DrumSoundCategory = 'gm' | 'gmExtra' | 'named'

export type DrumSoundMeta = {
  /** da-ji-yue.json 键（序号） */
  key: number
  /** 源音色库 key，如 128-69 */
  sourceKey?: string
  zh: string
  en: string
  category: DrumSoundCategory
  /** 音频比对佐证 */
  evidence?: string
}

export const DRUM_SOUND_LIST: readonly DrumSoundMeta[] = [
  { key: 1, sourceKey: '131-60', zh: '未知亮音（似铃鼓/沙蛋）', en: 'Unknown bright shaker', category: 'gmExtra', evidence: '库号 131 非标准打击乐库，唯一 WAV；声音亮而短，无法确定' },
  { key: 2, sourceKey: '128-69', zh: '强音镲 2（Crash 2）', en: 'Crash cymbal 2', category: 'gm', evidence: '≈ 右大镲' },
  { key: 3, sourceKey: '128-41', zh: '右强音镲（止音）', en: 'Crash R (choked)', category: 'gmExtra', evidence: '与右大镲同音源但很快被掐断' },
  { key: 4, sourceKey: '128-55', zh: '高音落地通鼓', en: 'High floor tom', category: 'gm', evidence: '≈ 低筒鼓 1.00' },
  { key: 5, sourceKey: '128-54', zh: '踩镲（闭合）', en: 'Closed hi-hat', category: 'gm', evidence: '≈ 踩镲合' },
  { key: 6, sourceKey: '128-40', zh: '左强音镲（止音）', en: 'Crash L (choked)', category: 'gmExtra', evidence: '左强音镲的止音 / 闷镲' },
  { key: 7, sourceKey: '128-68', zh: '牛铃', en: 'Cowbell', category: 'gm', evidence: '仅按规律推断，特征大致吻合' },
  { key: 8, sourceKey: '128-56', zh: '踩镲（踩踏）', en: 'Pedal hi-hat', category: 'gm', evidence: '声音很轻，比对不出来' },
  { key: 9, sourceKey: '128-43', zh: '金属/沙类长音', en: 'Metallic shaker (unknown)', category: 'gmExtra', evidence: '高频、尾音长，无法确定' },
  { key: 10, sourceKey: '128-57', zh: '低通鼓', en: 'Low tom', category: 'gm', evidence: '≈ 中筒鼓 0.99' },
  { key: 11, sourceKey: '128-53', zh: '低音落地通鼓', en: 'Low floor tom', category: 'gm', evidence: '≈ 低筒鼓 0.98' },
  { key: 12, sourceKey: '128-47', zh: '原声底鼓', en: 'Acoustic bass drum', category: 'gm', evidence: '≈ 底鼓 1.00' },
  { key: 13, sourceKey: '128-46', zh: '军鼓变体', en: 'Snare variant', category: 'gmExtra', evidence: '军鼓的变体奏法' },
  { key: 14, sourceKey: '128-52', zh: '电军鼓', en: 'Electric snare', category: 'gm', evidence: '≈ 军鼓' },
  { key: 15, sourceKey: '128-44', zh: '鼓边/鼓槌短击', en: 'Rim / stick click', category: 'gmExtra', evidence: '短促击打声' },
  { key: 16, sourceKey: '128-50', zh: '原声军鼓', en: 'Acoustic snare', category: 'gm', evidence: '≈ 军鼓 0.98' },
  { key: 17, sourceKey: '128-51', zh: '拍手 / 响指', en: 'Hand clap / snap', category: 'gm', evidence: '≈ 响指 0.97' },
  { key: 18, sourceKey: '128-45', zh: '踩镲（踩踏 2）', en: 'Pedal hi-hat 2', category: 'gmExtra', evidence: '与序号 8 特征几乎一样' },
  { key: 19, sourceKey: '128-48', zh: '底鼓', en: 'Bass drum', category: 'gm', evidence: '≈ 底鼓 0.99' },
  { key: 20, sourceKey: '128-60', zh: '中高通鼓', en: 'Hi-mid tom', category: 'gm', evidence: '≈ 高筒鼓 0.98' },
  { key: 21, sourceKey: '128-61', zh: '强音镲 1（Crash 1）', en: 'Crash cymbal 1', category: 'gm', evidence: '≈ 左大镲 0.99' },
  { key: 22, sourceKey: '128-49', zh: '鼓边（侧击）', en: 'Side stick', category: 'gm', evidence: '≈ 鼓边 0.99' },
  { key: 23, sourceKey: '128-63', zh: '叮叮镲 1（Ride 1）', en: 'Ride cymbal 1', category: 'gm', evidence: '≈ 叮叮镲' },
  { key: 24, sourceKey: '128-62', zh: '高通鼓', en: 'High tom', category: 'gm', evidence: '与序号 20 是同一段音频' },
  { key: 25, sourceKey: '128-66', zh: '铃鼓', en: 'Tambourine', category: 'gm', evidence: '≈ 铃鼓 0.97' },
  { key: 26, sourceKey: '128-65', zh: '叮叮镲帽（Ride Bell）', en: 'Ride bell', category: 'gm', evidence: '≈ 叮镲帽 0.97' },
  { key: 27, sourceKey: '128-71', zh: '叮叮镲 2（Ride 2）', en: 'Ride cymbal 2', category: 'gm', evidence: '≈ 叮叮镲 0.97' },
  { key: 28, sourceKey: '128-59', zh: '中低通鼓', en: 'Low-mid tom', category: 'gm', evidence: '≈ 中筒鼓 0.98' },
  { key: 29, sourceKey: '128-58', zh: '踩镲（开音）', en: 'Open hi-hat', category: 'gm', evidence: '≈ 踩镲开 0.99' },
  { key: 30, sourceKey: '128-64', zh: '中国镲', en: 'Chinese cymbal', category: 'gm', evidence: '按规律推断，10 秒长尾音相符' },
  { key: 31, zh: '踩镲（合）', en: 'Hi-hat (closed)', category: 'named' },
  { key: 32, zh: '踩镲（开）', en: 'Hi-hat (open)', category: 'named' },
  { key: 33, zh: '镲', en: 'Cymbal', category: 'named' },
  { key: 34, zh: '串铃', en: 'Sleigh bells', category: 'named' },
  { key: 35, zh: '大钹', en: 'Large bo cymbals', category: 'named' },
  { key: 36, zh: '大镲', en: 'Big cymbal', category: 'named' },
  { key: 37, zh: '大鼓', en: 'Big drum', category: 'named' },
  { key: 38, zh: '大锣', en: 'Big gong', category: 'named' },
  { key: 39, zh: '底鼓', en: 'Kick', category: 'named' },
  { key: 40, zh: '低筒鼓', en: 'Low tom', category: 'named' },
  { key: 41, zh: '叮镲帽', en: 'Ride bell', category: 'named' },
  { key: 42, zh: '叮叮镲镲帽', en: 'Ride cymbal bell', category: 'named' },
  { key: 43, zh: 'duo-jiao（似低音鼓）', en: 'Duo-jiao (bass-like)', category: 'named' },
  { key: 44, zh: '风铃', en: 'Wind chimes', category: 'named' },
  { key: 45, zh: '高筒鼓', en: 'High tom', category: 'named' },
  { key: 46, zh: '鼓槌', en: 'Drumsticks', category: 'named' },
  { key: 47, zh: '号 do', en: 'Horn do', category: 'named' },
  { key: 48, zh: '号 低音 sol', en: 'Horn low sol', category: 'named' },
  { key: 49, zh: '号 mi', en: 'Horn mi', category: 'named' },
  { key: 50, zh: '号 sol', en: 'Horn sol', category: 'named' },
  { key: 51, zh: '军鼓边', en: 'Snare rim', category: 'named' },
  { key: 52, zh: '军鼓', en: 'Snare', category: 'named' },
  { key: 53, zh: '卡巴萨', en: 'Cabasa', category: 'named' },
  { key: 54, zh: '铃鼓', en: 'Tambourine', category: 'named' },
  { key: 55, zh: '木块', en: 'Wood block', category: 'named' },
  { key: 56, zh: '木鱼', en: 'Temple block', category: 'named' },
  { key: 57, zh: '牛铃', en: 'Cowbell', category: 'named' },
  { key: 58, zh: '拍手', en: 'Hand clap', category: 'named' },
  { key: 59, zh: '三角铁', en: 'Triangle', category: 'named' },
  { key: 60, zh: '沙槌', en: 'Maracas', category: 'named' },
  { key: 61, zh: '沙蛋', en: 'Egg shaker', category: 'named' },
  { key: 62, zh: '蛙鸣筒', en: 'Frog guiro', category: 'named' },
  { key: 63, zh: '响板', en: 'Castanets', category: 'named' },
  { key: 64, zh: '响棒', en: 'Claves', category: 'named' },
  { key: 65, zh: '响指', en: 'Finger snap', category: 'named' },
  { key: 66, zh: '小钹', en: 'Small bo cymbals', category: 'named' },
  { key: 67, zh: '小镲', en: 'Small cymbal', category: 'named' },
  { key: 68, zh: '右吊镲', en: 'Suspended cymbal R', category: 'named' },
  { key: 69, zh: '中国大镲', en: 'Chinese big cymbal', category: 'named' },
  { key: 70, zh: '中国大鼓', en: 'Chinese big drum', category: 'named' },
  { key: 71, zh: '中锣', en: 'Medium gong', category: 'named' },
  { key: 72, zh: '中筒鼓', en: 'Mid tom', category: 'named' },
  { key: 73, zh: '左吊镲', en: 'Suspended cymbal L', category: 'named' },
  { key: 74, zh: '大鼓边', en: 'Big drum rim', category: 'named' },
  { key: 75, zh: '非洲鼓（闷音）', en: 'Djembe (muted)', category: 'named' },
  { key: 76, zh: '非洲鼓（低音）', en: 'Djembe (bass)', category: 'named' },
  { key: 77, zh: '非洲鼓（低音 2）', en: 'Djembe (bass 2)', category: 'named' },
  { key: 78, zh: '非洲鼓（高音）', en: 'Djembe (slap)', category: 'named' },
  { key: 79, zh: '非洲鼓（开音）', en: 'Djembe (open)', category: 'named' },
  { key: 80, zh: '鼓边', en: 'Rim', category: 'named' },
  { key: 81, zh: '锣', en: 'Gong', category: 'named' },
  { key: 82, zh: '右大镲', en: 'Crash R', category: 'named' },
  { key: 83, zh: '左大镲', en: 'Crash L', category: 'named' }
]

export const DRUM_SOUND_MAP: ReadonlyMap<number, DrumSoundMeta> = new Map(
  DRUM_SOUND_LIST.map((s) => [s.key, s])
)

export const DRUM_SOUND_CATEGORIES: readonly DrumSoundCategory[] = ['gm', 'gmExtra', 'named']

export function isDrumSoundKey(key: unknown): key is number {
  return typeof key === 'number' && DRUM_SOUND_MAP.has(key)
}

/** 日文名（按序号） */
const DRUM_SOUND_JA: Readonly<Record<number, string>> = {
  1: '不明な明るい音（タンバリン／シェイカー風）',
  2: 'クラッシュシンバル 2',
  3: 'クラッシュ R（チョーク）',
  4: 'ハイフロアタム',
  5: 'クローズドハイハット',
  6: 'クラッシュ L（チョーク）',
  7: 'カウベル',
  8: 'ペダルハイハット',
  9: '金属系シェイカー（不明）',
  10: 'ロータム',
  11: 'ローフロアタム',
  12: 'アコースティックバスドラム',
  13: 'スネア（バリエーション）',
  14: 'エレクトリックスネア',
  15: 'リム／スティッククリック',
  16: 'アコースティックスネア',
  17: 'ハンドクラップ／フィンガースナップ',
  18: 'ペダルハイハット 2',
  19: 'バスドラム',
  20: 'ハイミッドタム',
  21: 'クラッシュシンバル 1',
  22: 'サイドスティック',
  23: 'ライドシンバル 1',
  24: 'ハイタム',
  25: 'タンバリン',
  26: 'ライドベル',
  27: 'ライドシンバル 2',
  28: 'ローミッドタム',
  29: 'オープンハイハット',
  30: 'チャイナシンバル',
  31: 'ハイハット（クローズ）',
  32: 'ハイハット（オープン）',
  33: 'シンバル',
  34: 'スレイベル',
  35: '大鈸（ダーボー）',
  36: '大シンバル',
  37: '大太鼓',
  38: '大銅鑼',
  39: 'キック',
  40: 'ロータム',
  41: 'ライドベル',
  42: 'ライドシンバルベル',
  43: 'duo-jiao（低音ドラム風）',
  44: 'ウィンドチャイム',
  45: 'ハイタム',
  46: 'ドラムスティック',
  47: 'ホルン ド',
  48: 'ホルン 低音ソ',
  49: 'ホルン ミ',
  50: 'ホルン ソ',
  51: 'スネアリム',
  52: 'スネア',
  53: 'カバサ',
  54: 'タンバリン',
  55: 'ウッドブロック',
  56: '木魚',
  57: 'カウベル',
  58: 'ハンドクラップ',
  59: 'トライアングル',
  60: 'マラカス',
  61: 'エッグシェイカー',
  62: 'カエルギロ',
  63: 'カスタネット',
  64: 'クラベス',
  65: 'フィンガースナップ',
  66: '小鈸（シャオボー）',
  67: '小シンバル',
  68: 'サスペンデッドシンバル R',
  69: '中国大シンバル',
  70: '中国大太鼓',
  71: '中銅鑼',
  72: 'ミッドタム',
  73: 'サスペンデッドシンバル L',
  74: '大太鼓リム',
  75: 'ジャンベ（ミュート）',
  76: 'ジャンベ（ベース）',
  77: 'ジャンベ（ベース 2）',
  78: 'ジャンベ（スラップ）',
  79: 'ジャンベ（オープン）',
  80: 'リム',
  81: '銅鑼',
  82: 'クラッシュ R',
  83: 'クラッシュ L'
}

export function drumSoundLabel(key: number, locale: string): string {
  const meta = DRUM_SOUND_MAP.get(key)
  if (!meta) return String(key)
  if (locale.startsWith('zh')) return meta.zh
  if (locale.startsWith('ja')) return DRUM_SOUND_JA[key] ?? meta.en
  return meta.en
}

// —— 时值（Unit256）——

/** 四分音符 = 64 */
export const DRUM_BEAT_UNITS = 64
/** 4/4 一小节 */
export const DRUM_BAR_UNITS = 256
/** 新块 / 补齐用的默认时值：十六分 */
export const DRUM_DEFAULT_BLOCK_UNITS = 16
/** 可选块时值：二分、四分、八分、十六分、三十二分 */
export const DRUM_BLOCK_UNIT_OPTIONS = [128, 64, 32, 16, 8] as const

/** 音轨区总时值（拍）范围；默认 2 小节 = 32 个十六分块 */
export const DRUM_TOTAL_BEATS_MIN = 1
export const DRUM_TOTAL_BEATS_MAX = 64
export const DRUM_DEFAULT_TOTAL_BEATS = 8

// —— 播放配置 ——

export const DRUM_BPM_MIN = 40
export const DRUM_BPM_MAX = 240
export const DRUM_DEFAULT_BPM = 110
export const DRUM_DEFAULT_VOLUME = 0.5
export const DRUM_DEFAULT_TRACK_VOLUME = 0.8
/** 摇摆上限：反拍最多延后 0.6 个摇摆单位 */
export const DRUM_SWING_MAX = 0.6
export const DRUM_SWING_UNIT_OPTIONS = [128, 64, 32, 16, 8] as const
export const DRUM_DEFAULT_SWING_UNIT = 32

/** 调度提前量（秒）与轮询间隔（毫秒） */
export const DRUM_SCHEDULE_LOOKAHEAD_SEC = 0.12
export const DRUM_SCHEDULE_TICK_MS = 25

/** 最多音轨数 */
export const DRUM_TRACK_MAX = 24

/** 默认 9 轨（对应在线鼓机的底鼓、军鼓、闭镲、开镲、拍手、叮叮镲、高/中/低筒鼓） */
export const DRUM_DEFAULT_TRACK_SOUNDS: readonly number[] = [12, 16, 5, 29, 58, 23, 24, 10, 4]

/** 默认节奏：各轨在十六分网格上的击打位置（两小节） */
export const DRUM_DEFAULT_HITS: Readonly<Record<number, readonly number[]>> = {
  12: [0, 6, 8, 16, 22, 24],
  16: [4, 12, 20, 28],
  5: [0, 2, 4, 6, 8, 10, 12, 16, 18, 20, 22, 24, 26, 28],
  29: [14, 30]
}

/** 轨道配色（按轨道序号循环） */
export const DRUM_TRACK_COLORS: readonly string[] = [
  '#f472b6',
  '#fb923c',
  '#facc15',
  '#34d399',
  '#22d3ee',
  '#60a5fa',
  '#a78bfa',
  '#f87171',
  '#4ade80'
]
