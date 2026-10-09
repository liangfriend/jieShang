import type { PerformOverlayCanvasCommand } from '../types'
import { createThunderArcRuntime } from '../canvas/thunderArcEffect'

const BASELINE_HEIGHT = 3

export const thunderPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createThunderArcRuntime,

  /** 导线基准线：暗钢底 + 沿线噼啪游走的电流 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const y = baselineY + BASELINE_HEIGHT / 2
    ctx.save()
    ctx.fillStyle = '#2a2f55'
    ctx.fillRect(0, baselineY, width, BASELINE_HEIGHT)

    ctx.globalCompositeOperation = 'lighter'
    ctx.lineJoin = 'round'
    for (const [lw, color] of [
      [4, 'rgba(140, 110, 255, 0.35)'],
      [1.2, 'rgba(210, 245, 255, 0.95)']
    ] as const) {
      ctx.strokeStyle = color
      ctx.lineWidth = lw
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 6; x <= width; x += 6) ctx.lineTo(x, y + (Math.random() - 0.5) * 3.2)
      ctx.stroke()
    }
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由电弧 runtime 绘制
  }
}
