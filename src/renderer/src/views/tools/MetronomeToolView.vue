<script lang="ts" setup>
import { TIME_SIGNATURE_TYPES_ORDERED, TimeSignatureTypeEnum } from '@deciphony/renderer'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { PLAY_BPM_MAX, PLAY_BPM_MIN } from '@renderer/constant/play'
import { resolveTimeSignatureLabel } from '@renderer/i18n/helpers'
import { useMetronomeStore } from '@renderer/store/metronome.store'

defineOptions({ name: 'MetronomeToolView' })

type PanelKind = 'timeSignature' | 'bpm' | 'volume' | null

const { t } = useI18n()
const metronome = useMetronomeStore()
const { bpm, playing, timeSignatureType, volumePercent, ready } = storeToRefs(metronome)

const activePanel = ref<PanelKind>(null)
const rulerRef = ref<HTMLElement | null>(null)
const dragging = ref(false)

const RULER_HEIGHT = 420
const RULER_WIDTH = 120
const TRACK_X = 48
const PAD_TOP = 16
const PAD_BOTTOM = 16
const trackHeight = RULER_HEIGHT - PAD_TOP - PAD_BOTTOM

const timeSignatureOptions = TIME_SIGNATURE_TYPES_ORDERED

const bpmTicks = computed(() => {
  const ticks: { bpm: number; major: boolean; y: number }[] = []
  for (let value = PLAY_BPM_MIN; value <= PLAY_BPM_MAX; value += 5) {
    const major = value % 20 === 0
    ticks.push({ bpm: value, major, y: bpmToY(value) })
  }
  return ticks
})

const thumbY = computed(() => bpmToY(bpm.value))

function bpmToY(value: number): number {
  const clamped = Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, value))
  const t = (PLAY_BPM_MAX - clamped) / (PLAY_BPM_MAX - PLAY_BPM_MIN)
  return PAD_TOP + t * trackHeight
}

function yToBpm(y: number): number {
  const t = (y - PAD_TOP) / trackHeight
  const raw = PLAY_BPM_MAX - t * (PLAY_BPM_MAX - PLAY_BPM_MIN)
  return Math.round(Math.min(PLAY_BPM_MAX, Math.max(PLAY_BPM_MIN, raw)))
}

function togglePanel(kind: Exclude<PanelKind, null>) {
  activePanel.value = activePanel.value === kind ? null : kind
}

function onTimeSignatureChange(value: TimeSignatureTypeEnum) {
  void metronome.setTimeSignatureType(value)
}

function onBpmInput(raw: string | number) {
  const next = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(next)) return
  metronome.setBpm(next)
}

function setBpmFromClientY(clientY: number) {
  const el = rulerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const y = ((clientY - rect.top) / rect.height) * RULER_HEIGHT
  metronome.setBpm(yToBpm(y))
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  setBpmFromClientY(event.clientY)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  setBpmFromClientY(event.clientY)
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false
  try {
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  } catch {
    // ignore
  }
}

async function togglePlay() {
  await metronome.toggleLoop()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.metro-btn-wrap')) {
    activePanel.value = null
  }
}

onMounted(async () => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  await metronome.waitReady()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  metronome.stop()
})
</script>

<template>
  <div class="tool-page">
    <header class="tool-page__header">
      <BackButton fallback="/tools" />
      <h1 class="tool-page__title">{{ t('tools.metronome.title') }}</h1>
    </header>

    <main class="tool-page__main">
      <div class="metro-top">
        <div class="metro-btn-wrap">
          <button
            type="button"
            class="metro-btn"
            :class="{ 'is-active': activePanel === 'timeSignature' }"
            @click="togglePanel('timeSignature')"
          >
            {{ t('tools.metronome.timeSignature') }}
          </button>
          <div v-if="activePanel === 'timeSignature'" class="metro-panel">
            <label class="metro-panel__label">{{ t('tools.metronome.timeSignature') }}</label>
            <select
              class="metro-select"
              :value="timeSignatureType"
              @change="
                onTimeSignatureChange(
                  (($event.target as HTMLSelectElement).value as TimeSignatureTypeEnum)
                )
              "
            >
              <option v-for="item in timeSignatureOptions" :key="item" :value="item">
                {{ resolveTimeSignatureLabel(item) }}
              </option>
            </select>
          </div>
        </div>

        <div class="metro-btn-wrap">
          <button
            type="button"
            class="metro-btn"
            :class="{ 'is-active': activePanel === 'bpm' }"
            @click="togglePanel('bpm')"
          >
            BPM
          </button>
          <div v-if="activePanel === 'bpm'" class="metro-panel">
            <label class="metro-panel__label">BPM</label>
            <div class="metro-bpm-row">
              <button type="button" class="step-btn" @click="metronome.setBpm(bpm - 1)">−</button>
              <input
                class="metro-number"
                type="number"
                :min="PLAY_BPM_MIN"
                :max="PLAY_BPM_MAX"
                :value="bpm"
                @change="onBpmInput(($event.target as HTMLInputElement).value)"
              />
              <button type="button" class="step-btn" @click="metronome.setBpm(bpm + 1)">+</button>
            </div>
            <p class="metro-hint">{{ PLAY_BPM_MIN }} – {{ PLAY_BPM_MAX }}</p>
          </div>
        </div>

        <div class="metro-btn-wrap">
          <button
            type="button"
            class="metro-btn"
            :class="{ 'is-active': activePanel === 'volume' }"
            @click="togglePanel('volume')"
          >
            {{ t('tools.metronome.volume') }}
          </button>
          <div v-if="activePanel === 'volume'" class="metro-panel">
            <label class="metro-panel__label">
              {{ t('tools.metronome.volume') }} · {{ volumePercent }}%
            </label>
            <input
              class="metro-range"
              type="range"
              min="0"
              max="100"
              :value="volumePercent"
              @input="volumePercent = Number(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <section class="metro-stage">
        <div class="metro-readout">
          <span class="metro-readout__bpm">{{ bpm }}</span>
          <span class="metro-readout__unit">BPM</span>
          <span class="metro-readout__ts">{{ resolveTimeSignatureLabel(timeSignatureType) }}</span>
        </div>

        <div
          ref="rulerRef"
          class="metro-ruler"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <svg
            class="metro-ruler__svg"
            :viewBox="`0 0 ${RULER_WIDTH} ${RULER_HEIGHT}`"
            :width="RULER_WIDTH"
            :height="RULER_HEIGHT"
            aria-hidden="true"
          >
            <line
              :x1="TRACK_X"
              :y1="PAD_TOP"
              :x2="TRACK_X"
              :y2="RULER_HEIGHT - PAD_BOTTOM"
              class="metro-ruler__track"
            />
            <template v-for="tick in bpmTicks" :key="tick.bpm">
              <line
                :x1="TRACK_X - (tick.major ? 18 : 10)"
                :y1="tick.y"
                :x2="TRACK_X + (tick.major ? 18 : 10)"
                :y2="tick.y"
                class="metro-ruler__tick"
                :class="{ 'is-major': tick.major }"
              />
              <text
                v-if="tick.major"
                :x="TRACK_X + 26"
                :y="tick.y + 4"
                class="metro-ruler__label"
              >
                {{ tick.bpm }}
              </text>
            </template>
            <circle
              :cx="TRACK_X"
              :cy="thumbY"
              r="14"
              class="metro-ruler__thumb"
              :class="{ 'is-dragging': dragging }"
            />
            <circle :cx="TRACK_X" :cy="thumbY" r="5" class="metro-ruler__thumb-dot" />
          </svg>
        </div>

        <button
          type="button"
          class="metro-play"
          :class="{ 'is-playing': playing }"
          :disabled="!ready"
          @click="togglePlay"
        >
          {{ playing ? t('tools.metronome.stop') : t('tools.metronome.play') }}
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.tool-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.tool-page__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.tool-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.tool-page__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 16px 28px;
  box-sizing: border-box;
}

.metro-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 520px;
}

.metro-btn-wrap {
  position: relative;
}

.metro-btn {
  min-width: 96px;
  padding: 10px 16px;
  border: 1px solid rgba(201, 184, 255, 0.65);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #6a5a88;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.metro-btn.is-active {
  border-color: #ff8fba;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  color: #fff;
}

.metro-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  z-index: 20;
  min-width: 180px;
  padding: 12px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 248, 251, 0.98);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.22);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metro-panel__label {
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.metro-select,
.metro-number {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 8px;
  background: #fff;
  color: #5c4a6a;
  font-size: 14px;
  box-sizing: border-box;
}

.metro-bpm-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metro-bpm-row .metro-number {
  width: 72px;
  text-align: center;
}

.step-btn {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(201, 184, 255, 0.65);
  border-radius: 8px;
  background: #fff;
  color: #6a5a88;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.metro-range {
  width: 100%;
  accent-color: #ff8fba;
}

.metro-hint {
  margin: 0;
  font-size: 11px;
  color: #9a8aa8;
}

.metro-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 18px 24px 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 36px rgba(200, 140, 180, 0.16);
}

.metro-readout {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.metro-readout__bpm {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: #5c4a6a;
  letter-spacing: -0.03em;
}

.metro-readout__unit {
  font-size: 14px;
  font-weight: 700;
  color: #9a8aa8;
}

.metro-readout__ts {
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.28);
  font-size: 13px;
  font-weight: 700;
  color: #6a5a88;
}

.metro-ruler {
  touch-action: none;
  cursor: ns-resize;
  user-select: none;
}

.metro-ruler__track {
  stroke: rgba(140, 110, 160, 0.35);
  stroke-width: 4;
  stroke-linecap: round;
}

.metro-ruler__tick {
  stroke: rgba(140, 110, 160, 0.35);
  stroke-width: 1.5;
}

.metro-ruler__tick.is-major {
  stroke: rgba(100, 80, 130, 0.55);
  stroke-width: 2;
}

.metro-ruler__label {
  fill: #8a5a72;
  font-size: 11px;
  font-weight: 600;
}

.metro-ruler__thumb {
  fill: #fff;
  stroke: #ff8fba;
  stroke-width: 3;
  filter: drop-shadow(0 4px 10px rgba(255, 143, 186, 0.35));
  transition: r 0.12s ease;
}

.metro-ruler__thumb.is-dragging {
  stroke: #c9b8ff;
}

.metro-ruler__thumb-dot {
  fill: #ff8fba;
  pointer-events: none;
}

.metro-play {
  min-width: 148px;
  padding: 12px 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(255, 158, 197, 0.35);
}

.metro-play:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.metro-play.is-playing {
  background: linear-gradient(135deg, #8a7ab8, #6a5a88);
  box-shadow: 0 6px 18px rgba(106, 90, 136, 0.28);
}
</style>
