<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'
import { usePitchDetection } from '@renderer/views/tools/usePitchDetection'

defineOptions({ name: 'PitchDetectionToolView' })

const MIDI_MIN = 21
const MIDI_MAX = 108
const MIDI_SPAN = MIDI_MAX - MIDI_MIN

/** 典型声部 / 普通人音域（教材常用近似），lane 横向错开 */
const VOICE_BANDS = [
  { key: 'bass' as const, midiMin: 40, midiMax: 64, lane: 0, color: 'rgba(96, 140, 200, 0.28)' },
  { key: 'averageMale' as const, midiMin: 45, midiMax: 69, lane: 1, color: 'rgba(200, 180, 120, 0.28)' },
  { key: 'tenor' as const, midiMin: 48, midiMax: 72, lane: 2, color: 'rgba(220, 140, 160, 0.28)' },
  { key: 'alto' as const, midiMin: 53, midiMax: 77, lane: 3, color: 'rgba(120, 180, 150, 0.28)' },
  { key: 'averageFemale' as const, midiMin: 57, midiMax: 81, lane: 4, color: 'rgba(240, 170, 140, 0.28)' },
  { key: 'soprano' as const, midiMin: 60, midiMax: 84, lane: 5, color: 'rgba(180, 140, 220, 0.28)' }
]

const LANE_COUNT = VOICE_BANDS.length
const LANE_GAP = 1.2

const { t } = useI18n()
const {
  supported,
  active,
  error,
  result,
  silenceRmsThreshold,
  applySilenceThreshold,
  start,
  stop
} = usePitchDetection()

const hasPitch = computed(() => result.frequency > 0 && result.midi > 0)
const frequencyText = computed(() =>
  hasPitch.value ? `${result.frequency.toFixed(1)} Hz` : '—'
)
const midiText = computed(() => (hasPitch.value ? String(result.midi) : '—'))
const pitchText = computed(() => (hasPitch.value ? result.pitch || '—' : '—'))

function midiToTopPercent(midi: number): number {
  return ((MIDI_MAX - midi) / MIDI_SPAN) * 100
}

function midiRangeHeightPercent(midiMin: number, midiMax: number): number {
  return ((midiMax - midiMin) / MIDI_SPAN) * 100
}

/** 高音在上：MIDI 108 → 21 */
const pianoKeys = computed(() => {
  const keys: { midi: number; black: boolean; name: string }[] = []
  for (let midi = MIDI_MAX; midi >= MIDI_MIN; midi--) {
    const pc = midi % 12
    keys.push({
      midi,
      black: pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10,
      name: noteNameToNoteString(midiToNoteName(midi))
    })
  }
  return keys
})

const voiceBands = computed(() => {
  const laneWidth = (100 - LANE_GAP * (LANE_COUNT - 1)) / LANE_COUNT
  return VOICE_BANDS.map((band) => ({
    ...band,
    label: t(`tools.pitch.bands.${band.key}`),
    style: {
      top: `${midiToTopPercent(band.midiMax)}%`,
      height: `${midiRangeHeightPercent(band.midiMin, band.midiMax)}%`,
      left: `${band.lane * (laneWidth + LANE_GAP)}%`,
      width: `${laneWidth}%`,
      background: band.color
    }
  }))
})

/** 用频率换连续 MIDI，条带平滑浮动 */
const midiFloat = computed(() => {
  if (!hasPitch.value) return null
  const hz = result.frequency
  if (!(hz > 0)) return null
  return 69 + 12 * Math.log2(hz / 440)
})

const activeMidi = computed(() => {
  if (midiFloat.value == null) return null
  return Math.round(Math.min(MIDI_MAX, Math.max(MIDI_MIN, midiFloat.value)))
})

const barTopPercent = computed(() => {
  if (midiFloat.value == null) return 50
  const clamped = Math.min(MIDI_MAX, Math.max(MIDI_MIN, midiFloat.value))
  return midiToTopPercent(clamped)
})

async function toggle() {
  if (active.value) {
    stop()
    return
  }
  try {
    await start()
  } catch {
    // error 已写入
  }
}
</script>

<template>
  <div class="tool-page">
    <header class="tool-page__header">
      <BackButton fallback="/tools" />
      <h1 class="tool-page__title">{{ t('tools.pitch.title') }}</h1>
    </header>

    <main class="tool-page__main">
      <div class="pitch-left">
        <section class="tool-card">
          <h2 class="tool-card__title">{{ t('tools.pitch.controls') }}</h2>
          <p v-if="!supported" class="tool-hint tool-hint--error">
            {{ t('tools.pitch.unsupported') }}
          </p>
          <template v-else>
            <div class="actions">
              <button
                type="button"
                class="primary-btn"
                :class="{ 'is-active': active }"
                @click="toggle"
              >
                {{ active ? t('tools.pitch.stop') : t('tools.pitch.start') }}
              </button>
            </div>

            <label class="field">
              <span class="field__label">
                {{ t('tools.pitch.silenceThreshold') }} · {{ silenceRmsThreshold.toFixed(3) }}
              </span>
              <input
                class="field__range"
                type="range"
                min="0.005"
                max="0.1"
                step="0.001"
                :value="silenceRmsThreshold"
                @input="
                  applySilenceThreshold(Number(($event.target as HTMLInputElement).value))
                "
              />
              <span class="field__hint">{{ t('tools.pitch.silenceHint') }}</span>
            </label>

            <p v-if="error" class="tool-hint tool-hint--error">{{ error }}</p>
            <p class="tool-hint">{{ t('tools.pitch.hint') }}</p>
          </template>
        </section>

        <section class="tool-card pitch-readout" :class="{ 'is-live': active && hasPitch }">
          <h2 class="tool-card__title">{{ t('tools.pitch.readout') }}</h2>
          <div class="pitch-hero">{{ pitchText }}</div>
          <div class="pitch-metrics">
            <div class="pitch-metric">
              <span class="pitch-metric__label">{{ t('tools.pitch.frequency') }}</span>
              <span class="pitch-metric__value">{{ frequencyText }}</span>
            </div>
            <div class="pitch-metric">
              <span class="pitch-metric__label">MIDI</span>
              <span class="pitch-metric__value">{{ midiText }}</span>
            </div>
          </div>
          <p v-if="active && !hasPitch" class="tool-hint">{{ t('tools.pitch.waiting') }}</p>
        </section>
      </div>

      <aside class="pitch-right" aria-hidden="true">
        <div class="piano-panel">
          <div class="piano">
            <div
              v-for="key in pianoKeys"
              :key="key.midi"
              class="key-slot"
              :class="{
                'is-black': key.black,
                'is-white': !key.black,
                'is-active': activeMidi === key.midi
              }"
            >
              <div v-if="key.black" class="key-black">
                <span class="key-label">{{ key.name }} {{ key.midi }}</span>
              </div>
              <div v-else class="key-white">
                <span class="key-label">{{ key.name }} {{ key.midi }}</span>
              </div>
            </div>
          </div>
          <div class="pitch-rail">
            <div
              v-for="band in voiceBands"
              :key="band.key"
              class="voice-band"
              :style="band.style"
            >
              <span class="voice-band__label">{{ band.label }}</span>
            </div>
            <div
              class="pitch-bar"
              :class="{ 'is-visible': hasPitch }"
              :style="{ top: `${barTopPercent}%` }"
            />
          </div>
        </div>
      </aside>
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
  display: flex;
  gap: 16px;
  padding: 16px 18px 18px;
  box-sizing: border-box;
}

.pitch-left {
  flex: 0 1 420px;
  min-width: 260px;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pitch-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
}

.piano-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  padding: 8px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.12);
  box-sizing: border-box;
}

.piano {
  flex: 0 0 118px;
  width: 118px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px 0 0 10px;
  overflow: hidden;
  background: #efe8f6;
  box-shadow: inset 0 0 0 1px rgba(90, 70, 110, 0.12);
}

.key-slot {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
}

.key-white {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: 4px;
  background: linear-gradient(90deg, #fff 0%, #f7f2fb 100%);
  border-bottom: 1px solid rgba(90, 70, 110, 0.1);
  box-sizing: border-box;
}

.key-black {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 62%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 3px;
  border-radius: 3px 0 0 3px;
  background: linear-gradient(90deg, #3a3148 0%, #1c1628 100%);
  box-shadow: -1px 0 0 rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
  z-index: 1;
}

.key-label {
  font-size: 7px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.key-white .key-label {
  color: #7a6a8a;
}

.key-black .key-label {
  color: rgba(255, 248, 251, 0.88);
}

.key-slot.is-active .key-white {
  background: linear-gradient(90deg, #ffe0ef 0%, #ffc2dd 100%);
}

.key-slot.is-active .key-white .key-label {
  color: #5c4a6a;
}

.key-slot.is-active .key-black {
  background: linear-gradient(90deg, #ff8fba 0%, #d978a8 100%);
}

.key-slot.is-active .key-black .key-label {
  color: #fff;
}

.pitch-rail {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-left: 2px;
  border-radius: 0 10px 10px 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(248, 240, 255, 0.92), rgba(255, 248, 251, 0.92));
  box-shadow: inset 0 0 0 1px rgba(90, 70, 110, 0.08);
}

.voice-band {
  position: absolute;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  pointer-events: none;
}

.voice-band__label {
  font-size: 11px;
  font-weight: 800;
  color: rgba(70, 55, 90, 0.78);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.08em;
  user-select: none;
}

.pitch-bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: 0;
  background: linear-gradient(90deg, #ff9ec5, #c9b8ff 40%, #9ec8ff);
  box-shadow: 0 2px 12px rgba(255, 143, 186, 0.5);
  transform: translateY(-50%);
  opacity: 0;
  z-index: 5;
  transition:
    top 0.05s linear,
    opacity 0.15s ease;
  pointer-events: none;
}

.pitch-bar.is-visible {
  opacity: 0.95;
}

.tool-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.12);
}

.tool-card__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 800;
}

.tool-hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: #9a8aa8;
}

.tool-hint--error {
  color: #b91c1c;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.primary-btn {
  min-height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
}

.primary-btn.is-active {
  background: linear-gradient(135deg, #8a7ab8, #6a5a88);
  box-shadow: 0 4px 14px rgba(106, 90, 136, 0.28);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field__label {
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.field__range {
  width: min(420px, 100%);
  accent-color: #ff8fba;
}

.field__hint {
  font-size: 12px;
  color: #9a8aa8;
}

.pitch-readout.is-live {
  border-color: rgba(255, 143, 186, 0.65);
  box-shadow: 0 10px 28px rgba(255, 143, 186, 0.2);
}

.pitch-hero {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  text-align: center;
  color: #5c4a6a;
  padding: 12px 0 8px;
}

.pitch-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.pitch-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(248, 240, 255, 0.85);
}

.pitch-metric__label {
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.pitch-metric__value {
  font-size: 22px;
  font-weight: 800;
  color: #5c4a6a;
}

@media (max-width: 720px) {
  .tool-page__main {
    flex-direction: column;
  }

  .pitch-left {
    flex: 0 0 auto;
    max-width: none;
    max-height: 38%;
  }

  .pitch-right {
    flex: 1;
    min-height: 240px;
  }
}
</style>
