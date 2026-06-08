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

defineOptions({
  name: 'DsPianoMidiBox'
})

import type { MidiBoxSequence } from '@renderer/utils/scorePagePlayback/toMidiBoxSequence'
import type {
  BeginnerMidiBoxNote,
  MidiBoxBatchPayload
} from '@renderer/utils/beginnerNoteProgressHighlight'

const emit = defineEmits<{
  (e: 'finished'): void
  (e: 'progressReset'): void
  (e: 'batchComplete', payload: MidiBoxBatchPayload): void
  (e: 'batchActive', payload: MidiBoxBatchPayload): void
}>()

/** 相邻块不使用相近色 */
const BLOCK_PALETTE = [
  'hsl(350, 88%, 72%)',
  'hsl(280, 78%, 72%)',
  'hsl(200, 82%, 68%)',
  'hsl(145, 70%, 62%)',
  'hsl(45, 90%, 68%)',
  'hsl(15, 85%, 68%)',
  'hsl(320, 75%, 70%)',
  'hsl(250, 70%, 72%)'
] as const

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
  /** 方块边长（px） */
  blockSize: {
    type: Number,
    default: 14
  },
  /** 方块之间的垂直间距（px） */
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
  /** 批次完成后的下落动画时长（秒） */
  fallDuration: {
    type: Number,
    default: 0.1
  }
})

const containerRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })
const isFillParentMode = computed(() => props.layoutMode === 'fillParent')

const activeKeys = ref<Set<number>>(new Set())
const state = ref<'stopped' | 'playing'>('stopped')
/** 当前等待弹奏的批次索引 */
const currentBatchIndex = ref(0)
/** 已完成并下落的批次数 */
const fallenBatchCount = ref(0)

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

/** 按批次索引归组：index → [{ midi, info }] */
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

function blockColor(midi: number, batchIndex: number) {
  const idx = (batchIndex * 5 + midi) % BLOCK_PALETTE.length
  return BLOCK_PALETTE[idx]
}

const totalWidth = computed(() => fixedWhiteKeyWidthNum.value * whiteKeyCount.value + keyUnit.value)

const waterfallHeight = computed(() => {
  if (totalBatchCount.value <= 0) return props.baseLineBottom
  return props.baseLineBottom + totalBatchCount.value * blockStride.value
})

const containerStyle = computed(
  (): CSSProperties => ({
    width: isFillParentMode.value ? '100%' : totalWidth.value,
    height: props.height,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0',
    border: '1px solid rgba(255, 184, 208, 0.35)',
    background:
      'linear-gradient(180deg, rgba(255, 248, 252, 0.96) 0%, rgba(245, 238, 255, 0.94) 55%, rgba(234, 245, 255, 0.92) 100%)',
    boxShadow: 'inset 0 2px 10px rgba(255, 192, 220, 0.18)'
  })
)

const waterfallStyle = computed((): CSSProperties => ({
  height: `${waterfallHeight.value}px`,
  position: 'absolute',
  bottom: 0,
  transform: `translateY(${fallenBatchCount.value * blockStride.value}px)`,
  transition: `transform ${props.fallDuration}s ease-out`,
  userSelect: 'none',
  display: 'flex'
}))

const keyStyle = computed(() => {
  return (midi: number): CSSProperties => ({
    width: getMidiWidth(midi) + keyUnit.value,
    height: '100%',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative'
  })
})

const midiEventStyle = computed(() => {
  return (midi: number): CSSProperties => {
    const midiWidth = getMidiWidth(midi)
    const active = activeKeys.value.has(midi)
    return {
      width: midiWidth + keyUnit.value,
      flexShrink: 0,
      height: active ? '6px' : '0.1px',
      borderRadius: '999px',
      background: 'linear-gradient(90deg, #ffd1e8, #ff9ec7, #c9b8ff)',
      boxShadow: '0 0 10px 2px rgba(255, 143, 184, 0.85)',
      transform: 'translateY(-3px)',
      transition: 'height 0.1s ease',
      visibility: active ? 'visible' : 'hidden'
    }
  }
})

const midiEventContainerStyle = computed((): CSSProperties => ({
  height: '3px',
  bottom: `${props.baseLineBottom}px`,
  background:
    'linear-gradient(90deg, transparent 0%, rgba(255, 158, 199, 0.45) 8%, rgba(255, 158, 199, 0.85) 50%, rgba(201, 184, 255, 0.45) 92%, transparent 100%)',
  boxShadow: '0 0 12px 1px rgba(255, 158, 199, 0.6)',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'flex-end'
}))

function isCurrentBatchBlock(midi: number, batchIndex: number) {
  return state.value === 'playing' && batchIndex === currentBatchIndex.value
}

function blockStyle(midi: number, batchIndex: number): CSSProperties {
  const color = blockColor(midi, batchIndex)
  const highlighted = isCurrentBatchBlock(midi, batchIndex)
  const fallen = batchIndex < fallenBatchCount.value

  return {
    width: `${props.blockSize}px`,
    height: `${props.blockSize}px`,
    position: 'absolute',
    flexShrink: 0,
    borderRadius: '3px',
    bottom: `${props.baseLineBottom + batchIndex * blockStride.value}px`,
    background: highlighted
      ? `linear-gradient(180deg, #fff 0%, ${color} 100%)`
      : color,
    boxShadow: highlighted ? '0 0 10px 2px rgba(46, 184, 166, 0.75)' : '0 2px 6px rgba(0, 0, 0, 0.12)',
    opacity: fallen ? 0.35 : 1,
    transition: `opacity ${props.fallDuration}s ease, box-shadow 0.1s ease`
  }
}

function resetProgress() {
  currentBatchIndex.value = 0
  fallenBatchCount.value = 0
  activeKeys.value = new Set()
  skipEmptyBatches()
}

/** 跳过没有音符的批次索引 */
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
  if (!isFillParentMode.value || !containerRef.value) return

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    containerSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height
    }
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

onMounted(() => {
  observeContainer()
  window.addEventListener('keydown', keyBoardKeyDown)
  window.addEventListener('keyup', keyBoardKeyUp)
  midiStore.addMessageListener(handleMidiMessage)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
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
    <div :style="waterfallStyle" class="stackItem">
      <div
        v-for="noteMidi in Array.from({ length: midi.max - midi.min + 1 }, (_, i) => midi.min + i)"
        :key="noteMidi"
        :style="keyStyle(noteMidi)"
      >
        <div
          v-for="(item, index) in performSequence[noteMidi] ?? []"
          :key="`${noteMidi}-${item[0]}-${index}`"
          :style="blockStyle(noteMidi, item[0])"
        />
      </div>
    </div>
    <div :style="midiEventContainerStyle" class="stackItem">
      <div
        v-for="noteMidi in Array.from({ length: midi.max - midi.min + 1 }, (_, i) => midi.min + i)"
        :key="noteMidi"
        :style="midiEventStyle(noteMidi)"
      />
    </div>
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

.stackItem {
  pointer-events: none;
  position: absolute;
  height: 100%;
  width: 100%;
}

.stackItem > * {
  pointer-events: auto;
}
</style>
