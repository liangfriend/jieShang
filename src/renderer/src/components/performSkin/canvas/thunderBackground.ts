import type { PerformLayerBackgroundInput } from '../types'

type Segment = { x1: number; y1: number; x2: number; y2: number; w: number }

type StormScene = {
  width: number
  height: number
  cloudsFar: HTMLCanvasElement
  cloudsNear: HTMLCanvasElement
  ridge: HTMLCanvasElement
}

let scene: StormScene | null = null
let cachedStrike: { id: number; segs: Segment[] } | null = null

const STRIKE_PERIOD = 3400
const STRIKE_DURATION = 420

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** 基于种子的伪随机序列，保证同一次雷击的形状在各帧一致 */
function seededRandom(seed: number) {
  let i = 0
  return () => hash(seed * 7.13 + i++ * 1.618)
}

function makeCanvas(width: number, height: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  return c
}

/**
 * 中点位移闪电：递归细分并横向扰动，随机长出分叉。
 * 结果写入 out，w 为线宽（主干粗、分叉细）。
 */
export function buildBolt(
  out: Segment[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displace: number,
  w: number,
  rnd: () => number,
  branchChance = 0.35,
  depth = 0
) {
  if (displace < 3 || depth > 9) {
    out.push({ x1, y1, x2, y2, w })
    return
  }
  const mx = (x1 + x2) / 2 + (rnd() - 0.5) * displace
  const my = (y1 + y2) / 2 + (rnd() - 0.5) * displace * 0.3
  buildBolt(out, x1, y1, mx, my, displace / 2, w, rnd, branchChance, depth + 1)
  buildBolt(out, mx, my, x2, y2, displace / 2, w, rnd, branchChance, depth + 1)
  if (depth < 4 && rnd() < branchChance) {
    const len = Math.hypot(x2 - x1, y2 - y1) * (0.6 + rnd() * 0.6)
    const angle = Math.atan2(y2 - y1, x2 - x1) + (rnd() - 0.5) * 1.6
    buildBolt(
      out,
      mx,
      my,
      mx + Math.cos(angle) * len,
      my + Math.sin(angle) * len,
      displace / 2,
      w * 0.5,
      rnd,
      branchChance * 0.6,
      depth + 1
    )
  }
}

/** 三遍描边：宽紫外晕 → 青色中层 → 白芯 */
export function strokeBolt(ctx: CanvasRenderingContext2D, segs: Segment[], alpha: number, scale = 1) {
  if (alpha <= 0.01) return
  const byWidth = new Map<number, Segment[]>()
  for (const s of segs) {
    const list = byWidth.get(s.w)
    if (list) list.push(s)
    else byWidth.set(s.w, [s])
  }
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const [mult, color, a] of [
    [5, '150, 110, 255', 0.18],
    [2.2, '130, 220, 255', 0.55],
    [1, '255, 255, 255', 1]
  ] as const) {
    ctx.strokeStyle = `rgba(${color}, ${a * alpha})`
    for (const [w, list] of byWidth) {
      ctx.lineWidth = w * mult * scale
      ctx.beginPath()
      for (const s of list) {
        ctx.moveTo(s.x1, s.y1)
        ctx.lineTo(s.x2, s.y2)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
}

function buildCloudBank(width: number, height: number, seed: number, base: string, rim: string) {
  const c = makeCanvas(width, height)
  const g = c.getContext('2d')!
  const puffs: Array<[number, number, number]> = []
  const count = Math.ceil(width / 8)
  for (let i = 0; i < count; i++) {
    const x = hash(seed + i) * width
    const y = height * (0.25 + hash(seed + i + 0.5) * 0.4)
    const r = 26 + hash(seed + i + 0.8) * 34
    puffs.push([x, y, r])
    if (x < 110) puffs.push([x + width, y, r])
    if (x > width - 110) puffs.push([x - width, y, r])
  }
  puffs.sort((a, b) => a[1] - b[1])
  g.save()
  g.scale(1.8, 1)
  for (const [x0, y, r] of puffs) {
    const x = x0 / 1.8
    const grad = g.createRadialGradient(x, y - r * 0.45, r * 0.05, x, y, r)
    grad.addColorStop(0, rim)
    grad.addColorStop(0.45, base)
    grad.addColorStop(0.85, base.replace(/[\d.]+\)$/, '0.4)'))
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    g.fillStyle = grad
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
  g.restore()
  const top = g.createLinearGradient(0, 0, 0, height * 0.35)
  top.addColorStop(0, base)
  top.addColorStop(1, 'rgba(0, 0, 0, 0)')
  g.fillStyle = top
  g.fillRect(0, 0, width, height * 0.35)
  return c
}

function buildRidge(width: number, height: number) {
  const c = makeCanvas(width, height)
  const g = c.getContext('2d')!
  const baseY = height * 0.86
  g.fillStyle = '#04050b'
  g.beginPath()
  g.moveTo(0, height)
  for (let x = 0, i = 0; x <= width + 20; x += 20, i++) {
    const y = baseY - Math.sin(x * 0.008 + 1.3) * height * 0.04 - hash(i + 40) * height * 0.03
    g.lineTo(x, y)
  }
  g.lineTo(width, height)
  g.closePath()
  g.fill()
  return c
}

function ensureScene(width: number, height: number): StormScene {
  if (scene && scene.width === width && scene.height === height) return scene
  const cloudH = height * 0.42
  scene = {
    width,
    height,
    cloudsFar: buildCloudBank(width, cloudH, 11, 'rgba(38, 42, 78, 0.8)', 'rgba(72, 78, 128, 0.75)'),
    cloudsNear: buildCloudBank(width, cloudH, 57, 'rgba(20, 22, 44, 0.92)', 'rgba(52, 56, 98, 0.85)'),
    ridge: buildRidge(width, height)
  }
  cachedStrike = null
  return scene
}

function getStrike(s: StormScene, id: number) {
  if (cachedStrike && cachedStrike.id === id) return cachedStrike.segs
  const rnd = seededRandom(id + 1)
  const segs: Segment[] = []
  const x = s.width * (0.15 + rnd() * 0.7)
  const endX = x + (rnd() - 0.5) * s.width * 0.3
  buildBolt(segs, x, s.height * 0.12, endX, s.height * (0.7 + rnd() * 0.15), s.width * 0.25, 3, rnd)
  cachedStrike = { id, segs }
  return segs
}

/** 当前闪光强度：一次雷击内两次闪烁后衰减 */
export function thunderFlash(time: number) {
  const id = Math.floor(time / STRIKE_PERIOD)
  const offset = hash(id + 0.31) * (STRIKE_PERIOD - STRIKE_DURATION - 200)
  const local = (time % STRIKE_PERIOD) - offset
  if (local < 0 || local > STRIKE_DURATION) return { id, flash: 0 }
  const t = local / STRIKE_DURATION
  const flicker = t < 0.12 ? 1 : t < 0.22 ? 0.25 : t < 0.32 ? 0.9 : (1 - t) / 0.68
  return { id, flash: Math.max(0, flicker) }
}

function drawCloudLayer(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, w: number, offset: number, y: number) {
  const x = -(((offset % w) + w) % w)
  ctx.drawImage(img, x, y)
  ctx.drawImage(img, x + w, y)
}

function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.strokeStyle = 'rgba(170, 190, 255, 0.28)'
  ctx.lineWidth = 1
  ctx.beginPath()
  const span = w + 120
  for (let i = 0; i < 110; i++) {
    const speed = 0.5 + hash(i + 0.7) * 0.4
    const x = ((hash(i) * span - time * 0.12 * speed) % span + span) % span - 60
    const y = ((hash(i + 0.5) * h + time * speed) % (h + 40)) - 20
    const len = 10 + hash(i + 0.9) * 10
    ctx.moveTo(x, y)
    ctx.lineTo(x - len * 0.25, y + len)
  }
  ctx.stroke()
}

/** 雷霆第一层：暴风夜空、双层积雨云、斜雨、山脊，周期性分叉闪电与全屏闪光 */
export function drawThunderBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  const { id, flash } = thunderFlash(time)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#07081a')
  sky.addColorStop(0.55, '#171c3a')
  sky.addColorStop(1, '#0b0e20')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  if (flash > 0) {
    ctx.fillStyle = `rgba(150, 140, 255, ${flash * 0.28})`
    ctx.fillRect(0, 0, w, h)
  }

  drawCloudLayer(ctx, s.cloudsFar, w, time * 0.008, h * 0.02)
  if (flash > 0) strokeBolt(ctx, getStrike(s, id), flash)
  drawCloudLayer(ctx, s.cloudsNear, w, time * 0.018, -h * 0.06)

  if (flash > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = flash * 0.45
    drawCloudLayer(ctx, s.cloudsNear, w, time * 0.018, -h * 0.06)
    ctx.restore()
  }

  drawRain(ctx, w, h, time)
  ctx.drawImage(s.ridge, 0, 0)
  if (flash > 0) {
    ctx.fillStyle = `rgba(200, 200, 255, ${flash * 0.12})`
    ctx.fillRect(0, 0, w, h)
  }
}

/** 层内电弧丝：每 70ms 重新生成的竖向锯齿线 */
function drawFilaments(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
  gap: number
) {
  const frame = Math.floor(time / 70)
  const step = 14
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = gap / 2, col = 0; x < w; x += gap, col++) {
    ctx.moveTo(x, 0)
    for (let y = step, row = 0; y <= h + step; y += step, row++) {
      const jitter = (hash(col * 131 + row * 7 + frame * 0.61) - 0.5) * 6
      ctx.lineTo(x + jitter, y)
    }
  }
  ctx.stroke()
}

/** 雷霆 normal 层：电紫等离子 + 跳动的电弧丝 + 流光 */
export function drawThunderNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#a47bff')
  g.addColorStop(0.5, '#7446f0')
  g.addColorStop(1, '#4a26c8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const period = 150
  const shift = (time * 0.15) % period
  for (let y = -period + shift; y < h + period; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + 40)
    band.addColorStop(0, 'rgba(0, 0, 0, 0)')
    band.addColorStop(0.5, 'rgba(210, 200, 255, 0.45)')
    band.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, 40)
  }
  drawFilaments(ctx, w, h, time, 'rgba(190, 240, 255, 0.55)', 7)
}

/** 雷霆 active 层：白热电蓝 + 高亮电弧丝，整体随放电闪烁 */
export function drawThunderActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.45, '#aef0ff')
  g.addColorStop(1, '#4aa8ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const flicker = hash(Math.floor(time / 50))
  ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.3})`
  ctx.fillRect(0, 0, w, h)
  drawFilaments(ctx, w, h, time, 'rgba(120, 90, 255, 0.55)', 5)
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const THUNDER_CONTAINER_BG = 'linear-gradient(180deg, #07081a 0%, #171c3a 55%, #0b0e20 100%)'
