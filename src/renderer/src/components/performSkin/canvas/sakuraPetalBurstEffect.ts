import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { drawSakuraPetal, SAKURA_PETAL_COLORS } from './sakuraBackground'

type FlyingPetal = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  rotSpeed: number
  flip: number
  flipSpeed: number
  color: string
  life: number
  maxLife: number
}

function createPetal(x: number, y: number, burst: boolean): FlyingPetal {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (burst ? 1.8 : 0.9)
  const speed = burst ? 2.2 + Math.random() * 2.6 : 1 + Math.random() * 1.4
  const maxLife = 900 + Math.random() * 700
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 6 + Math.random() * 6,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
    flip: Math.random() * Math.PI * 2,
    flipSpeed: 0.08 + Math.random() * 0.1,
    color: SAKURA_PETAL_COLORS[(Math.random() * SAKURA_PETAL_COLORS.length) | 0]!,
    life: maxLife,
    maxLife
  }
}

/** 樱花第四层：按下时一簇花瓣向上绽开再飘落，按住时零星飘出 */
export function createSakuraPetalBurstRuntime(): PerformOverlayRuntime {
  const petals: FlyingPetal[] = []
  const pending = new Set<number>()
  const acc = new Map<number, number>()

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]!
        p.vx *= 0.97 ** k
        p.vy = p.vy * 0.97 ** k + 0.05 * k
        p.x += (p.vx + Math.sin(p.flip) * 0.35) * k
        p.y += p.vy * k
        p.rot += p.rotSpeed * k
        p.flip += p.flipSpeed * k
        p.life -= input.deltaMs
        if (p.life <= 0) petals.splice(i, 1)
      }

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const burst = pending.has(midi)
        if (!burst && !input.activeKeys.has(midi)) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY - 6
        if (burst) {
          for (let i = 0; i < 9; i++) petals.push(createPetal(cx, y, true))
          continue
        }
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 7) {
          petals.push(createPetal(cx, y, false))
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
      for (const p of petals) {
        const t = p.life / p.maxLife
        drawSakuraPetal(ctx, p.x, p.y, p.size, p.rot, Math.cos(p.flip), p.color, t < 0.35 ? t / 0.35 : 1)
      }
    },

    isAnimating() {
      return petals.length > 0
    },

    reset() {
      petals.length = 0
      pending.clear()
      acc.clear()
    }
  }
}
