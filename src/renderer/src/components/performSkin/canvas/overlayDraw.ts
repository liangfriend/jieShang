import { drawRoundedRectPath } from '@renderer/utils/canvasGeometry'

export type OverlayRect = {
  x: number
  y: number
  width: number
  height: number
  borderRadius: number
}

/** 绘制基准线 */
export function drawSolidBaseline(
  ctx: CanvasRenderingContext2D,
  input: { width: number; baselineY: number; baselineHeight: number },
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  ctx.fillStyle = fillStyle
  ctx.fillRect(0, input.baselineY, input.width, input.baselineHeight)
}

/** 绘制圆角琴键高亮条 */
export function drawFilledRoundedBar(
  ctx: CanvasRenderingContext2D,
  rect: OverlayRect,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  ctx.fillStyle = fillStyle
  drawRoundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, rect.borderRadius)
  ctx.fill()
}

const TRAFFIC_BULBS = [
  { fill: '#e53935', glow: '#ff6f60' },
  { fill: '#fdd835', glow: '#fff176' },
  { fill: '#43a047', glow: '#72c77a' }
] as const

/** 竖排红黄绿信号灯（琴键按下高亮） */
export function drawTrafficLightHighlight(ctx: CanvasRenderingContext2D, rect: OverlayRect) {
  const { x, y, width, height } = rect
  const pad = 1.5
  const innerH = height - pad * 2

  drawRoundedRectPath(ctx, x, y, width, height, Math.min(width / 2, 5))
  ctx.fillStyle = '#262626'
  ctx.fill()

  const bulbR = Math.min((width - pad * 2) * 0.34, innerH / 7.5)
  const cx = x + width / 2
  const step = innerH / 3

  for (let i = 0; i < TRAFFIC_BULBS.length; i++) {
    const bulb = TRAFFIC_BULBS[i]!
    const cy = y + pad + step * (i + 0.5)

    ctx.beginPath()
    ctx.arc(cx, cy, bulbR + 0.6, 0, Math.PI * 2)
    ctx.fillStyle = bulb.glow
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, bulbR, 0, Math.PI * 2)
    ctx.fillStyle = bulb.fill
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx - bulbR * 0.28, cy - bulbR * 0.28, bulbR * 0.32, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()
  }
}
