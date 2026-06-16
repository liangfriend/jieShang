import type { PerformOverlayCanvasCommand } from '../types'
import { drawSolidBaseline } from '../canvas/overlayDraw'
import { createRainbowCandyOverlayRuntime } from './candyOverlayRuntime'

const BASELINE_HEIGHT = 3

export const rainbowPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createRainbowCandyOverlayRuntime,

  drawBaseline(ctx, input) {
    const { baselineY, width } = input

    ctx.save()
    ctx.shadowColor = 'rgba(255, 120, 200, 0.45)'
    ctx.shadowBlur = 8
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)'
    ctx.lineWidth = BASELINE_HEIGHT
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(width * 0.02, baselineY + BASELINE_HEIGHT / 2)
    ctx.lineTo(width * 0.98, baselineY + BASELINE_HEIGHT / 2)
    ctx.stroke()
    ctx.restore()

    const gradient = ctx.createLinearGradient(0, baselineY, width, baselineY)
    gradient.addColorStop(0, 'rgba(255, 158, 199, 0)')
    gradient.addColorStop(0.12, 'rgba(255, 158, 199, 0.35)')
    gradient.addColorStop(0.5, 'rgba(255, 158, 199, 0.55)')
    gradient.addColorStop(0.88, 'rgba(201, 184, 255, 0.35)')
    gradient.addColorStop(1, 'rgba(201, 184, 255, 0)')
    drawSolidBaseline(ctx, input, gradient)
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 彩虹糖高亮由糖果粒子 runtime 绘制
  }
}
