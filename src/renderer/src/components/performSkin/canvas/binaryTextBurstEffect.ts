const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'
const MATRIX_GREEN = '107, 228, 69'

export type BinaryTextBurstConfig = {
  fontSizeMin: number
  fontSizeMax: number
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

export const BINARY_TEXT_BURST_CONFIG: BinaryTextBurstConfig = {
  fontSizeMin: 8,
  fontSizeMax: 12,
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

type TextPieceState = {
  x: number
  y: number
  char: string
  fontSize: number
  vx: number
  vy: number
  travel: number
  maxTravel: number
}

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!
}

function createPiece(x: number, y: number, config: BinaryTextBurstConfig): TextPieceState {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.1
  const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)

  return {
    x,
    y,
    char: randomChar(),
    fontSize: config.fontSizeMin + Math.random() * (config.fontSizeMax - config.fontSizeMin),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    travel: 0,
    maxTravel: config.travelMin + Math.random() * (config.travelMax - config.travelMin)
  }
}

function pieceAlpha(piece: TextPieceState): number {
  const t = piece.travel / piece.maxTravel
  if (t < 0.15) return t / 0.15
  return 1 - (t - 0.15) / 0.85
}

function isPieceDead(piece: TextPieceState): boolean {
  return piece.travel >= piece.maxTravel || pieceAlpha(piece) <= 0
}

function stepPiece(piece: TextPieceState, config: BinaryTextBurstConfig, frameScale: number) {
  const prevX = piece.x
  const prevY = piece.y
  piece.vy += config.gravity * frameScale
  piece.vx *= config.drag ** frameScale
  piece.vy *= config.drag ** frameScale
  piece.x += piece.vx * frameScale
  piece.y += piece.vy * frameScale
  piece.travel += Math.hypot(piece.x - prevX, piece.y - prevY)
}

function drawPiece(ctx: CanvasRenderingContext2D, piece: TextPieceState) {
  const alpha = pieceAlpha(piece)
  if (alpha <= 0) return

  const glow = 0.08 + alpha * 0.92
  ctx.save()
  ctx.font = `${piece.fontSize}px ui-monospace, "Cascadia Mono", "Roboto Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = `rgba(${MATRIX_GREEN}, ${alpha * 0.5})`
  ctx.shadowBlur = 6
  ctx.fillStyle = `rgba(${MATRIX_GREEN}, ${glow})`
  ctx.fillText(piece.char, piece.x, piece.y)
  ctx.restore()
}

export type BinaryTextBurstSpawnInput = {
  x: number
  y: number
  xJitter?: number
}

export function createBinaryTextBurstRuntime(config: BinaryTextBurstConfig = BINARY_TEXT_BURST_CONFIG) {
  const pieces: TextPieceState[] = []
  const spawnAccByMidi = new Map<number, number>()
  let lastNow = 0

  function spawnBurst(input: BinaryTextBurstSpawnInput) {
    const count =
      config.burstCountMin +
      ((Math.random() * (config.burstCountMax - config.burstCountMin + 1)) | 0)
    const jitter = input.xJitter ?? 0

    for (let i = 0; i < count; i++) {
      const x = input.x + (jitter > 0 ? (Math.random() - 0.5) * jitter : 0)
      pieces.push(createPiece(x, input.y, config))
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
      lastNow = 0
    }
  }
}
