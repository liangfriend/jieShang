import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'

type Crystal = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  rotSpeed: number
  life: number
  maxLife: number
  color: string
}

type Pillar = { x: number; y: number; width: number }

const CRYSTAL_COLORS = ['#e8fbff', '#9ff7e8', '#d2b8ff']
const PILLAR_HEIGHT = 90

function createCrystal(x: number, y: number, burst: boolean): Crystal {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (burst ? 2.2 : 0.8)
  const speed = burst ? 1.8 + Math.random() * 2.4 : 0.8 + Math.random()
  const maxLife = 800 + Math.random() * 700
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: burst ? 3 + Math.random() * 4 : 2 + Math.random() * 2,
    rot: Math.random() * Math.PI,
    rotSpeed: (Math.random() - 0.5) * 0.12,
    life: maxLife,
    maxLife,
    color: CRYSTAL_COLORS[(Math.random() * CRYSTAL_COLORS.length) | 0]!
  }
}

/** 六臂冰晶：三条交叉主轴，每条末端带一对小分叉 */
function drawCrystal(ctx: CanvasRenderingContext2D, c: Crystal, alpha: number) {
  ctx.save()
  ctx.translate(c.x, c.y)
  ctx.rotate(c.rot)
  ctx.globalAlpha = alpha
  ctx.strokeStyle = c.color
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const s = c.size
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3
    const dx = Math.cos(a) * s
    const dy = Math.sin(a) * s
    ctx.moveTo(-dx, -dy)
    ctx.lineTo(dx, dy)
    for (const sign of [1, -1]) {
      const bx = dx * 0.6 * sign
      const by = dy * 0.6 * sign
      const pa = a + (sign > 0 ? 0 : Math.PI)
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(pa + 0.8) * s * 0.35, by + Math.sin(pa + 0.8) * s * 0.35)
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(pa - 0.8) * s * 0.35, by + Math.sin(pa - 0.8) * s * 0.35)
    }
  }
  ctx.stroke()
  ctx.restore()
}

/** 极光第四层：按住时琴键上方升起极光光柱，按下时迸出冰晶 */
export function createAuroraCrystalRuntime(): PerformOverlayRuntime {
  const crystals: Crystal[] = []
  const pillars: Pillar[] = []
  const pending = new Set<number>()
  const acc = new Map<number, number>()
  let clock = 0

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      clock = input.now
      for (let i = crystals.length - 1; i >= 0; i--) {
        const c = crystals[i]!
        c.vx *= 0.97 ** k
        c.vy = c.vy * 0.97 ** k + 0.03 * k
        c.x += c.vx * k
        c.y += c.vy * k
        c.rot += c.rotSpeed * k
        c.life -= input.deltaMs
        if (c.life <= 0) crystals.splice(i, 1)
      }

      pillars.length = 0
      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const held = input.activeKeys.has(midi)
        const burst = pending.has(midi)
        if (!held && !burst) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY
        if (held) pillars.push({ x: cx, y, width: Math.max(10, layout.width * 1.2) })
        if (burst) {
          for (let i = 0; i < 8; i++) crystals.push(createCrystal(cx, y - 4, true))
          continue
        }
        const next = (acc.get(midi) ?? 0) + k
        if (next >= 9) {
          crystals.push(createCrystal(cx, y - 4, false))
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
      for (const p of pillars) {
        const wave = 0.8 + 0.2 * Math.sin(clock * 0.01 + p.x * 0.05)
        const top = p.y - PILLAR_HEIGHT * wave
        const g = ctx.createLinearGradient(0, p.y, 0, top)
        g.addColorStop(0, 'rgba(150, 255, 210, 0.55)')
        g.addColorStop(0.5, 'rgba(120, 200, 255, 0.22)')
        g.addColorStop(1, 'rgba(190, 130, 255, 0)')
        ctx.fillStyle = g
        ctx.fillRect(p.x - p.width / 2, top, p.width, p.y - top)
      }
      for (const c of crystals) {
        const t = c.life / c.maxLife
        drawCrystal(ctx, c, t < 0.4 ? t / 0.4 : 1)
      }
      ctx.restore()
    },

    isAnimating() {
      return crystals.length > 0 || pillars.length > 0
    },

    reset() {
      crystals.length = 0
      pillars.length = 0
      pending.clear()
      acc.clear()
    }
  }
}
