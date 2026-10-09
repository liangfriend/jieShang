<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const MIDI_LO = 36
const MIDI_HI = 84
const MIDI_COUNT = MIDI_HI - MIDI_LO + 1
/** 左侧音名栏宽度 */
const LABEL_W = 36
/** 基准线距内容区左侧的固定位置（含音名栏） */
const BASELINE_X = LABEL_W + 64
const PX_PER_UNIT = 0.55

type TrackBar = { midi: number; start: number; end: number }

const props = defineProps<{
  playBars: TrackBar[]
  playedBars: TrackBar[]
  progressUnit: number
  liveMidi: number | null
  detecting: boolean
}>()

const { t } = useI18n()

const viewportRef = ref<HTMLElement | null>(null)
const viewportHeight = ref(0)

const rowH = computed(() => {
  if (viewportHeight.value <= 0) return 11
  return viewportHeight.value / MIDI_COUNT
})

const trackHeight = computed(() =>
  viewportHeight.value > 0 ? viewportHeight.value : MIDI_COUNT * rowH.value
)

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

function midiLabel(midi: number): string {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]!
  const octave = Math.floor(midi / 12) - 1
  return `${name}${octave}`
}

const pianoRollMidis = computed(() => {
  const a: number[] = []
  for (let m = MIDI_HI; m >= MIDI_LO; m--) a.push(m)
  return a
})

const timelineWidthPx = computed(() => {
  let max = 0
  for (const b of props.playBars) max = Math.max(max, b.end)
  for (const b of props.playedBars) max = Math.max(max, b.end)
  max = Math.max(max, props.progressUnit)
  return Math.ceil(max * PX_PER_UNIT) + 120
})

const progressX = computed(() => props.progressUnit * PX_PER_UNIT)

/** 水柱层整体平移：进度前进 → 向左移，基准线不动 */
const notesTranslateX = computed(() => BASELINE_X - progressX.value)

const pitchDotTop = computed(() => {
  if (props.liveMidi == null) return 0
  const m = Math.min(MIDI_HI, Math.max(MIDI_LO, props.liveMidi))
  return (MIDI_HI - m) * rowH.value + rowH.value / 2
})

const pitchDotVisible = computed(
  () =>
    props.detecting &&
    props.liveMidi != null &&
    props.liveMidi >= MIDI_LO &&
    props.liveMidi <= MIDI_HI
)

function isBlackKey(midi: number): boolean {
  const n = midi % 12
  return n === 1 || n === 3 || n === 6 || n === 8 || n === 10
}

function barStyle(bar: TrackBar): Record<string, string> {
  const h = rowH.value
  const gap = Math.min(2, h * 0.2)
  return {
    left: `${bar.start * PX_PER_UNIT}px`,
    width: `${Math.max(4, (bar.end - bar.start) * PX_PER_UNIT)}px`,
    top: `${(MIDI_HI - bar.midi) * h + gap / 2}px`,
    height: `${Math.max(2, h - gap)}px`
  }
}

function syncViewportHeight() {
  const el = viewportRef.value
  if (!el) return
  viewportHeight.value = el.clientHeight
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  syncViewportHeight()
  if (!viewportRef.value) return
  resizeObserver = new ResizeObserver(() => syncViewportHeight())
  resizeObserver.observe(viewportRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div class="singing-waterfall">
    <div class="singing-waterfall__legend">
      <span class="singing-waterfall__chip singing-waterfall__chip--ref">{{
        t('singing.waterfall.reference')
      }}</span>
      <span class="singing-waterfall__chip singing-waterfall__chip--sung">{{
        t('singing.waterfall.sung')
      }}</span>
      <span class="singing-waterfall__chip singing-waterfall__chip--live">{{
        t('singing.waterfall.livePitch')
      }}</span>
    </div>

    <div ref="viewportRef" class="singing-waterfall__viewport">
      <div class="singing-waterfall__roll" :style="{ height: `${trackHeight}px` }">
        <div
          v-for="midi in pianoRollMidis"
          :key="midi"
          class="singing-waterfall__row"
          :class="{
            'singing-waterfall__row--black': isBlackKey(midi),
            'singing-waterfall__row--c': midi % 12 === 0
          }"
          :style="{ top: `${(MIDI_HI - midi) * rowH}px`, height: `${rowH}px` }"
        >
          <span v-if="midi % 12 === 0" class="singing-waterfall__row-label">{{
            midiLabel(midi)
          }}</span>
        </div>

        <div class="singing-waterfall__notes-clip" :style="{ left: `${LABEL_W}px` }">
          <div
            class="singing-waterfall__notes"
            :style="{
              width: `${timelineWidthPx}px`,
              transform: `translate3d(${notesTranslateX - LABEL_W}px, 0, 0)`
            }"
          >
            <div
              v-for="(bar, idx) in playBars"
              :key="`play-${idx}`"
              class="singing-waterfall__note"
              :style="barStyle(bar)"
            />
            <div
              v-for="(bar, idx) in playedBars"
              :key="`played-${idx}`"
              class="singing-waterfall__note singing-waterfall__note--played"
              :style="barStyle(bar)"
            />
          </div>
        </div>

        <div class="singing-waterfall__playhead" :style="{ left: `${BASELINE_X}px` }">
          <div class="singing-waterfall__playhead-glow" />
          <div class="singing-waterfall__playhead-line" />
          <div
            v-show="pitchDotVisible"
            class="singing-waterfall__pitch-dot"
            :style="{ top: `${pitchDotTop}px` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.singing-waterfall {
  --sw-bg0: #1a1420;
  --sw-bg1: #241a2c;
  --sw-grid: rgba(255, 210, 230, 0.06);
  --sw-ref: #ff8ab8;
  --sw-sung: #6be0b0;
  --sw-live: #ffd166;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.singing-waterfall__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.singing-waterfall__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #6a4a5c;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 184, 208, 0.35);
}

.singing-waterfall__chip::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.singing-waterfall__chip--ref::before {
  background: var(--sw-ref);
  box-shadow: 0 0 0 3px rgba(255, 138, 184, 0.25);
}

.singing-waterfall__chip--sung::before {
  background: var(--sw-sung);
  box-shadow: 0 0 0 3px rgba(107, 224, 176, 0.25);
}

.singing-waterfall__chip--live::before {
  background: var(--sw-live);
  box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.25);
}

.singing-waterfall__viewport {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 18px;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(255, 120, 170, 0.16), transparent 55%),
    radial-gradient(90% 70% at 100% 100%, rgba(150, 110, 255, 0.14), transparent 50%),
    linear-gradient(180deg, var(--sw-bg1), var(--sw-bg0));
  border: 1px solid rgba(255, 184, 208, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 10px 28px rgba(40, 16, 40, 0.12);
}

.singing-waterfall__roll {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.singing-waterfall__row {
  position: absolute;
  left: 0;
  right: 0;
  box-sizing: border-box;
  border-bottom: 1px solid var(--sw-grid);
  z-index: 0;
}

.singing-waterfall__row--black {
  background: rgba(0, 0, 0, 0.18);
}

.singing-waterfall__row--c {
  border-bottom-color: rgba(255, 184, 208, 0.22);
}

.singing-waterfall__row-label {
  position: relative;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  width: 34px;
  height: 100%;
  padding-left: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #d7b4c6;
  background: linear-gradient(90deg, rgba(26, 20, 32, 0.95), rgba(26, 20, 32, 0.35));
  box-sizing: border-box;
}

.singing-waterfall__notes-clip {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.singing-waterfall__notes {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  will-change: transform;
}

.singing-waterfall__note {
  position: absolute;
  border-radius: 5px;
  background: linear-gradient(180deg, rgba(255, 170, 205, 0.85), rgba(255, 110, 170, 0.72));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12) inset,
    0 2px 8px rgba(255, 100, 160, 0.25);
  box-sizing: border-box;
}

.singing-waterfall__note--played {
  background: linear-gradient(180deg, rgba(130, 240, 195, 0.92), rgba(70, 210, 150, 0.78));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.16) inset,
    0 2px 10px rgba(70, 210, 150, 0.28);
  z-index: 2;
}

.singing-waterfall__playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  z-index: 3;
  pointer-events: none;
}

.singing-waterfall__playhead-glow {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -18px;
  width: 36px;
  background: linear-gradient(90deg, transparent, rgba(255, 120, 170, 0.18), transparent);
}

.singing-waterfall__playhead-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  margin-left: -1px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffd1e2, #ff6b9d 40%, #d98cff);
  box-shadow: 0 0 12px rgba(255, 120, 170, 0.65);
}

.singing-waterfall__pitch-dot {
  position: absolute;
  left: 0;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6d6, var(--sw-live) 55%, #f0a020);
  box-shadow:
    0 0 0 3px rgba(255, 209, 102, 0.28),
    0 0 16px rgba(255, 200, 80, 0.55);
  animation: singing-pitch-pulse 1.1s ease-in-out infinite;
}

@keyframes singing-pitch-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
</style>
