import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
}

type Ring = { x: number; y: number; life: number; maxLife: number }

const SPARK_COLORS = ['#7ffcff', '#ff5ae0', '#ffffff', '#b98cff']
const RING_LIFE = 420

function createSpark(x: number, y: number, burst: boolean): Spark {
  const maxLife = burst ? 380 + Math.random() * 360 : 260 + Math.random() * 240
  return {
    x: x + (Math.random() - 0.5) * 6,
    y,
    vx: (Math.random() - 0.5) * (burst ? 5 : 1.6),
    vy: -(burst ? 4 + Math.random() * 5 : 3 + Math.random() * 3),
    life: maxLife,
    maxLife,
    color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]!
  }
}

/** 霓虹落日第四层：按下时地面扩散霓虹环 + 火花喷射，按住时持续喷出细火花 */
export function createSynthwaveSparkRuntime(): PerformOverlayRuntime {
  const sparks: Spark[] = []
  const rings: Ring[] = []
  const pending = new Set<number>()
  const acc = new Map<number, number>()

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!
        p.vy += 0.22 * k
        p.vx *= 0.98 ** k
        p.x += p.vx * k
        p.y += p.vy * k
        p.life -= input.deltaMs
        if (p.life <= 0) sparks.splice(i, 1)
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i]!.life -= input.deltaMs
        if (rings[i]!.life <= 0) rings.splice(i, 1)
      }

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const burst = pending.has(midi)
        if (!burst && !input.activeKeys.has(midi)) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY
        if (burst) {
          rings.push({ x: cx, y, life: RING_LIFE, maxLife: RING_LIFE })
          for (let i = 0; i < 14; i++) sparks.push(createSpark(cx, y - 2, true))
          continue
        }
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 3) {
          sparks.push(createSpark(cx, y - 2, false))
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
      ctx.lineCap = 'round'
      for (const r of rings) {
        const t = 1 - r.life / r.maxLife
        const radius = 6 + t * 38
        ctx.strokeStyle = `rgba(127, 252, 255, ${(1 - t) * 0.9})`
        ctx.lineWidth = 2.5 * (1 - t) + 0.5
        ctx.beginPath()
        ctx.ellipse(r.x, r.y, radius, radius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      for (const p of sparks) {
        const a = Math.min(1, (p.life / p.maxLife) * 1.6)
        ctx.globalAlpha = a
        ctx.strokeStyle = p.color
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 3.2, p.y - p.vy * 3.2)
        ctx.stroke()
      }
      ctx.restore()
    },

    isAnimating() {
      return sparks.length > 0 || rings.length > 0
    },

    reset() {
      sparks.length = 0
      rings.length = 0
      pending.clear()
      acc.clear()
    }
  }
}
