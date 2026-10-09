import type { PerformSkinPack } from '../types'
import { THUNDER_CONTAINER_BG } from '../canvas/thunderBackground'
import { thunderMidiBoxActiveBlock } from './midiBox/active'
import { thunderMidiBoxNormalBlock } from './midiBox/normal'
import { thunderWaterfallActiveColumn } from './waterfall/active'
import { thunderWaterfallNormalColumn } from './waterfall/normal'
import { thunderPerformOverlay } from './overlay'
import { thunderPerformBackground } from './background'

export const thunderPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(150, 120, 255, 0.45)',
    background: THUNDER_CONTAINER_BG
  },
  background: thunderPerformBackground,
  midiBox: {
    normalBlock: thunderMidiBoxNormalBlock,
    activeBlock: thunderMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: thunderWaterfallNormalColumn,
    activeColumn: thunderWaterfallActiveColumn
  },
  overlay: thunderPerformOverlay
}
