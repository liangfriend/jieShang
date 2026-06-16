import type { PerformOverlayCanvasCommand } from '../types'
import { drawFilledRoundedBar, drawSolidBaseline } from '../canvas/overlayDraw'

const BASELINE_HEIGHT = 3
const BASELINE_COLOR = '#ff0000'

const KEY_ACTIVE_HEIGHT = 6

export const defaultPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  drawBaseline(ctx, input) {
    drawSolidBaseline(ctx, input, BASELINE_COLOR)
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
    const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height)
    gradient.addColorStop(0, '#64b5f6')
    gradient.addColorStop(0.55, '#2196f3')
    gradient.addColorStop(1, '#1565c0')
    drawFilledRoundedBar(ctx, rect, gradient)
  }
}
