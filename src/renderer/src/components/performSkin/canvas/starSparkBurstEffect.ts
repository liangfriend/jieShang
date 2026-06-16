export type StarSparkBurstConfig = {
  sizeMin: number
  sizeMax: number
  travelMin: number
  travelMax: number
  speedMin: number
  speedMax: number
  gravity: number
  drag: number
  spawnIntervalFrames: number
  burstCountMin: number
  burstCountMax: number
}

export const STAR_SPARK_BURST_CONFIG: StarSparkBurstConfig = {
  sizeMin: 1.2,
  sizeMax: 3.2,
  travelMin: 26,
  travelMax: 68,
  speedMin: 1.6,
  speedMax: 4,
  gravity: 0.08,
  drag: 0.993,
  spawnIntervalFrames: 2,
  burstCountMin: 1,
  burstCountMax: 3
}

type SparkPiece = {
  x: number
  y: number
  size: number
  warm: boolean
  vx: number
  vy: number
  travel: number
  maxTravel: number
  twinkle: number
}

function createPiece(x: number, y: number, config: StarSparkBurstConfig): SparkPiece {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.15
  const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)

  return {
    x,
    y,
    size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
    warm: Math.random() < 0.65,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    travel: 0,
    maxTravel: config.travelMin + Math.random() * (config.travelMax - config.travelMin),
    twinkle: Math.random() * Math.PI * 2
  }
}

function pieceAlpha(piece: SparkPiece): number {
  const t = piece.travel / piece.maxTravel
  if (t < 0.12) return t / 0.12
  return 1 - (t - 0.12) / 0.88
}

function isPieceDead(piece: SparkPiece): boolean {
  return piece.travel >= piece.maxTravel || pieceAlpha(piece) <= 0
}

function stepPiece(piece: SparkPiece, config: StarSparkBurstConfig, frameScale: number) {
  const prevX = piece.x
  const prevY = piece.y
  piece.vy += config.gravity * frameScale
  piece.vx *= config.drag ** frameScale
  piece.vy *= config.drag ** frameScale
  piece.x += piece.vx * frameScale
  piece.y += piece.vy * frameScale
  piece.twinkle += 0.12 * frameScale
  piece.travel += Math.hypot(piece.x - prevX, piece.y - prevY)
}

function drawSpark(ctx: CanvasRenderingContext2D, piece: SparkPiece) {
  const alpha = pieceAlpha(piece)
  if (alpha <= 0) return

  const tw = 0.6 + Math.sin(piece.twinkle) * 0.4
  const a = alpha * tw
  const hue = piece.warm ? 42 : 210
  const sat = piece.warm ? 88 : 55
  const light = piece.warm ? 92 : 88

  ctx.save()
  ctx.shadowColor = piece.warm ? `rgba(255, 220, 140, ${a * 0.7})` : `rgba(200, 220, 255, ${a * 0.6})`
  ctx.shadowBlur = piece.size * 3

  ctx.beginPath()
  ctx.arc(piece.x, piece.y, piece.size * 2.2, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${a * 0.15})`
  ctx.fill()

  ctx.beginPath()
  ctx.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light + 8}%, ${a})`
  ctx.fill()

  if (piece.size > 1.8 && a > 0.35) {
    ctx.strokeStyle = `hsla(${hue}, 70%, 98%, ${a * 0.45})`
    ctx.lineWidth = 0.6
    const r = piece.size * 2.4
    ctx.beginPath()
    ctx.moveTo(piece.x - r, piece.y)
    ctx.lineTo(piece.x + r, piece.y)
    ctx.moveTo(piece.x, piece.y - r)
    ctx.lineTo(piece.x, piece.y + r)
    ctx.stroke()
  }

  ctx.restore()
}

export function createStarSparkBurstRuntime(config: StarSparkBurstConfig = STAR_SPARK_BURST_CONFIG) {
  const pieces: SparkPiece[] = []
  const spawnAccByMidi = new Map<number, number>()
  let lastNow = 0

  function spawnBurst(x: number, y: number, xJitter = 4) {
    const count =
      config.burstCountMin +
      ((Math.random() * (config.burstCountMax - config.burstCountMin + 1)) | 0)

    for (let i = 0; i < count; i++) {
      const sx = x + (xJitter > 0 ? (Math.random() - 0.5) * xJitter : 0)
      pieces.push(createPiece(sx, y, config))
    }
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
    },

    spawnForHeldKey(midi: number, x: number, baselineY: number) {
      const acc = (spawnAccByMidi.get(midi) ?? 0) + 1
      if (acc >= config.spawnIntervalFrames) {
        spawnBurst(x, baselineY)
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
        drawSpark(ctx, piece)
      }
    },

    isAnimating() {
      return pieces.length > 0
    },

    reset() {
      pieces.length = 0
      spawnAccByMidi.clear()
      lastNow = 0
    }
  }
}
