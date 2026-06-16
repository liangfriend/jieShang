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
import { HighlightPolicy, NoteScoreResult } from '@/types/types'
import { useMidiStore } from '@renderer/store/midi.store'
import { usePerformSkin } from '@renderer/components/performSkin/usePerformSkin'
import {
  buildMidiColumnLayouts,
  drawWaterfallActiveLayer,
  drawWaterfallNormalLayer,
  type WaterfallHighlightDraw,
  type WaterfallNoteDraw
} from '@renderer/utils/pianoWaterfallCanvasRenderer'
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
  name: 'DsPianoWaterfallCanvas'
})

const { skin } = usePerformSkin()

const emit = defineEmits<{
  /** 单个音符评分完成：评分结果、实时分、总分、第三个附加参数(noteInfo id) */
  (e: 'score', result: NoteScoreResult, realScore: number, totalScore: number, info: any): void
}>()

const props = defineProps({
  /** whiteKeyWidth：固定白键宽度；fillParent：铺满父级并按 midi 范围均分白键宽 */
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
  bpm: {
    type: Number,
    default: 120
  },
  columnHeightConstant: {
    type: Number,
    default: 0.05
  },
  prepareTime: {
    type: Number,
    default: 3000
  },
  performSequence: {
    type: Object as PropType<Record<string, [number, number, any?][]>>,
    default: () => {
      return {
        '60': [
          [0, 600, 'n60-0'],
          [600, 1200, 'n60-1'],
          [3200, 4200, 'n60-2'],
          [4800, 5600, 'n60-3']
        ],
        '61': [
          [1200, 1800, 'n61-0'],
          [1800, 3200, 'n61-1']
        ],
        '62': [
          [0, 600, 'n62-0'],
          [1800, 2400, 'n62-1']
        ]
      }
    }
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
  highlightPolicy: {
    type: Object as PropType<Partial<HighlightPolicy>>,
    default: () => ({})
  }
})

const performSequenceComputed = computed(() => {
  const res: Record<number, [number, number, any?][]> = {}

  for (const [midiStr, seq] of Object.entries(props.performSequence)) {
    const midi = Number(midiStr)
    res[midi] = seq.map(([start, end, info]) => [
      start + props.prepareTime,
      end + props.prepareTime,
      info
    ])
  }

  return res
})

const duration = computed(() => {
  let maxTime = 0
  for (const i of Object.keys(performSequenceComputed.value)) {
    const waterColumns = performSequenceComputed.value[Number(i)]
    for (const j in waterColumns) {
      const endTime = waterColumns[j][1]
      if (endTime > maxTime) {
        maxTime = endTime
      }
    }
  }
  return maxTime
})

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })
const isFillParentMode = computed(() => props.layoutMode === 'fillParent')

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
  const { unit } = parseAndFormatDimension(props.whiteKeyWidth)
  return unit
})

function getMidiWidth(midi: number) {
  let width = 0
  switch (midi % 12) {
    case 0: {
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    }
    case 1: {
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    }
    case 2: {
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    }
    case 3: {
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    }
    case 4: {
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    }
    case 5: {
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    }
    case 6: {
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    }
    case 7: {
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    }
    case 8: {
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    }
    case 9: {
      width = whiteKeyWidthNum.value - props.blackKeyWidthRatio * whiteKeyWidthNum.value
      break
    }
    case 10: {
      width = whiteKeyWidthNum.value * props.blackKeyWidthRatio
      break
    }
    case 11: {
      width = whiteKeyWidthNum.value - (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      break
    }
  }
  if (midi === props.midi.min) {
    switch (midi % 12) {
      case 2: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
      }
      case 4: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 7: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 9: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 11: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
    }
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }
  if (midi === props.midi.max) {
    switch (midi % 12) {
      case 0: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 2: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 4: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 5: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 7: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
      case 9: {
        width += (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
        break
      }
    }
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }
  return width
}

const pianoWaterfallContainerStyle = computed(
  (): CSSProperties => ({
    width: isFillParentMode.value ? '100%' : totalWidth.value,
    height: props.height,
    position: 'relative',
    overflow: 'hidden',
    ...skin.value.container
  })
)

const defaultHighlightPolicy: HighlightPolicy = {
  startTriggerThreshold: 200,
  postTriggerThreshold: 200,
  passThreshold: 150,
  goodThreshold: 100,
  perfectThresdhold: 70
}
const policy = computed(() => ({
  ...defaultHighlightPolicy,
  ...props.highlightPolicy
}))
const activeKeys = ref<Set<number>>(new Set())
const activeParts = ref(new Map<number, Array<Array<number>>>())

const currentTime = ref(0)
const state = ref<'stopped' | 'playing' | 'paused'>('stopped')
let sessionStartedAt = 0
let lastTimestamp = 0
let rafId: number | null = null

type FlatNote = {
  key: string
  midi: number
  start: number
  end: number
  info: any
}

const flatNotes = computed<FlatNote[]>(() => {
  const list: FlatNote[] = []
  for (const [midiStr, seq] of Object.entries(performSequenceComputed.value)) {
    const midi = Number(midiStr)
    seq.forEach(([start, end, info], idx) => {
      list.push({
        midi,
        start,
        end,
        info,
        key: info != null ? String(info) : `${midi}:${idx}`
      })
    })
  }
  return list
})

const noteScores = ref(new Map<string, NoteScoreResult>())

const stats = computed(() => {
  let perfect = 0
  let good = 0
  let pass = 0
  let early = 0
  let late = 0
  let miss = 0
  for (const result of noteScores.value.values()) {
    if (result === 'perfect') perfect++
    else if (result === 'good') good++
    else if (result === 'pass') pass++
    else if (result === 'early') early++
    else if (result === 'late') late++
    else if (result === 'miss') miss++
  }
  const total = flatNotes.value.length
  const judged = noteScores.value.size
  const earned = (early + late) * 50 + pass * 60 + good * 80 + perfect * 100
  const totalScore = total ? (earned / (total * 100)) * 100 : 0
  const realScore = judged ? (earned / (judged * 100)) * 100 : 0
  return { total, miss, early, late, pass, good, perfect, judged, realScore, totalScore }
})

function recordScore(note: FlatNote, result: NoteScoreResult) {
  if (noteScores.value.has(note.key)) return
  const next = new Map(noteScores.value)
  next.set(note.key, result)
  noteScores.value = next
  emit('score', result, stats.value.realScore, stats.value.totalScore, note.info)
}

function judgeOnPress(midi: number, t: number) {
  const candidates = flatNotes.value.filter(
    (n) =>
      n.midi === midi &&
      !noteScores.value.has(n.key) &&
      t >= n.start - policy.value.startTriggerThreshold &&
      t <= n.start + policy.value.postTriggerThreshold
  )
  if (!candidates.length) return

  let best = candidates[0]
  for (const c of candidates) {
    if (Math.abs(t - c.start) < Math.abs(t - best.start)) best = c
  }

  const delta = t - best.start
  const ad = Math.abs(delta)
  let result: NoteScoreResult
  if (ad <= policy.value.perfectThresdhold) result = 'perfect'
  else if (ad <= policy.value.goodThreshold) result = 'good'
  else if (ad <= policy.value.passThreshold) result = 'pass'
  else result = delta < 0 ? 'early' : 'late'

  recordScore(best, result)
}

function evaluateMisses(t: number) {
  for (const n of flatNotes.value) {
    if (noteScores.value.has(n.key)) continue
    if (t > n.start + policy.value.postTriggerThreshold) {
      recordScore(n, 'miss')
    }
  }
}

const highlightSegments = computed(() => {
  const result: Record<number, [number, number][]> = {}

  for (const [midiStr, seq] of Object.entries(performSequenceComputed.value)) {
    const midi = Number(midiStr)
    const activeSeq = activeParts.value.get(midi) || []
    const highlightParts: [number, number][] = []

    for (const [pStart, pEnd] of seq) {
      const validStart = pStart - policy.value.startTriggerThreshold
      const validEnd = pStart + policy.value.postTriggerThreshold

      for (const part of activeSeq) {
        const aStart = part[0]
        const aEnd = part[1] ?? currentTime.value

        if (aStart < validStart || aStart > validEnd) continue

        const overlapStart = Math.max(pStart, aStart)
        const overlapEnd = Math.min(pEnd, aEnd)
        if (overlapStart < overlapEnd) {
          highlightParts.push([overlapStart, overlapEnd])
        }
        break
      }
    }

    if (highlightParts.length > 0) {
      result[midi] = highlightParts
    }
  }

  return result
})

const totalWidth = computed(() => {
  return fixedWhiteKeyWidthNum.value * whiteKeyCount.value + keyUnit.value
})

const midiColumnLayouts = computed(() =>
  buildMidiColumnLayouts(props.midi.min, props.midi.max, getMidiWidth)
)

const waterfallKeyActiveBarWidth = computed(
  () =>
    skin.value.waterfall.activeColumn.getShape({
      start: 0,
      end: 0,
      columnHeightConstant: props.columnHeightConstant
    }).width
)

const drawNotes = computed<WaterfallNoteDraw[]>(() => {
  const notes: WaterfallNoteDraw[] = []
  for (const [midiStr, seq] of Object.entries(performSequenceComputed.value)) {
    const midi = Number(midiStr)
    for (const [start, end] of seq) {
      notes.push({ midi, start, end })
    }
  }
  return notes
})
// 这段代码实际就是把highlightSegments.value平铺一下
const drawHighlights = computed<WaterfallHighlightDraw[]>(() => {
  const list: WaterfallHighlightDraw[] = []
  for (const [midiStr, segments] of Object.entries(highlightSegments.value)) {
    const midi = Number(midiStr)
    for (const [start, end] of segments) {
      list.push({ midi, start, end })
    }
  }
  return list
})

const overlayHost = createPerformOverlayHost()
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
  lastTimestamp = 0

  const step = (timestamp: number) => {
    if (state.value === 'playing') {
      const delta = lastTimestamp ? timestamp - lastTimestamp : 0
      lastTimestamp = timestamp
      if (delta > 0) {
        currentTime.value += delta
        evaluateMisses(currentTime.value)
        if (currentTime.value >= duration.value) {
          currentTime.value = duration.value
          state.value = 'stopped'
        }
      }
    }

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

const bgCanvasRef = ref<HTMLCanvasElement | null>(null)
const normalCanvasRef = ref<HTMLCanvasElement | null>(null)
const activeCanvasRef = ref<HTMLCanvasElement | null>(null)
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null)
let canvasStack: PerformCanvasContexts | null = null

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
  if (
    !canvasStack?.normal ||
    !canvasStack.active ||
    !canvasStack.overlay ||
    !containerSize.value.width
  )
    return

  const deltaMs = getOverlayDeltaMs(now)

  const { bg, normal, active, overlay, width, height, dpr } = canvasStack
  const layerBase = {
    width,
    height,
    dpr,
    baseLineBottom: props.baseLineBottom,
    columnHeightConstant: props.columnHeightConstant,
    currentTime: currentTime.value,
    layerTime: getLayerTime(),
    midiLayouts: midiColumnLayouts.value
  }

  if (bg) {
    drawPerformBackgroundLayer(
      bg,
      { width, height, dpr, time: layerBase.layerTime },
      skin.value.background
    )
  }

  drawWaterfallNormalLayer({
    ctx: normal,
    ...layerBase,
    notes: drawNotes.value,
    command: skin.value.waterfall.normalColumn
  })

  drawWaterfallActiveLayer({
    ctx: active,
    ...layerBase,
    highlights: drawHighlights.value,
    command: skin.value.waterfall.activeColumn
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
    keyActiveBarWidth: waterfallKeyActiveBarWidth.value,
    command: skin.value.overlay,
    host: overlayHost,
    now,
    deltaMs
  })
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
  stopRenderLoop()
  overlayHost.runtime?.reset()
  window.removeEventListener('keydown', keyBoardKeyDown)
  window.removeEventListener('keyup', keyBoardKeyUp)
  midiStore.removeMessageListener(handleMidiMessage)
})

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
function handleKeyDown(midi: number) {
  if (!midi) return
  if (activeKeys.value.has(midi)) return
  activeKeys.value = new Set(activeKeys.value).add(midi)
  if (state.value !== 'playing') return
  const timeStamp = currentTime.value
  if (activeParts.value.has(midi)) {
    const arr = activeParts.value.get(midi)!
    arr.push([timeStamp])
  } else {
    activeParts.value.set(midi, [[timeStamp]])
  }
  judgeOnPress(midi, timeStamp)
}

function handleKeyUp(midi: number) {
  if (!midi) return
  if (!activeKeys.value.has(midi)) return
  const next = new Set(activeKeys.value)
  next.delete(midi)
  activeKeys.value = next
  if (state.value !== 'playing') return
  const timeStamp = currentTime.value
  const arr = activeParts.value.get(midi)
  if (!arr || arr.length === 0) return
  const last = arr[arr.length - 1]
  if (last.length === 1) last.push(timeStamp)
}

function play() {
  if (state.value === 'playing') return
  if (currentTime.value === 0) {
    clearActiveParts()
  }
  state.value = 'playing'
  lastTimestamp = performance.now()
}

function pause() {
  if (state.value !== 'playing') return
  state.value = 'paused'
}

function stop() {
  if (state.value === 'stopped' && currentTime.value === 0) return
  state.value = 'stopped'
  currentTime.value = 0
}

function clearActiveParts() {
  activeParts.value = new Map<number, Array<Array<number>>>()
  activeKeys.value = new Set<number>()
  noteScores.value = new Map<string, NoteScoreResult>()
  overlayHost.runtime?.reset()
  overlayHost.prevActiveKeys = new Set()
}

defineExpose({
  play,
  pause,
  stop,
  clearActiveParts,
  stats
})
</script>

<template>
  <div
    ref="containerRef"
    :style="pianoWaterfallContainerStyle"
    class="hide-scrollbar stack"
    comment="滚动容器"
  >
    <canvas ref="bgCanvasRef" class="perform-layer perform-layer--bg" comment="第一层：背景占位" />
    <canvas
      ref="normalCanvasRef"
      class="perform-layer perform-layer--normal"
      comment="第二层：normal 水柱"
    />
    <canvas
      ref="activeCanvasRef"
      class="perform-layer perform-layer--active"
      comment="第三层：active 水柱"
    />
    <canvas
      ref="overlayCanvasRef"
      class="perform-layer perform-layer--overlay"
      comment="第四层：基准线与琴键高亮"
    />
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
