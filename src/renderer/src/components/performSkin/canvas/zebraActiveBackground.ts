import type { PerformLayerBackgroundInput } from '../types'

/** 斑马线 active 层：高可视黄警示色，与黑白条纹形成对比 */
export function drawZebraActiveLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height, time } = input
  const drift = Math.sin(time * 0.0014) * height * 0.04

  const gradient = ctx.createLinearGradient(0, -drift, 0, height - drift)
  gradient.addColorStop(0, '#fff176')
  gradient.addColorStop(0.45, '#ffca28')
  gradient.addColorStop(1, '#f9a825')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(0, 0, width, Math.min(height * 0.16, 16))
}
