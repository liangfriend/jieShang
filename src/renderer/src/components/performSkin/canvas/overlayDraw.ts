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
