import type { PerformOverlayCanvasCommand } from '../types'
import { createFireflySwarmRuntime } from '../canvas/fireflySwarmEffect'

const BASELINE_HEIGHT = 3
const BLADE_GAP = 5

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

export const fireflyPerformOverlay: PerformOverlayCanvasCommand = {
  getBaselineHeight: () => BASELINE_HEIGHT,

  createRuntime: createFireflySwarmRuntime,

  /** 草地基准线：深绿地面 + 随风轻摆的草叶 */
  drawBaseline(ctx, input) {
    const { baselineY, width } = input
    const sway = performance.now() * 0.0015

    ctx.save()
    ctx.fillStyle = '#1d4a24'
    ctx.fillRect(0, baselineY, width, BASELINE_HEIGHT)

    ctx.strokeStyle = '#3f8a3a'
    ctx.lineWidth = 1.4
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (let x = 0, i = 0; x <= width; x += BLADE_GAP, i++) {
      const h = 3 + hash(i) * 7
      const lean = (hash(i + 0.5) - 0.5) * 4 + Math.sin(sway + x * 0.03) * 1.8
      ctx.moveTo(x, baselineY + 1)
      ctx.quadraticCurveTo(x + lean * 0.3, baselineY - h * 0.6, x + lean, baselineY - h)
    }
    ctx.stroke()
    ctx.restore()
  },

  getKeyActiveBarShape() {
    return null
  },

  drawKeyActiveBar() {
    // 琴键高亮由萤火 runtime 的呼吸光绘制
  }
}
