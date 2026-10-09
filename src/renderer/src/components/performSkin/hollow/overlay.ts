import type { PerformOverlayCanvasCommand } from '../types'
import { drawHollowBaseline, type HollowTheme } from '../canvas/hollowGlow'
import { createHollowRayRuntime } from '../canvas/hollowRayEffect'

const BASELINE_HEIGHT = 2

export function createHollowPerformOverlay(theme: HollowTheme): PerformOverlayCanvasCommand {
  return {
    getBaselineHeight: () => BASELINE_HEIGHT,

    createRuntime: () => createHollowRayRuntime(theme),

    drawBaseline: (ctx, input) => drawHollowBaseline(ctx, input, theme),

    getKeyActiveBarShape() {
      return null
    },

    drawKeyActiveBar() {
      // 琴键高亮由空洞光线 runtime 绘制
    }
  }
}
