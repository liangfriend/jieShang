import type { MusicScore } from 'deciphony-renderer'
import {
  NOTE_SLICE_BLOCK_SHELL_HEIGHT,
  NOTE_SLICE_BLOCK_SHELL_WIDTH
} from '@renderer/views/noteSlice/noteSliceGameConstants'

/** 将 musicScore 等比缩放并在外壳 rect 内水平、垂直居中 */
export function resolveNoteSliceScoreShellTransform(musicScore: MusicScore): {
  offsetX: number
  offsetY: number
  scale: number
} {
  const scale = Math.min(
    NOTE_SLICE_BLOCK_SHELL_WIDTH / musicScore.width,
    NOTE_SLICE_BLOCK_SHELL_HEIGHT / musicScore.height
  )
  const scaledWidth = musicScore.width * scale
  const scaledHeight = musicScore.height * scale
  return {
    offsetX: (NOTE_SLICE_BLOCK_SHELL_WIDTH - scaledWidth) / 2,
    offsetY: (NOTE_SLICE_BLOCK_SHELL_HEIGHT - scaledHeight) / 2,
    scale
  }
}
