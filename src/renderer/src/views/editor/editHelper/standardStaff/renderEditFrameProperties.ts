import { reactive } from 'vue'
import type { MusicScore } from '@deciphony/renderer'
import {
  findScoreVDom,
  frameShiftVDomPatch,
  scoreWriteGateFor
} from '../scoreWriteGate'

/** 属性栏横向偏移滑块范围（relativeX，0 为默认居中） */
export const RELATIVE_X_OFFSET_MIN = -40
export const RELATIVE_X_OFFSET_MAX = 40

type RelativeXTarget = { id: string; relativeX?: number }

/** 滑块拖动中未落盘的 preview（reactive，供 computed 读） */
const previewRelativeXById = reactive(new Map<string, number>())

export function readRelativeX(target: RelativeXTarget): number {
  return previewRelativeXById.get(target.id) ?? target.relativeX ?? 0
}

/** 直接写源数据（非高频路径，如 reset） */
export function setRelativeX(target: { relativeX?: number }, relativeX: number): void {
  target.relativeX = relativeX
  if ('id' in target && typeof (target as RelativeXTarget).id === 'string') {
    previewRelativeXById.delete((target as RelativeXTarget).id)
  }
}

/**
 * 属性栏滑块改 relativeX：立刻 updateVDom(id, patch)，源数据 100ms 防抖。
 * 读值请用 readRelativeX，否则滑块会在 commit 前弹回。
 * patch 相对整谱渲染节点 + (preview − 已落盘 relativeX) 总位移。
 */
export function previewRelativeX(
  musicScore: MusicScore,
  target: RelativeXTarget,
  relativeX: number
): void {
  if (readRelativeX(target) === relativeX) return
  const committedX = target.relativeX ?? 0
  const totalDx = relativeX - committedX
  const node = findScoreVDom(musicScore, target.id)
  const patch = node ? frameShiftVDomPatch(node, totalDx, 0, 0, 0) : null
  scoreWriteGateFor(musicScore).patch({
    key: `frame:${target.id}:relativeX`,
    ...(patch && Object.keys(patch).length
      ? { mirror: { targetId: target.id, patch } }
      : {}),
    commit: () => {
      target.relativeX = relativeX
      previewRelativeXById.delete(target.id)
    }
  })
  previewRelativeXById.set(target.id, relativeX)
}
