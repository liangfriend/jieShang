import type { PerformLayerBackgroundInput } from '../types'

/**
 * 彩虹糖 normal 层：整层竖向彩虹渐变，随 time 缓慢流动。
 * 所有水柱共享此背景，下落时各自「窗口」扫过不同区域。
 */
export function drawRainbowNormalLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height, time } = input
  const phase = time * 0.00008

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  for (let i = 0; i <= 8; i++) {
    const hue = (280 + i * 42 + phase * 360) % 360
    gradient.addColorStop(i / 8, `hsla(${hue}, 95%, 72%, 0.96)`)
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const shimmer = ctx.createLinearGradient(0, 0, width, 0)
  const wave = Math.sin(time * 0.0015) * 0.5 + 0.5
  shimmer.addColorStop(0, `rgba(255, 255, 255, ${0.08 + wave * 0.06})`)
  shimmer.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
  shimmer.addColorStop(1, `rgba(255, 255, 255, ${0.05 + (1 - wave) * 0.05})`)
  ctx.fillStyle = shimmer
  ctx.fillRect(0, 0, width, height)
}

/**
 * 彩虹糖 active 层：整层青绿渐变 + 轻微流动
 */
export function drawRainbowActiveLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height, time } = input
  const drift = Math.sin(time * 0.0012) * height * 0.08

  const gradient = ctx.createLinearGradient(0, -drift, 0, height - drift)
  gradient.addColorStop(0, '#7ee8fa')
  gradient.addColorStop(0.45, '#4dd4c4')
  gradient.addColorStop(1, '#2eb8a6')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(0, 0, width, Math.min(height * 0.25, 24))
}

/** 彩虹糖 MidiBox normal 层 */
export function drawRainbowMidiBoxNormalLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  drawRainbowNormalLayerBackground(ctx, input)
}

/** 彩虹糖 MidiBox active 层 */
export function drawRainbowMidiBoxActiveLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  drawRainbowActiveLayerBackground(ctx, input)
}
