import type {SlotConfig, VDom} from 'deciphony-renderer'

function getSlotW(config: SlotConfig | undefined, name: 'g-l' | 's-l' | 'g-r' | 's-r'): number {
  return config?.[name]?.w ?? 0
}

/** 标题区与谱表内容同宽：左侧跳过 g-l + s-l，右侧减去 g-r + s-r */
export function computeTitleContentRect(node: VDom, slotConfig?: SlotConfig) {
  const leftInset = getSlotW(slotConfig, 'g-l') + getSlotW(slotConfig, 's-l')
  const rightInset = getSlotW(slotConfig, 'g-r') + getSlotW(slotConfig, 's-r')
  return {
    x: leftInset,
    w: Math.max(0, node.w - leftInset - rightInset),
    h: node.h,
  }
}
