import type { PerformOverlayCanvasCommand } from '../types'
import { createBinaryTextOverlayRuntime } from './textOverlayRuntime'

const BASELINE_HEIGHT = 3

export const binaryPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createBinaryTextOverlayRuntime,

  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const lineY = baselineY + BASELINE_HEIGHT / 2

    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.lineWidth = BASELINE_HEIGHT
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(width * 0.02, lineY)
    ctx.lineTo(width * 0.98, lineY)
    ctx.stroke()
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由绿色字符粒子 runtime 绘制
  }
}
