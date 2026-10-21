/** 内置默认：标题区（t）高度 */
export const DEFAULT_SCORE_T_SLOT_H = 140

export const SCORE_T_SLOT_H_MIN = 40
export const SCORE_T_SLOT_H_MAX = 400
export const SCORE_T_SLOT_H_STEP = 4

/**
 * 歌词挂在每个单谱表的 s-d 上，s-d 高度固定 0，歌词往下占用单谱表下外边距；
 * 估算曲谱总高度时给最后一个单谱表下方的歌词留这么多
 */
export const SCORE_LYRICS_RESERVE_H = 100

/** musicScore.data 上的标题区高度字段（与 uSpace 一样随谱保存） */
export const SCORE_DATA_T_SLOT_H = 'tSlotH'
/** 作品（deciphony-work）按此字段定 s-d 高度；编辑器 s-d 固定 0，始终写 0 保持一致 */
export const SCORE_DATA_GD_SLOT_H = 'gdSlotH'

/** 内置默认：左留白（s-l 宽度），音色名也画在这里 */
export const DEFAULT_SCORE_S_L_SLOT_W = 80
export const SCORE_S_L_SLOT_W_MIN = 0
export const SCORE_S_L_SLOT_W_MAX = 300
export const SCORE_S_L_SLOT_W_STEP = 2

/** 内置默认：歌词字号（px），与 dr-lyrics 默认一致 */
export const DEFAULT_SCORE_LYRICS_FONT_SIZE = 13
export const SCORE_LYRICS_FONT_SIZE_MIN = 8
export const SCORE_LYRICS_FONT_SIZE_MAX = 40
export const SCORE_LYRICS_FONT_SIZE_STEP = 1

/** 内置默认：右留白（s-r 宽度），给换行处的连音线留位置 */
export const DEFAULT_SCORE_S_R_SLOT_W = 50
export const SCORE_S_R_SLOT_W_MIN = 0
export const SCORE_S_R_SLOT_W_MAX = 300
export const SCORE_S_R_SLOT_W_STEP = 2

/** 音色名文字与谱表的间距：须大于连谱号宽度（皮肤里 bracket 约 12px，画在 s-l 最右侧） */
export const SCORE_INSTRUMENT_NAME_GAP = 18

/** musicScore.data 上的左留白字段；作品（deciphony-work Score.vue）读同名字段 */
export const SCORE_DATA_S_L_SLOT_W = 'sLSlotW'

/** musicScore.data 上的右留白字段；作品读同名字段 */
export const SCORE_DATA_S_R_SLOT_W = 'sRSlotW'

/** musicScore.data 上的歌词字号字段；作品读同名字段 */
export const SCORE_DATA_LYRICS_FONT_SIZE = 'lyricsFontSize'

/** musicScore.data 上的歌词字体；空字符串表示沿用系统默认 */
export const SCORE_DATA_LYRICS_FONT_FAMILY = 'lyricsFontFamily'

/** musicScore.data 上的标题字体；空字符串表示沿用系统默认 */
export const SCORE_DATA_TITLE_FONT_FAMILY = 'titleFontFamily'

/** musicScore.data 上的音色名（s-l 乐器名）字体；作品读同名字段，空字符串表示沿用系统默认 */
export const SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY = 'instrumentNameFontFamily'

/** 内置默认：标题 / 歌词 / 音色名字体（空 = 系统默认） */
export const DEFAULT_SCORE_TITLE_FONT_FAMILY = ''
export const DEFAULT_SCORE_LYRICS_FONT_FAMILY = ''
export const DEFAULT_SCORE_INSTRUMENT_NAME_FONT_FAMILY = ''

/** musicScore.data 上是否在 s-l 显示单谱表音色名；作品读同名字段 */
export const SCORE_DATA_SHOW_INSTRUMENT_NAME = 'showInstrumentName'
