import type { PerformOverlayCanvasCommand } from '../types'
import { createMintSodaFizzRuntime } from '../canvas/mintSodaFizzEffect'

const BASELINE_HEIGHT = 3

export const mintSodaPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createMintSodaFizzRuntime,

  /** 液面：两道相位错开的正弦波，随时间流动 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const t = performance.now() * 0.002
    const y0 = baselineY + BASELINE_HEIGHT / 2

    ctx.save()
    ctx.lineCap = 'round'
    const waves = [
      { color: 'rgba(31, 174, 156, 0.55)', amp: 2.2, len: 46, phase: 0, width: 3 },
      { color: 'rgba(255, 255, 255, 0.95)', amp: 1.6, len: 32, phase: 1.3, width: 2 }
    ]
    for (const wave of waves) {
      ctx.strokeStyle = wave.color
      ctx.lineWidth = wave.width
      ctx.beginPath()
      for (let x = 0; x <= width; x += 4) {
        const y = y0 + Math.sin(x / wave.len + t + wave.phase) * wave.amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由汽泡 runtime 绘制
  }
}
