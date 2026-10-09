import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { buildBolt, strokeBolt } from './thunderBackground'

type Segment = Parameters<typeof strokeBolt>[1][number]

type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
type Shock = { x: number; y: number; life: number; segs: Segment[] }

const SHOCK_LIFE = 320
const ARC_HEIGHT = 46
const CHAIN_MAX_GAP = 90

/** 雷霆第四层：按住时琴键窜出电弧、相邻按键之间串起连锁闪电，按下时冲击环 + 电火花 */
export function createThunderArcRuntime(): PerformOverlayRuntime {
  const sparks: Spark[] = []
  const shocks: Shock[] = []
  const pending = new Set<number>()
  let arcs: Segment[] = []
  let arcFrame = -1
  let heldPoints: Array<{ x: number; y: number }> = []

  return {
    tick(input: PerformOverlayTickInput) {
      const k = Math.min(3, input.deltaMs / 16.67)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]!
        p.vx *= 0.93 ** k
        p.vy = p.vy * 0.93 ** k + 0.12 * k
        p.x += p.vx * k
        p.y += p.vy * k
        p.life -= input.deltaMs
        if (p.life <= 0) sparks.splice(i, 1)
      }
      for (let i = shocks.length - 1; i >= 0; i--) {
        shocks[i]!.life -= input.deltaMs
        if (shocks[i]!.life <= 0) shocks.splice(i, 1)
      }

      const points: Array<{ x: number; y: number }> = []
      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const held = input.activeKeys.has(midi)
        const burst = pending.has(midi)
        if (!held && !burst) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY - 2
        if (held) points.push({ x: cx, y })
        if (burst) {
          const segs: Segment[] = []
          for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i - 2) * 0.55
            buildBolt(segs, cx, y, cx + Math.cos(a) * 34, y + Math.sin(a) * 34, 16, 1.1, Math.random, 0.2)
          }
          shocks.push({ x: cx, y, life: SHOCK_LIFE, segs })
          for (let i = 0; i < 12; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6
            const sp = 2 + Math.random() * 4
            const maxLife = 250 + Math.random() * 300
            sparks.push({ x: cx, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: maxLife, maxLife })
          }
        }
      }
      pending.clear()
      heldPoints = points

      const frame = Math.floor(input.now / 55)
      if (frame !== arcFrame) {
        arcFrame = frame
        arcs = []
        for (const p of points) {
          const topX = p.x + (Math.random() - 0.5) * 18
          buildBolt(arcs, p.x, p.y, topX, p.y - ARC_HEIGHT * (0.6 + Math.random() * 0.4), 18, 1, Math.random, 0.22)
        }
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1]!
          const b = points[i]!
          if (b.x - a.x > CHAIN_MAX_GAP) continue
          const lift = 18 + Math.random() * 14
          const midX = (a.x + b.x) / 2
          const segs: Segment[] = []
          buildBolt(segs, a.x, a.y - 6, midX, a.y - lift, 14, 1, Math.random, 0)
          buildBolt(segs, midX, a.y - lift, b.x, b.y - 6, 14, 1, Math.random, 0)
          arcs.push(...segs)
        }
      }
    },

    onKeysChanged(prev, next) {
      for (const midi of next) {
        if (!prev.has(midi)) pending.add(midi)
      }
    },

    draw(ctx) {
      if (heldPoints.length) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (const p of heldPoints) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22)
          g.addColorStop(0, 'rgba(200, 240, 255, 0.8)')
          g.addColorStop(1, 'rgba(120, 90, 255, 0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - 22, p.y - 22, 44, 44)
        }
        ctx.restore()
        strokeBolt(ctx, arcs, 0.75)
      }

      for (const s of shocks) {
        const t = s.life / SHOCK_LIFE
        strokeBolt(ctx, s.segs, t)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = `rgba(170, 230, 255, ${t * 0.8})`
        ctx.lineWidth = 2 * t + 0.5
        const r = 8 + (1 - t) * 34
        ctx.beginPath()
        ctx.ellipse(s.x, s.y, r, r * 0.35, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      if (sparks.length) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineCap = 'round'
        ctx.lineWidth = 1.6
        for (const p of sparks) {
          ctx.strokeStyle = `rgba(220, 245, 255, ${p.life / p.maxLife})`
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2)
          ctx.stroke()
        }
        ctx.restore()
      }
    },

    isAnimating() {
      return sparks.length > 0 || shocks.length > 0 || heldPoints.length > 0
    },

    reset() {
      sparks.length = 0
      shocks.length = 0
      pending.clear()
      arcs = []
      heldPoints = []
    }
  }
}
