import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { drawImperialGlow } from './imperialDragonBackground'

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  ember: boolean
}

type Flash = { x: number; y: number; life: number }

const SPARK_COLORS = ['#fff2b0', '#ffd24a', '#ff9a2a', '#ff5a3a']
const FLASH_LIFE = 260

function createFirework(x: number, y: number, i: number, count: number): Spark {
  const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2
  const speed = 2.4 + Math.random() * 2.2
  const maxLife = 600 + Math.random() * 400
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 1.6,
    size: 1.6 + Math.random() * 1.2,
    life: maxLife,
    maxLife,
    color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0]!,
    ember: false
  }
}

function createEmber(x: number, y: number): Spark {
  const maxLife = 700 + Math.random() * 600
  return {
    x: x + (Math.random() - 0.5) * 8,
    y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(0.8 + Math.random() * 1.2),
    size: 4 + Math.random() * 4,
    life: maxLife,
    maxLife,
    color: '#ffb347',
    ember: true
  }
}

/** 金龙第四层：按下时金色烟花绽放 + 闪光，按住时持续升腾火星 */
export function createImperialDragonFireworkRuntime(): PerformOverlayRuntime {
  const sparks: Spark[] = []
  const flashes: Flash[] = []
  const pending = new Set<number>()
  const acc = new Map<number, number>()

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!
        if (p.ember) {
          p.vx += (Math.random() - 0.5) * 0.08 * k
        } else {
          p.vx *= 0.955 ** k
          p.vy = p.vy * 0.955 ** k + 0.07 * k
        }
        p.x += p.vx * k
        p.y += p.vy * k
        p.life -= input.deltaMs
        if (p.life <= 0) sparks.splice(i, 1)
      }
      for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i]!.life -= input.deltaMs
        if (flashes[i]!.life <= 0) flashes.splice(i, 1)
      }

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const burst = pending.has(midi)
        if (!burst && !input.activeKeys.has(midi)) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY - 6
        if (burst) {
          flashes.push({ x: cx, y, life: FLASH_LIFE })
          const count = 16
          for (let i = 0; i < count; i++) sparks.push(createFirework(cx, y, i, count))
          continue
        }
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 5) {
          sparks.push(createEmber(cx, y))
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
      for (const f of flashes) {
        const t = f.life / FLASH_LIFE
        drawImperialGlow(ctx, f.x, f.y, 14 + (1 - t) * 26, t)
      }
      ctx.lineCap = 'round'
      for (const p of sparks) {
        const t = p.life / p.maxLife
        if (p.ember) {
          drawImperialGlow(ctx, p.x, p.y, p.size, t * (0.6 + 0.4 * Math.sin(p.life * 0.03)))
          continue
        }
        ctx.globalAlpha = Math.min(1, t * 1.5)
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5)
        ctx.stroke()
        if (t < 0.35 && ((p.life / 60) | 0) % 2 === 0) {
          ctx.fillStyle = '#fffbe8'
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2)
        }
      }
      ctx.restore()
    },

    isAnimating() {
      return sparks.length > 0 || flashes.length > 0
    },

    reset() {
      sparks.length = 0
      flashes.length = 0
      pending.clear()
      acc.clear()
    }
  }
}
