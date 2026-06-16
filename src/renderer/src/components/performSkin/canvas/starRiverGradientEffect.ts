import type { PerformLayerBackgroundInput } from '../types'

/** 星河 active 层：白金色暖光，与浅星空 normal 形成对比 */
export function drawStarRiverActiveLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height, time } = input
  const drift = Math.sin(time * 0.001) * height * 0.05
  const shimmer = Math.sin(time * 0.0018) * 0.5 + 0.5

  const gradient = ctx.createLinearGradient(0, -drift, 0, height - drift)
  gradient.addColorStop(0, '#fffef8')
  gradient.addColorStop(0.35, '#ffe9b8')
  gradient.addColorStop(0.72, '#e8c06a')
  gradient.addColorStop(1, '#c9a04a')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createLinearGradient(0, 0, width, 0)
  glow.addColorStop(0, `rgba(255, 255, 255, ${0.06 + shimmer * 0.08})`)
  glow.addColorStop(0.5, 'rgba(255, 248, 220, 0)')
  glow.addColorStop(1, `rgba(255, 230, 180, ${0.05 + (1 - shimmer) * 0.06})`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.fillRect(0, 0, width, Math.min(height * 0.18, 18))
}
