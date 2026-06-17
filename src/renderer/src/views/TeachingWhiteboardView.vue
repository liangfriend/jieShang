<script lang="ts" setup>
import type { KeySignatureTypeEnum } from 'deciphony-renderer'
import musicScoreVue from 'deciphony-renderer'
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { WhiteboardToolbar } from '@renderer/components/whiteboard'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import { WHITEBOARD_PIANO_SECTION_HEIGHT } from '@renderer/constant/whiteboard'
import { usePlayStore } from '@renderer/store/play.store'
import { useWhiteboardStore } from '@renderer/store/whiteboard.store'
import buildTeachingWhiteboardScore from '@renderer/template/teachingWhiteboard'
import {
  addNoteToWhiteboardScore,
  applyWhiteboardKeySignature,
  clearAllWhiteboardNotes,
  resolveChronaxieFromHoldMs
} from '@renderer/views/teachingWhiteboard/noteInput'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'

const WHITEBOARD_SLOT_CONFIG = {
  'g-l': { w: 50 },
  'g-r': { w: 50 }
} as const

const musicScoreData = ref(JSON.parse(JSON.stringify(buildTeachingWhiteboardScore)))
const scoreSectionRef = ref<HTMLElement | null>(null)
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

const whiteboardStore = useWhiteboardStore()
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
  targetClef,
  noteInputBpm,
  isCustomWidth
} = storeToRefs(whiteboardStore)

/** 记录每个按下中的琴键开始时间戳，keyup 时据此推断时值 */
const keyDownAt = new Map<number, number>()

function onPianoKeyDown(midi: number) {
  keyDownAt.set(midi, performance.now())
  void playStore.triggerNote(midi)
}

function onPianoKeyUp(midi: number) {
  playStore.releaseNote(midi)
  const start = keyDownAt.get(midi)
  keyDownAt.delete(midi)
  if (!addNoteEnabled.value || start == null) return

  const holdMs = performance.now() - start
  const chronaxie = resolveChronaxieFromHoldMs(holdMs, noteInputBpm.value)
  addNoteToWhiteboardScore({
    score: musicScoreData.value,
    clef: targetClef.value,
    midi,
    chronaxie
  })
}

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

function fitScoreToSection() {
  const section = scoreSectionRef.value
  if (!section) return

  const { width, height } = measureScoreSection(section)
  if (musicScoreData.value.width === width && musicScoreData.value.height === height) return

  musicScoreData.value.width = width
  musicScoreData.value.height = height
}

let scoreResizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  fitScoreToSection()

  if (scoreSectionRef.value) {
    scoreResizeObserver = new ResizeObserver(() => fitScoreToSection())
    scoreResizeObserver.observe(scoreSectionRef.value)
  }

  await playStore.waitReady()
  await playStore.ensureCollectionToneColorInitialized()
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
        class="whiteboard__score-svg"
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
