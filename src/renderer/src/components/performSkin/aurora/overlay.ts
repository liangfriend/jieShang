import type { PerformOverlayCanvasCommand } from '../types'
import { createAuroraCrystalRuntime } from '../canvas/auroraCrystalEffect'

const BASELINE_HEIGHT = 3

export const auroraPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createAuroraCrystalRuntime,

  /** 冰线基准线：冰蓝实线 + 往返流动的高光 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    ctx.save()
    ctx.fillStyle = 'rgba(160, 240, 255, 0.25)'
    ctx.fillRect(0, baselineY - 2, width, BASELINE_HEIGHT + 4)
    const g = ctx.createLinearGradient(0, baselineY, 0, baselineY + BASELINE_HEIGHT)
    g.addColorStop(0, '#f2fdff')
    g.addColorStop(1, '#7fd8f0')
    ctx.fillStyle = g
    ctx.fillRect(0, baselineY, width, BASELINE_HEIGHT)

    const t = (Math.sin(performance.now() * 0.0006) + 1) / 2
    const cx = t * width
    const glint = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0)
    glint.addColorStop(0, 'rgba(255, 255, 255, 0)')
    glint.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
    glint.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glint
    ctx.fillRect(cx - 80, baselineY - 1, 160, BASELINE_HEIGHT + 2)
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由极光光柱 runtime 绘制
  }
}
