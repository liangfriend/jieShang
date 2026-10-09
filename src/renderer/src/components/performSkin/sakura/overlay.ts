import type { PerformOverlayCanvasCommand } from '../types'
import { drawSakuraBlossom, SAKURA_PETAL_COLORS } from '../canvas/sakuraBackground'
import { createSakuraPetalBurstRuntime } from '../canvas/sakuraPetalBurstEffect'

const BASELINE_HEIGHT = 3
const BLOSSOM_GAP = 72

export const sakuraPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createSakuraPetalBurstRuntime,

  /** 樱枝基准线：微弯的深褐枝条，间隔点缀小花 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const y = baselineY + BASELINE_HEIGHT / 2

    ctx.save()
    ctx.strokeStyle = '#6e4639'
    ctx.lineWidth = BASELINE_HEIGHT
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (let x = 0; x <= width; x += 8) {
      const yy = y + Math.sin(x / 90) * 1.2
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()

    for (let x = BLOSSOM_GAP / 2, i = 0; x < width; x += BLOSSOM_GAP, i++) {
      const yy = y + Math.sin(x / 90) * 1.2
      drawSakuraBlossom(ctx, x, yy - 1, 5.5, SAKURA_PETAL_COLORS[i % SAKURA_PETAL_COLORS.length]!)
    }
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由花瓣 runtime 绘制
  }
}
