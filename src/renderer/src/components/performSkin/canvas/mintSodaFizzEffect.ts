import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { drawMintSodaBubble } from './mintSodaBackground'

type FizzBubble = {
  x: number
  y: number
  r: number
  vy: number
  wobble: number
  rise: number
  maxRise: number
}

type Pop = { x: number; y: number; r: number; life: number }

const POP_LIFE = 260

/** 薄荷汽水第四层：按住琴键时冒汽泡，升到顶端「啵」地破成水圈 */
export function createMintSodaFizzRuntime(): PerformOverlayRuntime {
  const bubbles: FizzBubble[] = []
  const pops: Pop[] = []
  const acc = new Map<number, number>()

  function spawn(x: number, y: number, big: boolean) {
    const r = big ? 4 + Math.random() * 4 : 1.6 + Math.random() * 2.6
    bubbles.push({
      x: x + (Math.random() - 0.5) * 8,
      y,
      r,
      vy: 0.8 + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
      rise: 0,
      maxRise: 50 + Math.random() * 90
    })
  }

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]!
        b.y -= b.vy * k
        b.rise += b.vy * k
        b.vy *= 0.995 ** k
        b.wobble += 0.12 * k
        if (b.rise >= b.maxRise) {
          pops.push({ x: b.x + Math.sin(b.wobble) * 2, y: b.y, r: b.r, life: POP_LIFE })
          bubbles.splice(i, 1)
        }
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        pops[i]!.life -= input.deltaMs
        if (pops[i]!.life <= 0) pops.splice(i, 1)
      }

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        if (!input.activeKeys.has(midi)) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 3) {
          spawn(layout.x + layout.width / 2, input.baselineY - 4, Math.random() < 0.25)
          acc.set(midi, 0)
        } else {
          acc.set(midi, next)
        }
      }
    },

    onKeysChanged(prev, next) {
      for (const midi of prev) {
        if (!next.has(midi)) acc.delete(midi)
      }
    },

    draw(ctx) {
      for (const b of bubbles) {
        const t = b.rise / b.maxRise
        drawMintSodaBubble(ctx, b.x + Math.sin(b.wobble) * 2, b.y, b.r, t < 0.1 ? t / 0.1 : 1, 0.7)
      }
      ctx.lineWidth = 1.2
      for (const p of pops) {
        const t = 1 - p.life / POP_LIFE
        ctx.strokeStyle = `rgba(20, 140, 128, ${(1 - t) * 0.7})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (1 + t * 1.6), 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = `rgba(20, 140, 128, ${(1 - t) * 0.6})`
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4
          const d = p.r * (1.4 + t * 2.4)
          ctx.fillRect(p.x + Math.cos(a) * d - 0.75, p.y + Math.sin(a) * d - 0.75, 1.5, 1.5)
        }
      }
    },

    isAnimating() {
      return bubbles.length > 0 || pops.length > 0
    },

    reset() {
      bubbles.length = 0
      pops.length = 0
      acc.clear()
    }
  }
}
