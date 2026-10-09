import type { PerformOverlayCanvasCommand } from '../types'
import { createSynthwaveSparkRuntime } from '../canvas/synthwaveSparkEffect'

const BASELINE_HEIGHT = 3
const KEY_ACTIVE_HEIGHT = 6

export const synthwavePerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createSynthwaveSparkRuntime,

  /** 霓虹灯管基准线：品红外晕 + 亮芯 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const y = baselineY + BASELINE_HEIGHT / 2
    ctx.save()
    ctx.lineCap = 'round'
    for (const [lw, color] of [
      [10, 'rgba(255, 60, 210, 0.18)'],
      [5, 'rgba(255, 60, 210, 0.5)'],
      [2, '#ffd6f6']
    ] as const) {
      ctx.strokeStyle = color
      ctx.lineWidth = lw
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.restore()
  },

  getKeyActiveBarShape(input) {
    if (!input.active) return null
    return { height: KEY_ACTIVE_HEIGHT, borderRadius: 3, gapAboveBaseline: 3 }
  },

  /** 青色霓虹灯条 */
  drawKeyActiveBar(ctx, rect) {
    const { x, y, width: w, height: h } = rect
    ctx.save()
    ctx.fillStyle = 'rgba(127, 252, 255, 0.25)'
    ctx.beginPath()
    ctx.roundRect(x - 3, y - 3, w + 6, h + 6, 6)
    ctx.fill()
    ctx.fillStyle = '#35e6ff'
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 3)
    ctx.fill()
    ctx.fillStyle = '#f2ffff'
    ctx.fillRect(x + 2, y + h / 2 - 1, Math.max(0, w - 4), 2)
    ctx.restore()
  }
}
