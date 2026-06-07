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
} from 'deciphony-core'
import vDrag from '@renderer/directivces/drag'
import { useMidiStore } from '@renderer/store/midi.store'

defineOptions({
  name: 'DsPiano'
})

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
    // 音程尺
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
  console.log(
    'chicken',
    whiteIndex,
    whiteKeyWidthNum.value,
    dim(whiteIndex * whiteKeyWidthNum.value)
  )
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
    return
  }

  if (!setActiveKey(midi, false)) return
  emits('keyUp', midi)
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

    const res = []
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
// 音程尺
const intervalRulerStyle = computed((): CSSProperties => {
  const res: CSSProperties = {
    width: dim(whiteKeyWidthNum.value * 26),
    height: props.height,
    backgroundColor: 'white',
    boxShadow: '0px 0px 5px 2px rgba(200,200,200,1)',
    borderRadius: '10px',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center'
  }
  return res
})
// 音程尺刻度样式
const intervalRulerTickStyle = computed((): ((index: number) => CSSProperties) => {
  return (index) => {
    const res: CSSProperties = {
      width: '1px',
      height:
        index % 2 ? dim(containerHeightNum.value * 0.1) : dim(containerHeightNum.value * 0.07),
      backgroundColor: '#111'
    }
    return res
  }
})
const intervalRulerData = ref([
  { name: '纯一度', semitones: 0, wholeTones: 0 },
  { name: '小二度', semitones: 1, wholeTones: 0.5 },
  { name: '大二度', semitones: 2, wholeTones: 1 },
  { name: '小三度', semitones: 3, wholeTones: 1.5 },
  { name: '大三度', semitones: 4, wholeTones: 2 },
  { name: '纯四度', semitones: 5, wholeTones: 2.5 },
  { name: '增四度', semitones: 6, wholeTones: 3 },
  { name: '纯五度', semitones: 7, wholeTones: 3.5 },
  { name: '小六度', semitones: 8, wholeTones: 4 },
  { name: '大六度', semitones: 9, wholeTones: 4.5 },
  { name: '小七度', semitones: 10, wholeTones: 5 },
  { name: '大七度', semitones: 11, wholeTones: 5.5 },
  { name: '纯八度', semitones: 12, wholeTones: 6 },
  { name: '小九度', semitones: 13, wholeTones: 6.5 },
  { name: '大九度', semitones: 14, wholeTones: 7 },
  { name: '小十度', semitones: 15, wholeTones: 7.5 },
  { name: '大十度', semitones: 16, wholeTones: 8 },
  { name: '纯十一度', semitones: 17, wholeTones: 8.5 },
  { name: '增十一度', semitones: 18, wholeTones: 9 },
  { name: '纯十二度', semitones: 19, wholeTones: 9.5 },
  { name: '小十三度', semitones: 20, wholeTones: 10 },
  { name: '大十三度', semitones: 21, wholeTones: 10.5 },
  { name: '小十四度', semitones: 22, wholeTones: 11 },
  { name: '大十四度', semitones: 23, wholeTones: 11.5 },
  { name: '纯十五度', semitones: 24, wholeTones: 12 }
])
const intervalRulerItemStyle = computed((): CSSProperties => {
  return {
    width: isFillParentMode.value ? dim(whiteKeyWidthNum.value) : props.whiteKeyWidth,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})
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
const chordBoxStyle = computed((): CSSProperties => {
  const keyW = Math.max(whiteKeyWidthNum.value, 28)
  const rightPad = keyW * 0.85
  return {
    width: dim(keyW * 5 + rightPad),
    height: dim(keyW),
    bottom: '0',
    position: 'absolute',
    display: 'flex',
    padding: `2px ${dim(rightPad)} 2px 6px`
  }
})
const curChord = ref({
  name: '大三和弦',
  keyList: [0, 4, 7]
})

const chordBoxRef = ref(null)
const curActiveChordMidi = ref<Set<number>>(new Set())

function chordBoxPointerDown(event: PointerEvent) {
  const el = event.target as HTMLElement
  el.setPointerCapture(event.pointerId)
  // 滑块距离左侧位置 TODO 因为这里的left只能是px,所以外部传入的值也必须px,否则计算出错
  const { value: left, unit } = parseAndFormatDimension(getComputedStyle(chordBoxRef.value).left)
  // 键盘起始midi
  const startMidi = props.midi.min
  // 起始midi固定唱名索引
  const solmizationIndex = startMidi % 12 // 比如21键起始9
  // 计算左侧未出现的已经经过的当前组的宽度，只计算白键
  const passWidth =
    {
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
    }['' + solmizationIndex] * whiteKeyWidthNum.value
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
  let midiAdd = relativeMidiAdd.find((e) => {
    const relativeLeft = (left + passWidth) % (7 * whiteKeyWidthNum.value)
    if (relativeLeft >= e.gte && relativeLeft < e.lt) {
      return true
    }
  }).relativeMidi
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

const midiStore = useMidiStore()

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

onMounted(() => {
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
        :class="{ active: isKeyActive(wk.midi) }"
        :style="{
          width: isFillParentMode ? dim(whiteKeyWidthNum) : whiteKeyWidth,
          height: '100%',
          position: 'absolute',
          left: leftForWhiteByIndex(wk.whiteIndex)
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
        :class="{ active: isKeyActive(bk.midi) }"
        :style="{
          width: dim(blackKeyWidthNum),
          height: dim(blackKeyHeightNum),
          left: leftForBlackByMidi(bk.midi)
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
        :style="intervalRulerStyle"
        comment="音程尺"
      >
        <div v-for="(item, index) in intervalRulerData" :style="intervalRulerItemStyle">
          <div></div>
          <div :style="{ writingMode: 'vertical-rl' }">{{ item.name }}</div>
          <div style="display: flex; justify-content: center; align-items: flex-end">
            <div :style="intervalRulerTickStyle(index)"></div>
          </div>
        </div>
      </div>
      <div
        v-show="chordBox"
        ref="chordBoxRef"
        v-drag="{ enabled: true, axis: 'x', limit: true }"
        class="chord-box"
        :style="chordBoxStyle"
        comment="和弦滑块"
      >
        <select v-model="curChord" class="chord-box__select">
          <option v-for="item in chordList" :label="item.name" :value="item"></option>
        </select>
        <!--            拖拽指令会设置pointerCaputre导致外部的pointerup不会触发，所以加.stop    -->
        <button
          class="chord-box__btn"
          type="button"
          @pointerup="chordBoxPointerUp($event)"
          @pointerdown.stop="chordBoxPointerDown($event)"
        >
          叩
        </button>
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

.white-key.active {
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

.black-key.active {
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

.chord-box {
  pointer-events: auto;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  min-width: 140px;
  min-height: 40px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 0 5px 2px rgba(200, 200, 200, 1);
}

.chord-box__select {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 1px solid rgba(200, 200, 200, 0.8);
  border-radius: 6px;
  background: #fff;
  font-size: 12px;
}

.chord-box__btn {
  flex-shrink: 0;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid rgba(155, 127, 214, 0.55);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 248, 251, 1), rgba(230, 220, 245, 1));
  color: #5c4a6a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
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
