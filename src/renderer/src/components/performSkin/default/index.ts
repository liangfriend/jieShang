import type { PerformSkinPack } from '../types'
import { bg } from './svg'
import { defaultMidiBoxActiveBlock } from './midiBox/active'
import { defaultMidiBoxNormalBlock } from './midiBox/normal'
import { defaultWaterfallActiveColumn } from './waterfall/active'
import { defaultWaterfallNormalColumn } from './waterfall/normal'
import { defaultPerformOverlay } from './overlay'

export const defaultPerformSkin: PerformSkinPack = {
  container: {
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: '#ffffff'
  },
  midiBox: {
    normalBlock: defaultMidiBoxNormalBlock,
    activeBlock: defaultMidiBoxActiveBlock
  },
  waterfall: {
    normalColumn: defaultWaterfallNormalColumn,
    activeColumn: defaultWaterfallActiveColumn
  },
  overlay: defaultPerformOverlay,
  bgSvg: bg
}
