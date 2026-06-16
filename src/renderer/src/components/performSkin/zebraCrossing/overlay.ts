import type { PerformOverlayCanvasCommand } from '../types'
import { drawFilledRoundedBar } from '../canvas/overlayDraw'

const BASELINE_HEIGHT = 4
const KEY_ACTIVE_HEIGHT = 7

export const zebraCrossingPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const y = baselineY + BASELINE_HEIGHT / 2

    ctx.save()
    ctx.strokeStyle = '#f5f5f5'
    ctx.lineWidth = BASELINE_HEIGHT
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()

    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, y + BASELINE_HEIGHT / 2 + 0.5)
    ctx.lineTo(width, y + BASELINE_HEIGHT / 2 + 0.5)
    ctx.stroke()
    ctx.restore()
  },

  getKeyActiveBarShape(input) {
    if (!input.active) return null
    return {
      height: KEY_ACTIVE_HEIGHT,
      borderRadius: 999,
      gapAboveBaseline: 0
    }
  },

  drawKeyActiveBar(ctx, rect) {
    ctx.fillStyle = '#ffeb3b'
    drawFilledRoundedBar(ctx, rect, '#ffeb3b')
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(rect.x, rect.y + rect.height - 1.5, rect.width, 1.5)
  }
}
