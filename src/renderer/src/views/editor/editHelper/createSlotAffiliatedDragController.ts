import type {MusicScore, SlotData, VDom} from '@deciphony/renderer'
import type {Ref} from 'vue'
import {computed, ref} from 'vue'
import {
  computeArpeggioHandlePoints,
  createArpeggioDragSession,
  isArpeggioSelected,
  isArpeggioVDom,
  previewArpeggioDrag,
  type ArpeggioDragSession,
  type VerticalHandleKind,
  type VerticalHandlePoints,
} from './renderEditArpeggioDrag'
import {
  computeStrummingHandlePoints,
  createStrummingDragSession,
  isStrummingSelected,
  isStrummingVDom,
  previewStrummingDrag,
  type StrummingDragSession,
} from './renderEditStrummingDrag'
import {
  computePedalHandlePoints,
  createPedalDragSession,
  isPedalSelected,
  isPedalVDom,
  previewPedalDrag,
  type HorizontalHandleKind,
  type HorizontalHandlePoints,
  type PedalDragSession,
} from './renderEditPedalDrag'
import {
  computePitchHandlePoints,
  createPitchDragSession,
  isPitchSelected,
  isPitchVDom,
  previewPitchDrag,
  type PitchDragSession,
} from './renderEditPitchDrag'
import {
  computeLineHandlePoints,
  createLineDragSession,
  isLineSelected,
  isLineVDom,
  previewLineDrag,
  type LineDragSession,
} from './renderEditLineDrag'
import {
  computeNoteAffiliatedBox,
  createNoteAffiliatedDragSession,
  isNoteAffiliatedSelected,
  isNoteAffiliatedVDom,
  previewNoteAffiliatedDrag,
  type FrameBox,
  type NoteAffiliatedDragSession,
} from './renderEditNoteAffiliatedDrag'
import {
  createMeasureRepeatDragSession,
  isMeasureRepeatSelected,
  isMeasureRepeatVDom,
  previewMeasureRepeatDrag,
  type MeasureRepeatDragSession,
} from './renderEditMeasureRepeatDrag'
import {flushScoreWrites, vDomMirrorEpoch, type UpdateVDomFn} from './scoreWriteGate'

type PointerToSvg = (
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
) => {x: number; y: number}

/**
 * 琶音 / 扫弦（竖向把手）、踏板 / pitch / 颤音线 / 渐强渐弱（横向把手）、
 * 单音符附属（移动按钮）拖拽编排。
 * 由各谱种 useRenderEdit 挂入 window 指针监听与 SVG 把手层。
 */
export function createSlotAffiliatedDragController(options: {
  scoreData: Ref<MusicScore>
  selectedItem: Ref<SlotData | null>
  vDomList: Ref<VDom[]>
  getUpdateVDom: () => UpdateVDomFn | undefined
  resolveScoreSvg: () => SVGSVGElement | null
  pointerToSvg: PointerToSvg
  attachWindowListeners: () => void
  removeWindowListenersIfIdle: () => void
}) {
  const {
    scoreData,
    selectedItem,
    vDomList,
    getUpdateVDom,
    resolveScoreSvg,
    pointerToSvg,
    attachWindowListeners,
    removeWindowListenersIfIdle,
  } = options

  const arpeggioDragSession = ref<ArpeggioDragSession | null>(null)
  const arpeggioHandleOverride = ref<VerticalHandlePoints | null>(null)
  const strummingDragSession = ref<StrummingDragSession | null>(null)
  const strummingHandleOverride = ref<VerticalHandlePoints | null>(null)
  const pedalDragSession = ref<PedalDragSession | null>(null)
  const pedalHandleOverride = ref<HorizontalHandlePoints | null>(null)
  const pitchDragSession = ref<PitchDragSession | null>(null)
  const pitchHandleOverride = ref<HorizontalHandlePoints | null>(null)
  const lineDragSession = ref<LineDragSession | null>(null)
  const lineHandleOverride = ref<HorizontalHandlePoints | null>(null)
  const noteAffiliatedDragSession = ref<NoteAffiliatedDragSession | null>(null)
  const measureRepeatDragSession = ref<MeasureRepeatDragSession | null>(null)
  const noteAffiliatedBoxOverride = ref<FrameBox | null>(null)

  const selectedArpeggioVdom = computed(() => {
    if (!isArpeggioSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === id && isArpeggioVDom(node)) ?? null
  })

  const arpeggioHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (arpeggioHandleOverride.value) return arpeggioHandleOverride.value
    const vdom = selectedArpeggioVdom.value
    return vdom ? computeArpeggioHandlePoints(vdom) : null
  })

  const selectedStrummingVdom = computed(() => {
    if (!isStrummingSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === id && isStrummingVDom(node)) ?? null
  })

  const strummingHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (strummingHandleOverride.value) return strummingHandleOverride.value
    const vdom = selectedStrummingVdom.value
    return vdom ? computeStrummingHandlePoints(vdom) : null
  })

  const selectedPedalVdom = computed(() => {
    if (!isPedalSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === id && isPedalVDom(node)) ?? null
  })

  const pedalHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (pedalHandleOverride.value) return pedalHandleOverride.value
    const vdom = selectedPedalVdom.value
    return vdom ? computePedalHandlePoints(vdom) : null
  })

  const selectedPitchVdom = computed(() => {
    if (!isPitchSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === id && isPitchVDom(node)) ?? null
  })

  const pitchHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (pitchHandleOverride.value) return pitchHandleOverride.value
    const vdom = selectedPitchVdom.value
    return vdom ? computePitchHandlePoints(vdom) : null
  })

  const selectedLineVdom = computed(() => {
    if (!isLineSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => node.targetId === id && isLineVDom(node)) ?? null
  })

  const lineHandlePoints = computed(() => {
    void vDomMirrorEpoch.value
    if (lineHandleOverride.value) return lineHandleOverride.value
    const vdom = selectedLineVdom.value
    return vdom ? computeLineHandlePoints(vdom) : null
  })

  const selectedNoteAffiliatedVdom = computed(() => {
    if (!isNoteAffiliatedSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => isNoteAffiliatedVDom(node, id)) ?? null
  })

  const selectedMeasureRepeatVdom = computed(() => {
    if (!isMeasureRepeatSelected(selectedItem.value)) return null
    const id = selectedItem.value.self.id
    return vDomList.value.find((node) => isMeasureRepeatVDom(node, id)) ?? null
  })

  const noteAffiliatedBox = computed(() => {
    void vDomMirrorEpoch.value
    if (noteAffiliatedBoxOverride.value) return noteAffiliatedBoxOverride.value
    const vdom = selectedNoteAffiliatedVdom.value ?? selectedMeasureRepeatVdom.value
    return vdom ? computeNoteAffiliatedBox(vdom) : null
  })

  function hasActiveSession() {
    return Boolean(
      arpeggioDragSession.value
      || strummingDragSession.value
      || pedalDragSession.value
      || pitchDragSession.value
      || lineDragSession.value
      || noteAffiliatedDragSession.value
      || measureRepeatDragSession.value,
    )
  }

  function updateArpeggioDragFromEvent(event: PointerEvent) {
    const session = arpeggioDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find(
      (node) => node.targetId === session.symbolId && isArpeggioVDom(node),
    )
    if (!vdom) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewArpeggioDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      vdom,
      x,
      y,
    )
    if (points) arpeggioHandleOverride.value = points
  }

  function endArpeggioDrag(event: PointerEvent) {
    if (arpeggioDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      arpeggioDragSession.value = null
      arpeggioHandleOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updateStrummingDragFromEvent(event: PointerEvent) {
    const session = strummingDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find(
      (node) => node.targetId === session.symbolId && isStrummingVDom(node),
    )
    if (!vdom) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewStrummingDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      vdom,
      x,
      y,
    )
    if (points) strummingHandleOverride.value = points
  }

  function endStrummingDrag(event: PointerEvent) {
    if (strummingDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      strummingDragSession.value = null
      strummingHandleOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updatePedalDragFromEvent(event: PointerEvent) {
    const session = pedalDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find(
      (node) => node.targetId === session.symbolId && isPedalVDom(node),
    )
    if (!vdom) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewPedalDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      vdom,
      x,
      y,
    )
    if (points) pedalHandleOverride.value = points
  }

  function endPedalDrag(event: PointerEvent) {
    if (pedalDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      pedalDragSession.value = null
      pedalHandleOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updatePitchDragFromEvent(event: PointerEvent) {
    const session = pitchDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find(
      (node) => node.targetId === session.symbolId && isPitchVDom(node),
    )
    if (!vdom) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewPitchDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      vdom,
      x,
      y,
    )
    if (points) pitchHandleOverride.value = points
  }

  function endPitchDrag(event: PointerEvent) {
    if (pitchDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      pitchDragSession.value = null
      pitchHandleOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updateLineDragFromEvent(event: PointerEvent) {
    const session = lineDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const vdom = vDomList.value.find(
      (node) => node.targetId === session.symbolId && isLineVDom(node),
    )
    if (!vdom) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const points = previewLineDrag(scoreData.value, getUpdateVDom, session, vdom, x, y)
    if (points) lineHandleOverride.value = points
  }

  function endLineDrag(event: PointerEvent) {
    if (lineDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      lineDragSession.value = null
      lineHandleOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updateNoteAffiliatedDragFromEvent(event: PointerEvent) {
    const session = noteAffiliatedDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    noteAffiliatedBoxOverride.value = previewNoteAffiliatedDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      x,
      y,
    )
  }

  function endNoteAffiliatedDrag(event: PointerEvent) {
    if (noteAffiliatedDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      noteAffiliatedDragSession.value = null
      noteAffiliatedBoxOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updateMeasureRepeatDragFromEvent(event: PointerEvent) {
    const session = measureRepeatDragSession.value
    if (!session || event.pointerId !== session.pointerId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    noteAffiliatedBoxOverride.value = previewMeasureRepeatDrag(
      scoreData.value,
      getUpdateVDom,
      session,
      x,
      y,
    )
  }

  function endMeasureRepeatDrag(event: PointerEvent) {
    if (measureRepeatDragSession.value?.pointerId === event.pointerId) {
      flushScoreWrites(scoreData.value)
      measureRepeatDragSession.value = null
      noteAffiliatedBoxOverride.value = null
      removeWindowListenersIfIdle()
    }
  }

  function updateFromEvent(event: PointerEvent) {
    if (measureRepeatDragSession.value) updateMeasureRepeatDragFromEvent(event)
    if (arpeggioDragSession.value) updateArpeggioDragFromEvent(event)
    if (strummingDragSession.value) updateStrummingDragFromEvent(event)
    if (pedalDragSession.value) updatePedalDragFromEvent(event)
    if (pitchDragSession.value) updatePitchDragFromEvent(event)
    if (lineDragSession.value) updateLineDragFromEvent(event)
    if (noteAffiliatedDragSession.value) updateNoteAffiliatedDragFromEvent(event)
  }

  function endFromEvent(event: PointerEvent) {
    endArpeggioDrag(event)
    endStrummingDrag(event)
    endPedalDrag(event)
    endPitchDrag(event)
    endLineDrag(event)
    endNoteAffiliatedDrag(event)
    endMeasureRepeatDrag(event)
  }

  function captureHandle(event: PointerEvent) {
    attachWindowListeners()
    const el = event.currentTarget
    if (el instanceof SVGElement) {
      el.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
  }

  function handleArpeggioHandleDown(handle: VerticalHandleKind, event: PointerEvent) {
    const vdom = selectedArpeggioVdom.value
    if (!vdom?.targetId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {x} = pointerToSvg(svg, event.clientX, event.clientY)
    arpeggioDragSession.value = createArpeggioDragSession(event, vdom.targetId, handle, vdom, x)
    captureHandle(event)
  }

  function handleStrummingHandleDown(handle: VerticalHandleKind, event: PointerEvent) {
    const vdom = selectedStrummingVdom.value
    if (!vdom?.targetId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {x} = pointerToSvg(svg, event.clientX, event.clientY)
    strummingDragSession.value = createStrummingDragSession(event, vdom.targetId, handle, vdom, x)
    captureHandle(event)
  }

  function handlePedalHandleDown(handle: HorizontalHandleKind, event: PointerEvent) {
    const vdom = selectedPedalVdom.value
    if (!vdom?.targetId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {y} = pointerToSvg(svg, event.clientX, event.clientY)
    pedalDragSession.value = createPedalDragSession(event, vdom.targetId, handle, vdom, y)
    captureHandle(event)
  }

  function handlePitchHandleDown(handle: HorizontalHandleKind, event: PointerEvent) {
    const vdom = selectedPitchVdom.value
    if (!vdom?.targetId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {y} = pointerToSvg(svg, event.clientX, event.clientY)
    pitchDragSession.value = createPitchDragSession(event, vdom.targetId, handle, vdom, y)
    captureHandle(event)
  }

  function handleLineHandleDown(handle: HorizontalHandleKind, event: PointerEvent) {
    const vdom = selectedLineVdom.value
    if (!vdom?.targetId) return
    const svg = resolveScoreSvg()
    if (!svg) return
    const {y} = pointerToSvg(svg, event.clientX, event.clientY)
    const session = createLineDragSession(event, vdom.targetId, handle, vdom, y)
    if (!session) return
    lineDragSession.value = session
    captureHandle(event)
  }

  function handleNoteAffiliatedHandleDown(event: PointerEvent) {
    const svg = resolveScoreSvg()
    if (!svg) return
    const {x, y} = pointerToSvg(svg, event.clientX, event.clientY)
    const repeatVdom = selectedMeasureRepeatVdom.value
    if (repeatVdom) {
      const repeatSession = createMeasureRepeatDragSession(event, scoreData.value, repeatVdom, x, y)
      if (!repeatSession) return
      measureRepeatDragSession.value = repeatSession
      captureHandle(event)
      return
    }
    const vdom = selectedNoteAffiliatedVdom.value
    if (!vdom) return
    const session = createNoteAffiliatedDragSession(event, scoreData.value, vdom, x, y)
    if (!session) return
    noteAffiliatedDragSession.value = session
    captureHandle(event)
  }

  function resetSessions() {
    arpeggioDragSession.value = null
    arpeggioHandleOverride.value = null
    strummingDragSession.value = null
    strummingHandleOverride.value = null
    pedalDragSession.value = null
    pedalHandleOverride.value = null
    pitchDragSession.value = null
    pitchHandleOverride.value = null
    lineDragSession.value = null
    lineHandleOverride.value = null
    noteAffiliatedDragSession.value = null
    measureRepeatDragSession.value = null
    noteAffiliatedBoxOverride.value = null
  }

  return {
    arpeggioHandlePoints,
    strummingHandlePoints,
    pedalHandlePoints,
    pitchHandlePoints,
    lineHandlePoints,
    noteAffiliatedBox,
    handleArpeggioHandleDown,
    handleStrummingHandleDown,
    handlePedalHandleDown,
    handlePitchHandleDown,
    handleLineHandleDown,
    handleNoteAffiliatedHandleDown,
    updateFromEvent,
    endFromEvent,
    hasActiveSession,
    resetSessions,
  }
}
