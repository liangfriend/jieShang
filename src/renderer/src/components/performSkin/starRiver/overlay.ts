import type { PerformOverlayCanvasCommand } from '../types'
import { createStarRiverSparkOverlayRuntime } from './sparkOverlayRuntime'

const BASELINE_HEIGHT = 2

export const starRiverPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createStarRiverSparkOverlayRuntime,

  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const lineY = baselineY + BASELINE_HEIGHT / 2

    ctx.save()
    ctx.shadowColor = 'rgba(255, 220, 160, 0.55)'
    ctx.shadowBlur = 10
    const g = ctx.createLinearGradient(0, lineY, width, lineY)
    g.addColorStop(0, 'rgba(255, 220, 160, 0)')
    g.addColorStop(0.15, 'rgba(255, 235, 200, 0.45)')
    g.addColorStop(0.5, 'rgba(255, 248, 230, 0.75)')
    g.addColorStop(0.85, 'rgba(255, 235, 200, 0.45)')
    g.addColorStop(1, 'rgba(255, 220, 160, 0)')
    ctx.strokeStyle = g
    ctx.lineWidth = BASELINE_HEIGHT
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(width * 0.02, lineY)
    ctx.lineTo(width * 0.98, lineY)
    ctx.stroke()
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由星屑粒子 runtime 绘制
  }
}
