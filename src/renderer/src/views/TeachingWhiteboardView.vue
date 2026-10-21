<script lang="ts" setup>
import type { KeySignatureTypeEnum } from '@deciphony/renderer'
import musicScoreVue from '@deciphony/renderer'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { WhiteboardToolbar } from '@renderer/components/whiteboard'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import {
  WHITEBOARD_AUTO_CLEAR_THROTTLE_MS,
  WHITEBOARD_CHORD_WINDOW_MS,
  WHITEBOARD_PIANO_SECTION_HEIGHT,
  type WhiteboardStaffMode
} from '@renderer/constant/whiteboard'
import { usePlayStore } from '@renderer/store/play.store'
import { useWhiteboardStore } from '@renderer/store/whiteboard.store'
import { pianoHoldTriggerOptions, pianoReleaseOptions } from '@renderer/utils/pianoEnvelope'
import { buildTeachingWhiteboardScore } from '@renderer/template/teachingWhiteboard'
import {
  addNoteToDoubleStaffScore,
  addNoteToWhiteboardScore,
  applyWhiteboardKeySignature,
  clearAllWhiteboardNotes,
  resolveChronaxieFromHoldMs,
  type DoubleStaffChordSlots
} from '@renderer/views/teachingWhiteboard/noteInput'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useVirtualPianoSkin } from '@renderer/utils/collection/useVirtualPianoSkin'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { t } from '@renderer/i18n/helpers'

const WHITEBOARD_SLOT_CONFIG = {
  'g-l': { w: 50 },
  'g-r': { w: 50 }
} as const

const whiteboardStore = useWhiteboardStore()

function buildScore(mode: WhiteboardStaffMode) {
  const score = buildTeachingWhiteboardScore(mode)
  applyWhiteboardKeySignature(score, whiteboardStore.keySignature)
  return score
}

const musicScoreData = ref(buildScore(whiteboardStore.staffMode))
const scoreSectionRef = ref<HTMLElement | null>(null)
const globalLoading = useGlobalLoadingStore()
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const { pianoSkin, virtualPianoSkinId, waitVirtualPianoSkin } = useVirtualPianoSkin()

const playStore = usePlayStore()
const {
  pianoLayoutMode,
  midiRange,
  pianoHeight,
  pianoWhiteKeyWidth,
  groupEnabled,
  chordBoxEnabled,
  intervalRulerEnabled,
  pitchNotation,
  addNoteEnabled,
  autoClearEnabled,
  targetClef,
  staffMode,
  noteInputBpm,
  isCustomWidth
} = storeToRefs(whiteboardStore)

/**
 * 一组几乎同时按下的琴键（和弦）；每个谱表首个松开的键写入 slot，其余追加到同一 slot。
 * 双行模式下同一和弦会按音高拆到高、低音两个谱表
 */
interface ChordPressGroup {
  startAt: number
  slots: DoubleStaffChordSlots
}

/** 记录每个按下中的琴键开始时间戳与所属和弦组，keyup 时据此推断时值 */
const keyDownAt = new Map<number, { at: number; group: ChordPressGroup }>()
let currentChordGroup: ChordPressGroup | null = null
/** 自动清空节流：和弦多键几乎同时按下时只清空一次 */
let lastAutoClearAt = 0

function onPianoKeyDown(midi: number) {
  const now = performance.now()
  if (autoClearEnabled.value && now - lastAutoClearAt >= WHITEBOARD_AUTO_CLEAR_THROTTLE_MS) {
    lastAutoClearAt = now
    clearAllWhiteboardNotes(musicScoreData.value)
  }
  if (!currentChordGroup || now - currentChordGroup.startAt > WHITEBOARD_CHORD_WINDOW_MS) {
    currentChordGroup = { startAt: now, slots: {} }
  }
  keyDownAt.set(midi, { at: now, group: currentChordGroup })
  void playStore.triggerNote(midi, pianoHoldTriggerOptions())
}

function onPianoKeyUp(midi: number) {
  playStore.releaseNote(midi, pianoReleaseOptions())
  const press = keyDownAt.get(midi)
  keyDownAt.delete(midi)
  if (!addNoteEnabled.value || press == null) return

  const holdMs = performance.now() - press.at
  const chronaxie = resolveChronaxieFromHoldMs(holdMs, noteInputBpm.value)
  if (staffMode.value === 'double') {
    addNoteToDoubleStaffScore({
      score: musicScoreData.value,
      midi,
      chronaxie,
      chord: press.group.slots
    })
    return
  }
  const clef = targetClef.value
  const slot = addNoteToWhiteboardScore({
    score: musicScoreData.value,
    clef,
    midi,
    chronaxie,
    chordSlot: press.group.slots[clef]
  })
  if (slot) press.group.slots[clef] = slot
}

watch(staffMode, (mode) => {
  const next = buildScore(mode)
  const section = scoreSectionRef.value
  if (section) Object.assign(next, measureScoreSection(section))
  musicScoreData.value = next
  currentChordGroup = null
  scoreView.value = null
  void refitAfterRender()
})

watch(scoreSkinName, () => void refitAfterRender())

function onClearNotes() {
  clearAllWhiteboardNotes(musicScoreData.value)
}

function onChangeKeySignature(key: KeySignatureTypeEnum) {
  applyWhiteboardKeySignature(musicScoreData.value, key)
}

function measureScoreSection(el: HTMLElement) {
  const style = getComputedStyle(el)
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
  return {
    width: Math.max(1, Math.floor(el.clientWidth - padX)),
    height: Math.max(1, Math.floor(el.clientHeight - padY))
  }
}

/** 各模式谱面放大倍数上限 */
const SCORE_MAX_SCALE: Record<WhiteboardStaffMode, number> = {
  triple: 1.5,
  double: 2
}
/** 谱表上下各留的空间（谱面单位），放得下加线上的音符 */
const STAFF_V_PAD = 50

/** 谱面按 scale 放大，竖直方向用 offsetY 把谱表居中 */
const scoreView = ref<{ scale: number; offsetY: number } | null>(null)

const scoreSvgStyle = computed(() => {
  const view = scoreView.value
  if (!view) return undefined
  const { width, height } = musicScoreData.value
  return {
    flex: 'none',
    width: `${width * view.scale}px`,
    height: `${height * view.scale}px`,
    margin: '0 auto',
    overflow: 'visible',
    transform: `translateY(${view.offsetY}px)`
  }
})

function setScoreSize(width: number, height: number) {
  if (musicScoreData.value.width !== width) musicScoreData.value.width = width
  if (musicScoreData.value.height !== height) musicScoreData.value.height = height
}

/** 当前谱面里五线（小节框）的竖直范围，单位为谱面坐标；与皮肤有关，只能量渲染结果 */
function measureStaffRange(section: HTMLElement): { top: number; bottom: number } | null {
  const svg = section.querySelector('svg')
  const measures = svg?.querySelectorAll('[data-tag="measure"]')
  if (!svg || !measures?.length) return null
  const svgRect = svg.getBoundingClientRect()
  const unit = svgRect.height / musicScoreData.value.height
  if (!(unit > 0)) return null
  let top = Infinity
  let bottom = -Infinity
  for (const el of measures) {
    const rect = el.getBoundingClientRect()
    top = Math.min(top, rect.top)
    bottom = Math.max(bottom, rect.bottom)
  }
  return { top: (top - svgRect.top) / unit, bottom: (bottom - svgRect.top) / unit }
}

function fitScoreToSection() {
  const section = scoreSectionRef.value
  if (!section) return

  const { width, height } = measureScoreSection(section)
  const range = measureStaffRange(section)
  if (!range) {
    scoreView.value = null
    setScoreSize(width, height)
    return
  }

  const contentTop = range.top - STAFF_V_PAD
  const contentHeight = range.bottom - range.top + STAFF_V_PAD * 2
  const scale = Math.max(1, Math.min(SCORE_MAX_SCALE[staffMode.value], height / contentHeight))
  setScoreSize(Math.floor(width / scale), Math.ceil(range.bottom + STAFF_V_PAD))
  scoreView.value = {
    scale,
    offsetY: Math.round((height - contentHeight * scale) / 2 - contentTop * scale)
  }
}

/** 谱面换了结构或皮肤后，等渲染完再按新结果排版 */
async function refitAfterRender() {
  await nextTick()
  requestAnimationFrame(() => fitScoreToSection())
}

let scoreResizeObserver: ResizeObserver | null = null

onMounted(async () => {
  globalLoading.show(t('common.loading'))
  try {
    await Promise.all([
      waitScoreSkin(),
      waitVirtualPianoSkin(),
      playStore.waitReady(),
      playStore.resetCollectionToneColorToDefault()
    ])
    await nextTick()
    fitScoreToSection()
    void refitAfterRender()

    if (scoreSectionRef.value) {
      scoreResizeObserver = new ResizeObserver(() => fitScoreToSection())
      scoreResizeObserver.observe(scoreSectionRef.value)
    }
  } finally {
    globalLoading.hide()
  }
})

onBeforeUnmount(() => {
  scoreResizeObserver?.disconnect()
  playStore.releaseAllHeldNotes()
})
</script>

<template>
  <div class="whiteboard">
    <section ref="scoreSectionRef" class="whiteboard__score">
      <musicScoreVue
        v-if="scoreSkin"
        :key="scoreSkinName"
        class="whiteboard__score-svg"
        :style="scoreSvgStyle"
        :data="musicScoreData"
        :slot-config="WHITEBOARD_SLOT_CONFIG"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
      />
    </section>

    <section
      class="whiteboard__piano"
      :class="{ 'whiteboard__piano--custom': isCustomWidth }"
      :style="{ height: `${WHITEBOARD_PIANO_SECTION_HEIGHT}px` }"
    >
      <VirtualPiano
        v-if="pianoSkin"
        :key="virtualPianoSkinId ?? 'default'"
        class="whiteboard__piano-inner"
        :chord-box="chordBoxEnabled"
        :group="groupEnabled"
        :height="pianoHeight"
        :interval-ruler="intervalRulerEnabled"
        :layout-mode="pianoLayoutMode"
        :midi="midiRange"
        :pitch-notation="pitchNotation"
        :white-key-width="pianoWhiteKeyWidth"
        @key-down="onPianoKeyDown"
        @key-up="onPianoKeyUp"
      />
    </section>

    <WhiteboardToolbar
      @clear-notes="onClearNotes"
      @change-key-signature="onChangeKeySignature"
    />
  </div>
</template>

<style scoped>
.whiteboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
  box-sizing: border-box;
}

.whiteboard__score {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.whiteboard__score-svg {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.whiteboard__piano {
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.72);
  overflow: hidden;
}

.whiteboard__piano--custom {
  overflow-x: auto;
  overflow-y: hidden;
  justify-content: flex-start;
}

.whiteboard__piano-inner {
  flex-shrink: 0;
}

.whiteboard__piano:not(.whiteboard__piano--custom) .whiteboard__piano-inner {
  width: 100%;
}
</style>
