import {
  NOTE_SLICE_GAME_HEIGHT,
  NOTE_SLICE_GAME_WIDTH
} from '@renderer/views/noteSlice/noteSliceGameConstants'

export const NOTE_SLICE_GRID_COLS = 5
export const NOTE_SLICE_GRID_ROWS = 3
export const NOTE_SLICE_GRID_SLOT_COUNT = NOTE_SLICE_GRID_COLS * NOTE_SLICE_GRID_ROWS

/** 5×3 网格单格逻辑尺寸 */
const CELL_WIDTH = NOTE_SLICE_GAME_WIDTH / NOTE_SLICE_GRID_COLS
const CELL_HEIGHT = NOTE_SLICE_GAME_HEIGHT / NOTE_SLICE_GRID_ROWS

/** v-for 用的槽位索引 0..14 */
export const NOTE_SLICE_GRID_SLOT_INDICES = Array.from(
  { length: NOTE_SLICE_GRID_SLOT_COUNT },
  (_, index) => index
)

/** 槽位区域（用于清除特效定位） */
export function getNoteSliceSlotRect(slotIndex: number): {
  x: number
  y: number
  width: number
  height: number
} {
  const col = slotIndex % NOTE_SLICE_GRID_COLS
  const row = Math.floor(slotIndex / NOTE_SLICE_GRID_COLS)
  return {
    x: col * CELL_WIDTH,
    y: row * CELL_HEIGHT,
    width: CELL_WIDTH,
    height: CELL_HEIGHT
  }
}

/** 音符块在外壳尺寸下于槽位内居中 */
export function getNoteSliceSlotPosition(
  slotIndex: number,
  blockWidth: number,
  blockHeight: number
): { x: number; y: number } {
  const col = slotIndex % NOTE_SLICE_GRID_COLS
  const row = Math.floor(slotIndex / NOTE_SLICE_GRID_COLS)
  return {
    x: col * CELL_WIDTH + (CELL_WIDTH - blockWidth) / 2,
    y: row * CELL_HEIGHT + (CELL_HEIGHT - blockHeight) / 2
  }
}

/** 从 0..14 中挑出未被占用的槽位 */
export function listEmptyNoteSliceSlots(occupiedSlots: ReadonlySet<number>): number[] {
  const empty: number[] = []
  for (let slotIndex = 0; slotIndex < NOTE_SLICE_GRID_SLOT_COUNT; slotIndex++) {
    if (!occupiedSlots.has(slotIndex)) {
      empty.push(slotIndex)
    }
  }
  return empty
}

/** 从空槽位中随机选一个 */
export function pickRandomNoteSliceSlot(
  emptySlots: readonly number[],
  random: () => number = Math.random
): number | null {
  if (emptySlots.length === 0) return null
  return emptySlots[Math.floor(random() * emptySlots.length)] ?? null
}
