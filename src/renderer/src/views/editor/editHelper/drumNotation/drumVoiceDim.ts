import type { MusicScore, VDom } from '@deciphony/renderer'
import { getMeasureVoices, slotSymbol, vdomDomId } from '@deciphony/renderer'
import type { DrumVoice } from '@deciphony/extensions/dr-edit'
import { nextTick } from 'vue'

const VOICE_DIM_CLASS = 'dr-drum-voice-dim'

type IdHolder = { id?: string }
type DrumSymbolLike = IdHolder & {
  notesInfo?: (IdHolder & { augmentationDot?: IdHolder; affiliatedSymbols?: IdHolder[] })[]
  augmentationDot?: IdHolder
  affiliatedSymbols?: IdHolder[]
}

function addId(ids: Set<string>, holder: IdHolder | undefined) {
  if (holder?.id) ids.add(holder.id)
}

/** 某声部全部符号 id：槽位 / 休止符 / notesInfo / 附点 / 单音附属符号 */
function collectVoiceTargetIds(score: MusicScore, voice: DrumVoice): Set<string> {
  const ids = new Set<string>()
  for (const grandStaff of score.grandStaffs) {
    for (const singleStaff of grandStaff.staves) {
      for (const measure of singleStaff.measures) {
        for (const slot of getMeasureVoices(measure)[voice]) {
          addId(ids, slot)
          const sym = slotSymbol(slot) as DrumSymbolLike
          addId(ids, sym)
          addId(ids, sym.augmentationDot)
          for (const aff of sym.affiliatedSymbols ?? []) addId(ids, aff)
          for (const info of sym.notesInfo ?? []) {
            addId(ids, info)
            addId(ids, info.augmentationDot)
            for (const aff of info.affiliatedSymbols ?? []) addId(ids, aff)
          }
        }
      }
    }
  }
  return ids
}

function beamDirection(vdom: VDom): DrumVoice | null {
  if (vdom.tag !== 'noteBeam') return null
  const direction = (vdom.special as { beam?: { direction?: DrumVoice } } | undefined)?.beam?.direction
  return direction ?? null
}

export type DrumVoiceDimDeps = {
  getScore: () => MusicScore
  getVDomList: () => readonly VDom[]
  getActiveVoice: () => DrumVoice
  findElementByVDom: (vdom: VDom) => SVGElement | null
  /** 曲谱 svg 根；符杠无 targetId，需按 domIndex 拼 DOM id 查找 */
  getSvgRoot: () => ParentNode | null
}

/** 鼓谱：添加面板选中一声部时二声部整体置灰，反之亦然；重渲染后需重新绑定 */
export function createDrumVoiceDim(deps: DrumVoiceDimDeps) {
  const dimmed = new Set<SVGElement>()
  let scheduled = false

  function clear() {
    for (const el of dimmed) el.classList.remove(VOICE_DIM_CLASS)
    dimmed.clear()
  }

  function applyNow() {
    clear()
    const inactive: DrumVoice = deps.getActiveVoice() === 'up' ? 'down' : 'up'
    const ids = collectVoiceTargetIds(deps.getScore(), inactive)
    const root = deps.getSvgRoot()
    deps.getVDomList().forEach((vdom, domIndex) => {
      const beam = beamDirection(vdom)
      const hit = beam != null ? beam === inactive : Boolean(vdom.targetId && ids.has(vdom.targetId))
      if (!hit) return
      const el = vdom.targetId
        ? deps.findElementByVDom(vdom)
        : root?.querySelector(`#${CSS.escape(vdomDomId(vdom, domIndex))}`)
      if (!(el instanceof SVGElement)) return
      el.classList.add(VOICE_DIM_CLASS)
      dimmed.add(el)
    })
  }

  /** 等 SVG patch 进 DOM 后再绑；同一帧多次触发只执行一次 */
  function schedule() {
    if (scheduled) return
    scheduled = true
    void nextTick(() => {
      scheduled = false
      applyNow()
    })
  }

  return { schedule, clear }
}
