import type { MusicScore, SlotData, VDom } from '@deciphony/renderer'
import {
  locateDrumNotesInfoById,
  locateDrumRestById,
  setDrumNotesInfoRegion,
  setDrumRestRegion
} from '@deciphony/extensions/dr-edit'
import {
  findElementByVdomDomId,
  findVDomBySelectionKey,
  vdomSelectionKey
} from '@deciphony/renderer'
import type { Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { DEFAULT_ADD_NOTE_STATE, type AddNoteState } from '../renderEditAddNoteState'
import { EXCLUDED_INTERACTION_TAGS, HIGHLIGHT_CLASS } from '../constants'
import { createEditHighlight } from '../renderEditHighlight'
import {
  computeSlurHandlePoints,
  createSlurDragSession,
  isSlurSelected,
  isSlurVDom,
  previewSlurDrag,
  type SlurDragSession,
  type SlurHandleKind,
  type SlurHandlePoints
} from '../renderEditSlurDrag'
import { flushScoreWrites, scoreWriteGateFor, captureScoreVDomBaseline, vDomMirrorEpoch } from '../scoreWriteGate'
import { createSlotAffiliatedDragController } from '../createSlotAffiliatedDragController'
import {
  computeVoltaHandlePoints,
  createVoltaDragSession,
  findVoltaSymbol,
  isVoltaSelected,
  isVoltaVDom,
  previewVoltaDrag,
  resolveVoltaMeasureIds,
  type VoltaDragSession,
  type VoltaHandleKind,
  type VoltaHandlePoints
} from '../renderEditVoltaDrag'
import {resolveSpanAnchorHeadIds} from '../renderEditSpanAnchors'
import { deleteSelectedItem } from '../renderEditDelete'
import { resolveNeighborMeasureSlot, type MeasureNavDirection } from '../renderEditMeasureNavigate'
import { resolveInteractionTarget, resolveSvgFromEvent } from '../renderEditPointer'
import { resolvePropertyPanelKind } from '../renderEditPropertyPanel'
import { slotDataFromVDom } from '../renderEditSelection'
import {
  findMeasureElement,
  findMeasureSlotVDom,
  findMeasureVDom,
  isMeasureAddMode,
  isPointerInMeasureAddRange,
  isPointerInMeasureBounds,
  measureBoundsFromVDom,
  pointerToSvg,
  resolveMeasureSlotAtPointer
} from '../standardStaff/renderEditSymbolAddAction'
import { tabStaffFrame } from '../tab/renderEditTabAddAction'
import type { MusicScoreComponentExpose } from '../tab/useRenderEdit'
import { DEFAULT_ADD_DRUM_STATE, type AddDrumState } from './renderEditDrumAddState'
import { createDrumVoiceDim } from './drumVoiceDim'
import {
  applyDrumMeasureAddAction,
  drumRegionFromRelativeY,
  resolveGhostDrumPreview,
  type GhostDrumPreview
} from './renderEditDrumAddAction'

export type { MusicScoreComponentExpose }

/** 拖动音符头 / 休止符上下改线位 */
type DrumDragSession = {
  pointerId: number
  kind: 'head' | 'rest'
  /** 音符头为 notesInfo.id，休止符为 rest.id */
  id: string
  measureId: string
}

const DRUM_SYMBOL_TAGS = new Set([
  'noteHead',
  'noteStem',
  'noteTail',
  'rest',
  'augmentationDot',
  'addLine_g',
  'addLine_u'
])

/**
 * 鼓谱编辑：选中、幽灵音符、点击落音、音符头 / 休止符上下拖动、连音线等附属拖拽。
 * 落音走 dr-edit 的鼓谱 API，按 addDrumState.voice 写入 up / down 声部。
 */
export function useDrumRenderEdit(
  scoreData: Ref<MusicScore>,
  options?: { musicScoreRef?: Ref<MusicScoreComponentExpose | null> }
) {
  const scoreRootRef = ref<HTMLElement | null>(null)
  const highlightedEl = ref<SVGElement | null>(null)
  const selectedEl = ref<SVGElement | null>(null)
  const selectedItem = ref<SlotData | null>(null)
  const selectedVdomKey = ref<string | null>(null)
  const ghostNotePreview = ref<GhostDrumPreview | null>(null)
  const drumDragSession = ref<DrumDragSession | null>(null)
  const slurDragSession = ref<SlurDragSession | null>(null)
  const slurHandleOverride = ref<SlurHandlePoints | null>(null)
  const voltaDragSession = ref<VoltaDragSession | null>(null)
  const voltaHandleOverride = ref<VoltaHandlePoints | null>(null)
  const relatedHighlightEls = ref<SVGElement[]>([])
  const vDomList = shallowRef<VDom[]>([])
  const addNoteState = ref<AddNoteState>({ ...DEFAULT_ADD_NOTE_STATE })
  const addDrumState = ref<AddDrumState>({ ...DEFAULT_ADD_DRUM_STATE })
  const lastTopPointer = ref<{ clientX: number; clientY: number } | null>(null)
  let affiliatedDragListenersAttached = false

  const getUpdateVDom = () => options?.musicScoreRef?.value?.updateVDom
  const getVDomList = () => vDomList.value
  scoreWriteGateFor(scoreData.value, getUpdateVDom, getVDomList)
  watch(scoreData, (ms) => {
    scoreWriteGateFor(ms, getUpdateVDom, getVDomList)
  })

  const highlight = createEditHighlight({ highlightedEl, selectedEl, selectedItem })
  const isMeasureSelected = computed(() => isMeasureAddMode(selectedItem.value))
  const propertyPanelKind = computed(() => resolvePropertyPanelKind(selectedItem.value))

  const activeGhostPreview = computed((): GhostDrumPreview | null => {
    const preview = ghostNotePreview.value
    const measureId = selectedItem.value?.measure?.id
    if (!preview || !measureId || preview.measureId !== measureId) return null
    return preview
  })

  const selectedSlurVdom = computed(() => {
    if (!isSlurSelected(selectedItem.value)) return null
    const slurId = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === slurId && isSlurVDom(node)) ?? null
  })

  const slurHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (slurHandleOverride.value) return slurHandleOverride.value
    const vdom = selectedSlurVdom.value
    return vdom ? computeSlurHandlePoints(vdom) : null
  })

  const selectedVoltaVdom = computed(() => {
    if (!isVoltaSelected(selectedItem.value)) return null
    const voltaId = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === voltaId && isVoltaVDom(node)) ?? null
  })

  const voltaHandlePoints = computed(() => {
    if (voltaHandleOverride.value) return voltaHandleOverride.value
    const vdom = selectedVoltaVdom.value
    return vdom ? computeVoltaHandlePoints(vdom) : null
  })

  const relatedMeasureIds = computed(() => {
    const slot = selectedItem.value
    if (!isVoltaSelected(slot)) return [] as string[]
    return resolveVoltaMeasureIds(scoreData.value, slot.self)
  })

  function resolveScoreSvg(): SVGSVGElement | null {
    const root = scoreRootRef.value
    if (!root) return null
    const svg = root.querySelector('svg')
    return svg instanceof SVGSVGElement ? svg : null
  }

  function attachAffiliatedDragWindowListeners() {
    if (affiliatedDragListenersAttached) return
    affiliatedDragListenersAttached = true
    window.addEventListener('pointermove', onAffiliatedDragWindowMove)
    window.addEventListener('pointerup', onAffiliatedDragWindowUp)
  }

  function removeAffiliatedDragWindowListeners() {
    if (slurDragSession.value || voltaDragSession.value || slotAffiliatedDrag.hasActiveSession()) return
    if (!affiliatedDragListenersAttached) return
    affiliatedDragListenersAttached = false
    window.removeEventListener('pointermove', onAffiliatedDragWindowMove)
    window.removeEventListener('pointerup', onAffiliatedDragWindowUp)
  }

  const slotAffiliatedDrag = createSlotAffiliatedDragController({
    scoreData,
    selectedItem,
    vDomList,
    getUpdateVDom,
    resolveScoreSvg,
    pointerToSvg,
    attachWindowListeners: attachAffiliatedDragWindowListeners,
    removeWindowListenersIfIdle: removeAffiliatedDragWindowListeners
  })

  function resolveSelectionElement(vdom: VDom): SVGElement | null {
    return (
      options?.musicScoreRef?.value?.findElementByVDom(vdom) ??
      (scoreRootRef.value ? findElementByVdomDomId(scoreRootRef.value, vdom) : null)
    )
  }

  const voiceDim = createDrumVoiceDim({
    getScore: () => scoreData.value,
    getVDomList: () => vDomList.value,
    getActiveVoice: () => addDrumState.value.voice,
    findElementByVDom: resolveSelectionElement,
    getSvgRoot: () => scoreRootRef.value
  })
  watch(
    () => addDrumState.value.voice,
    () => voiceDim.schedule()
  )

  function resolveDrumHeadElement(infoId: string): SVGElement | null {
    const root = scoreRootRef.value
    if (!root) return null
    const el = root.querySelector(`[data-target-id="${infoId}"][data-tag="noteHead"]`)
    return el instanceof SVGElement ? el : null
  }

  function resolveMeasureElement(measureId: string): SVGElement | null {
    const root = scoreRootRef.value
    if (root) {
      const fromDom = findMeasureElement(root, measureId)
      if (fromDom) return fromDom
    }
    const vdom = findMeasureVDom(vDomList.value, measureId)
    return vdom ? resolveSelectionElement(vdom) : null
  }

  function clearRelatedHighlights() {
    for (const el of relatedHighlightEls.value) {
      el.classList.remove(HIGHLIGHT_CLASS.related)
    }
    relatedHighlightEls.value = []
  }

  function addRelatedHighlight(el: SVGElement) {
    el.style.transition = 'filter 0.2s ease'
    el.classList.add(HIGHLIGHT_CLASS.related)
    relatedHighlightEls.value.push(el)
  }

  function syncRelatedHighlights(slot: SlotData | null | undefined) {
    clearRelatedHighlights()
    if (!slot) return
    if (isVoltaSelected(slot)) {
      for (const measureId of resolveVoltaMeasureIds(scoreData.value, slot.self)) {
        const el = resolveMeasureElement(measureId)
        if (el) addRelatedHighlight(el)
      }
      return
    }
    for (const id of resolveSpanAnchorHeadIds(scoreData.value, slot) ?? []) {
      const el = resolveDrumHeadElement(id)
      if (el) addRelatedHighlight(el)
    }
  }

  function clearSelection() {
    clearRelatedHighlights()
    highlight.clearHoverHighlight()
    if (selectedEl.value) {
      selectedEl.value.classList.remove(HIGHLIGHT_CLASS.selected)
      selectedEl.value = null
    }
    selectedVdomKey.value = null
    selectedItem.value = null
    ghostNotePreview.value = null
  }

  function normalizeMeasureSelectionVdom(vdom: VDom): VDom {
    if (vdom.tag === 'slot' && vdom.slotName === 'm') return vdom
    if (vdom.tag === 'measure' && vdom.targetId) {
      const slotVdom = findMeasureSlotVDom(vDomList.value, vdom.targetId)
      if (slotVdom) return slotVdom
    }
    const measureId = selectedItem.value?.measure?.id
    if (measureId) {
      const slotVdom = findMeasureSlotVDom(vDomList.value, measureId)
      if (slotVdom) return slotVdom
    }
    return vdom
  }

  function applySelectionDom(el: SVGElement | null) {
    if (selectedEl.value && selectedEl.value !== el) {
      selectedEl.value.classList.remove(HIGHLIGHT_CLASS.selected)
    }
    selectedEl.value = el
    if (el) highlight.applySelectedHighlight(el)
  }

  function resolveSlotFromVDom(vdom: VDom): SlotData | null {
    if (vdom.slotData) return vdom.slotData
    return slotDataFromVDom(scoreData.value, vdom)
  }

  function bindSelectionVdom(vdom: VDom, slot?: SlotData | null) {
    const resolvedSlot = slot ?? resolveSlotFromVDom(vdom)
    const bindingVdom =
      resolvedSlot && isMeasureAddMode(resolvedSlot) ? normalizeMeasureSelectionVdom(vdom) : vdom
    selectedVdomKey.value = vdomSelectionKey(bindingVdom)
    if (resolvedSlot) selectedItem.value = resolvedSlot
    applySelectionDom(resolveSelectionElement(bindingVdom))
    syncRelatedHighlights(resolvedSlot)
    if (isSlurSelected(resolvedSlot) || isVoltaSelected(resolvedSlot)) {
      ghostNotePreview.value = null
    }
  }

  /** 重渲染后按 domId 找回 vDom / SlotData / DOM；目标已不存在则清空选中 */
  function rebindSelectionAfterRender(list: VDom[]) {
    const session = drumDragSession.value
    if (session) {
      const sessionTag = session.kind === 'rest' ? 'rest' : 'noteHead'
      const vdom = list.find((node) => node.tag === sessionTag && node.targetId === session.id)
      if (!vdom) return
      bindSelectionVdom(vdom)
      return
    }
    const key = selectedVdomKey.value
    if (!key) return
    const vdom = findVDomBySelectionKey(list, key)
    if (!vdom) {
      clearSelection()
      return
    }
    bindSelectionVdom(vdom)
  }

  function selectMeasureSlot(slot: SlotData) {
    highlight.clearHoverHighlight()
    const measureId = slot.measure?.id
    const vdom = measureId ? findMeasureSlotVDom(vDomList.value, measureId) : undefined
    if (vdom) {
      bindSelectionVdom(vdom, vdom.slotData ?? slot)
    } else {
      selectedVdomKey.value = null
      applySelectionDom(null)
      selectedItem.value = slot
    }
    ghostNotePreview.value = null
  }

  function selectDrumInfo(notesInfoId: string) {
    const located = locateDrumNotesInfoById(scoreData.value, notesInfoId)
    if (!located) return
    const slot: SlotData = {
      musicScore: scoreData.value,
      grandStaff: located.grandStaff,
      singleStaff: located.singleStaff,
      measure: located.measure,
      note: located.note as unknown as SlotData['note'],
      info: located.info as unknown as SlotData['info'],
      self: located.info as unknown as SlotData['self']
    }
    const vdom = vDomList.value.find((node) => node.tag === 'noteHead' && node.targetId === notesInfoId)
    highlight.clearHoverHighlight()
    if (vdom) bindSelectionVdom(vdom, slot)
    else {
      selectedItem.value = slot
      selectedVdomKey.value = null
      applySelectionDom(resolveDrumHeadElement(notesInfoId))
    }
    ghostNotePreview.value = null
  }

  function updateGhostFromPointer(clientX: number, clientY: number) {
    // 长休止符小节不渲染音符，禁止落音
    if (!isMeasureSelected.value || selectedItem.value?.measure?.longRest) {
      ghostNotePreview.value = null
      return
    }
    const svg = scoreRootRef.value?.querySelector('svg')
    if (!(svg instanceof SVGSVGElement)) return
    const measureId = selectedItem.value?.measure?.id
    if (!measureId) return
    const bounds = measureBoundsFromVDom(vDomList.value, measureId)
    if (!bounds) {
      ghostNotePreview.value = null
      return
    }
    const { x, y } = pointerToSvg(svg, clientX, clientY)
    ghostNotePreview.value = resolveGhostDrumPreview({
      selected: selectedItem.value,
      vDomList: vDomList.value,
      svgX: x,
      svgY: y,
      measureBounds: bounds,
      addDrumState: addDrumState.value
    })
  }

  function updateGhostFromTopEvent(event: PointerEvent) {
    lastTopPointer.value = { clientX: event.clientX, clientY: event.clientY }
    updateGhostFromPointer(event.clientX, event.clientY)
  }

  function refreshGhostFromLastPointer() {
    const pointer = lastTopPointer.value
    if (!pointer) return
    updateGhostFromPointer(pointer.clientX, pointer.clientY)
  }

  watch(
    addDrumState,
    () => {
      refreshGhostFromLastPointer()
    },
    { deep: true }
  )

  function updateSlurDragFromEvent(event: PointerEvent) {
    const session = slurDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find((node) => node.targetId === session.slurId && isSlurVDom(node))
    if (!vdom) return
    const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewSlurDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      vdom,
      x,
      y,
      scoreData.value.type
    )
    if (points) slurHandleOverride.value = points
  }

  function endSlurDrag(event: PointerEvent) {
    if (slurDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      slurDragSession.value = null
      slurHandleOverride.value = null
      removeAffiliatedDragWindowListeners()
    }
  }

  function updateVoltaDragFromEvent(event: PointerEvent) {
    const session = voltaDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find((node) => node.targetId === session.voltaId && isVoltaVDom(node))
    if (!vdom) return
    const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewVoltaDrag(scoreData.value, getUpdateVDom, session, vdom, x, y)
    if (points) voltaHandleOverride.value = points
  }

  function endVoltaDrag(event: PointerEvent) {
    if (voltaDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      voltaDragSession.value = null
      voltaHandleOverride.value = null
      removeAffiliatedDragWindowListeners()
    }
  }

  function onAffiliatedDragWindowMove(event: PointerEvent) {
    if (slurDragSession.value) updateSlurDragFromEvent(event)
    if (voltaDragSession.value) updateVoltaDragFromEvent(event)
    slotAffiliatedDrag.updateFromEvent(event)
  }

  function onAffiliatedDragWindowUp(event: PointerEvent) {
    endSlurDrag(event)
    endVoltaDrag(event)
    slotAffiliatedDrag.endFromEvent(event)
  }

  function handleSlurHandleDown(handle: SlurHandleKind, event: PointerEvent) {
    const vdom = selectedSlurVdom.value
    if (!vdom?.targetId) return
    slurDragSession.value = createSlurDragSession(event, vdom.targetId, handle, vdom)
    attachAffiliatedDragWindowListeners()
    const el = event.currentTarget
    if (el instanceof SVGElement) el.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function handleVoltaHandleDown(handle: VoltaHandleKind, event: PointerEvent) {
    const slot = selectedItem.value
    if (!isVoltaSelected(slot)) return
    const sym = findVoltaSymbol(scoreData.value, slot.self.id)
    if (!sym) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
    voltaDragSession.value = createVoltaDragSession(event, sym.id, handle, sym, x, y)
    attachAffiliatedDragWindowListeners()
    const el = event.currentTarget
    if (el instanceof SVGElement) el.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function deleteSelected(): boolean {
    const selected = selectedItem.value
    if (!selected) return false
    if (!deleteSelectedItem(scoreData.value, selected)) return false
    clearSelection()
    return true
  }

  function navigateSelectedMeasure(direction: MeasureNavDirection): boolean {
    const next = resolveNeighborMeasureSlot(selectedItem.value, direction)
    if (!next) return false
    selectMeasureSlot(next)
    return true
  }

  function addMidiNote(_midi: number): boolean {
    return false
  }

  function tryMeasureAddAtEvent(event: PointerEvent) {
    const measureId = selectedItem.value?.measure?.id
    if (!measureId || selectedItem.value?.measure?.longRest) return
    const bounds = measureBoundsFromVDom(vDomList.value, measureId)
    const svg = resolveSvgFromEvent(event)
    if (!bounds || !svg) return
    const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
    if (!isPointerInMeasureAddRange(x, y, bounds)) {
      ghostNotePreview.value = null
      return
    }
    updateGhostFromTopEvent(event)
    const preview = ghostNotePreview.value
    const measureSlot = selectedItem.value
    if (!preview || !measureSlot?.measure) return
    const result = applyDrumMeasureAddAction(
      measureSlot as SlotData & { measure: NonNullable<SlotData['measure']> },
      preview
    )
    if (result?.type === 'select') {
      void nextTick(() => selectDrumInfo(result.notesInfoId))
    }
  }

  function handleDrClick(event: MouseEvent, vdom: VDom) {
    if (event.button !== 0) return
    if (EXCLUDED_INTERACTION_TAGS.has(vdom.tag)) return
    const el = resolveInteractionTarget(event)
    if (!el) return
    const slot = resolveSlotFromVDom(vdom)
    if (!slot) return
    if (isMeasureAddMode(slot)) {
      const measureId = slot.measure?.id
      if (!measureId) return
      const svg = resolveSvgFromEvent(event)
      const bounds = measureBoundsFromVDom(vDomList.value, measureId)
      if (!svg || !bounds) return
      const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
      if (!isPointerInMeasureBounds(x, y, bounds)) return
    }
    highlight.clearHoverHighlight()
    if (selectedEl.value === el && selectedVdomKey.value === vdomSelectionKey(vdom)) return
    bindSelectionVdom(vdom, slot)
    if (!isMeasureAddMode(slot)) ghostNotePreview.value = null
  }

  function handleDrEnter(event: PointerEvent, vdom: VDom) {
    if (EXCLUDED_INTERACTION_TAGS.has(vdom.tag)) return
    const el = resolveInteractionTarget(event)
    if (!el || el === selectedEl.value || highlightedEl.value === el) return
    highlight.clearHoverHighlight()
    highlight.applyHoverHighlight(el)
    highlightedEl.value = el
  }

  function handleDrLeave(event: PointerEvent, vdom: VDom) {
    if (EXCLUDED_INTERACTION_TAGS.has(vdom.tag)) return
    const el = resolveInteractionTarget(event)
    if (el && highlightedEl.value === el) highlight.clearHoverHighlight()
  }

  function endDrumDrag(event: PointerEvent) {
    if (drumDragSession.value?.pointerId === event.pointerId) {
      drumDragSession.value = null
    }
  }

  function updateDrumDragFromEvent(event: PointerEvent) {
    const session = drumDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveSvgFromEvent(event)
    if (!svg) return
    const frame = tabStaffFrame(vDomList.value, session.measureId)
    if (!frame) return
    const { y } = pointerToSvg(svg, event.clientX, event.clientY)
    const region = drumRegionFromRelativeY(y - frame.y, frame.h)
    let changed = false
    if (session.kind === 'head') {
      const located = locateDrumNotesInfoById(scoreData.value, session.id)
      if (located) changed = setDrumNotesInfoRegion(located.info, region, located.note)
    } else {
      const located = locateDrumRestById(scoreData.value, session.id)
      if (located) changed = setDrumRestRegion(located.rest, region)
    }
    if (changed) rebindSelectionAfterRender(vDomList.value)
  }

  function handleDrDown(event: PointerEvent, vdom: VDom) {
    if (event.button !== 0) return
    if (EXCLUDED_INTERACTION_TAGS.has(vdom.tag)) return
    if (vdom.tag !== 'noteHead' && vdom.tag !== 'rest') return
    if (!vdom.targetId) return

    const slot = slotDataFromVDom(scoreData.value, vdom)
    if (!slot?.measure) return
    const kind = vdom.tag === 'rest' ? 'rest' : 'head'
    const located =
      kind === 'head'
        ? locateDrumNotesInfoById(scoreData.value, vdom.targetId)
        : locateDrumRestById(scoreData.value, vdom.targetId)
    if (!located) return

    const el = resolveInteractionTarget(event)
    if (!el) return

    highlight.clearHoverHighlight()
    const selfId = (selectedItem.value?.self as { id?: string } | undefined)?.id
    if (selfId !== vdom.targetId) {
      bindSelectionVdom(vdom, slot)
      ghostNotePreview.value = null
    }

    drumDragSession.value = {
      pointerId: event.pointerId,
      kind,
      id: vdom.targetId,
      measureId: slot.measure.id
    }
    el.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  // 符头拖拽会话留给 handleTopUp 结束：捕获后 top-up 命中为 null，需靠会话判断不改选小节
  function handleDrUp(event: PointerEvent) {
    endSlurDrag(event)
    endVoltaDrag(event)
    slotAffiliatedDrag.endFromEvent(event)
  }

  function handleTopMove(event: PointerEvent, _vdom: VDom | null) {
    if (slurDragSession.value) {
      updateSlurDragFromEvent(event)
      return
    }
    if (voltaDragSession.value) {
      updateVoltaDragFromEvent(event)
      return
    }
    if (slotAffiliatedDrag.hasActiveSession()) {
      slotAffiliatedDrag.updateFromEvent(event)
      return
    }
    if (drumDragSession.value) {
      updateDrumDragFromEvent(event)
      return
    }
    if (isMeasureSelected.value) updateGhostFromTopEvent(event)
  }

  function handleTopUp(event: PointerEvent, vdom: VDom | null) {
    const wasSlurDragging = slurDragSession.value?.pointerId === event.pointerId
    const wasVoltaDragging = voltaDragSession.value?.pointerId === event.pointerId
    const wasSlotAffiliatedDragging = slotAffiliatedDrag.hasActiveSession()
    const wasDragging = drumDragSession.value?.pointerId === event.pointerId
    endSlurDrag(event)
    endVoltaDrag(event)
    slotAffiliatedDrag.endFromEvent(event)
    endDrumDrag(event)
    if (event.button !== 0) return
    if (wasSlurDragging || wasVoltaDragging || wasSlotAffiliatedDragging || wasDragging) return
    if (vdom && DRUM_SYMBOL_TAGS.has(vdom.tag)) return
    if (vdom != null && vdom.tag !== 'measure') return

    const svg = resolveSvgFromEvent(event)
    if (!svg) return
    const { x, y } = pointerToSvg(svg, event.clientX, event.clientY)
    const slotData = resolveMeasureSlotAtPointer(vDomList.value, x, y, { forSelection: true })

    if (isMeasureAddMode(selectedItem.value)) {
      const selectedId = selectedItem.value?.measure?.id
      const selectedBounds = selectedId ? measureBoundsFromVDom(vDomList.value, selectedId) : null
      const inSelectedAddRange =
        selectedBounds != null && isPointerInMeasureAddRange(x, y, selectedBounds)
      if (inSelectedAddRange && selectedId) {
        const hitSelected = !slotData?.measure || slotData.measure.id === selectedId
        if (hitSelected) {
          tryMeasureAddAtEvent(event)
          return
        }
      }
      if (slotData?.measure) selectMeasureSlot(slotData)
      else ghostNotePreview.value = null
      return
    }

    if (!slotData?.measure) return
    selectMeasureSlot(slotData)
  }

  function handleRenderMusicScore(list: VDom[]) {
    vDomList.value = list
    captureScoreVDomBaseline(scoreData.value, list)
    rebindSelectionAfterRender(list)
    refreshGhostFromLastPointer()
    voiceDim.schedule()
  }

  onBeforeUnmount(() => {
    flushScoreWrites(scoreData.value)
    voiceDim.clear()
    clearSelection()
    drumDragSession.value = null
    slurDragSession.value = null
    slurHandleOverride.value = null
    voltaDragSession.value = null
    voltaHandleOverride.value = null
    slotAffiliatedDrag.resetSessions()
    removeAffiliatedDragWindowListeners()
  })

  return {
    scoreRootRef,
    selectedItem,
    selectedEl,
    addNoteState,
    addDrumState,
    activeGhostPreview,
    isMeasureSelected,
    propertyPanelKind,
    selectedSlurVdom,
    slurHandlePoints,
    voltaHandlePoints,
    arpeggioHandlePoints: slotAffiliatedDrag.arpeggioHandlePoints,
    strummingHandlePoints: slotAffiliatedDrag.strummingHandlePoints,
    pedalHandlePoints: slotAffiliatedDrag.pedalHandlePoints,
    pitchHandlePoints: slotAffiliatedDrag.pitchHandlePoints,
    lineHandlePoints: slotAffiliatedDrag.lineHandlePoints,
    noteAffiliatedBox: slotAffiliatedDrag.noteAffiliatedBox,
    relatedMeasureIds,
    handleDrClick,
    handleDrEnter,
    handleDrLeave,
    handleDrDown,
    handleDrUp,
    handleSlurHandleDown,
    handleVoltaHandleDown,
    handleArpeggioHandleDown: slotAffiliatedDrag.handleArpeggioHandleDown,
    handleStrummingHandleDown: slotAffiliatedDrag.handleStrummingHandleDown,
    handlePedalHandleDown: slotAffiliatedDrag.handlePedalHandleDown,
    handlePitchHandleDown: slotAffiliatedDrag.handlePitchHandleDown,
    handleLineHandleDown: slotAffiliatedDrag.handleLineHandleDown,
    handleNoteAffiliatedHandleDown: slotAffiliatedDrag.handleNoteAffiliatedHandleDown,
    handleTopMove,
    handleTopUp,
    handleRenderMusicScore,
    deleteSelected,
    navigateSelectedMeasure,
    addMidiNote,
    clearSelection
  }
}
