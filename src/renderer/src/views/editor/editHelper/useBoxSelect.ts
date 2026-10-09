import type { MusicScore, VDom } from '@deciphony/renderer'
import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { pointerToSvg } from './standardStaff/renderEditSymbolAddAction'
import {
  collectNotesInRect,
  MULTI_SELECT_TAGS,
  type MultiSelectedItem,
  type SvgRect
} from './renderEditMultiSelect'

const DRAG_THRESHOLD_PX = 4
const MULTI_SELECTED_CLASS = 'dr-multi-selected-highlight'
/** 谱面 svg 及其叠加层所在容器；在其内按下的事件由 musicScore 的 top-down 处理 */
const SCORE_STACK_SELECTOR = '.score-page__stack'
/** 标题 / 歌词等 foreignObject 槽位的空白处允许起框，只避开真正的输入控件 */
const INTERACTIVE_SELECTOR = [
  'input',
  'textarea',
  'select',
  'button',
  'a',
  '[contenteditable="true"]',
  '.el-input',
  '.el-input-number',
  '.el-select',
  '.el-button'
].join(', ')

export type UseBoxSelectOptions = {
  musicScore: Ref<MusicScore>
  scoreRootRef: Ref<HTMLElement | null>
  /** 当前谱种是否支持框选 */
  enabled: () => boolean
  /** 框选成功时清掉单选 */
  clearSelection: () => void
}

type PendingDrag = {
  pointerId: number
  clientX: number
  clientY: number
  svg: SVGSVGElement
  start: { x: number; y: number }
  active: boolean
}

/**
 * 编辑器左键框选音符：在空白处 / 小节内按下拖动画矩形，松开后选中矩形内音符与休止符（紫色高亮）。
 * 框选生效时吞掉随后的 top-up / dr-click，避免选中小节或添加音符。
 */
export function useBoxSelect(options: UseBoxSelectOptions) {
  const multiSelected = ref([]) as Ref<MultiSelectedItem[]>
  const boxRect = ref<SvgRect | null>(null)
  let vDomList: VDom[] = []
  let pending: PendingDrag | null = null
  let suppressPointerUp = false
  let highlighted: Element[] = []

  function clearHighlight() {
    for (const el of highlighted) el.classList.remove(MULTI_SELECTED_CLASS)
    highlighted = []
  }

  function applyHighlight() {
    clearHighlight()
    const root = options.scoreRootRef.value
    if (!root || !multiSelected.value.length) return
    for (const { targetId } of multiSelected.value) {
      const id = CSS.escape(targetId)
      const selector = MULTI_SELECT_TAGS.map(
        (tag) => `[data-tag="${tag}"][data-target-id="${id}"]`
      ).join(',')
      for (const el of root.querySelectorAll(selector)) {
        el.classList.add(MULTI_SELECTED_CLASS)
        highlighted.push(el)
      }
    }
  }

  function setMultiSelected(items: MultiSelectedItem[]) {
    multiSelected.value = items
    void nextTick(applyHighlight)
  }

  function clearMultiSelected() {
    if (!multiSelected.value.length) return
    multiSelected.value = []
    clearHighlight()
  }

  function handleRender(list: VDom[]) {
    vDomList = list
    if (multiSelected.value.length) void nextTick(applyHighlight)
  }

  function rectFrom(a: { x: number; y: number }, b: { x: number; y: number }): SvgRect {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y)
    }
  }

  function onWindowMove(event: PointerEvent) {
    if (!pending || event.pointerId !== pending.pointerId) return
    if (!pending.active) {
      const dx = event.clientX - pending.clientX
      const dy = event.clientY - pending.clientY
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      pending.active = true
      document.body.style.userSelect = 'none'
    }
    const point = pointerToSvg(pending.svg, event.clientX, event.clientY)
    if (point) boxRect.value = rectFrom(pending.start, point)
  }

  function stopTracking() {
    window.removeEventListener('pointermove', onWindowMove, true)
    window.removeEventListener('pointerup', onWindowUp, true)
    window.removeEventListener('pointercancel', onWindowCancel, true)
    document.body.style.userSelect = ''
    pending = null
    boxRect.value = null
  }

  function onWindowUp(event: PointerEvent) {
    if (!pending || event.pointerId !== pending.pointerId) return
    const rect = pending.active ? boxRect.value : null
    stopTracking()
    if (!rect) return
    suppressPointerUp = true
    setTimeout(() => {
      suppressPointerUp = false
    }, 0)
    const hits = collectNotesInRect(options.musicScore.value, vDomList, rect)
    if (!hits.length) {
      clearMultiSelected()
      return
    }
    options.clearSelection()
    setMultiSelected(hits)
  }

  function onWindowCancel(event: PointerEvent) {
    if (pending && event.pointerId === pending.pointerId) stopTracking()
  }

  function scoreSvg(): SVGSVGElement | null {
    return options.scoreRootRef.value?.querySelector<SVGSVGElement>(`${SCORE_STACK_SELECTOR} svg`) ?? null
  }

  /** 绑定到 musicScore 的 top-down */
  function handleTopDown(event: PointerEvent, vDom: VDom | null) {
    if (vDom && vDom.tag !== 'measure' && vDom.tag !== 'slot') return
    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : scoreSvg()
    beginDrag(event, svg)
  }

  /** 绑定到编辑区容器的 pointerdown：谱面以外的空白处也能开始框选 */
  function handleAreaDown(event: PointerEvent) {
    const target = event.target as Element | null
    if (target?.closest(SCORE_STACK_SELECTOR)) return
    const area = event.currentTarget as HTMLElement | null
    if (area && target === area) {
      const rect = area.getBoundingClientRect()
      const onScrollbar =
        event.clientX - rect.left >= area.clientLeft + area.clientWidth ||
        event.clientY - rect.top >= area.clientTop + area.clientHeight
      if (onScrollbar) return
    }
    beginDrag(event, scoreSvg())
  }

  function beginDrag(event: PointerEvent, svg: SVGSVGElement | null) {
    if (event.button !== 0 || !options.enabled() || !svg) return
    const target = event.target as Element | null
    if (target?.closest(INTERACTIVE_SELECTOR)) return
    const start = pointerToSvg(svg, event.clientX, event.clientY)
    stopTracking()
    pending = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      svg,
      start,
      active: false
    }
    window.addEventListener('pointermove', onWindowMove, true)
    window.addEventListener('pointerup', onWindowUp, true)
    window.addEventListener('pointercancel', onWindowCancel, true)
  }

  /** 框选刚结束：宿主应跳过本次 top-up / dr-click */
  function isPointerUpSuppressed() {
    return suppressPointerUp
  }

  onBeforeUnmount(() => {
    stopTracking()
    clearHighlight()
  })

  return {
    multiSelected,
    boxRect,
    handleTopDown,
    handleAreaDown,
    handleRender,
    isPointerUpSuppressed,
    setMultiSelected,
    clearMultiSelected,
    refreshHighlight: applyHighlight
  }
}
