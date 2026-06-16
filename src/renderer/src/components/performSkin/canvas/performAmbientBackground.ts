import type { PerformBackgroundCanvasCommand, PerformLayerBackgroundInput } from '../types'

/** 与第一层 canvas 粉紫环境渐变一致的容器 CSS 背景 */
export const PERFORM_AMBIENT_CONTAINER_BG =
  'linear-gradient(180deg, rgba(255,248,252,0.96) 0%, rgba(245,238,255,0.94) 55%, rgba(234,245,255,0.92) 100%)'

/** 四层结构第一层：粉紫环境渐变（当前多款皮肤共用，亦可被单皮肤 background 引用） */
export function drawPerformAmbientBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height } = input
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(255, 248, 252, 0.96)')
  gradient.addColorStop(0.55, 'rgba(245, 238, 255, 0.94)')
  gradient.addColorStop(1, 'rgba(234, 245, 255, 0.92)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export const ambientPerformBackground: PerformBackgroundCanvasCommand = {
  drawBackground: drawPerformAmbientBackground
}
