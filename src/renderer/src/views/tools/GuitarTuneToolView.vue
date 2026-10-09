<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { usePitchDetection } from '@renderer/views/tools/usePitchDetection'
import { pitchDetectTuning } from '@deciphony/pitch-detection'
import {
  TUNING_INSTRUMENTS,
  findTuningInstrument,
  type TuningString
} from '@renderer/views/tools/tuningInstruments'

defineOptions({ name: 'GuitarTuneToolView' })

/** 音分偏差超过此值视为不准 */
const CENTS_IN_TUNE = 8
/** 指示钮最大偏移对应的音分 */
const CENTS_MAX_OFFSET = 50
/** 弦名按钮在 SVG 坐标中的圆心 x 与半径（琴头两侧外沿） */
const BTN_X_LEFT = -32
const BTN_X_RIGHT = 312
const BTN_R = 21

const { t } = useI18n()
const { supported, active, error, result, start, stop, applySilenceThreshold } = usePitchDetection()

const instrumentId = ref(TUNING_INSTRUMENTS[0]!.id)
const instrument = computed(() => findTuningInstrument(instrumentId.value))
const shape = computed(() => instrument.value.shape)

const selectedId = ref(instrument.value.defaultStringId)

const selectedString = computed<TuningString>(
  () =>
    instrument.value.strings.find((s) => s.id === selectedId.value) ??
    instrument.value.strings[instrument.value.strings.length - 1]!
)

const pegGeometry = computed(() => {
  const { strings, shape: sh } = instrument.value
  return sh.pegs.flatMap((peg) => {
    const s = strings.find((x) => x.id === peg.stringId)
    if (!s) return []
    return [{ ...peg, s, btnX: peg.side === 'left' ? BTN_X_LEFT : BTN_X_RIGHT }]
  })
})

/** 相对中位数超过此音分视为显著离群，结算时剔除 */
const OUTLIER_CENTS = 35
/** 至少采到这么多样本才结算一次读数 */
const MIN_SAMPLES = 4

/**
 * 相对目标空弦的音分（折到最近八度，±600 内）。
 * 正 = 偏高，负 = 偏低。
 */
function centsFromHz(hz: number, targetMidi: number): number | null {
  if (!(hz > 0)) return null
  const detectedMidi = 69 + 12 * Math.log2(hz / 440)
  let diff = detectedMidi - targetMidi
  diff = ((diff % 12) + 12) % 12
  if (diff > 6) diff -= 12
  return diff * 100
}

/** 去掉相对中位数显著偏高/偏低的样本后取均值 */
function robustMeanCents(values: number[]): number | null {
  if (values.length === 0) return null
  if (values.length < 3) {
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  const median =
    sorted.length % 2 === 1
      ? sorted[mid]!
      : (sorted[mid - 1]! + sorted[mid]!) / 2
  const kept = values.filter((v) => Math.abs(v - median) <= OUTLIER_CENTS)
  const use = kept.length >= 2 ? kept : values
  return use.reduce((sum, v) => sum + v, 0) / use.length
}

/** 拨弦期间只采样，旋钮不跟；停声后才结算并移动一次 */
const sampleBuf: number[] = []
const collecting = ref(false)
const displayCents = ref<number | null>(null)

watch(
  () => [result.frequency, result.midi, selectedString.value.midi] as const,
  ([hz, midi, targetMidi]) => {
    const live = midi > 0 ? centsFromHz(hz, targetMidi) : null
    if (live != null) {
      if (!collecting.value) {
        sampleBuf.length = 0
        collecting.value = true
      }
      sampleBuf.push(live)
      return
    }
    if (!collecting.value) return
    collecting.value = false
    if (sampleBuf.length >= MIN_SAMPLES) {
      const mean = robustMeanCents(sampleBuf)
      if (mean != null) displayCents.value = mean
    }
    sampleBuf.length = 0
  }
)

const cents = computed(() => displayCents.value)

const status = computed<'idle' | 'listening' | 'flat' | 'sharp' | 'inTune'>(() => {
  if (collecting.value) return 'listening'
  if (cents.value == null) return 'idle'
  if (Math.abs(cents.value) <= CENTS_IN_TUNE) return 'inTune'
  return cents.value < 0 ? 'flat' : 'sharp'
})

const statusText = computed(() => {
  if (status.value === 'listening') return t('tools.guitarTune.calculating')
  if (status.value === 'flat') return t('tools.guitarTune.tuneUp')
  if (status.value === 'sharp') return t('tools.guitarTune.tuneDown')
  if (status.value === 'inTune') return t('tools.guitarTune.inTune')
  return t('tools.guitarTune.listening')
})

const centsLabel = computed(() => {
  if (cents.value == null) return '—'
  const rounded = Math.round(cents.value)
  return rounded > 0 ? `+${rounded}` : String(rounded)
})

/** 指示钮水平位置：中心 50%，偏低← 偏高→（仅在停声结算后更新） */
const needleLeftPercent = computed(() => {
  if (cents.value == null) return 50
  const clamped = Math.max(-CENTS_MAX_OFFSET, Math.min(CENTS_MAX_OFFSET, cents.value))
  return 50 + (clamped / CENTS_MAX_OFFSET) * 42
})

function resetReading() {
  sampleBuf.length = 0
  collecting.value = false
  displayCents.value = null
}

function selectString(id: number) {
  selectedId.value = id
  resetReading()
}

watch(instrument, (next) => {
  selectedId.value = next.defaultStringId
  resetReading()
  applySilenceThreshold(next.silenceRms)
})

const prevSilenceRms = pitchDetectTuning.silenceRmsThreshold

onMounted(() => {
  applySilenceThreshold(instrument.value.silenceRms)
  if (!supported.value) return
  void start().catch(() => {
    // 权限失败时 error 已写入，可手动再点
  })
})

onBeforeUnmount(() => {
  applySilenceThreshold(prevSilenceRms)
})
</script>

<template>
  <div class="tool-page">
    <header class="tool-page__header">
      <BackButton fallback="/tools" />
      <h1 class="tool-page__title">{{ t('tools.guitarTune.title') }}</h1>
      <button
        v-if="supported"
        type="button"
        class="header-btn"
        :class="{ 'is-active': active }"
        @click="active ? stop() : start()"
      >
        {{ active ? t('tools.guitarTune.stop') : t('tools.guitarTune.start') }}
      </button>
    </header>

    <main class="tool-page__main">
      <section class="tune-left">
        <div class="instrument-picker" role="radiogroup" :aria-label="t('tools.guitarTune.instrument')">
          <button
            v-for="ins in TUNING_INSTRUMENTS"
            :key="ins.id"
            type="button"
            role="radio"
            class="instrument-picker__item"
            :class="{ 'is-selected': instrumentId === ins.id }"
            :aria-checked="instrumentId === ins.id"
            @click="instrumentId = ins.id"
          >
            {{ t(`tools.guitarTune.instruments.${ins.id}`) }}
          </button>
        </div>
        <p v-if="!supported" class="tool-hint tool-hint--error">
          {{ t('tools.guitarTune.unsupported') }}
        </p>
        <p v-else-if="error" class="tool-hint tool-hint--error">{{ error }}</p>
        <p class="tool-hint">
          {{ t('tools.guitarTune.hint', { string: selectedString.id, note: selectedString.label }) }}
        </p>

        <div class="headstock-wrap">
          <svg class="headstock" viewBox="-60 0 400 360">
            <path
              v-if="!shape.shaftUnderBody"
              class="headstock__body"
              :d="shape.bodyPath"
              aria-hidden="true"
            />
            <!-- 旋钮 → 弦柱 -->
            <g v-for="p in pegGeometry" :key="`peg-${p.s.id}`" aria-hidden="true">
              <line
                :x1="p.side === 'left' ? p.pegX + shape.pegR : p.pegX - shape.pegR"
                :y1="p.y"
                :x2="p.postX"
                :y2="p.y"
                class="headstock__shaft"
              />
              <circle :cx="p.pegX" :cy="p.y" :r="shape.pegR" class="headstock__peg" />
              <circle :cx="p.pegX" :cy="p.y" :r="shape.pegR * 0.44" class="headstock__peg-core" />
            </g>
            <path
              v-if="shape.shaftUnderBody"
              class="headstock__body"
              :d="shape.bodyPath"
              aria-hidden="true"
            />
            <!-- 弦：弦枕 → 各自弦柱 -->
            <g class="headstock__strings" aria-hidden="true">
              <g
                v-for="p in pegGeometry"
                :key="`str-${p.s.id}`"
                :stroke="p.s.color"
                :stroke-width="p.s.width"
                :class="{ 'is-selected': selectedId === p.s.id }"
              >
                <line :x1="shape.nutX[p.s.id]" :y1="shape.nutY" :x2="p.postX" :y2="p.y" />
                <line :x1="shape.nutX[p.s.id]" :y1="shape.nutY" :x2="shape.nutX[p.s.id]" y2="360" />
              </g>
            </g>
            <g v-for="p in pegGeometry" :key="`post-${p.s.id}`" aria-hidden="true">
              <circle :cx="p.postX" :cy="p.y" r="5" class="headstock__post" />
            </g>
            <rect
              :x="shape.nutLeft"
              :y="shape.nutY - 4"
              :width="shape.nutRight - shape.nutLeft"
              height="10"
              rx="2"
              class="headstock__nut"
              aria-hidden="true"
            />

            <!-- 弦名按钮与旋钮同高 -->
            <g
              v-for="p in pegGeometry"
              :key="`btn-${p.s.id}`"
              class="string-btn"
              :class="{ 'is-selected': selectedId === p.s.id }"
              role="button"
              tabindex="0"
              :aria-label="t('tools.guitarTune.stringN', { n: p.s.id })"
              :aria-pressed="selectedId === p.s.id"
              @click="selectString(p.s.id)"
              @keydown.enter.prevent="selectString(p.s.id)"
              @keydown.space.prevent="selectString(p.s.id)"
            >
              <title>{{ t('tools.guitarTune.stringN', { n: p.s.id }) }}</title>
              <circle :cx="p.btnX" :cy="p.y" :r="BTN_R" class="string-btn__bg" />
              <text :x="p.btnX" :y="p.y" class="string-btn__label">{{ p.s.label }}</text>
            </g>
          </svg>
        </div>
      </section>

      <section class="tune-right">
        <div
          class="status-badge"
          :class="{
            'is-idle': status === 'idle' || status === 'listening',
            'is-warn': status === 'flat' || status === 'sharp',
            'is-ok': status === 'inTune'
          }"
        >
          {{ statusText }}
        </div>

        <div class="meter">
          <div class="meter__track">
            <div class="meter__center-line" />
            <div
              class="meter__needle"
              :class="{
                'is-idle': cents == null,
                'is-warn': cents != null && Math.abs(cents) > CENTS_IN_TUNE,
                'is-ok': cents != null && Math.abs(cents) <= CENTS_IN_TUNE
              }"
              :style="{ left: `${needleLeftPercent}%` }"
            >
              {{ centsLabel }}
            </div>
          </div>
          <div class="meter__hints">
            <span>{{ t('tools.guitarTune.flatSide') }}</span>
            <span>{{ t('tools.guitarTune.sharpSide') }}</span>
          </div>
        </div>

        <p class="target-line">
          {{ t('tools.guitarTune.target', { string: selectedString.id, note: selectedString.label }) }}
        </p>
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
  flex: 1;
}

.header-btn {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(201, 184, 255, 0.65);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #6a5a88;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.header-btn.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #8a7ab8, #6a5a88);
  color: #fff;
}

.tool-page__main {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 20px;
  padding: 16px 20px 20px;
  box-sizing: border-box;
}

.tune-left {
  flex: 0 1 420px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.tune-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.12);
}

.tool-hint {
  margin: 0;
  font-size: 13px;
  color: #9a8aa8;
}

.tool-hint--error {
  color: #b91c1c;
}

.headstock-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.headstock {
  width: min(100%, 400px);
  height: auto;
  max-height: 100%;
}

.headstock__body {
  fill: #c4a07a;
  stroke: #8a6a4a;
  stroke-width: 2;
}

.headstock__nut {
  fill: #efe6d8;
  stroke: #8a6a4a;
  stroke-width: 1;
}

.headstock__strings line {
  stroke-linecap: round;
}

.headstock__strings .is-selected {
  stroke: #ff6fa8;
  filter: drop-shadow(0 0 2px rgba(255, 111, 168, 0.7));
}

.headstock__peg {
  fill: #d8c4a8;
  stroke: #6a5040;
  stroke-width: 1.5;
}

.headstock__peg-core {
  fill: #5c4a3a;
}

.headstock__shaft {
  stroke: #6a5040;
  stroke-width: 3;
}

.headstock__post {
  fill: #e8dcc8;
  stroke: #6a5040;
  stroke-width: 1.5;
}

.instrument-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  background: rgba(255, 255, 255, 0.8);
  align-self: flex-start;
}

.instrument-picker__item {
  min-height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #6a5a88;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.instrument-picker__item:hover:not(.is-selected) {
  background: rgba(201, 184, 255, 0.2);
}

.instrument-picker__item.is-selected {
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  color: #fff;
  box-shadow: 0 3px 10px rgba(255, 143, 186, 0.35);
}

.string-btn {
  cursor: pointer;
  outline: none;
}

.string-btn__bg {
  fill: rgba(255, 255, 255, 0.95);
  stroke: rgba(201, 184, 255, 0.85);
  stroke-width: 2;
  filter: drop-shadow(0 3px 6px rgba(160, 120, 150, 0.22));
  transition: fill 0.15s ease, stroke 0.15s ease;
}

.string-btn__label {
  fill: #5c4a6a;
  font-size: 17px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
  user-select: none;
}

.string-btn:hover .string-btn__bg,
.string-btn:focus-visible .string-btn__bg {
  stroke: #ff8fba;
}

.string-btn.is-selected .string-btn__bg {
  fill: #ff9ec5;
  stroke: #ff8fba;
}

.string-btn.is-selected .string-btn__label {
  fill: #fff;
}

.status-badge {
  min-width: 120px;
  padding: 10px 22px;
  border-radius: 999px;
  border: 2px solid rgba(160, 150, 180, 0.45);
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #7a6a8a;
  background: rgba(248, 240, 255, 0.9);
}

.status-badge.is-warn {
  border-color: #e85a5a;
  color: #c62828;
  background: rgba(255, 235, 238, 0.95);
}

.status-badge.is-ok {
  border-color: #2e9b63;
  color: #1b7a4a;
  background: rgba(232, 248, 239, 0.95);
}

.meter {
  width: min(100%, 520px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meter__track {
  position: relative;
  height: 120px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255, 180, 180, 0.25), rgba(255, 255, 255, 0.5) 50%, rgba(180, 220, 255, 0.28));
  box-shadow: inset 0 0 0 1px rgba(90, 70, 110, 0.1);
}

.meter__center-line {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 50%;
  width: 3px;
  border-radius: 999px;
  background: rgba(90, 70, 110, 0.45);
  transform: translateX(-50%);
}

.meter__needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #5c4a6a;
  background: #fff;
  border: 3px solid rgba(160, 150, 180, 0.55);
  box-shadow: 0 6px 18px rgba(120, 90, 130, 0.22);
  transform: translate(-50%, -50%);
  transition:
    left 0.35s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  will-change: left;
}

.meter__needle.is-warn {
  border-color: #e85a5a;
  color: #c62828;
}

.meter__needle.is-ok {
  border-color: #2e9b63;
  color: #1b7a4a;
}

.meter__hints {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #9a8aa8;
  padding: 0 4px;
}

.target-line {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #8a5a72;
}

@media (max-width: 860px) {
  .tool-page__main {
    flex-direction: column;
  }

  .tune-left {
    flex: 0 0 auto;
    max-height: 48%;
  }

  .tune-right {
    flex: 1;
  }
}
</style>
