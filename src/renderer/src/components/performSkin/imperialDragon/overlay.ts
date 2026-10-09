import type { PerformOverlayCanvasCommand } from '../types'
import { drawKeyFretStrip } from '../canvas/imperialDragonBackground'
import { createImperialDragonFireworkRuntime } from '../canvas/imperialDragonFireworkEffect'

const BASELINE_HEIGHT = 8
const KEY_ACTIVE_HEIGHT = 8

export const imperialDragonPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createImperialDragonFireworkRuntime,

  /** 金条基准线：金色渐变 + 暗红回纹刻纹 + 上下亮边 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    ctx.save()
    const g = ctx.createLinearGradient(0, baselineY, 0, baselineY + BASELINE_HEIGHT)
    g.addColorStop(0, '#fff2b0')
    g.addColorStop(0.45, '#f5c542')
    g.addColorStop(1, '#a8720a')
    ctx.fillStyle = g
    ctx.fillRect(0, baselineY, width, BASELINE_HEIGHT)
    drawKeyFretStrip(ctx, width, baselineY + 0.4, 0.95, 'rgba(120, 10, 20, 0.75)')
    ctx.fillStyle = 'rgba(255, 255, 240, 0.8)'
    ctx.fillRect(0, baselineY, width, 1)
    ctx.fillStyle = 'rgba(60, 4, 8, 0.7)'
    ctx.fillRect(0, baselineY + BASELINE_HEIGHT, width, 1.5)
    ctx.restore()
  },

  getKeyActiveBarShape(input) {
    if (!input.active) return null
    return { height: KEY_ACTIVE_HEIGHT, borderRadius: 4, gapAboveBaseline: 2 }
  },

  /** 元宝形金块：金色渐变圆角条 + 中央红宝石 */
  drawKeyActiveBar(ctx, rect) {
    const { x, y, width: w, height: h } = rect
    ctx.save()
    const g = ctx.createLinearGradient(0, y, 0, y + h)
    g.addColorStop(0, '#fff6c8')
    g.addColorStop(0.5, '#ffd24a')
    g.addColorStop(1, '#c78a0c')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 4)
    ctx.fill()
    ctx.strokeStyle = 'rgba(120, 60, 0, 0.8)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#d7141e'
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, Math.min(2.4, w / 5), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
