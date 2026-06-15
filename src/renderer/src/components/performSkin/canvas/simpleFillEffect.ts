import type { PerformLayerBackgroundInput } from '../types'

/** 整层纯色背景 */
export function drawSolidLayerBackground(
  ctx: CanvasRenderingContext2D,
  color: string,
  input: PerformLayerBackgroundInput
) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, input.width, input.height)
}
