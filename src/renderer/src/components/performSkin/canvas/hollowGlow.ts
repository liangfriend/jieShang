import { appendRoundedRectPath } from '@renderer/utils/canvasGeometry'
import type {
  PerformColumnRect,
  PerformLayerBackgroundInput,
  PerformOverlayBaselineDrawInput
} from '../types'
import {
  HOLLOW_FLOW_PERIOD_PX,
  hollowFlowPxPerMs,
  hollowGlowK,
  sortedHollowStops,
  type HollowOption
} from '../hollow/option'

export const HOLLOW_BG = '#000000'
/** 略微圆角：整体仍是矩形，不是胶囊 */
export const HOLLOW_COLUMN_RADIUS = 3
export const HOLLOW_COLUMN_WIDTH = 14

type Rgb = { r: number; g: number; b: number }
type ThemeStop = { offset: number; rgb: Rgb; color: string }

/** 由用户参数推导出的绘制主题，皮肤包创建时算一次 */
export type HollowTheme = {
  stops: ThemeStop[]
  /** 渐变一个往返周期的像素长度 */
  periodPx: number
  /** 渐变流动速度 px/ms */
  flowPxPerMs: number
  /** 光晕强度倍率，默认参数时为 1 */
  glowK: number
  /** 渐变里最亮的颜色，用作亮芯与光线芯 */
  core: Rgb
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function luminance({ r, g, b }: Rgb) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function rgba({ r, g, b }: Rgb, a: number) {
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t)
  }
}

export function createHollowTheme(option: HollowOption): HollowTheme {
  const stops = sortedHollowStops(option.gradientStops).map((s) => ({
    offset: s.offset / 100,
    rgb: hexToRgb(s.color),
    color: s.color
  }))
  const core = stops.reduce((best, s) => (luminance(s.rgb) > luminance(best) ? s.rgb : best), stops[0]!.rgb)
  return {
    stops,
    periodPx: HOLLOW_FLOW_PERIOD_PX,
    flowPxPerMs: hollowFlowPxPerMs(option.flowSpeed),
    glowK: hollowGlowK(option.glowStrength),
    core
  }
}

/** 渐变上 t（0~1）处的颜色 */
function colorOnStops(stops: readonly ThemeStop[], t: number): Rgb {
  if (t <= stops[0]!.offset) return stops[0]!.rgb
  for (let i = 1; i < stops.length; i++) {
    const b = stops[i]!
    if (t <= b.offset) {
      const a = stops[i - 1]!
      const span = b.offset - a.offset
      return span <= 0 ? b.rgb : mix(a.rgb, b.rgb, (t - a.offset) / span)
    }
  }
  return stops[stops.length - 1]!.rgb
}

/** 随时间沿渐变来回游走的颜色：光晕颜色因此不断变化 */
export function themeColorAt(theme: HollowTheme, now: number, phase = 0): Rgb {
  const cycle = (now * theme.flowPxPerMs) / theme.periodPx + phase
  const f = cycle - Math.floor(cycle)
  return colorOnStops(theme.stops, f < 0.5 ? f * 2 : 2 - f * 2)
}

/**
 * 沿 dir 方向铺满整个画布、随时间流动的渐变。
 * 每个周期正向 + 反向各走一遍色标，首尾相接不跳色。
 */
function createFlowGradient(
  ctx: CanvasRenderingContext2D,
  theme: HollowTheme,
  width: number,
  height: number,
  now: number,
  dir: { x: number; y: number },
  alpha = 1
) {
  const len = Math.hypot(dir.x, dir.y)
  const ux = dir.x / len
  const uy = dir.y / len
  const projections = [0, width * ux, height * uy, width * ux + height * uy]
  const min = Math.min(...projections)
  const max = Math.max(...projections)
  const period = theme.periodPx
  const shift = (now * theme.flowPxPerMs) % period
  const start = min - period + shift
  const cycles = Math.max(1, Math.ceil((max - start) / period))
  const end = start + cycles * period

  const g = ctx.createLinearGradient(start * ux, start * uy, end * ux, end * uy)
  const add = (pos: number, s: ThemeStop) => g.addColorStop(Math.min(1, Math.max(0, pos)), rgba(s.rgb, alpha))
  for (let c = 0; c < cycles; c++) {
    for (const s of theme.stops) add((c + s.offset / 2) / cycles, s)
    for (let i = theme.stops.length - 1; i >= 0; i--) {
      const s = theme.stops[i]!
      add((c + 1 - s.offset / 2) / cycles, s)
    }
  }
  return g
}

export function drawHollowBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  ctx.fillStyle = HOLLOW_BG
  ctx.fillRect(0, 0, input.width, input.height)
}

export function drawNothing() {}

function appendFramesPath(ctx: CanvasRenderingContext2D, columns: readonly PerformColumnRect[], grow: number) {
  ctx.beginPath()
  for (const c of columns) {
    const w = c.width + grow * 2
    const h = c.height + grow * 2
    if (w <= 0 || h <= 0) continue
    appendRoundedRectPath(ctx, c.x - grow, c.y - grow, w, h, Math.max(0, c.borderRadius + grow))
  }
}

const COLUMN_FLOW_DIR = { x: 0.45, y: 1 }
/** 未弹线框的线宽；已弹实心块按它内缩，宽度等于线框内侧宽度 */
const FRAME_LINE_WIDTH = 1.4

/**
 * 未弹水柱的发光线框：同一透明度的水柱合并成一条 path。
 * 大 / 中 / 小三层 shadowBlur 光晕 → 亮芯，描边色是随时间流动的渐变，光晕色沿渐变游走。
 */
export function drawHollowFrames(
  ctx: CanvasRenderingContext2D,
  columns: readonly PerformColumnRect[],
  input: PerformLayerBackgroundInput,
  theme: HollowTheme
) {
  const now = performance.now()
  const dpr = input.dpr
  const groups = new Map<number, PerformColumnRect[]>()
  for (const c of columns) {
    const g = groups.get(c.opacity) ?? []
    g.push(c)
    groups.set(c.opacity, g)
  }

  const breathe = 0.82 + 0.18 * Math.sin(now / 420)
  const k = theme.glowK * breathe
  const halo = themeColorAt(theme, now)
  const lineWidth = FRAME_LINE_WIDTH
  const stroke = createFlowGradient(ctx, theme, input.width, input.height, now, COLUMN_FLOW_DIR)

  ctx.save()
  ctx.lineJoin = 'round'
  for (const [opacity, group] of groups) {
    ctx.globalAlpha = opacity
    ctx.globalCompositeOperation = 'lighter'

    // 光晕只靠 shadowBlur 逐层叠：大半径淡、小半径浓，外缘自然衰减到全透明，没有硬边
    appendFramesPath(ctx, group, -lineWidth / 2)
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.shadowColor = rgba(halo, 0.45)
    ctx.shadowBlur = 34 * k * dpr
    ctx.stroke()
    ctx.shadowColor = rgba(halo, 0.7)
    ctx.shadowBlur = 16 * k * dpr
    ctx.stroke()
    ctx.shadowColor = rgba(halo, 0.9)
    ctx.shadowBlur = 6 * k * dpr
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.strokeStyle = rgba(theme.core, 0.5)
    ctx.lineWidth = 0.6
    ctx.stroke()

    ctx.globalCompositeOperation = 'source-over'
  }
  ctx.restore()
}

/** 已弹水柱：不描边、不透明的实心流动渐变块，宽度等于未弹线框的内侧宽度 */
export function drawHollowSolidColumns(
  ctx: CanvasRenderingContext2D,
  columns: readonly PerformColumnRect[],
  input: PerformLayerBackgroundInput,
  theme: HollowTheme
) {
  const now = performance.now()
  appendFramesPath(ctx, columns, -FRAME_LINE_WIDTH)
  ctx.save()
  ctx.globalAlpha = 1
  ctx.fillStyle = createFlowGradient(ctx, theme, input.width, input.height, now, COLUMN_FLOW_DIR)
  ctx.fill()
  ctx.restore()
}

const SHEEN_PERIOD = 3200
const SHEEN_HALF_WIDTH = 140
const BASELINE_HALO = 26

/** 发光基准线：上下扩散的光晕带 + 流动渐变线 + 来回扫过的流光 */
export function drawHollowBaseline(
  ctx: CanvasRenderingContext2D,
  input: PerformOverlayBaselineDrawInput,
  theme: HollowTheme
) {
  const { width, baselineY, baselineHeight } = input
  const now = performance.now()
  const dpr = ctx.getTransform().a || 1
  const cy = baselineY + baselineHeight / 2
  const breathe = 0.78 + 0.22 * Math.sin(now / 520)
  const k = theme.glowK * breathe
  const halo = themeColorAt(theme, now, 0.25)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const haloH = BASELINE_HALO * Math.min(2.2, 0.6 + theme.glowK * 0.6)
  const band = ctx.createLinearGradient(0, cy - haloH, 0, cy + haloH)
  band.addColorStop(0, rgba(halo, 0))
  band.addColorStop(0.35, rgba(halo, 0.1 * k))
  band.addColorStop(0.5, rgba(halo, 0.32 * k))
  band.addColorStop(0.65, rgba(halo, 0.1 * k))
  band.addColorStop(1, rgba(halo, 0))
  ctx.fillStyle = band
  ctx.fillRect(0, cy - haloH, width, haloH * 2)

  ctx.fillStyle = createFlowGradient(ctx, theme, width, baselineY + baselineHeight, now, { x: 1, y: 0 })
  ctx.shadowColor = rgba(halo, 1)
  ctx.shadowBlur = 18 * k * dpr
  ctx.fillRect(0, baselineY, width, baselineHeight)
  ctx.shadowBlur = 6 * k * dpr
  ctx.fillRect(0, baselineY, width, baselineHeight)
  ctx.shadowBlur = 0

  ctx.fillStyle = rgba(theme.core, 0.85)
  ctx.fillRect(0, cy - 0.4, width, 0.8)

  const phase = (now % SHEEN_PERIOD) / SHEEN_PERIOD
  const sheenX = -SHEEN_HALF_WIDTH + phase * (width + SHEEN_HALF_WIDTH * 2)
  const sheen = ctx.createLinearGradient(sheenX - SHEEN_HALF_WIDTH, 0, sheenX + SHEEN_HALF_WIDTH, 0)
  sheen.addColorStop(0, rgba(theme.core, 0))
  sheen.addColorStop(0.5, rgba(theme.core, 0.9))
  sheen.addColorStop(1, rgba(theme.core, 0))
  ctx.fillStyle = sheen
  ctx.shadowColor = rgba(theme.core, 1)
  ctx.shadowBlur = 12 * dpr
  ctx.fillRect(sheenX - SHEEN_HALF_WIDTH, baselineY - 1, SHEEN_HALF_WIDTH * 2, baselineHeight + 2)
  ctx.restore()
}
