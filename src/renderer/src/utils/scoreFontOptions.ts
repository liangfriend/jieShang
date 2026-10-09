/** 布局弹窗可选字体（value 写入 musicScore.data；空串 = 系统默认） */
export type ScoreFontOption = {
  value: string
  /** 下拉展示名；空 value 的文案走 i18n */
  label: string
}

export const SCORE_FONT_FAMILY_OPTIONS: ScoreFontOption[] = [
  { value: '', label: '' },
  { value: '"Microsoft YaHei", "PingFang SC", sans-serif', label: '微软雅黑 / PingFang' },
  { value: 'SimSun, "Songti SC", serif', label: '宋体' },
  { value: 'SimHei, "Heiti SC", sans-serif', label: '黑体' },
  { value: 'KaiTi, "Kaiti SC", serif', label: '楷体' },
  { value: 'FangSong, "STFangsong", serif', label: '仿宋' },
  { value: '"Noto Sans SC", sans-serif', label: 'Noto Sans SC' },
  { value: '"Source Han Sans SC", "思源黑体", sans-serif', label: '思源黑体' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' }
]

export function normalizeScoreFontFamily(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (SCORE_FONT_FAMILY_OPTIONS.some((opt) => opt.value === trimmed)) return trimmed
  return trimmed
}
