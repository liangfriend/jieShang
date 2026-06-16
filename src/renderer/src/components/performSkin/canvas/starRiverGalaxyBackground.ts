import type { PerformLayerBackgroundInput } from '../types'

const BAND_ANGLE = 0.38

type Star = {
  x: number
  y: number
  depth: number
  vx: number
  vy: number
  size: number
  base: number
  twinkle: number
  twSpeed: number
  hue: number
  warm: boolean
}

type Nebula = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  alpha: number
  c0: string
  c1: string
  pulse: number
}

type Dust = {
  x: number
  y: number
  w: number
  h: number
  angle: number
  alpha: number
  vx: number
  vy: number
}

type Cluster = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
}

type Shooter = {
  x: number
  y: number
  len: number
  angle: number
  life: number
  speed: number
}

type GalaxyScene = {
  width: number
  height: number
  cx: number
  cy: number
  stars: Star[]
  nebulae: Nebula[]
  dust: Dust[]
  clusters: Cluster[]
  shooters: Shooter[]
}

const NEB_COLORS: [string, string][] = [
  ['rgba(120,40,180,', 'rgba(60,20,120,'],
  ['rgba(40,80,200,', 'rgba(20,40,100,'],
  ['rgba(200,60,140,', 'rgba(100,30,80,'],
  ['rgba(40,180,200,', 'rgba(20,80,100,'],
  ['rgba(255,120,60,', 'rgba(120,50,30,']
]

let scene: GalaxyScene | null = null
let lastGalaxyTime = 0
let lastAdvancedTime = -1

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function bandFactor(scene: GalaxyScene, x: number, y: number) {
  const nx = x / scene.width - 0.5
  const ny = y / scene.height - 0.5
  const along = nx * Math.cos(BAND_ANGLE) + ny * Math.sin(BAND_ANGLE)
  const perp = -nx * Math.sin(BAND_ANGLE) + ny * Math.cos(BAND_ANGLE)
  const core = Math.exp(-perp * perp * 16)
  const fade = 0.3 + 0.7 * Math.exp(-along * along * 1.6)
  return core * fade
}

function wrap(scene: GalaxyScene, x: number, y: number, margin = 80) {
  let wx = x
  let wy = y
  if (wx < -margin) wx += scene.width + margin * 2
  if (wx > scene.width + margin) wx -= scene.width + margin * 2
  if (wy < -margin) wy += scene.height + margin * 2
  if (wy > scene.height + margin) wy -= scene.height + margin * 2
  return { x: wx, y: wy }
}

function pickBandPos(scene: GalaxyScene) {
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * scene.width
    const y = Math.random() * scene.height
    if (Math.random() < bandFactor(scene, x, y) * 1.8 + 0.12) return { x, y }
  }
  return { x: Math.random() * scene.width, y: Math.random() * scene.height }
}

function createStar(
  scene: GalaxyScene,
  x: number,
  y: number,
  inBand: number,
  clusterBoost = 1
): Star {
  const depth = rand(0.15, 1)
  return {
    x,
    y,
    depth,
    vx: rand(-0.12, 0.12) * (0.4 + depth * 0.6),
    vy: rand(-0.12, 0.12) * (0.4 + depth * 0.6),
    size: rand(0.15, 1.1) * (0.45 + inBand * 1.1) * depth * clusterBoost,
    base: rand(0.25, 1),
    twinkle: rand(0, Math.PI * 2),
    twSpeed: rand(0.006, 0.035),
    hue: inBand > 0.35 ? rand(200, 285) : rand(0, 60) > 30 ? rand(180, 225) : rand(38, 58),
    warm: Math.random() < 0.18 + inBand * 0.25
  }
}

function buildScene(width: number, height: number): GalaxyScene {
  const next: GalaxyScene = {
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    stars: [],
    nebulae: [],
    dust: [],
    clusters: [],
    shooters: []
  }

  const clusterCount = 10 + ((width * height) / 180000 | 0)
  for (let i = 0; i < clusterCount; i++) {
    const { x, y } = pickBandPos(next)
    const r = rand(50, 160)
    next.clusters.push({ x, y, r, vx: rand(-0.05, 0.05), vy: rand(-0.05, 0.05) })

    const clusterStarCount = 55 + (Math.random() * 90 | 0)
    for (let j = 0; j < clusterStarCount; j++) {
      const ang = Math.random() * Math.PI * 2
      const dist = Math.pow(Math.random(), 1.8) * r
      const sx = x + Math.cos(ang) * dist
      const sy = y + Math.sin(ang) * dist
      const inBand = bandFactor(next, sx, sy)
      next.stars.push(createStar(next, sx, sy, Math.max(inBand, 0.5), 1.1 + (1 - dist / r) * 0.6))
    }
  }

  const starCount = Math.min(6500, Math.floor((width * height) / 140))
  for (let i = 0; i < starCount; i++) {
    const { x, y } = pickBandPos(next)
    next.stars.push(createStar(next, x, y, bandFactor(next, x, y)))
  }

  const nebCount = 7 + ((width * height) / 150000 | 0)
  for (let i = 0; i < nebCount; i++) {
    const { x, y } = pickBandPos(next)
    const c = NEB_COLORS[i % NEB_COLORS.length]!
    next.nebulae.push({
      x,
      y,
      r: rand(200, 480),
      vx: rand(-0.04, 0.04),
      vy: rand(-0.04, 0.04),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.00015, 0.00015),
      alpha: rand(0.05, 0.16),
      c0: c[0],
      c1: c[1],
      pulse: rand(0, Math.PI * 2)
    })
  }

  for (let i = 0; i < 8; i++) {
    const { x, y } = pickBandPos(next)
    next.dust.push({
      x,
      y,
      w: rand(350, 800),
      h: rand(45, 100),
      angle: BAND_ANGLE + rand(-0.18, 0.18),
      alpha: rand(0.04, 0.1),
      vx: rand(-0.03, 0.03),
      vy: rand(-0.03, 0.03)
    })
  }

  return next
}

function ensureScene(width: number, height: number): GalaxyScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = buildScene(width, height)
  lastGalaxyTime = 0
  lastAdvancedTime = -1
  return scene
}

function updateMotion(s: GalaxyScene, frameScale: number) {
  for (const c of s.clusters) {
    c.x += c.vx * frameScale
    c.y += c.vy * frameScale
    const p = wrap(s, c.x, c.y)
    c.x = p.x
    c.y = p.y
  }

  for (const star of s.stars) {
    star.x += star.vx * frameScale
    star.y += star.vy * frameScale
    const p = wrap(s, star.x, star.y)
    star.x = p.x
    star.y = p.y
  }

  for (const n of s.nebulae) {
    n.x += n.vx * frameScale
    n.y += n.vy * frameScale
    n.rot += n.rotSpeed * frameScale
    const p = wrap(s, n.x, n.y)
    n.x = p.x
    n.y = p.y
  }

  for (const d of s.dust) {
    d.x += d.vx * frameScale
    d.y += d.vy * frameScale
    const p = wrap(s, d.x, d.y)
    d.x = p.x
    d.y = p.y
  }
}

function maybeShoot(s: GalaxyScene) {
  if (Math.random() < 0.003 && s.shooters.length < 2) {
    s.shooters.push({
      x: rand(0, s.width),
      y: rand(0, s.height * 0.55),
      len: rand(90, 220),
      angle: rand(0.6, 1.1),
      life: 1,
      speed: rand(10, 18)
    })
  }
}

type GalaxyTone = 'deep' | 'light'

function drawBackground(ctx: CanvasRenderingContext2D, s: GalaxyScene, tone: GalaxyTone) {
  const g = ctx.createRadialGradient(s.cx, s.cy * 0.9, 0, s.cx, s.cy, Math.max(s.width, s.height) * 0.85)
  if (tone === 'deep') {
    g.addColorStop(0, '#0c0824')
    g.addColorStop(0.35, '#060418')
    g.addColorStop(0.7, '#030010')
    g.addColorStop(1, '#010008')
  } else {
    g.addColorStop(0, '#4a4898')
    g.addColorStop(0.35, '#3a3880')
    g.addColorStop(0.7, '#2c2a68')
    g.addColorStop(1, '#1e1c50')
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s.width, s.height)
}

function drawClusterGlow(ctx: CanvasRenderingContext2D, s: GalaxyScene, tone: GalaxyTone) {
  for (const c of s.clusters) {
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 1.6)
    if (tone === 'deep') {
      g.addColorStop(0, 'rgba(180,160,255,0.07)')
      g.addColorStop(0.35, 'rgba(120,100,220,0.04)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
    } else {
      g.addColorStop(0, '#b8a8f0')
      g.addColorStop(0.35, '#9080d8')
      g.addColorStop(1, '#3a3880')
    }
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r * 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawNebulae(ctx: CanvasRenderingContext2D, s: GalaxyScene, time: number, tone: GalaxyTone) {
  const lightNebColors: [string, string][] = [
    ['#c898f0', '#8868c8'],
    ['#88a8f0', '#5878c0'],
    ['#f088c0', '#c05898'],
    ['#78d8e8', '#4898b0'],
    ['#ffb888', '#d88858']
  ]

  for (let i = 0; i < s.nebulae.length; i++) {
    const n = s.nebulae[i]!
    const pulse = 0.85 + Math.sin(time * 0.001 + n.pulse) * 0.15
    const r = n.r * pulse

    ctx.save()
    ctx.translate(n.x, n.y)
    ctx.rotate(n.rot)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    if (tone === 'deep') {
      ctx.globalCompositeOperation = 'screen'
      const a = n.alpha * pulse
      g.addColorStop(0, `${n.c0}${a})`)
      g.addColorStop(0.4, `${n.c1}${a * 0.5})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
    } else {
      const c = lightNebColors[i % lightNebColors.length]!
      g.addColorStop(0, c[0])
      g.addColorStop(0.45, c[1])
      g.addColorStop(1, '#3a3880')
    }
    ctx.fillStyle = g
    ctx.scale(1.6, 0.7)
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.restore()
  }
  ctx.globalCompositeOperation = 'source-over'
}

function drawDust(ctx: CanvasRenderingContext2D, s: GalaxyScene, tone: GalaxyTone) {
  for (const d of s.dust) {
    ctx.save()
    ctx.translate(d.x, d.y)
    ctx.rotate(d.angle)
    const g = ctx.createLinearGradient(-d.w / 2, 0, d.w / 2, 0)
    if (tone === 'deep') {
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(0.3, `rgba(0,0,10,${d.alpha})`)
      g.addColorStop(0.5, `rgba(0,0,20,${d.alpha * 1.4})`)
      g.addColorStop(0.7, `rgba(0,0,10,${d.alpha})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
    } else {
      g.addColorStop(0, '#3a3880')
      g.addColorStop(0.3, '#4a4888')
      g.addColorStop(0.5, '#5858a0')
      g.addColorStop(0.7, '#4a4888')
      g.addColorStop(1, '#3a3880')
    }
    ctx.fillStyle = g
    ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h)
    ctx.restore()
  }
}

function drawStars(ctx: CanvasRenderingContext2D, s: GalaxyScene, tone: GalaxyTone) {
  s.stars.sort((a, b) => a.depth - b.depth)
  const lightBoost = tone === 'light' ? 14 : 0

  for (const star of s.stars) {
    star.twinkle += star.twSpeed
    const tw = 0.55 + Math.sin(star.twinkle) * 0.45
    const bf = bandFactor(s, star.x, star.y)
    const sat = star.warm ? 70 : 40 + bf * 40
    const light = (star.warm ? 85 + tw * 15 : 75 + tw * 25) + lightBoost

    if (tone === 'deep') {
      const alpha = star.base * tw
      if (star.size > 0.75 && alpha > 0.55) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${star.hue}, ${sat}%, ${light}%, ${alpha * 0.12})`
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${star.hue}, ${sat}%, ${light}%, ${alpha})`
      ctx.fill()

      if (star.size > 0.65 && alpha > 0.45) {
        ctx.strokeStyle = `hsla(${star.hue}, 60%, 95%, ${alpha * 0.3})`
        ctx.lineWidth = 0.5
        const r = star.size * 2.2
        ctx.beginPath()
        ctx.moveTo(star.x - r, star.y)
        ctx.lineTo(star.x + r, star.y)
        ctx.moveTo(star.x, star.y - r)
        ctx.lineTo(star.x, star.y + r)
        ctx.stroke()
      }
    } else {
      if (star.size > 0.75 && star.base * tw > 0.55) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${star.hue}, ${sat}%, ${Math.min(98, light + 8)}%)`
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${star.hue}, ${sat}%, ${Math.min(98, light)}%)`
      ctx.fill()

      if (star.size > 0.65 && star.base * tw > 0.45) {
        ctx.strokeStyle = `hsl(${star.hue}, 60%, 98%)`
        ctx.lineWidth = 0.5
        const r = star.size * 2.2
        ctx.beginPath()
        ctx.moveTo(star.x - r, star.y)
        ctx.lineTo(star.x + r, star.y)
        ctx.moveTo(star.x, star.y - r)
        ctx.lineTo(star.x, star.y + r)
        ctx.stroke()
      }
    }
  }
}

function advanceGalaxy(input: PerformLayerBackgroundInput) {
  if (lastAdvancedTime === input.time) return
  lastAdvancedTime = input.time

  const s = ensureScene(input.width, input.height)
  const deltaMs = lastGalaxyTime ? input.time - lastGalaxyTime : 16.67
  lastGalaxyTime = input.time
  const frameScale = Math.min(3, deltaMs / 16.67)

  updateMotion(s, frameScale)
  maybeShoot(s)
  drawShootersAdvance(s, frameScale)
}

/** 流星在 advance 阶段更新生命，绘制留在 paint */
function drawShootersAdvance(s: GalaxyScene, frameScale: number) {
  for (let i = s.shooters.length - 1; i >= 0; i--) {
    const shot = s.shooters[i]!
    shot.life -= 0.025 * frameScale
    shot.x += Math.cos(shot.angle) * shot.speed * frameScale
    shot.y += Math.sin(shot.angle) * shot.speed * frameScale
    if (shot.life <= 0) s.shooters.splice(i, 1)
  }
}

function drawShootersPaint(ctx: CanvasRenderingContext2D, s: GalaxyScene, tone: GalaxyTone) {
  for (const shot of s.shooters) {
    const tailX = shot.x - Math.cos(shot.angle) * shot.len
    const tailY = shot.y - Math.sin(shot.angle) * shot.len
    const g = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY)
    if (tone === 'deep') {
      g.addColorStop(0, `rgba(255,255,255,${shot.life * 0.9})`)
      g.addColorStop(0.3, `rgba(200,220,255,${shot.life * 0.5})`)
      g.addColorStop(1, 'rgba(200,220,255,0)')
    } else {
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.35, '#d8e8ff')
      g.addColorStop(1, '#a8c0f0')
    }
    ctx.strokeStyle = g
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(shot.x, shot.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
  }
}

function paintGalaxy(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput,
  tone: GalaxyTone = 'deep'
) {
  const s = ensureScene(input.width, input.height)
  drawBackground(ctx, s, tone)
  drawDust(ctx, s, tone)
  drawClusterGlow(ctx, s, tone)
  drawNebulae(ctx, s, input.time, tone)
  drawStars(ctx, s, tone)
  drawShootersPaint(ctx, s, tone)
}

/** 星河第一层背景：深空星野、星云、流星 */
export function drawStarRiverGalaxyBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  advanceGalaxy(input)
  paintGalaxy(ctx, input)
}

/** 星河 normal 层：同款星空，不透明浅色配色 */
export function drawStarRiverGalaxyNormalBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  advanceGalaxy(input)
  paintGalaxy(ctx, input, 'light')
}
