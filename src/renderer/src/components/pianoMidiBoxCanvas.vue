<script lang="ts" setup>
import {
  computed,
  CSSProperties,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch
} from 'vue'
import { parseAndFormatDimension } from '../utils/commonUtil'
import { KeyCodeEnum } from '../../types/enum'
import { defaultCodeConfig } from '../utils/constant'
import { useMidiStore } from '@renderer/store/midi.store'
import { usePerformSkin } from '@renderer/components/performSkin/usePerformSkin'
import type { MidiBoxSequence } from '@renderer/utils/scorePagePlayback/toMidiBoxSequence'
import type {
  BeginnerMidiBoxNote,
  MidiBoxBatchPayload
} from '@renderer/views/forBeginner/beginnerNoteProgressHighlight'
import {
  buildMidiColumnLayouts,
  drawMidiBoxActiveLayer,
  drawMidiBoxNormalLayer,
  type MidiBoxBlockDraw
} from '@renderer/utils/pianoMidiBoxCanvasRenderer'
import {
  drawPerformBackgroundLayer,
  syncPerformCanvasStack,
  type PerformCanvasContexts
} from '@renderer/utils/performCanvasStack'
import {
  createPerformOverlayHost,
  drawPerformOverlayLayer
} from '@renderer/utils/performCanvasOverlayRenderer'

defineOptions({
  name: 'DsPianoMidiBoxCanvas'
})

const emit = defineEmits<{
  (e: 'finished'): void
  (e: 'progressReset'): void
  (e: 'batchComplete', payload: MidiBoxBatchPayload): void
  (e: 'batchActive', payload: MidiBoxBatchPayload): void
}>()

const { skin, skinBgStyle } = usePerformSkin()

const props = defineProps({
  layoutMode: {
    type: String as PropType<'whiteKeyWidth' | 'fillParent'>,
    default: 'whiteKeyWidth'
  },
  height: { type: String, default: '180px' },
  whiteKeyWidth: { type: String, default: '40px' },
  blackKeyWidthRatio: {
    type: Number,
    default: 0.7
  },
  config: {
    type: Object as PropType<{
      keyboard: {
        code: KeyCodeEnum
        midi: number
      }[]
    }>,
    default: () => ({
      keyboard: defaultCodeConfig
    })
  },
  blockSize: {
    type: Number,
    default: 14
  },
  blockGap: {
    type: Number,
    default: 2
  },
  performSequence: {
    type: Object as PropType<MidiBoxSequence>,
    default: () => ({
      '60': [
        [0, 'n60-0'],
        [1, 'n60-1'],
        [2, 'n60-2'],
        [3, 'n60-3']
      ],
      '61': [
        [0, 'n61-0'],
        [1, 'n61-1']
      ],
      '62': [
        [0, 'n62-0'],
        [1, 'n62-1']
      ]
    })
  },
  midi: {
    type: Object as PropType<{
      min: number
      max: number
    }>,
    default: () => ({ min: 21, max: 108 })
  },
  baseLineBottom: {
    type: Number,
    default: 100
  },
  fallDuration: {
    type: Number,
    default: 0.1
  }
})

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })
const isFillParentMode = computed(() => props.layoutMode === 'fillParent')

const activeKeys = ref<Set<number>>(new Set())
const state = ref<'stopped' | 'playing'>('stopped')
const currentBatchIndex = ref(0)
const fallenBatchCount = ref(0)
const fallScrollOffset = ref(0)

const blockStride = computed(() => props.blockSize + props.blockGap)

function isWhiteKey(midi: number) {
  const noteIndex = midi % 12
  return ![1, 3, 6, 8, 10].includes(noteIndex)
}

const whiteKeyCount = computed(() => {
  let count = 0
  for (let i = props.midi.min; i <= props.midi.max; i++) {
    if (isWhiteKey(i)) count++
  }
  return count
})

const fixedWhiteKeyWidthNum = computed(() => parseAndFormatDimension(props.whiteKeyWidth).value)

const whiteKeyWidthNum = computed(() => {
  if (isFillParentMode.value) {
    const count = whiteKeyCount.value
    if (!count || !containerSize.value.width) return 0
    return containerSize.value.width / count
  }
  return fixedWhiteKeyWidthNum.value
})

const keyUnit = computed(() => {
  if (isFillParentMode.value) return 'px'
  return parseAndFormatDimension(props.whiteKeyWidth).unit
})

function getMidiWidth(midi: number) {
  let width = 0
  switch (midi % 12) {
    case 0:
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    case 1:
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    case 2:
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    case 3:
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    case 4:
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    case 5:
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    case 6:
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    case 7:
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    case 8:
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    case 9:
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    case 10:
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    case 11:
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
  }

  if (midi === props.midi.min) {
    switch (midi % 12) {
      case 2:
      case 4:
      case 7:
      case 9:
      case 11:
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
    }
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }

  if (midi === props.midi.max) {
    switch (midi % 12) {
      case 0:
      case 2:
      case 4:
      case 5:
      case 7:
      case 9:
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
    }
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }

  return width
}

const batchesByIndex = computed(() => {
  const map = new Map<number, { midi: number; info: any }[]>()
  for (const [midiStr, seq] of Object.entries(props.performSequence)) {
    const midi = Number(midiStr)
    for (const [batchIndex, info] of seq) {
      if (!map.has(batchIndex)) map.set(batchIndex, [])
      map.get(batchIndex)!.push({ midi, info })
    }
  }
  return map
})

const maxBatchIndex = computed(() => {
  let max = -1
  for (const index of batchesByIndex.value.keys()) {
    if (index > max) max = index
  }
  return max
})

const totalBatchCount = computed(() => maxBatchIndex.value + 1)

const currentBatchNotes = computed(() => batchesByIndex.value.get(currentBatchIndex.value) ?? [])

const isFinished = computed(
  () => state.value === 'playing' && currentBatchIndex.value > maxBatchIndex.value
)

const totalWidth = computed(() => fixedWhiteKeyWidthNum.value * whiteKeyCount.value + keyUnit.value)

const containerStyle = computed(
  (): CSSProperties => ({
    width: isFillParentMode.value ? '100%' : totalWidth.value,
    height: props.height,
    position: 'relative',
    overflow: 'hidden',
    ...skin.value.container,
    ...skinBgStyle.value
  })
)

const midiColumnLayouts = computed(() =>
  buildMidiColumnLayouts(props.midi.min, props.midi.max, getMidiWidth)
)

const overlayHost = createPerformOverlayHost()
let sessionStartedAt = 0
let rafId: number | null = null
let overlayLastNow = 0

function getLayerTime(): number {
  return sessionStartedAt ? performance.now() - sessionStartedAt : 0
}

function getOverlayDeltaMs(now: number): number {
  const deltaMs = overlayLastNow ? now - overlayLastNow : 16.67
  overlayLastNow = now
  return deltaMs
}

function startRenderLoop() {
  if (rafId != null) return
  sessionStartedAt = performance.now()
  overlayLastNow = 0

  const step = (timestamp: number) => {
    drawFrame(timestamp)
    rafId = requestAnimationFrame(step)
  }

  rafId = requestAnimationFrame(step)
}

function stopRenderLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  overlayLastNow = 0
  sessionStartedAt = 0
}

const drawBlocks = computed<MidiBoxBlockDraw[]>(() => {
  const blocks: MidiBoxBlockDraw[] = []
  for (const [midiStr, seq] of Object.entries(props.performSequence)) {
    const midi = Number(midiStr)
    for (const [batchIndex] of seq) {
      blocks.push({
        midi,
        batchIndex,
        highlighted: state.value === 'playing' && batchIndex === currentBatchIndex.value,
        fallen: batchIndex < fallenBatchCount.value
      })
    }
  }
  return blocks
})

const bgCanvasRef = ref<HTMLCanvasElement | null>(null)
const normalCanvasRef = ref<HTMLCanvasElement | null>(null)
const activeCanvasRef = ref<HTMLCanvasElement | null>(null)
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null)
let canvasStack: PerformCanvasContexts | null = null
let fallAnimRaf: number | null = null
let skipFallAnimation = false

function syncCanvasSize() {
  if (!containerRef.value) return
  canvasStack = syncPerformCanvasStack(
    {
      bg: bgCanvasRef.value,
      normal: normalCanvasRef.value,
      active: activeCanvasRef.value,
      overlay: overlayCanvasRef.value
    },
    containerRef.value
  )
}

function drawFrame(now = performance.now()) {
  if (!canvasStack?.normal || !canvasStack.active || !canvasStack.overlay || !containerSize.value.width)
    return

  const deltaMs = getOverlayDeltaMs(now)

  const { bg, normal, active, overlay, width, height, dpr } = canvasStack
  const layerBase = {
    width,
    height,
    dpr,
    baseLineBottom: props.baseLineBottom,
    blockSize: props.blockSize,
    blockStride: blockStride.value,
    fallScrollOffset: fallScrollOffset.value,
    midiLayouts: midiColumnLayouts.value,
    layerTime: getLayerTime()
  }

  if (bg) drawPerformBackgroundLayer(bg, width, height)

  drawMidiBoxNormalLayer({
    ctx: normal,
    ...layerBase,
    blocks: drawBlocks.value,
    command: skin.value.midiBox.normalBlock
  })

  drawMidiBoxActiveLayer({
    ctx: active,
    ...layerBase,
    blocks: drawBlocks.value,
    command: skin.value.midiBox.activeBlock
  })

  drawPerformOverlayLayer({
    ctx: overlay,
    width,
    height,
    baseLineBottom: props.baseLineBottom,
    midiMin: props.midi.min,
    midiMax: props.midi.max,
    activeKeys: activeKeys.value,
    midiLayouts: midiColumnLayouts.value,
    keyActiveBarWidth: props.blockSize,
    command: skin.value.overlay,
    host: overlayHost,
    now,
    deltaMs
  })
}

function animateFallScroll(from: number, to: number) {
  if (fallAnimRaf) cancelAnimationFrame(fallAnimRaf)

  const durationMs = props.fallDuration * 1000
  if (durationMs <= 0 || from === to) {
    fallScrollOffset.value = to
    return
  }

  const startAt = performance.now()

  function step(now: number) {
    const t = Math.min(1, (now - startAt) / durationMs)
    const eased = 1 - (1 - t) ** 3
    fallScrollOffset.value = from + (to - from) * eased
    if (t < 1) {
      fallAnimRaf = requestAnimationFrame(step)
    } else {
      fallAnimRaf = null
    }
  }

  fallAnimRaf = requestAnimationFrame(step)
}

watch(fallenBatchCount, (next, prev) => {
  if (skipFallAnimation) {
    skipFallAnimation = false
    return
  }
  animateFallScroll(prev * blockStride.value, next * blockStride.value)
})

function resetProgress() {
  if (fallAnimRaf) {
    cancelAnimationFrame(fallAnimRaf)
    fallAnimRaf = null
  }
  skipFallAnimation = true
  currentBatchIndex.value = 0
  fallenBatchCount.value = 0
  fallScrollOffset.value = 0
  activeKeys.value = new Set()
  overlayHost.runtime?.reset()
  overlayHost.prevActiveKeys = new Set()
  skipEmptyBatches()
}

function skipEmptyBatches() {
  while (
    currentBatchIndex.value <= maxBatchIndex.value &&
    !(batchesByIndex.value.get(currentBatchIndex.value)?.length ?? 0)
  ) {
    currentBatchIndex.value += 1
    fallenBatchCount.value += 1
  }
}

function toBatchNotes(notes: { midi: number; info: any }[]): BeginnerMidiBoxNote[] {
  return notes.map((note) => ({ midi: note.midi, info: note.info }))
}

function emitBatchActive() {
  if (currentBatchIndex.value > maxBatchIndex.value) {
    emit('batchActive', { batchIndex: -1, notes: [] })
    return
  }
  emit('batchActive', {
    batchIndex: currentBatchIndex.value,
    notes: toBatchNotes(currentBatchNotes.value)
  })
}

function tryAdvanceBatch() {
  const required = currentBatchNotes.value
  if (!required.length) return

  const allPressed = required.every((note) => activeKeys.value.has(note.midi))
  if (!allPressed) return

  const completedIndex = currentBatchIndex.value
  const completedNotes = toBatchNotes(required)

  fallenBatchCount.value += 1
  currentBatchIndex.value += 1
  skipEmptyBatches()

  emit('batchComplete', { batchIndex: completedIndex, notes: completedNotes })

  if (currentBatchIndex.value > maxBatchIndex.value) {
    state.value = 'stopped'
    emit('batchActive', { batchIndex: -1, notes: [] })
    emit('finished')
    return
  }

  emitBatchActive()
}

function play() {
  if (state.value === 'playing') return
  resetProgress()
  emit('progressReset')
  state.value = 'playing'
  emitBatchActive()
}

function stop() {
  state.value = 'stopped'
  resetProgress()
  emit('progressReset')
}

function clearActiveParts() {
  activeKeys.value = new Set()
}

let resizeObserver: ResizeObserver | null = null

function observeContainer() {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (!containerRef.value) return

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    containerSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height
    }
    syncCanvasSize()
    drawFrame()
  })
  resizeObserver.observe(containerRef.value)
}

watch(
  () => props.layoutMode,
  async () => {
    await nextTick()
    observeContainer()
  }
)

const midiStore = useMidiStore()

function handleKeyDown(midi: number) {
  if (!midi || activeKeys.value.has(midi)) return
  activeKeys.value = new Set(activeKeys.value).add(midi)
  if (state.value === 'playing') tryAdvanceBatch()
}

function handleKeyUp(midi: number) {
  if (!midi || !activeKeys.value.has(midi)) return
  const next = new Set(activeKeys.value)
  next.delete(midi)
  activeKeys.value = next
}

function keyBoardKeyDown(event: KeyboardEvent) {
  if (event.repeat) return
  const midi = props.config.keyboard?.find((item) => item.code === event.code)?.midi
  if (midi == null) return
  handleKeyDown(midi)
}

function keyBoardKeyUp(event: KeyboardEvent) {
  const midi = props.config.keyboard?.find((item) => item.code === event.code)?.midi
  if (midi == null) return
  handleKeyUp(midi)
}

function handleMidiMessage(event: MIDIMessageEvent) {
  const data = event.data
  if (!data || data.length < 2) return

  const command = data[0] & 0xf0
  const midi = data[1]
  const velocity = data.length > 2 ? data[2] : 0

  if (command === 0x90 && velocity > 0) {
    handleKeyDown(midi)
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    handleKeyUp(midi)
  }
}

onMounted(async () => {
  await nextTick()
  observeContainer()
  syncCanvasSize()
  startRenderLoop()
  window.addEventListener('keydown', keyBoardKeyDown)
  window.addEventListener('keyup', keyBoardKeyUp)
  midiStore.addMessageListener(handleMidiMessage)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (fallAnimRaf) cancelAnimationFrame(fallAnimRaf)
  stopRenderLoop()
  overlayHost.runtime?.reset()
  window.removeEventListener('keydown', keyBoardKeyDown)
  window.removeEventListener('keyup', keyBoardKeyUp)
  midiStore.removeMessageListener(handleMidiMessage)
})

defineExpose({
  play,
  stop,
  clearActiveParts,
  state,
  currentBatchIndex,
  fallenBatchCount,
  isFinished
})
</script>

<template>
  <div ref="containerRef" :style="containerStyle" class="hide-scrollbar stack">
    <canvas ref="bgCanvasRef" class="perform-layer perform-layer--bg" />
    <canvas ref="normalCanvasRef" class="perform-layer perform-layer--normal" />
    <canvas ref="activeCanvasRef" class="perform-layer perform-layer--active" />
    <canvas ref="overlayCanvasRef" class="perform-layer perform-layer--overlay" />
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.stack {
  position: relative;
  height: 100%;
  width: 100%;
}

.perform-layer {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.perform-layer--overlay {
  z-index: 4;
}
</style>
