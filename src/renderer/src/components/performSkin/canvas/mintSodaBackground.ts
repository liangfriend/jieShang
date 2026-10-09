import type { PerformLayerBackgroundInput } from '../types'

type Bubble = {
  x: number
  y: number
  r: number
  speed: number
  wobble: number
  wobbleSpeed: number
}

type LimeSlice = {
  x: number
  y: number
  r: number
  rot: number
  rotSpeed: number
  speed: number
  lemon: boolean
}

type SodaScene = {
  width: number
  height: number
  bubbles: Bubble[]
  slices: LimeSlice[]
}

let scene: SodaScene | null = null
let lastTime = 0

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

/** 0~1 的确定性哈希：层内气泡无状态，按网格格子取位置 */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function createBubble(width: number, height: number, anywhere: boolean): Bubble {
  const r = Math.random() < 0.8 ? rand(2, 6) : rand(8, 16)
  return {
    x: rand(0, width),
    y: anywhere ? rand(0, height) : height + r + rand(0, 40),
    r,
    speed: 0.25 + r * 0.06 + rand(0, 0.3),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.02, 0.05)
  }
}

function createSlice(width: number, height: number, anywhere: boolean): LimeSlice {
  const r = rand(18, 34)
  return {
    x: rand(r, width - r),
    y: anywhere ? rand(0, height) : height + r * 2,
    r,
    rot: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.004, 0.004),
    speed: rand(0.12, 0.22),
    lemon: Math.random() < 0.4
  }
}

function buildScene(width: number, height: number): SodaScene {
  const bubbleCount = Math.min(90, Math.floor((width * height) / 6000))
  return {
    width,
    height,
    bubbles: Array.from({ length: bubbleCount }, () => createBubble(width, height, true)),
    slices: Array.from({ length: 3 }, () => createSlice(width, height, true))
  }
}

function ensureScene(width: number, height: number): SodaScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = buildScene(width, height)
  lastTime = 0
  return scene
}

function advance(s: SodaScene, time: number) {
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const k = Math.min(3, Math.max(0, deltaMs) / 16.67)

  for (let i = 0; i < s.bubbles.length; i++) {
    const b = s.bubbles[i]!
    b.y -= b.speed * k
    b.wobble += b.wobbleSpeed * k
    if (b.y < -b.r * 2) s.bubbles[i] = createBubble(s.width, s.height, false)
  }
  for (let i = 0; i < s.slices.length; i++) {
    const sl = s.slices[i]!
    sl.y -= sl.speed * k
    sl.rot += sl.rotSpeed * k
    if (sl.y < -sl.r * 2) s.slices[i] = createSlice(s.width, s.height, false)
  }
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha = 1,
  rimAlpha = 0.35
) {
  ctx.globalAlpha = alpha
  const fill = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  fill.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
  fill.addColorStop(0.7, 'rgba(255, 255, 255, 0.12)')
  fill.addColorStop(1, 'rgba(255, 255, 255, 0.35)')
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `rgba(20, 140, 128, ${rimAlpha})`
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = Math.max(1, r * 0.18)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.62, Math.PI * 1.1, Math.PI * 1.45)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawSlice(ctx: CanvasRenderingContext2D, sl: LimeSlice) {
  const rind = sl.lemon ? '#f5c518' : '#5cc94a'
  const pith = sl.lemon ? '#fff7cf' : '#eaffd8'
  const pulp = sl.lemon ? 'rgba(255, 226, 90, 0.85)' : 'rgba(150, 225, 100, 0.85)'

  ctx.save()
  ctx.translate(sl.x, sl.y)
  ctx.rotate(sl.rot)
  ctx.globalAlpha = 0.55

  ctx.fillStyle = rind
  ctx.beginPath()
  ctx.arc(0, 0, sl.r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = pith
  ctx.beginPath()
  ctx.arc(0, 0, sl.r * 0.86, 0, Math.PI * 2)
  ctx.fill()

  const segments = 8
  ctx.fillStyle = pulp
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2 + 0.06
    const a1 = ((i + 1) / segments) * Math.PI * 2 - 0.06
    ctx.beginPath()
    ctx.moveTo(Math.cos((a0 + a1) / 2) * sl.r * 0.1, Math.sin((a0 + a1) / 2) * sl.r * 0.1)
    ctx.arc(0, 0, sl.r * 0.76, a0, a1)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

/** 薄荷汽水第一层：薄荷渐变、顶部光束、上浮气泡与柠檬 / 青柠片 */
export function drawMintSodaBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  advance(s, time)

  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#e9fff8')
  g.addColorStop(0.45, '#bff2e4')
  g.addColorStop(1, '#8fdcd0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 4; i++) {
    const cx = w * (0.15 + i * 0.25) + Math.sin(time * 0.0003 + i * 1.7) * 30
    const ray = ctx.createLinearGradient(cx, 0, cx + h * 0.25, h)
    ray.addColorStop(0, 'rgba(255, 255, 255, 0.12)')
    ray.addColorStop(0.7, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = ray
    ctx.beginPath()
    ctx.moveTo(cx - 14, 0)
    ctx.lineTo(cx + 22, 0)
    ctx.lineTo(cx + h * 0.3 + 36, h)
    ctx.lineTo(cx + h * 0.3 - 16, h)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  for (const sl of s.slices) drawSlice(ctx, sl)
  for (const b of s.bubbles) drawBubble(ctx, b.x + Math.sin(b.wobble) * b.r * 0.8, b.y, b.r, 0.9)
}

/** 层内无状态细泡：按网格格子哈希位置，随时间上升 */
function drawFizz(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
  speed: number
) {
  const cell = 20
  const cols = Math.ceil(w / cell)
  const rise = time * speed
  ctx.fillStyle = color
  for (let c = 0; c < cols; c++) {
    const seed = hash(c + 1)
    const colRise = rise * (0.7 + seed * 0.6)
    const offset = colRise % cell
    for (let y = h + cell - offset, row = 0; y > -cell; y -= cell, row++) {
      const cellId = c * 1000 + row - Math.floor(colRise / cell)
      const hx = hash(cellId)
      if (hx < 0.35) continue
      const r = 0.8 + hash(cellId + 0.5) * 1.6
      const x = c * cell + hx * cell + Math.sin(time * 0.004 + cellId) * 1.5
      ctx.beginPath()
      ctx.arc(x, y - hash(cellId + 0.25) * cell, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** 薄荷汽水 normal 层：半透青绿汽水 + 上升细泡 */
export function drawMintSodaNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#6fe0c8')
  g.addColorStop(1, '#1fae9c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  drawFizz(ctx, w, h, time, 'rgba(255, 255, 255, 0.7)', 0.05)
}

/** 薄荷汽水 active 层：柠檬汽水黄 + 更密更亮的气泡 */
export function drawMintSodaActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#fff7a6')
  g.addColorStop(1, '#ffc93c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  drawFizz(ctx, w, h, time, 'rgba(255, 255, 255, 0.95)', 0.09)
}

export { drawBubble as drawMintSodaBubble }

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const MINT_SODA_CONTAINER_BG = 'linear-gradient(180deg, #e9fff8 0%, #bff2e4 45%, #8fdcd0 100%)'
