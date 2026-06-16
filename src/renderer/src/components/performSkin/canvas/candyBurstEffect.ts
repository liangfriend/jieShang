export type CandyShape =
  | 'circle'
  | 'ring'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'pill'
  | 'triangle'
  | 'cross'

export type CandyBurstConfig = {
  /** 粒子尺寸范围 */
  sizeMin: number
  sizeMax: number
  /** 飞行距离范围 */
  travelMin: number
  travelMax: number
  /** 初速度范围 */
  speedMin: number
  speedMax: number
  gravity: number
  drag: number
  /** 按住键时每 N 帧喷发一次 */
  spawnIntervalFrames: number
  /** 单次喷发粒子数范围 */
  burstCountMin: number
  burstCountMax: number
}

export const RAINBOW_CANDY_BURST_CONFIG: CandyBurstConfig = {
  sizeMin: 2,
  sizeMax: 5.5,
  travelMin: 28,
  travelMax: 72,
  speedMin: 1.8,
  speedMax: 4.2,
  gravity: 0.09,
  drag: 0.992,
  spawnIntervalFrames: 2,
  burstCountMin: 1,
  burstCountMax: 2
}

const SHAPES: CandyShape[] = [
  'circle',
  'ring',
  'star',
  'heart',
  'diamond',
  'pill',
  'triangle',
  'cross'
]

type CandyPieceState = {
  x: number
  y: number
  shape: CandyShape
  size: number
  hue: number
  rotation: number
  spin: number
  vx: number
  vy: number
  travel: number
  maxTravel: number
}

function pickShape(): CandyShape {
  return SHAPES[(Math.random() * SHAPES.length) | 0]!
}

function createPiece(x: number, y: number, hueBase: number, config: CandyBurstConfig): CandyPieceState {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.1
  const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)

  return {
    x,
    y,
    shape: pickShape(),
    size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
    hue: (hueBase + Math.random() * 80) % 360,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.18,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    travel: 0,
    maxTravel: config.travelMin + Math.random() * (config.travelMax - config.travelMin)
  }
}

function pieceAlpha(piece: CandyPieceState): number {
  const t = piece.travel / piece.maxTravel
  if (t < 0.15) return t / 0.15
  return 1 - (t - 0.15) / 0.85
}

function isPieceDead(piece: CandyPieceState): boolean {
  return piece.travel >= piece.maxTravel || pieceAlpha(piece) <= 0
}

function stepPiece(piece: CandyPieceState, config: CandyBurstConfig, frameScale: number) {
  const prevX = piece.x
  const prevY = piece.y
  piece.vy += config.gravity * frameScale
  piece.vx *= config.drag ** frameScale
  piece.vy *= config.drag ** frameScale
  piece.x += piece.vx * frameScale
  piece.y += piece.vy * frameScale
  piece.rotation += piece.spin * frameScale
  piece.travel += Math.hypot(piece.x - prevX, piece.y - prevY)
}

function drawPieceShape(ctx: CanvasRenderingContext2D, piece: CandyPieceState, alpha: number) {
  const s = piece.size
  const fill = `hsla(${piece.hue}, 92%, 62%, ${alpha})`
  const stroke = `hsla(${piece.hue}, 100%, 78%, ${alpha * 0.9})`

  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = Math.max(0.5, s * 0.18)

  switch (piece.shape) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(0, 0, s, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      break

    case 'ring':
      ctx.beginPath()
      ctx.arc(0, 0, s, 0, Math.PI * 2)
      ctx.lineWidth = s * 0.35
      ctx.stroke()
      break

    case 'star':
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const r = i % 2 === 0 ? s : s * 0.45
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break

    case 'heart':
      ctx.beginPath()
      ctx.moveTo(0, s * 0.35)
      ctx.bezierCurveTo(0, -s * 0.2, -s, -s * 0.2, -s, s * 0.15)
      ctx.bezierCurveTo(-s, s * 0.7, 0, s * 0.95, 0, s * 1.15)
      ctx.bezierCurveTo(0, s * 0.95, s, s * 0.7, s, s * 0.15)
      ctx.bezierCurveTo(s, -s * 0.2, 0, -s * 0.2, 0, s * 0.35)
      ctx.fill()
      break

    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.7, 0)
      ctx.lineTo(0, s)
      ctx.lineTo(-s * 0.7, 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break

    case 'pill':
      ctx.beginPath()
      ctx.roundRect(-s * 0.55, -s * 0.35, s * 1.1, s * 0.7, s * 0.35)
      ctx.fill()
      ctx.stroke()
      break

    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.9, s * 0.7)
      ctx.lineTo(-s * 0.9, s * 0.7)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      break

    case 'cross':
      ctx.lineWidth = s * 0.38
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-s, 0)
      ctx.lineTo(s, 0)
      ctx.moveTo(0, -s)
      ctx.lineTo(0, s)
      ctx.stroke()
      break
  }
}

function drawPiece(ctx: CanvasRenderingContext2D, piece: CandyPieceState) {
  const alpha = pieceAlpha(piece)
  if (alpha <= 0) return

  ctx.save()
  ctx.translate(piece.x, piece.y)
  ctx.rotate(piece.rotation)
  ctx.shadowColor = `hsla(${piece.hue}, 100%, 70%, ${alpha * 0.55})`
  ctx.shadowBlur = 4
  drawPieceShape(ctx, piece, alpha)
  ctx.restore()
}

export type CandyBurstSpawnInput = {
  x: number
  y: number
  xJitter?: number
}

export function createCandyBurstRuntime(config: CandyBurstConfig = RAINBOW_CANDY_BURST_CONFIG) {
  const pieces: CandyPieceState[] = []
  const spawnAccByMidi = new Map<number, number>()
  let hueBase = 0
  let lastNow = 0

  function spawnBurst(input: CandyBurstSpawnInput) {
    const count =
      config.burstCountMin +
      ((Math.random() * (config.burstCountMax - config.burstCountMin + 1)) | 0)
    const jitter = input.xJitter ?? 0

    for (let i = 0; i < count; i++) {
      const x = input.x + (jitter > 0 ? (Math.random() - 0.5) * jitter : 0)
      pieces.push(createPiece(x, input.y, hueBase, config))
    }

    hueBase = (hueBase + 18 + Math.random() * 24) % 360
  }

  return {
    tick(input: { now: number; deltaMs?: number }) {
      const deltaMs = input.deltaMs ?? (lastNow ? input.now - lastNow : 16.67)
      lastNow = input.now
      const frameScale = Math.min(3, deltaMs / 16.67)

      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i]!
        stepPiece(piece, config, frameScale)
        if (isPieceDead(piece)) pieces.splice(i, 1)
      }

      return { frameScale, deltaMs }
    },

    spawnForHeldKey(midi: number, x: number, baselineY: number) {
      const acc = (spawnAccByMidi.get(midi) ?? 0) + 1
      if (acc >= config.spawnIntervalFrames) {
        spawnBurst({ x, y: baselineY, xJitter: 4 })
        spawnAccByMidi.set(midi, 0)
      } else {
        spawnAccByMidi.set(midi, acc)
      }
    },

    releaseKey(midi: number) {
      spawnAccByMidi.delete(midi)
    },

    clearHeldKeys() {
      spawnAccByMidi.clear()
    },

    draw(ctx: CanvasRenderingContext2D) {
      for (const piece of pieces) {
        drawPiece(ctx, piece)
      }
    },

    isAnimating() {
      return pieces.length > 0
    },

    reset() {
      pieces.length = 0
      spawnAccByMidi.clear()
      hueBase = 0
      lastNow = 0
    }
  }
}

export type CandyBurstRuntime = ReturnType<typeof createCandyBurstRuntime>
