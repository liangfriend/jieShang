import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'

type Puff = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  grow: number
  life: number
  maxLife: number
}

type Bean = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  life: number
  maxLife: number
}

const BEAN_COLORS = ['#ff5252', '#ffd020', '#3ddc84']

function createPuff(x: number, y: number, burst: boolean): Puff {
  const maxLife = burst ? 520 + Math.random() * 260 : 700 + Math.random() * 300
  return {
    x: x + (Math.random() - 0.5) * 6,
    y,
    vx: (Math.random() - 0.5) * (burst ? 2.2 : 0.6),
    vy: -(burst ? 0.8 + Math.random() * 1.2 : 0.5 + Math.random() * 0.5),
    r: burst ? 3 + Math.random() * 3 : 2.5 + Math.random() * 1.5,
    grow: burst ? 0.12 : 0.06,
    life: maxLife,
    maxLife
  }
}

function createBean(x: number, y: number, i: number): Bean {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8
  const speed = 2.4 + Math.random() * 2.2
  const maxLife = 600 + Math.random() * 300
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 2 + Math.random() * 1.4,
    color: BEAN_COLORS[i % BEAN_COLORS.length]!,
    life: maxLife,
    maxLife
  }
}

/** 卡通云团：三个叠圆 + 描边，白底灰边 */
function drawPuff(ctx: CanvasRenderingContext2D, p: Puff, alpha: number) {
  const { x, y, r } = p
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x - r * 0.7, y + r * 0.2, r * 0.75, 0, Math.PI * 2)
  ctx.arc(x, y - r * 0.2, r, 0, Math.PI * 2)
  ctx.arc(x + r * 0.75, y + r * 0.25, r * 0.7, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 40, 40, 0.55)'
  ctx.lineWidth = 1
  ctx.stroke()
}

/** 斑马线第四层：按下时红绿灯顶喷出卡通云团 + 三色信号豆，按住时持续冒小云团 */
export function createZebraCrossingPuffRuntime(keyBarHeight: number): () => PerformOverlayRuntime {
  return () => {
    const puffs: Puff[] = []
    const beans: Bean[] = []
    const pending = new Set<number>()
    const acc = new Map<number, number>()

    return {
      tick(input: PerformOverlayTickInput) {
        const k = Math.min(3, input.deltaMs / 16.67)
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i]!
          p.vx *= 0.96 ** k
          p.vy *= 0.97 ** k
          p.x += p.vx * k
          p.y += p.vy * k
          p.r += p.grow * k
          p.life -= input.deltaMs
          if (p.life <= 0) puffs.splice(i, 1)
        }
        for (let i = beans.length - 1; i >= 0; i--) {
          const b = beans[i]!
          b.vy += 0.16 * k
          b.x += b.vx * k
          b.y += b.vy * k
          b.life -= input.deltaMs
          if (b.life <= 0) beans.splice(i, 1)
        }

        const topY = input.baselineY - 1 - keyBarHeight
        for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
          const burst = pending.has(midi)
          if (!burst && !input.activeKeys.has(midi)) continue
          const layout = input.midiLayouts.get(midi)
          if (!layout) continue
          const cx = layout.x + layout.width / 2
          if (burst) {
            for (let i = 0; i < 4; i++) puffs.push(createPuff(cx, topY - 2, true))
            for (let i = 0; i < 6; i++) beans.push(createBean(cx, topY - 2, i))
            continue
          }
          const next = (acc.get(midi) ?? 0) + k
          if (next >= 10) {
            puffs.push(createPuff(cx, topY - 2, false))
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
        for (const p of puffs) {
          const t = p.life / p.maxLife
          drawPuff(ctx, p, t < 0.5 ? t / 0.5 : 1)
        }
        for (const b of beans) {
          const t = b.life / b.maxLife
          ctx.globalAlpha = t < 0.3 ? t / 0.3 : 1
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fillStyle = b.color
          ctx.fill()
          ctx.strokeStyle = 'rgba(30, 30, 30, 0.6)'
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
        ctx.restore()
      },

      isAnimating() {
        return puffs.length > 0 || beans.length > 0
      },

      reset() {
        puffs.length = 0
        beans.length = 0
        pending.clear()
        acc.clear()
      }
    }
  }
}
