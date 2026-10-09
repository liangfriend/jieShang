import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { drawFireflyGlow, fireflyBlink } from './fireflyBackground'

type LiveFly = {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  size: number
  life: number
  maxLife: number
}

type KeyGlow = { x: number; y: number; width: number }

function createFly(x: number, y: number, burst: boolean): LiveFly {
  const maxLife = 1600 + Math.random() * 1400
  return {
    x: x + (Math.random() - 0.5) * 8,
    y,
    vx: (Math.random() - 0.5) * (burst ? 2.4 : 1),
    vy: -(burst ? 1.2 + Math.random() * 1.6 : 0.6 + Math.random() * 0.8),
    phase: Math.random() * Math.PI,
    size: 7 + Math.random() * 7,
    life: maxLife,
    maxLife
  }
}

/** 萤火第四层：按下时放飞一群萤火虫，按住时琴键处有一团呼吸光 */
export function createFireflySwarmRuntime(): PerformOverlayRuntime {
  const flies: LiveFly[] = []
  const pending = new Set<number>()
  const acc = new Map<number, number>()
  const glows: KeyGlow[] = []
  let clock = 0

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      clock = input.now
      for (let i = flies.length - 1; i >= 0; i--) {
        const f = flies[i]!
        f.vx = (f.vx + (Math.random() - 0.5) * 0.12 * k) * 0.98 ** k
        f.vy = (f.vy + (Math.random() - 0.5) * 0.08 * k) * 0.985 ** k - 0.004 * k
        f.x += f.vx * k
        f.y += f.vy * k
        f.phase += 0.09 * k
        f.life -= input.deltaMs
        if (f.life <= 0) flies.splice(i, 1)
      }

      glows.length = 0
      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const held = input.activeKeys.has(midi)
        const burst = pending.has(midi)
        if (!held && !burst) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY - 4
        if (held) glows.push({ x: cx, y, width: layout.width })
        if (burst) {
          for (let i = 0; i < 6; i++) flies.push(createFly(cx, y, true))
          continue
        }
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 14) {
          flies.push(createFly(cx, y, false))
          acc.set(midi, 0)
        } else {
          acc.set(midi, next)
        }
      }
      pending.clear()
    },

    onKeysChanged(prev, next) {
      for (const midi of next) {
        if (!prev.has(midi)) pending.add(midi)
      }
      for (const midi of prev) {
        if (!next.has(midi)) acc.delete(midi)
      }
    },

    draw(ctx) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const breath = 0.75 + 0.25 * Math.sin(clock * 0.008)
      for (const g of glows) {
        drawFireflyGlow(ctx, g.x, g.y, Math.max(18, g.width * 1.4) * breath, 0.85)
      }
      for (const f of flies) {
        const t = f.life / f.maxLife
        const fade = t < 0.3 ? t / 0.3 : 1
        const b = Math.max(0.35, fireflyBlink(f.phase))
        drawFireflyGlow(ctx, f.x, f.y, f.size * (0.7 + b * 0.5), b * fade)
      }
      ctx.restore()
    },

    isAnimating() {
      return flies.length > 0 || glows.length > 0
    },

    reset() {
      flies.length = 0
      glows.length = 0
      pending.clear()
      acc.clear()
    }
  }
}
