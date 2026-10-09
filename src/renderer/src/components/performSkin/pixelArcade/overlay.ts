import type { PerformOverlayCanvasCommand } from '../types'
import { createPixelArcadeBurstRuntime } from '../canvas/pixelArcadeBurstEffect'

const BASELINE_HEIGHT = 4
const SEGMENT = 8
const KEY_ACTIVE_HEIGHT = 10

export const pixelArcadePerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createPixelArcadeBurstRuntime,

  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    ctx.fillStyle = '#1a0b2e'
    ctx.fillRect(0, baselineY + BASELINE_HEIGHT, width, 2)
    for (let x = 0, i = 0; x < width; x += SEGMENT, i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ff3d9a' : '#00c8e8'
      ctx.fillRect(x, baselineY, SEGMENT, BASELINE_HEIGHT)
    }
  },

  getKeyActiveBarShape(input) {
    if (!input.active) return null
    return { height: KEY_ACTIVE_HEIGHT, borderRadius: 0, gapAboveBaseline: 2 }
  },

  /** 像素按钮：暗色描边 + 亮顶 + 橙色底边 */
  drawKeyActiveBar(ctx, rect) {
    const x = Math.round(rect.x)
    const y = Math.round(rect.y)
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    ctx.fillStyle = '#1a0b2e'
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2)
    ctx.fillStyle = '#ffd400'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#fff6a8'
    ctx.fillRect(x, y, w, 2)
    ctx.fillStyle = '#ff8a00'
    ctx.fillRect(x, y + h - 2, w, 2)
  }
}
