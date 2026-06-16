import type { PerformLayerBackgroundInput } from '../types'

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'
const FONT_SIZE = 14
const MATRIX_GREEN = '107, 228, 69'

type MatrixCell = {
  char: string
  opacity: number
  target: number
  speed: number
}

type MatrixGridState = {
  width: number
  height: number
  dpr: number
  cols: number
  rows: number
  grid: MatrixCell[][]
}

let gridState: MatrixGridState | null = null
let lastMatrixTime = 0
let lastAdvancedTime = -1

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!
}

function createCell(): MatrixCell {
  return {
    char: randomChar(),
    opacity: Math.random(),
    target: Math.random(),
    speed: 0.02 + Math.random() * 0.06
  }
}

function buildGrid(width: number, height: number, dpr: number): MatrixGridState {
  const cols = Math.ceil(width / FONT_SIZE)
  const rows = Math.ceil(height / FONT_SIZE)
  const grid: MatrixCell[][] = []

  for (let r = 0; r < rows; r++) {
    const row: MatrixCell[] = []
    for (let c = 0; c < cols; c++) {
      row.push(createCell())
    }
    grid.push(row)
  }

  return { width, height, dpr, cols, rows, grid }
}

function ensureGrid(width: number, height: number, dpr: number): MatrixGridState {
  if (
    gridState &&
    gridState.width === width &&
    gridState.height === height &&
    gridState.dpr === dpr
  ) {
    return gridState
  }

  gridState = buildGrid(width, height, dpr)
  lastMatrixTime = 0
  lastAdvancedTime = -1
  return gridState
}

function tickGrid(grid: MatrixCell[][], frameScale: number) {
  for (const row of grid) {
    for (const cell of row) {
      cell.opacity += (cell.target - cell.opacity) * cell.speed * frameScale
      if (Math.abs(cell.target - cell.opacity) < 0.02) {
        cell.target = Math.random()
        if (Math.random() < 0.15) cell.char = randomChar()
      }
    }
  }
}

function advanceMatrix(input: PerformLayerBackgroundInput) {
  if (lastAdvancedTime === input.time) return
  lastAdvancedTime = input.time

  const state = ensureGrid(input.width, input.height, input.dpr)
  const deltaMs = lastMatrixTime ? input.time - lastMatrixTime : 10
  lastMatrixTime = input.time
  const frameScale = Math.min(3, deltaMs / 10)
  tickGrid(state.grid, frameScale)
}

function paintMatrix(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width, height, dpr } = input
  const state = ensureGrid(width, height, dpr)

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  ctx.font = `${FONT_SIZE}px ui-monospace, "Cascadia Mono", "Roboto Mono", monospace`
  ctx.textBaseline = 'top'

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = state.grid[r]![c]!
      const alpha = 0.08 + cell.opacity * 0.92
      ctx.fillStyle = `rgba(${MATRIX_GREEN}, ${alpha})`
      ctx.fillText(cell.char, c * FONT_SIZE, r * FONT_SIZE)
    }
  }
}

/** 二进制 normal 层：黑底矩阵字符闪烁 */
export function drawBinaryMatrixLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  advanceMatrix(input)
  paintMatrix(ctx, input)
}
