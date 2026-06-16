import type { PerformLayerBackgroundInput } from '../types'
import { appendRoundedRectPath } from '@renderer/utils/canvasGeometry'

const ROAD_RATIO = 0.8
const FLOWER_COLORS = ['#ff9ecf', '#ffd166', '#a8e6cf', '#c9b1ff', '#ffab91'] as const

type RoadSide = 'top' | 'bot'

type Cloud = {
  x: number
  y: number
  s: number
  speed: number
}

type Tree = {
  x: number
  side: RoadSide
  s: number
}

type Flower = {
  x: number
  side: RoadSide
  offY: number
  color: string
  s: number
}

type RoadScene = {
  width: number
  height: number
  clouds: Cloud[]
  trees: Tree[]
  flowers: Flower[]
}

let scene: RoadScene | null = null
let scrollOffset = 0
let lastRoadTime = 0

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function roadTop(h: number) {
  return h * 0.5 - (h * ROAD_RATIO) / 2
}

function roadBot(h: number) {
  return h * 0.5 + (h * ROAD_RATIO) / 2
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.fill()
    return
  }
  ctx.beginPath()
  appendRoundedRectPath(ctx, x, y, width, height, radius)
  ctx.fill()
}

function buildScene(width: number, height: number): RoadScene {
  const clouds: Cloud[] = []
  const trees: Tree[] = []
  const flowers: Flower[] = []

  for (let i = 0; i < 8; i++) {
    clouds.push({
      x: Math.random() * width * 1.5,
      y: rand(height * 0.06, height * 0.28),
      s: rand(0.7, 1.4),
      speed: rand(0.08, 0.2)
    })
  }

  for (let i = 0; i < 16; i++) {
    trees.push({
      x: Math.random() * width * 2,
      side: Math.random() < 0.5 ? 'top' : 'bot',
      s: rand(0.6, 1.1)
    })
  }

  for (let i = 0; i < 30; i++) {
    flowers.push({
      x: Math.random() * width * 2,
      side: Math.random() < 0.5 ? 'top' : 'bot',
      offY: rand(12, 30),
      color: FLOWER_COLORS[i % FLOWER_COLORS.length]!,
      s: rand(0.5, 1)
    })
  }

  return { width, height, clouds, trees, flowers }
}

function ensureScene(width: number, height: number): RoadScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = buildScene(width, height)
  scrollOffset = 0
  lastRoadTime = 0
  return scene
}

function advanceRoad(input: PerformLayerBackgroundInput) {
  const s = ensureScene(input.width, input.height)
  const deltaMs = lastRoadTime ? input.time - lastRoadTime : 16.67
  lastRoadTime = input.time
  const frameScale = Math.min(3, deltaMs / 16.67)

  scrollOffset += 1.2 * frameScale

  for (const cloud of s.clouds) {
    cloud.x += cloud.speed * frameScale
    if (cloud.x > s.width + 80) cloud.x = -80
  }
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#b8e4ff')
  g.addColorStop(0.55, '#d4f0ff')
  g.addColorStop(1, '#e8fff0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud) {
  const { x, y, s } = c
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  const blobs: [number, number, number][] = [
    [0, 0, 28],
    [22, -6, 22],
    [-20, -4, 20],
    [12, 8, 18],
    [-14, 6, 16]
  ]
  for (const [bx, by, br] of blobs) {
    ctx.beginPath()
    ctx.arc(x + bx * s, y + by * s, br * s, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.ellipse(x, y + 10 * s, 38 * s, 10 * s, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawGrassBand(
  ctx: CanvasRenderingContext2D,
  w: number,
  y0: number,
  y1: number,
  flip: boolean,
  offset: number
) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  if (flip) {
    g.addColorStop(0, '#9ee89a')
    g.addColorStop(1, '#7ed67a')
  } else {
    g.addColorStop(0, '#7ed67a')
    g.addColorStop(1, '#9ee89a')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, y0, w, y1 - y0)

  ctx.fillStyle = '#8ed88a'
  const bumps = Math.ceil(w / 120) + 2
  for (let i = -1; i < bumps; i++) {
    const bx = ((i * 120 - (offset * 0.3) % 120) + w * 2) % (w + 120) - 60
    const by = flip ? y0 + 8 : y1 - 8
    ctx.beginPath()
    ctx.arc(bx, by, 50, flip ? Math.PI : 0, flip ? Math.PI * 2 : 0, !flip)
    ctx.fill()
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  const rt = roadTop(h)
  const rb = roadBot(h)
  const r = 12

  ctx.fillStyle = '#6b7288'
  fillRoundRect(ctx, -2, rt, w + 4, rb - rt, r)

  ctx.fillStyle = '#848b9c'
  fillRoundRect(ctx, 6, rt + 5, w - 12, rb - rt - 10, r - 4)

  ctx.strokeStyle = '#fff8f0'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, rt + 8)
  ctx.lineTo(w, rt + 8)
  ctx.moveTo(0, rb - 8)
  ctx.lineTo(w, rb - 8)
  ctx.stroke()

  const cy = (rt + rb) / 2
  const dashW = 36
  const gap = 28
  const total = dashW + gap
  const scroll = offset % total
  for (let x = -total; x < w + total; x += total) {
    const dx = x + scroll
    ctx.fillStyle = '#ffe566'
    fillRoundRect(ctx, dx, cy - 3, dashW, 6, 3)
  }
}

function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number, t: Tree, offset: number) {
  const tx = ((t.x - offset * 0.5) % (w * 2) + w * 2) % (w * 2)
  if (tx < -40 || tx > w + 40) return

  const rt = roadTop(h)
  const rb = roadBot(h)
  const baseY = t.side === 'top' ? rt - 6 : rb + 6
  const s = t.s

  ctx.fillStyle = '#c49a6c'
  fillRoundRect(ctx, tx - 5 * s, baseY + (t.side === 'top' ? -22 * s : 0), 10 * s, 22 * s, 4)

  const crownY = t.side === 'top' ? baseY - 28 * s : baseY + 28 * s
  ctx.fillStyle = '#6ecf8a'
  ctx.beginPath()
  ctx.arc(tx, crownY, 22 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8ae6a0'
  ctx.beginPath()
  ctx.arc(tx - 10 * s, crownY + (t.side === 'top' ? 4 : -4) * s, 14 * s, 0, Math.PI * 2)
  ctx.arc(tx + 12 * s, crownY + (t.side === 'top' ? 6 : -6) * s, 12 * s, 0, Math.PI * 2)
  ctx.fill()
}

function drawFlower(ctx: CanvasRenderingContext2D, w: number, h: number, f: Flower, offset: number) {
  const fx = ((f.x - offset * 0.35) % (w * 2) + w * 2) % (w * 2)
  if (fx < -10 || fx > w + 10) return

  const rt = roadTop(h)
  const rb = roadBot(h)
  const fy = f.side === 'top' ? rt - f.offY : rb + f.offY
  const s = f.s

  ctx.fillStyle = '#7ed67a'
  ctx.fillRect(fx, f.side === 'top' ? fy + 4 * s : fy - 8 * s, 2, 8 * s)

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.fillStyle = f.color
    ctx.beginPath()
    ctx.arc(fx + Math.cos(a) * 5 * s, fy + Math.sin(a) * 5 * s, 4 * s, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#fff5a0'
  ctx.beginPath()
  ctx.arc(fx, fy, 3 * s, 0, Math.PI * 2)
  ctx.fill()
}

function paintRoadScene(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const s = ensureScene(input.width, input.height)
  const { width: w, height: h } = s
  const offset = scrollOffset

  drawSky(ctx, w, h)

  for (const cloud of s.clouds) drawCloud(ctx, cloud)

  drawGrassBand(ctx, w, 0, roadTop(h), false, offset)
  drawGrassBand(ctx, w, roadBot(h), h, true, offset)

  for (const flower of s.flowers) drawFlower(ctx, w, h, flower, offset)
  for (const tree of s.trees) drawTree(ctx, w, h, tree, offset)

  drawRoad(ctx, w, h, offset)
}

/** 斑马线第一层背景：横向滚动的卡通公路场景 */
export function drawZebraCrossingRoadBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  advanceRoad(input)
  paintRoadScene(ctx, input)
}

/** 与第一层 canvas 天空色一致的容器 CSS 背景 */
export const ZEBRA_CROSSING_CONTAINER_BG =
  'linear-gradient(180deg, #b8e4ff 0%, #d4f0ff 55%, #e8fff0 100%)'
