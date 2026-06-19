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
import { parseAndFormatDimension } from '@renderer/utils/commonUtil'
import {
  AccidentalEnum,
  midiToNoteName,
  noteNameToHelmholtz,
  noteNameToNoteString
} from '@renderer/utils/noteNameDisplay'
import vDrag from '@renderer/directivces/drag'
import { useMidiStore } from '@renderer/store/midi.store'
import { useVirtualPianoSkin } from '@renderer/utils/collection/useVirtualPianoSkin'
import { INTERVAL_SLIDER_STEPS, isIntervalSliderAnchor } from '@renderer/utils/intervalSliderData'

defineOptions({
  name: 'DsPiano'
})

const midiStore = useMidiStore()

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
  blackKeyHeightRatio: {
    type: Number,
    default: 0.65
  },
  midi: {
    type: Object as PropType<{
      min: number
      max: number
    }>,
    default: () => ({ min: 21, max: 108 })
  },
  pitchNotation: {
    type: String, // Scientific Helmholtz None
    default: 'None'
  },
  intervalRuler: {
    // 音程滑块
    type: Boolean,
    default: false
  },
  chordBox: {
    // 和弦滑块
    type: Boolean,
    default: false
  },
  group: {
    // 分组
    type: Boolean,
    default: false
  }
})

/** 判断该 midi 是否为黑键（1,3,6,8,10 实际上是 1,3,6,8,10 — 但你之前用 1,3,5,8,10；通常 black indices: 1,3,6,8,10） */
function isBlackKey(midi: number) {
  const noteIndex = midi % 12
  return [1, 3, 6, 8, 10].includes(noteIndex)
}

/** 原始键数组（含黑白标识） */
const rawKeys = computed(() => {
  const out: Array<{
    midi: number
    black: boolean
    scientificNoteName: [string, string]
    helmholtzNoteName: [string, string]
  }> = []
  for (let i = props.midi.min; i <= props.midi.max; i++) {
    out.push({
      midi: i,
      black: isBlackKey(i),
      scientificNoteName: [
        noteNameToNoteString(midiToNoteName(i, AccidentalEnum.Sharp)),
        noteNameToNoteString(midiToNoteName(i, AccidentalEnum.Flat))
      ],
      helmholtzNoteName: [
        noteNameToHelmholtz(midiToNoteName(i, AccidentalEnum.Sharp)),
        noteNameToHelmholtz(midiToNoteName(i, AccidentalEnum.Flat))
      ]
    })
  }
  return out
})

/** 白键数组（带索引） */
const whiteKeys = computed(() => {
  const arr: Array<{
    midi: number
    black: boolean
    scientificNoteName: [string, string]
    helmholtzNoteName: [string, string]
    whiteIndex: number
  }> = []
  let wi = 0
  for (const k of rawKeys.value) {
    if (!k.black) {
      arr.push({
        whiteIndex: wi,
        ...k
      })
      wi++
    }
  }
  return arr
})

/** 黑键数组 */
const blackKeys = computed(() => {
  // 只包含黑键，不带索引（位置按前面的白键数量计算）
  return rawKeys.value.filter((k) => {
    return k.black
  })
})

/** 从 midi 找到前面的白键数量（whiteIndexBefore） */
function whiteIndexBeforeMidi(midi: number) {
  // count white keys with midi < target
  let count = 0
  for (let m = props.midi.min; m < midi; m++) {
    if (!isBlackKey(m)) count++
  }
  return count // 等价于前面有多少白键
}

const containerRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })

const isFillParentMode = computed(() => props.layoutMode === 'fillParent')

const keyUnit = computed(() => {
  if (isFillParentMode.value) return 'px'
  return parseAndFormatDimension(props.whiteKeyWidth).unit
})

const fixedWhiteKeyWidthNum = computed(() => parseAndFormatDimension(props.whiteKeyWidth).value)

const fixedContainerHeightNum = computed(() => parseAndFormatDimension(props.height).value)

/** 白键宽度：固定模式用 props，铺满模式按容器宽度均分 */
const whiteKeyWidthNum = computed(() => {
  if (isFillParentMode.value) {
    const count = whiteKeys.value.length
    if (!count || !containerSize.value.width) return 0
    return containerSize.value.width / count
  }
  return fixedWhiteKeyWidthNum.value
})

const containerHeightNum = computed(() => fixedContainerHeightNum.value)

const blackKeyWidthNum = computed(() => whiteKeyWidthNum.value * props.blackKeyWidthRatio)
const blackKeyHeightNum = computed(() => containerHeightNum.value * props.blackKeyHeightRatio)

const { pianoSkin: pianoSkinPack } = useVirtualPianoSkin()

function keySkinStyle(midi: number): CSSProperties {
  const skin = pianoSkinPack.value?.[midi]
  if (!skin) return {}

  const url = isKeyActive(midi) ? skin.press : skin.normal
  if (!url) return {}

  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    border: 'none'
  }
}

const totalWidth = computed(() => {
  const count = whiteKeys.value.length
  return `${count * fixedWhiteKeyWidthNum.value}${keyUnit.value}`
})

const pianoContainerStyle = computed((): CSSProperties => {
  if (isFillParentMode.value) {
    return {
      width: '100%',
      height: props.height,
      position: 'relative',
      background: '#eee'
    }
  }
  return {
    width: totalWidth.value,
    height: props.height,
    position: 'relative',
    background: '#eee'
  }
})

function dim(value: number) {
  return `${value}${keyUnit.value}`
}

/** 生成白键样式 left 值 */
function leftForWhiteByIndex(whiteIndex: number) {
  return dim(whiteIndex * whiteKeyWidthNum.value)
}

/** 生成黑键 left 值（将黑键居中放在相邻两个白键之间） */
function leftForBlackByMidi(midi: number) {
  const beforeWhiteCount = whiteIndexBeforeMidi(midi)
  const leftNum = beforeWhiteCount * whiteKeyWidthNum.value - blackKeyWidthNum.value / 2
  return dim(leftNum)
}

/** 按键交互 */
const activeKeys = ref<Set<number>>(new Set())
const emits = defineEmits<{
  (e: 'keyDown', midi: number): void
  (e: 'keyUp', midi: number): void
}>()

function isMidiInRange(midi: number) {
  return midi >= props.midi.min && midi <= props.midi.max
}

function setActiveKey(midi: number, active: boolean) {
  const next = new Set(activeKeys.value)
  if (active) {
    if (next.has(midi)) return false
    next.add(midi)
  } else {
    if (!next.has(midi)) return false
    next.delete(midi)
  }
  activeKeys.value = next
  return true
}

function emitKey(type: 'keyUp' | 'keyDown', midi: number) {
  if (!isMidiInRange(midi)) return

  if (type === 'keyDown') {
    if (!setActiveKey(midi, true)) return
    emits('keyDown', midi)
    midiStore.dispatchVirtualNote(midi, true)
    return
  }

  if (!setActiveKey(midi, false)) return
  emits('keyUp', midi)
  midiStore.dispatchVirtualNote(midi, false)
}

function handlePointerDown(
  event: PointerEvent,
  key: {
    midi: number
    black: boolean
    scientificNoteName: [string, string]
    helmholtzNoteName: [string, string]
  }
) {
  emitKey('keyDown', key.midi)
  const el = event.target as HTMLAnchorElement
  el.setPointerCapture(event.pointerId)
}

function handlePointerUp(
  event: PointerEvent,
  key: {
    midi: number
    black: boolean
    scientificNoteName: [string, string]
    helmholtzNoteName: [string, string]
  }
) {
  emitKey('keyUp', key.midi)
  const el = event.target as HTMLAnchorElement
  el.releasePointerCapture(event.pointerId)
}

function isKeyActive(midi: number) {
  return activeKeys.value.has(midi)
}

/** 判断是否是白键 */
function isWhiteKey(midi: number) {
  const noteIndex = midi % 12
  return ![1, 3, 6, 8, 10].includes(noteIndex)
}

const groupColorMap = ref({
  大字三组: 'rgba(255, 99, 132, 0.2)', // 粉红
  大字二组: 'rgba(54, 162, 235, 0.2)', // 天蓝
  大字一组: 'rgba(255, 206, 86, 0.2)', // 明黄
  小字组: 'rgba(75, 192, 192, 0.2)', // 青绿
  小字一组: 'rgba(153, 102, 255, 0.2)', // 紫色
  小字二组: 'rgba(255, 159, 64, 0.2)', // 橙色
  小字三组: 'rgba(0, 200, 83, 0.2)', // 草绿
  小字四组: 'rgba(233, 30, 99, 0.2)', // 洋红
  小字五组: 'rgba(0, 188, 212, 0.2)', // 湖蓝
  小字六组: 'rgba(255, 87, 34, 0.2)', // 橘红
  小字七组: 'rgba(63, 81, 181, 0.2)', // 靛蓝
  小字八组: 'rgba(139, 195, 74, 0.2)' // 苹果绿
})
// 分组蒙层数组
const groupMaskList = computed(
  (): { whiteKeyCount: number; groupName: string; color: string }[] => {
    const min = props.midi.min
    const max = props.midi.max

    const groupNames = [
      '大字三组',
      '大字二组',
      '大字一组',
      '小字组',
      '小字一组',
      '小字二组',
      '小字三组',
      '小字四组',
      '小字五组',
      '小字六组',
      '小字七组',
      '小字八组'
    ]

    const res: { whiteKeyCount: number; groupName: string; color: string }[] = []
    let whiteKeyCount = 0
    for (let i = min; i <= max; i++) {
      whiteKeyCount += isWhiteKey(i) ? 1 : 0
      const ocatve = Math.floor(i / 12)
      let groupName: string = ''
      switch (ocatve) {
        case 0: {
          groupName = '大字四组'
          break
        }
        case 1: {
          groupName = '大字三组'
          break
        }
        case 2: {
          groupName = '大字二组'
          break
        }
        case 3: {
          groupName = '大字一组'
          break
        }
        case 4: {
          groupName = '小字组'
          break
        }
        case 5: {
          groupName = '小字一组'
          break
        }
        case 6: {
          groupName = '小字二组'
          break
        }
        case 7: {
          groupName = '小字三组'
          break
        }
        case 8: {
          groupName = '小字四组'
          break
        }
        case 9: {
          groupName = '小字五组'
          break
        }
      }
      const cur = {
        whiteKeyCount,
        groupName,
        color: groupColorMap.value[groupName]
      }
      // 加上最后一组
      if (max % 12 !== 11 && i === max) {
        res.push(cur)
      }
      if (i % 12 === 11) {
        res.push(cur)
        whiteKeyCount = 0
      }
    }

    return res
  }
)

const groupStyle = computed(
  (): ((item: { whiteKeyCount: number; groupName: string; color: string }) => CSSProperties) => {
    return (item: { whiteKeyCount: number; groupName: string; color: string }) => {
      return {
        width: dim(item.whiteKeyCount * whiteKeyWidthNum.value),
        backgroundColor: item.color,
        height: props.height,
        flexShrink: 0,
        pointerEvents: 'none'
      }
    }
  }
)
const groupNameStyle = computed(
  (): ((item: { whiteKeyCount: number; groupName: string; color: string }) => CSSProperties) => {
    return (item: { whiteKeyCount: number; groupName: string; color: string }) => {
      return {
        width: dim(item.whiteKeyCount * whiteKeyWidthNum.value),
        backgroundColor: item.color,
        height: '100%',
        flexShrink: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        minWidth: 0
      }
    }
  }
)
// 音程滑块（横向拖动，与琴键对齐）
const intervalSliderWidth = computed(() => dim(whiteKeyWidthNum.value * 26))

const intervalSliderColWidth = computed(() =>
  isFillParentMode.value ? dim(whiteKeyWidthNum.value) : props.whiteKeyWidth
)

const intervalSliderHeight = computed(() => {
  const compact = Math.min(58, Math.max(46, Math.round(containerHeightNum.value * 0.3)))
  return dim(compact)
})

function intervalSliderMarkerClass(index: number): string {
  if (isIntervalSliderAnchor(index)) return 'interval-slider__marker interval-slider__marker--anchor'
  return index % 2 === 0
    ? 'interval-slider__marker interval-slider__marker--mid'
    : 'interval-slider__marker interval-slider__marker--minor'
}
// 和弦滑块
const chordList = ref([
  // 三和弦 Triads
  { name: '大三和弦', keyList: [0, 4, 7] }, // Major
  { name: '小三和弦', keyList: [0, 3, 7] }, // Minor
  { name: '增三和弦', keyList: [0, 4, 8] }, // Augmented
  { name: '减三和弦', keyList: [0, 3, 6] }, // Diminished
  { name: '挂四和弦', keyList: [0, 5, 7] }, // Sus4
  { name: '挂二和弦', keyList: [0, 2, 7] }, // Sus2

  // 七和弦 Seventh Chords
  { name: '大七和弦', keyList: [0, 4, 7, 11] }, // Major 7 (maj7)
  { name: '属七和弦', keyList: [0, 4, 7, 10] }, // Dominant 7 (7)
  { name: '小七和弦', keyList: [0, 3, 7, 10] }, // Minor 7 (m7)
  { name: '半减七和弦', keyList: [0, 3, 6, 10] }, // Half-diminished 7 (m7♭5)
  { name: '减七和弦', keyList: [0, 3, 6, 9] }, // Fully diminished 7 (dim7)
  { name: '小大七和弦', keyList: [0, 3, 7, 11] }, // Minor Major 7 (mMaj7)
  { name: '增大七和弦', keyList: [0, 4, 8, 11] }, // Augmented Major 7 (augMaj7)
  { name: '增七和弦', keyList: [0, 4, 8, 10] }, // Augmented 7 (aug7)

  // 六和弦 Sixth Chords
  { name: '大六和弦', keyList: [0, 4, 7, 9] }, // Major 6 (6)
  { name: '小六和弦', keyList: [0, 3, 7, 9] }, // Minor 6 (m6)

  // 九和弦 Ninth Chords
  { name: '属九和弦', keyList: [0, 4, 7, 10, 14] }, // 9
  { name: '大九和弦', keyList: [0, 4, 7, 11, 14] }, // maj9
  { name: '小九和弦', keyList: [0, 3, 7, 10, 14] }, // m9

  // 十一和弦 Eleventh Chords
  { name: '属十一和弦', keyList: [0, 4, 7, 10, 14, 17] }, // 11
  { name: '小十一和弦', keyList: [0, 3, 7, 10, 14, 17] }, // m11
  { name: '大十一和弦', keyList: [0, 4, 7, 11, 14, 17] }, // maj11

  // 十三和弦 Thirteenth Chords
  { name: '属十三和弦', keyList: [0, 4, 7, 10, 14, 21] }, // 13
  { name: '小十三和弦', keyList: [0, 3, 7, 10, 14, 21] }, // m13
  { name: '大十三和弦', keyList: [0, 4, 7, 11, 14, 21] }, // maj13

  // 其他常见扩展与变化
  { name: 'sus4 加七', keyList: [0, 5, 7, 10] }, // 7sus4
  { name: 'sus2 加七', keyList: [0, 2, 7, 10] }, // 7sus2
  { name: '大七#11', keyList: [0, 4, 7, 11, 18] }, // maj7#11
  { name: '大七#5', keyList: [0, 4, 8, 11] }, // maj7#5
  { name: '属七b9', keyList: [0, 4, 7, 10, 13] }, // 7b9
  { name: '属七#9', keyList: [0, 4, 7, 10, 15] } // 7#9
])
const chordBoxLayout = computed(() => {
  const keyW = Math.max(whiteKeyWidthNum.value, 28)
  const rightPad = keyW * 0.85
  const height = Math.min(56, Math.max(44, Math.round(containerHeightNum.value * 0.28)))
  return { rightPad, height }
})

const chordBoxStyle = computed((): CSSProperties => {
  const { rightPad, height } = chordBoxLayout.value
  return {
    width: '168px',
    height: dim(height),
    bottom: '0',
    position: 'absolute',
    paddingRight: dim(rightPad)
  }
})
const curChordIndex = ref(0)
const curChord = computed(() => chordList.value[curChordIndex.value]!)

const chordBoxRef = ref<HTMLElement | null>(null)
const curActiveChordMidi = ref<Set<number>>(new Set())

function chordBoxPointerDown(event: PointerEvent) {
  const el = event.target as HTMLElement
  el.setPointerCapture(event.pointerId)
  // 滑块距离左侧位置 TODO 因为这里的left只能是px,所以外部传入的值也必须px,否则计算出错
  if (!chordBoxRef.value) return
  const { value: left, unit } = parseAndFormatDimension(getComputedStyle(chordBoxRef.value).left)
  // 键盘起始midi
  const startMidi = props.midi.min
  // 起始midi固定唱名索引
  const solmizationIndex = startMidi % 12 // 比如21键起始9
  // 计算左侧未出现的已经经过的当前组的宽度，只计算白键
  const solmizationOffsetMap: Record<string, number> = {
      '0': 0,
      '1': 1,
      '2': 1,
      '3': 2,
      '4': 2,
      '5': 3,
      '6': 4,
      '7': 4,
      '8': 5,
      '9': 5,
      '10': 6,
      '11': 6
    }
  const passWidth = (solmizationOffsetMap[String(solmizationIndex)] ?? 0) * whiteKeyWidthNum.value
  // 当前琴键已经走过的八度
  const baseMidi =
    (Math.floor((left + passWidth) / (whiteKeyWidthNum.value * 7)) + Math.floor(startMidi / 12)) *
    12 // 比如21键,baseMidi=12

  // 每组对应位置相对增加点midi值
  const relativeMidiAdd = [
    {
      relativeMidi: 0,
      gte: 0,
      lt: whiteKeyWidthNum.value - blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 1,
      gte: whiteKeyWidthNum.value - blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value + blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 2,
      gte: whiteKeyWidthNum.value + blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 2 - blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 3,
      gte: whiteKeyWidthNum.value * 2 - blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 2 + blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 4,
      gte: whiteKeyWidthNum.value * 2 + blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 3
    },
    {
      relativeMidi: 5,
      gte: whiteKeyWidthNum.value * 3,
      lt: whiteKeyWidthNum.value * 4 - blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 6,
      gte: whiteKeyWidthNum.value * 4 - blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 4 + blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 7,
      gte: whiteKeyWidthNum.value * 4 + blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 5 - blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 8,
      gte: whiteKeyWidthNum.value * 5 - blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 5 + blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 9,
      gte: whiteKeyWidthNum.value * 5 + blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 6 - blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 10,
      gte: whiteKeyWidthNum.value * 6 - blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 6 + blackKeyWidthNum.value / 2
    },
    {
      relativeMidi: 11,
      gte: whiteKeyWidthNum.value * 6 + blackKeyWidthNum.value / 2,
      lt: whiteKeyWidthNum.value * 7
    }
  ]
  const matched = relativeMidiAdd.find((e) => {
    const relativeLeft = (left + passWidth) % (7 * whiteKeyWidthNum.value)
    if (relativeLeft >= e.gte && relativeLeft < e.lt) {
      return true
    }
  })
  let midiAdd = matched?.relativeMidi ?? 0
  let midi = baseMidi + midiAdd

  // 特殊逻辑，如果当前钢琴以白键开始，但是原本左侧的0.5的黑键还会参与计算就会导致计算出错,这里进行修正
  if (midi < startMidi) {
    midi = startMidi
  }

  // 高亮和弦对应琴键
  curChord.value.keyList.forEach((key) => {
    curActiveChordMidi.value.add(key + midi)
    emitKey('keyDown', key + midi)
  })
}

function chordBoxPointerUp(event: PointerEvent) {
  const el = event.currentTarget as HTMLElement
  el.releasePointerCapture(event.pointerId)
  curActiveChordMidi.value.forEach((midi) => {
    emitKey('keyUp', midi)
  })
  curActiveChordMidi.value.clear()
}

// MIDI 设备输入（设备列表由 midi store 统一管理）

function handleMidiMessage(event: MIDIMessageEvent) {
  const data = event.data
  if (!data || data.length < 2) return

  const command = data[0] & 0xf0
  const note = data[1]
  const velocity = data.length > 2 ? data[2] : 0

  if (command === 0x90 && velocity > 0) {
    emitKey('keyDown', note)
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    emitKey('keyUp', note)
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

onMounted(async () => {
  observeContainer()
  midiStore.addMessageListener(handleMidiMessage)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  midiStore.removeMessageListener(handleMidiMessage)
})
</script>

<template>
  <div
    ref="containerRef"
    :style="pianoContainerStyle"
    class="ds-piano-container hide-scrollbar stack"
  >
    <div class="stackItem" comment="白键和黑键">
      <!-- 白键（绝对定位） -->
      <div
        v-for="wk in whiteKeys"
        :key="wk.midi"
        :class="{ active: isKeyActive(wk.midi), 'has-skin': !!pianoSkinPack }"
        :style="{
          width: isFillParentMode ? dim(whiteKeyWidthNum) : whiteKeyWidth,
          height: '100%',
          position: 'absolute',
          left: leftForWhiteByIndex(wk.whiteIndex),
          ...keySkinStyle(wk.midi)
        }"
        class="white-key"
        @pointerdown="handlePointerDown($event, wk)"
        @pointerup="handlePointerUp($event, wk)"
      >
        <div v-show="pitchNotation !== 'None'" class="noteName">
          {{
            pitchNotation === 'Scientific'
              ? noteNameToNoteString(midiToNoteName(wk.midi, AccidentalEnum.Sharp))
              : noteNameToHelmholtz(midiToNoteName(wk.midi, AccidentalEnum.Sharp))
          }}
        </div>
      </div>
      <template> </template>
      <!-- 黑键（绝对定位） -->
      <div
        v-for="bk in blackKeys"
        :key="bk.midi"
        :class="{ active: isKeyActive(bk.midi), 'has-skin': !!pianoSkinPack }"
        :style="{
          width: dim(blackKeyWidthNum),
          height: dim(blackKeyHeightNum),
          left: leftForBlackByMidi(bk.midi),
          ...keySkinStyle(bk.midi)
        }"
        class="black-key"
        @pointerdown="handlePointerDown($event, bk)"
        @pointerup="handlePointerUp($event, bk)"
      >
        <div v-show="pitchNotation !== 'None'" class="noteNameSharp">
          {{ pitchNotation === 'Scientific' ? bk.scientificNoteName[0] : bk.helmholtzNoteName[0] }}
        </div>
        <div v-show="pitchNotation !== 'None'" class="noteNameFlat">
          {{ pitchNotation === 'Scientific' ? bk.scientificNoteName[1] : bk.helmholtzNoteName[1] }}
        </div>
      </div>
    </div>
    <div v-show="group" class="stackItem group" comment="分组遮罩">
      <div v-for="item in groupMaskList" :key="item.groupName" :style="groupStyle(item)"></div>
    </div>
    <!--  这里移动端拖动有问题，以后再说吧      -->
    <div :style="{ height: 0, zIndex: 100 }" class="stackItem" comment="滑块功能层">
      <div
        v-show="group"
        :style="{ pointerEvents: 'none', height: dim(containerHeightNum * 0.2) }"
        class="groupName"
      >
        <div
          v-for="item in groupMaskList"
          :key="item.groupName"
          class="group-name-cell"
          :style="groupNameStyle(item)"
        >
          <span class="group-name-cell__text">{{ item.groupName }}</span>
        </div>
      </div>
      <div
        v-show="intervalRuler"
        v-drag="{ enabled: true, axis: 'x', limit: true }"
        class="interval-slider"
        :style="{ width: intervalSliderWidth, height: intervalSliderHeight }"
        comment="音程滑块"
      >
        <div class="interval-slider__head">
          <span class="interval-slider__grip" aria-hidden="true" />
          <span class="interval-slider__title">音程滑块</span>
        </div>
        <div class="interval-slider__track">
          <div
            v-for="(item, index) in INTERVAL_SLIDER_STEPS"
            :key="item.semitones"
            class="interval-slider__col"
            :style="{ width: intervalSliderColWidth }"
            :title="item.name"
          >
            <span class="interval-slider__label">{{ item.shortLabel }}</span>
            <span :class="intervalSliderMarkerClass(index)" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div
        v-show="chordBox"
        ref="chordBoxRef"
        v-drag="{ enabled: true, axis: 'x', limit: true }"
        class="chord-slider"
        :style="chordBoxStyle"
        comment="和弦滑块"
      >
        <div class="chord-slider__head">
          <span class="chord-slider__grip" aria-hidden="true" />
          <span class="chord-slider__title">和弦滑块</span>
        </div>
        <div class="chord-slider__body">
          <select v-model.number="curChordIndex" class="chord-slider__select">
            <option v-for="(item, index) in chordList" :key="item.name" :value="index">
              {{ item.name }}
            </option>
          </select>
          <button
            class="chord-slider__play"
            type="button"
            @pointerup="chordBoxPointerUp($event)"
            @pointerdown.stop="chordBoxPointerDown($event)"
          >
            叩
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-piano-container {
  user-select: none;
}

.white-key {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: white;
  border: 1px solid #ccc;
  box-sizing: border-box;
  cursor: pointer;
}

.white-key.active:not(.has-skin) {
  background: #a8d8ff;
}

.noteName {
  max-width: 100%;
  padding: 0 1px 3px;
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(50, 50, 50, 0.88);
}

.black-key {
  position: absolute;
  background: black;
  border-radius: 0 0 4px 4px;
  color: white;
  cursor: pointer;
  transform: translateY(0);

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.black-key.active:not(.has-skin) {
  background: #3399ff;
}

.noteNameSharp,
.noteNameFlat {
  max-width: 100%;
  padding: 0 1px;
  font-size: 8px;
  line-height: 1.05;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group {
  display: flex;
}

.groupName {
  display: flex;
  position: absolute;
  bottom: 0;
  width: 100%;
}

.group-name-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 2px;
}

.group-name-cell__text {
  display: block;
  max-width: 100%;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(60, 50, 70, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chord-slider {
  pointer-events: auto;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(155, 127, 214, 0.38);
  border-radius: 14px 14px 6px 6px;
  background: linear-gradient(165deg, rgba(248, 244, 255, 0.98) 0%, rgba(255, 240, 248, 0.96) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 6px 18px rgba(160, 130, 190, 0.18);
  cursor: grab;
  touch-action: none;
}

.chord-slider:active {
  cursor: grabbing;
}

.chord-slider__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-bottom: 1px solid rgba(155, 127, 214, 0.14);
  background: rgba(255, 255, 255, 0.55);
}

.chord-slider__grip {
  width: 14px;
  height: 8px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(155, 127, 214, 0.55) 1.5px, transparent 2px) 0 50% / 5px 8px,
    radial-gradient(circle, rgba(214, 51, 108, 0.55) 1.5px, transparent 2px) 50% 50% / 5px 8px,
    radial-gradient(circle, rgba(155, 127, 214, 0.55) 1.5px, transparent 2px) 100% 50% / 5px 8px;
}

.chord-slider__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #7a5a86;
}

.chord-slider__body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px 4px;
}

.chord-slider__select {
  flex: 1;
  min-width: 0;
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgba(155, 127, 214, 0.35);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c4a6a;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-overflow: ellipsis;
}

.chord-slider__select:focus {
  outline: none;
  border-color: rgba(214, 51, 108, 0.45);
  box-shadow: 0 0 0 2px rgba(214, 51, 108, 0.12);
}

.chord-slider__play {
  flex-shrink: 0;
  width: 28px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(214, 51, 108, 0.35);
  border-radius: 8px;
  background: linear-gradient(180deg, #ffd6e8 0%, #ffb8d0 100%);
  color: #9a3d5c;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.chord-slider__play:active {
  transform: translateY(1px);
  background: linear-gradient(180deg, #ffc4de 0%, #ff9fc4 100%);
}

.interval-slider {
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(214, 51, 108, 0.28);
  border-radius: 14px 14px 6px 6px;
  background: linear-gradient(165deg, rgba(255, 248, 252, 0.98) 0%, rgba(237, 226, 255, 0.96) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 6px 18px rgba(180, 130, 170, 0.18);
  cursor: grab;
  touch-action: none;
}

.interval-slider:active {
  cursor: grabbing;
}

.interval-slider__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-bottom: 1px solid rgba(214, 51, 108, 0.12);
  background: rgba(255, 255, 255, 0.55);
}

.interval-slider__grip {
  width: 14px;
  height: 8px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(214, 51, 108, 0.55) 1.5px, transparent 2px) 0 50% / 5px 8px,
    radial-gradient(circle, rgba(155, 127, 214, 0.55) 1.5px, transparent 2px) 50% 50% / 5px 8px,
    radial-gradient(circle, rgba(214, 51, 108, 0.55) 1.5px, transparent 2px) 100% 50% / 5px 8px;
}

.interval-slider__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #8a5a72;
}

.interval-slider__track {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  padding: 2px 2px 4px;
}

.interval-slider__col {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  min-width: 0;
}

.interval-slider__label {
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  color: #7a5a86;
  white-space: nowrap;
  transform: scale(0.92);
  transform-origin: center top;
}

.interval-slider__marker {
  display: block;
  width: 3px;
  border-radius: 999px;
  background: rgba(155, 127, 214, 0.55);
}

.interval-slider__marker--minor {
  height: 5px;
  opacity: 0.65;
}

.interval-slider__marker--mid {
  height: 8px;
  background: rgba(214, 51, 108, 0.45);
}

.interval-slider__marker--anchor {
  width: 5px;
  height: 11px;
  background: linear-gradient(180deg, #ff8fb8, #d6336c);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.65);
}

.hide-scrollbar {
  -ms-overflow-style: none; /* IE & Edge */
  scrollbar-width: none; /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome */
}
</style>
<style scoped>
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
