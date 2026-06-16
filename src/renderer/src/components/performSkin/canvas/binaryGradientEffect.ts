import type { PerformLayerBackgroundInput } from '../types'

/** 二进制 active 层：白灰竖向渐变 + 轻微流动 */
export function drawBinaryActiveLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height, time } = input
  const drift = Math.sin(time * 0.0012) * height * 0.06

  const gradient = ctx.createLinearGradient(0, -drift, 0, height - drift)
  gradient.addColorStop(0, '#f4f4f4')
  gradient.addColorStop(0.42, '#d4d4d4')
  gradient.addColorStop(1, '#8e8e8e')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.fillRect(0, 0, width, Math.min(height * 0.22, 22))
}
