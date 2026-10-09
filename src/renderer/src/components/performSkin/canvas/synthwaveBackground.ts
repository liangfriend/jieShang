import type { PerformLayerBackgroundInput } from '../types'

type SynthScene = {
  width: number
  height: number
  horizonY: number
  sky: HTMLCanvasElement
  mountains: HTMLCanvasElement
  sun: HTMLCanvasElement
  sunR: number
}

let scene: SynthScene | null = null

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function makeCanvas(width: number, height: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  return c
}

function buildSky(width: number, height: number, horizonY: number) {
  const c = makeCanvas(width, height)
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, horizonY)
  sky.addColorStop(0, '#0c0224')
  sky.addColorStop(0.55, '#2e0a55')
  sky.addColorStop(0.85, '#7a1a78')
  sky.addColorStop(1, '#ff3d8b')
  g.fillStyle = sky
  g.fillRect(0, 0, width, horizonY)

  for (let i = 0; i < 90; i++) {
    const x = hash(i + 0.13) * width
    const y = hash(i + 0.71) * horizonY * 0.8
    g.fillStyle = `rgba(255, 230, 255, ${0.25 + hash(i + 0.37) * 0.5})`
    g.fillRect(x, y, 1.2, 1.2)
  }
  return c
}

function buildMountains(width: number, horizonY: number, height: number) {
  const maxH = height * 0.13
  const c = makeCanvas(width, horizonY + 2)
  const g = c.getContext('2d')!
  const pts: Array<[number, number]> = []
  const step = 26
  for (let x = -step, i = 0; x <= width + step; x += step, i++) {
    const centerDip = Math.min(1, Math.abs(x - width / 2) / (width * 0.32))
    const h = maxH * (0.25 + hash(i + 3.3) * 0.75) * (0.2 + 0.8 * centerDip)
    pts.push([x, horizonY - h * (i % 2 === 0 ? 1 : 0.55)])
  }

  g.fillStyle = '#16052e'
  g.beginPath()
  g.moveTo(-step, horizonY + 2)
  for (const [x, y] of pts) g.lineTo(x, y)
  g.lineTo(width + step, horizonY + 2)
  g.closePath()
  g.fill()

  g.strokeStyle = 'rgba(255, 70, 220, 0.35)'
  g.lineWidth = 1
  g.beginPath()
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i]!
    if (y >= horizonY - 2) continue
    g.moveTo(x, y)
    g.lineTo(x - step * 0.6, horizonY)
    g.moveTo(x, y)
    g.lineTo(x + step * 0.6, horizonY)
  }
  g.stroke()

  g.strokeStyle = '#ff5ae0'
  g.lineWidth = 1.6
  g.beginPath()
  pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
  g.stroke()
  return c
}

function ensureScene(width: number, height: number): SynthScene {
  if (scene && scene.width === width && scene.height === height) return scene
  const horizonY = Math.round(height * 0.56)
  const sunR = Math.min(width, height) * 0.24
  scene = {
    width,
    height,
    horizonY,
    sky: buildSky(width, height, horizonY),
    mountains: buildMountains(width, horizonY, height),
    sun: makeCanvas(sunR * 2, sunR * 2),
    sunR
  }
  return scene
}

/** 条纹落日：渐变圆 + 下半部分向下滚动、逐渐变粗的切口 */
function paintSun(s: SynthScene, time: number) {
  const g = s.sun.getContext('2d')!
  const r = s.sunR
  const d = r * 2
  g.clearRect(0, 0, d, d)
  const grad = g.createLinearGradient(0, 0, 0, d)
  grad.addColorStop(0, '#fff176')
  grad.addColorStop(0.4, '#ffab40')
  grad.addColorStop(0.75, '#ff4f8b')
  grad.addColorStop(1, '#c2185b')
  g.fillStyle = grad
  g.beginPath()
  g.arc(r, r, r, 0, Math.PI * 2)
  g.fill()

  const start = d * 0.4
  const end = d * 0.78
  const spacing = d * 0.07
  const shift = (time * 0.012) % spacing
  for (let y = start + shift - spacing; y < d; y += spacing) {
    if (y < start) continue
    const t = Math.min(1, (y - start) / (end - start))
    g.clearRect(0, y, d, 1.5 + t * spacing * 0.6)
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, s: SynthScene, time: number) {
  const { width: w, height: h, horizonY: y0 } = s
  const depth = h - y0

  const floor = ctx.createLinearGradient(0, y0, 0, h)
  floor.addColorStop(0, '#2a0648')
  floor.addColorStop(1, '#07011a')
  ctx.fillStyle = floor
  ctx.fillRect(0, y0, w, depth)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const cx = w / 2
  ctx.strokeStyle = 'rgba(255, 60, 210, 0.55)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const spread = w * 0.14
  for (let i = -14; i <= 14; i++) {
    ctx.moveTo(cx, y0)
    ctx.lineTo(cx + i * spread * 2.2, h + depth * 1.2)
  }
  ctx.stroke()

  const frac = (time * 0.0006) % 1
  for (let i = 0; i < 18; i++) {
    const z = i + 1 - frac
    const y = y0 + depth / (z * 0.55 + 0.45)
    if (y > h + 2) continue
    const near = Math.min(1, (y - y0) / depth)
    ctx.strokeStyle = `rgba(255, 70, 220, ${0.15 + near * 0.6})`
    ctx.lineWidth = 0.8 + near * 1.4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const haze = ctx.createLinearGradient(0, y0 - 18, 0, y0 + 26)
  haze.addColorStop(0, 'rgba(255, 80, 180, 0)')
  haze.addColorStop(0.45, 'rgba(255, 80, 180, 0.45)')
  haze.addColorStop(1, 'rgba(255, 80, 180, 0)')
  ctx.fillStyle = haze
  ctx.fillRect(0, y0 - 18, w, 44)
  ctx.restore()
}

function drawShootingStar(ctx: CanvasRenderingContext2D, s: SynthScene, time: number) {
  const cycle = 5200
  const n = Math.floor(time / cycle)
  const p = (time % cycle) / cycle
  if (p > 0.14) return
  const t = p / 0.14
  const sx = hash(n + 0.5) * s.width * 0.7 + s.width * 0.15
  const sy = hash(n + 0.9) * s.horizonY * 0.35
  const len = s.width * 0.28
  const x = sx + t * len
  const y = sy + t * len * 0.35
  const tail = ctx.createLinearGradient(x, y, x - 60, y - 21)
  tail.addColorStop(0, `rgba(255, 255, 255, ${1 - t})`)
  tail.addColorStop(1, 'rgba(120, 240, 255, 0)')
  ctx.strokeStyle = tail
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - 60, y - 21)
  ctx.stroke()
}

/** 霓虹落日第一层：星空、条纹落日、线框山脉与向前滚动的透视网格 */
export function drawSynthwaveBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)

  ctx.drawImage(s.sky, 0, 0)
  for (let i = 0; i < 24; i++) {
    const a = 0.5 + 0.5 * Math.sin(time * 0.003 + i * 2.1)
    ctx.fillStyle = `rgba(160, 240, 255, ${a * 0.9})`
    ctx.fillRect(hash(i + 9.1) * w, hash(i + 4.7) * s.horizonY * 0.75, 1.8, 1.8)
  }
  drawShootingStar(ctx, s, time)

  const sunX = w / 2
  const sunY = s.horizonY - s.sunR * 0.55
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glow = ctx.createRadialGradient(sunX, sunY, s.sunR * 0.6, sunX, sunY, s.sunR * 2.2)
  glow.addColorStop(0, 'rgba(255, 90, 140, 0.35)')
  glow.addColorStop(1, 'rgba(255, 90, 140, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, s.horizonY)
  ctx.restore()

  paintSun(s, time)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, s.horizonY)
  ctx.clip()
  ctx.drawImage(s.sun, sunX - s.sunR, sunY - s.sunR)
  ctx.restore()

  ctx.drawImage(s.mountains, 0, 0)
  drawGrid(ctx, s, time)
}

/** 霓虹落日 normal 层：横向品红→紫→蓝的霓虹渐变 + 扫描线与流光 */
export function drawSynthwaveNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, '#ff5ae0')
  g.addColorStop(0.5, '#c77dff')
  g.addColorStop(1, '#6f9dff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const period = 160
  const shift = (time * 0.08) % period
  for (let y = -period + shift; y < h + period; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + 50)
    band.addColorStop(0, 'rgba(255, 255, 255, 0)')
    band.addColorStop(0.5, 'rgba(255, 230, 255, 0.45)')
    band.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, 50)
  }

  ctx.fillStyle = 'rgba(20, 0, 50, 0.16)'
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5)
}

/** 霓虹落日 active 层：青白电光 + 快速流光 */
export function drawSynthwaveActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#f2ffff')
  g.addColorStop(0.5, '#6ff6ff')
  g.addColorStop(1, '#19b8ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const period = 70
  const shift = (time * 0.2) % period
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  for (let y = -period + shift; y < h + period; y += period) ctx.fillRect(0, y, w, 3)
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const SYNTHWAVE_CONTAINER_BG = 'linear-gradient(180deg, #0c0224 0%, #2e0a55 30%, #ff3d8b 56%, #2a0648 56%, #07011a 100%)'
