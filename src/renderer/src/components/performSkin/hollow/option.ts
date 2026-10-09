export type HollowGradientStop = {
  color: string
  /** 0~100 */
  offset: number
}

export type HollowOption = {
  gradientStops: HollowGradientStop[]
  /** 渐变流动速度 0~100 */
  flowSpeed: number
  /** 光晕强度 0~100 */
  glowStrength: number
}

export const HOLLOW_GRADIENT_MIN_STOPS = 2
export const HOLLOW_GRADIENT_MAX_STOPS = 6

/** 须与 main `collectionBuiltinSeed.ts` 的 HOLLOW_DEFAULT_OPTION 一致 */
export function createDefaultHollowOption(): HollowOption {
  return {
    gradientStops: [
      { color: '#FF8A00', offset: 0 },
      { color: '#FFD45C', offset: 40 },
      { color: '#FFF6D6', offset: 55 },
      { color: '#C86A00', offset: 100 }
    ],
    flowSpeed: 50,
    glowStrength: 60
  }
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

function clampPercent(value: unknown, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

/** 解析数据库 option 字符串，缺失或非法字段回退默认值 */
export function parseHollowOption(raw: string | null | undefined): HollowOption {
  const defaults = createDefaultHollowOption()
  let parsed: Partial<HollowOption> = {}
  try {
    const value = raw ? JSON.parse(raw) : {}
    if (value && typeof value === 'object') parsed = value
  } catch {
    return defaults
  }

  const stops = Array.isArray(parsed.gradientStops)
    ? parsed.gradientStops
        .filter((s): s is HollowGradientStop => !!s && HEX_COLOR.test(String(s.color)))
        .map((s) => ({ color: s.color, offset: clampPercent(s.offset, 0) }))
        .slice(0, HOLLOW_GRADIENT_MAX_STOPS)
    : []

  return {
    gradientStops: stops.length >= HOLLOW_GRADIENT_MIN_STOPS ? stops : defaults.gradientStops,
    flowSpeed: clampPercent(parsed.flowSpeed, defaults.flowSpeed),
    glowStrength: clampPercent(parsed.glowStrength, defaults.glowStrength)
  }
}

/** 渐变一个往返周期的像素长度 */
export const HOLLOW_FLOW_PERIOD_PX = 320

/** 流动速度 0~100 → px/ms：0 静止，默认 50 约 2.3 秒一个周期，100 约 0.8 秒 */
export function hollowFlowPxPerMs(flowSpeed: number) {
  return (flowSpeed / 100) ** 1.5 * 0.4
}

/** 光晕强度 0~100 → 倍率：0 无光晕，默认 60 为 1，100 约 2 */
export function hollowGlowK(glowStrength: number) {
  return (glowStrength / 60) ** 1.4
}

export function sortedHollowStops(stops: readonly HollowGradientStop[]) {
  return [...stops].sort((a, b) => a.offset - b.offset)
}