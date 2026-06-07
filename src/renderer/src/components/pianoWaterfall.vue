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
import {
  AccidentalEnum,
  midiToNoteName,
  noteNameToHelmholtz,
  noteNameToNoteString
} from 'deciphony-core'
import vDrag from '../../directivces/drag'
import { KeyCodeEnum } from '../../types/enum'
import { defaultCodeConfig } from '../utils/constant'
import { HighlightPolicy, NoteScoreResult } from '@/types/types'
import { useMidiStore } from '@renderer/store/midi.store'

defineOptions({
  name: 'DsPianoWaterfall'
})

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
    // performSequence为sequence时生效
    type: Number,
    default: 120
  },
  columnHeightConstant: {
    // 水柱高度系数
    type: Number,
    default: 0.05
  },
  prepareTime: {
    type: Number,
    default: 3000 // 三秒的预备时间
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
  }, // 基准线位置
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
// 总时长（毫秒）
const duration = computed(() => {
  let maxTime = 0
  for (let i of Object.keys(performSequenceComputed.value)) {
    const waterColumns = performSequenceComputed.value[i]
    for (let j in waterColumns) {
      const endTime = waterColumns[j][1]
      if (endTime > maxTime) {
        maxTime = endTime
      }
    }
  }
  return maxTime
})

const containerRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })
const isFillParentMode = computed(() => props.layoutMode === 'fillParent')

/** 判断是否是白键 */
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

/** 解析容器高度，单位*/
const containerHeightNum = computed(() => {
  const { value: containerHeightNum, unit: heightUnit } = parseAndFormatDimension(props.height)
  return containerHeightNum
})
const containerHeightUnit = computed(() => {
  const { value: containerHeightNum, unit: heightUnit } = parseAndFormatDimension(props.height)
  return heightUnit
})

const fixedWhiteKeyWidthNum = computed(() => parseAndFormatDimension(props.whiteKeyWidth).value)

/** 白键宽度：固定模式用 props，铺满模式按容器宽度均分 */
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

function getMidiWidth(midi) {
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
  // 开始位置偏差
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
    // 黑键开始
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }
  // 结束位置偏差
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
    // 黑键结束
    if ([1, 3, 6, 8, 10].includes(midi % 12)) {
      width -= (props.blackKeyWidthRatio * whiteKeyWidthNum.value) / 2
    }
  }
  return width
}

/*
 * 样式
 * */
/** 按 midi 生成柔和的糖果色相 */
function noteHue(midi: number) {
  return (midi * 17 + 285) % 360
}

/** 样式 - 外容器（带滚动） */
const pianoWaterfallContainerStyle = computed(
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
const waterfallStyle = computed((): CSSProperties => {
  const waterfallHeight = duration.value * props.columnHeightConstant

  const precent = currentTime.value * props.columnHeightConstant - props.baseLineBottom
  // 当前时间在该区间时，计算下落动画

  return {
    height: waterfallHeight + 'px',
    position: 'absolute',
    bottom: 0, // 这个
    transform: `translateY(${precent}px)`, // 这里从containerHeightNum.value + waterfallHeight到0，如果transform不好做暂停，改用修改bottom
    userSelect: 'none',
    display: 'flex'
  }
})
const keyStyle = computed(() => {
  return (midi: number): CSSProperties => {
    const midiWidth = getMidiWidth(midi)
    const res: CSSProperties = {
      width: midiWidth + keyUnit.value,
      height: '100%',
      flexShrink: 0,
      // margin: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative'
    }
    return res
  }
})
const midiEventStyle = computed(() => {
  return (midi: number): CSSProperties => {
    const midiWidth = getMidiWidth(midi)
    const active = activeKeys.value.has(midi)
    const res: CSSProperties = {
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
    return res
  }
})

// 水柱样式
const waterColumnStyle = computed(() => {
  return (midi: number, item: [number, number, any?]) => {
    const start = item[0]
    const end = item[1]
    const hue = noteHue(midi)
    const res: CSSProperties = {
      height: (end - start) * props.columnHeightConstant + 'px',
      width: '14px',
      background: `linear-gradient(180deg, hsla(${hue}, 100%, 84%, 0.98) 0%, hsla(${hue}, 85%, 70%, 0.96) 100%)`,
      position: 'absolute',
      flexShrink: 0,
      borderRadius: '999px',
      boxShadow: `0 2px 8px hsla(${hue}, 80%, 60%, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.55)`,
      bottom: start * props.columnHeightConstant + 'px'
    }
    return res
  }
})
// 水柱激活样式
const waterColumnActiveStyle = computed(() => {
  return (item: [number, number]): CSSProperties => {
    const start = item[0]
    const end = item[1]

    return {
      height: (end - start) * props.columnHeightConstant + 'px',
      width: '14px',
      background: 'linear-gradient(180deg, #7ee8fa 0%, #4dd4c4 50%, #2eb8a6 100%)',
      opacity: 0.7,
      position: 'absolute',
      flexShrink: 0,
      borderRadius: '999px',
      bottom: start * props.columnHeightConstant + 'px'
    }
  }
})
/** 按键交互 */

// 高亮效果
const midiEventContainerStyle = computed((): CSSProperties => {
  return {
    height: '3px',
    bottom: props.baseLineBottom + 'px',
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255, 158, 199, 0.45) 8%, rgba(255, 158, 199, 0.85) 50%, rgba(201, 184, 255, 0.45) 92%, transparent 100%)',
    boxShadow: '0 0 12px 1px rgba(255, 158, 199, 0.6)',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'flex-end'
  }
})

/*
 * 评分机制
 * 单位都是毫秒
 * */

const defaultHighlightPolicy: HighlightPolicy = {
  startTriggerThreshold: 200, // 能提前触发弹奏的时间,理论上讲它应该比goodThreshold大，否则触发不了谈早
  postTriggerThreshold: 200, // 能延后触发弹奏的时间，理论上讲应该比goodThreshold大，否则触发不了弹晚
  passThreshold: 150, //后多少秒之内触发不算谈早弹晚，算及格,
  goodThreshold: 100, // 前后多少秒之内触发算优秀
  perfectThresdhold: 70 // 前后多少秒之内触发算完美
}
const policy = computed(() => ({
  ...defaultHighlightPolicy,
  ...props.highlightPolicy
}))
const activeKeys = ref<Set<number>>(new Set())
const activeParts = ref(new Map<number, Array<Array<number>>>())

/* ---------------- 评分 ---------------- */

type FlatNote = {
  /** 唯一标识，优先用第三个附加参数(noteInfo id) */
  key: string
  midi: number
  /** 起始毫秒（含 prepareTime） */
  start: number
  /** 结束毫秒（含 prepareTime） */
  end: number
  /** 第三个附加参数，回调时原样带出 */
  info: any
}

/** 把 performSequence 拍平成音符列表，便于逐音符判定 */
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

/** 已判定音符：key -> 评分结果 */
const noteScores = ref(new Map<string, NoteScoreResult>())

/** 实时详情信息 */
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

/** 记录某个音符的评分，并回调出去（同一音符只评一次） */
function recordScore(note: FlatNote, result: NoteScoreResult) {
  if (noteScores.value.has(note.key)) return
  const next = new Map(noteScores.value)
  next.set(note.key, result)
  noteScores.value = next
  emit('score', result, stats.value.realScore, stats.value.totalScore, note.info)
}

/** 按键按下时，判定命中的音符 */
function judgeOnPress(midi: number, t: number) {
  const candidates = flatNotes.value.filter(
    (n) =>
      n.midi === midi &&
      !noteScores.value.has(n.key) &&
      t >= n.start - policy.value.startTriggerThreshold &&
      t <= n.start + policy.value.postTriggerThreshold
  )
  if (!candidates.length) return

  // 取触发时刻最接近音符起点的那个
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

/** 时间推进时，将已错过触发窗口且未命中的音符判为漏弹 */
function evaluateMisses(t: number) {
  for (const n of flatNotes.value) {
    if (noteScores.value.has(n.key)) continue
    if (t > n.start + policy.value.postTriggerThreshold) {
      recordScore(n, 'miss')
    }
  }
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
onMounted(() => {
  observeContainer()
  // 绑定键盘按下与抬起事件
  window.addEventListener('keydown', keyBoardKeyDown)
  window.addEventListener('keyup', keyBoardKeyUp)
  midiStore.addMessageListener(handleMidiMessage)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  // 移除事件绑定
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
function handleKeyDown(midi) {
  if (!midi) return
  // 防止重复按下
  if (activeKeys.value.has(midi)) return
  activeKeys.value.add(midi)
  if (state.value !== 'playing') return
  // 记录高亮部分
  const timeStamp = currentTime.value
  if (activeParts.value.has(midi)) {
    const arr = activeParts.value.get(midi)
    arr.push([timeStamp])
  } else {
    activeParts.value.set(midi, [[timeStamp]])
  }
  // 评分判定
  judgeOnPress(midi, timeStamp)
}

function handleKeyUp(midi) {
  if (!midi) return
  activeKeys.value.delete(midi)
  if (state.value !== 'playing') return
  // 记录高亮部分
  const timeStamp = currentTime.value
  const arr = activeParts.value.get(midi)
  // 其实这个防护不一定能用到
  if (!arr || arr.length === 0) return
  const last = arr[arr.length - 1]
  if (last.length === 1) last.push(timeStamp)
}

// 高亮数据
const highlightSegments = computed(() => {
  const result: Record<number, [number, number][]> = {}

  for (const [midiStr, seq] of Object.entries(performSequenceComputed.value)) {
    const midi = Number(midiStr)
    const activeSeq = activeParts.value.get(midi) || []
    const highlightParts: [number, number][] = []

    for (const [pStart, pEnd] of seq) {
      // 根据策略计算允许的触发区间
      const validStart = pStart - policy.value.startTriggerThreshold
      const validEnd = pStart + policy.value.postTriggerThreshold

      // 若不允许重复，则只取第一个激活区间
      const parts = activeSeq

      for (const part of parts) {
        const aStart = part[0]
        const aEnd = part[1] ?? currentTime.value // 若还未抬键，则动态增长

        // 若整个按下区间完全不在允许区间内，则跳过
        if (aStart < validStart || aStart > validEnd) continue

        // 有效交集
        const overlapStart = Math.max(pStart, aStart)
        const overlapEnd = Math.min(pEnd, aEnd)

        if (overlapStart < overlapEnd) {
          highlightParts.push([overlapStart, overlapEnd])
        }
      }
    }

    // 若有高亮区间，则存入结果
    if (highlightParts.length > 0) {
      result[midi] = highlightParts
    }
  }

  return result
})
/* 整体宽度 */
const totalWidth = computed(() => {
  return fixedWhiteKeyWidthNum.value * whiteKeyCount.value + keyUnit.value
})

// 播放功能
// 当前播放时间（ms）
const currentTime = ref(0)
// 是否正在播放
const state = ref('stopped') // stopped playing paused
// 播放起点（用于恢复播放）
let lastTimestamp = 0
let rafId: number | null = null

/** 播放函数 */
function play() {
  if (state.value === 'playing') return
  // 从头开始播放时清空上一轮评分
  if (currentTime.value === 0) {
    noteScores.value = new Map<string, NoteScoreResult>()
  }
  state.value = 'playing'
  lastTimestamp = performance.now()
  requestFrame()
}

/** 暂停函数 */
function pause() {
  if (state.value !== 'playing') return
  state.value = 'paused'
  if (rafId) cancelAnimationFrame(rafId)
}

/** 停止函数（回到开头） */
function stop() {
  if (state.value === 'stopped') return
  state.value = 'stopped'
  if (rafId) cancelAnimationFrame(rafId)
  currentTime.value = 0
}

/* 清空已激活数据 */
function clearActiveParts() {
  activeParts.value = new Map<number, Array<Array<number>>>()
  activeKeys.value = new Set<number>()
  noteScores.value = new Map<string, NoteScoreResult>()
}

/** 动画循环 */
function requestFrame() {
  rafId = requestAnimationFrame((timestamp) => {
    if (state.value !== 'playing') return

    const delta = timestamp - lastTimestamp
    lastTimestamp = timestamp
    currentTime.value += delta

    // 漏弹判定：错过触发窗口仍未命中的音符
    evaluateMisses(currentTime.value)

    // 若播放超出总时长，停止动画，但保留状态
    if (currentTime.value >= duration.value) {
      if (rafId) cancelAnimationFrame(rafId)
      return
    }

    requestFrame()
  })
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
    <div :style="waterfallStyle" class="stackItem" comment="瀑布流容器">
      <div
        v-for="midi in Array.from({ length: midi.max - midi.min + 1 }, (_, i) => midi.min + i)"
        :key="midi"
        :style="keyStyle(midi)"
      >
        <div
          v-for="(item, index) in performSequenceComputed[midi]"
          :key="index"
          :style="waterColumnStyle(midi, item)"
          comment="音符水柱,后续改插槽自定义样式"
        ></div>
        <div
          v-for="(item, index) in highlightSegments[midi] || []"
          :key="index"
          :style="waterColumnActiveStyle(item)"
          comment="音符水柱激活态,后续改插槽自定义样式"
        ></div>
      </div>
    </div>
    <div :style="midiEventContainerStyle" class="stackItem" comment="瀑布流容器,midi按下效果">
      <div
        v-for="midi in Array.from({ length: midi.max - midi.min + 1 }, (_, i) => midi.min + i)"
        :key="midi"
        :style="midiEventStyle(midi)"
        comment="midi按下效果,后续改插槽自定义样式"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none; /* IE & Edge */
  scrollbar-width: none; /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome */
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

  > * {
    pointer-events: auto;
  }
}
</style>
