<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TuneJudgeScoreSnapshot } from '@deciphony/tune-judge'

const visible = defineModel<boolean>({ default: false })

const props = defineProps<{
  score: TuneJudgeScoreSnapshot
}>()

const { t } = useI18n()

function ratioPct(real: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((real / total) * 1000) / 10)
}

const pitchPct = computed(() => ratioPct(props.score.real.pitchScore, props.score.total.pitchScore))
const rhythmPct = computed(() =>
  ratioPct(props.score.real.rhythmScore, props.score.total.rhythmScore)
)
const completenessPct = computed(() =>
  ratioPct(props.score.real.completenessScore, props.score.total.completenessScore)
)

const overallPct = computed(() =>
  Math.round(((pitchPct.value + rhythmPct.value + completenessPct.value) / 3) * 10) / 10
)

const gradeKey = computed(() => {
  const v = overallPct.value
  if (v >= 90) return 'singing.result.gradeS'
  if (v >= 80) return 'singing.result.gradeA'
  if (v >= 70) return 'singing.result.gradeB'
  if (v >= 60) return 'singing.result.gradeC'
  return 'singing.result.gradeD'
})

const metrics = computed(() => [
  {
    key: 'pitch',
    label: t('singing.result.pitch'),
    pct: pitchPct.value,
    real: props.score.real.pitchScore,
    total: props.score.total.pitchScore,
    tone: 'rose'
  },
  {
    key: 'rhythm',
    label: t('singing.result.rhythm'),
    pct: rhythmPct.value,
    real: props.score.real.rhythmScore,
    total: props.score.total.rhythmScore,
    tone: 'violet'
  },
  {
    key: 'completeness',
    label: t('singing.result.completeness'),
    pct: completenessPct.value,
    real: props.score.real.completenessScore,
    total: props.score.total.completenessScore,
    tone: 'mint'
  }
])

const RING = 2 * Math.PI * 42

function ringOffset(pct: number): number {
  return RING * (1 - Math.min(100, Math.max(0, pct)) / 100)
}

function close() {
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="singing-result" role="dialog" aria-modal="true">
      <div class="singing-result__backdrop" @click="close" />
      <div class="singing-result__card">
        <div class="singing-result__glow" aria-hidden="true" />
        <p class="singing-result__eyebrow">{{ t('singing.result.title') }}</p>
        <div class="singing-result__hero">
          <div class="singing-result__overall-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle class="singing-result__ring-track" cx="50" cy="50" r="42" />
              <circle
                class="singing-result__ring-value"
                cx="50"
                cy="50"
                r="42"
                :style="{ strokeDashoffset: ringOffset(overallPct) }"
              />
            </svg>
            <div class="singing-result__overall-text">
              <span class="singing-result__overall-inner">
                <span class="singing-result__overall-pct">{{ overallPct }}</span>
                <span class="singing-result__overall-unit">%</span>
              </span>
            </div>
          </div>
          <div class="singing-result__hero-copy">
            <h2 class="singing-result__grade">{{ t(gradeKey) }}</h2>
            <p class="singing-result__hint">{{ t('singing.result.subtitle') }}</p>
          </div>
        </div>

        <div class="singing-result__metrics">
          <article
            v-for="m in metrics"
            :key="m.key"
            class="singing-result__metric"
            :data-tone="m.tone"
          >
            <div class="singing-result__metric-head">
              <span class="singing-result__metric-label">{{ m.label }}</span>
              <span class="singing-result__metric-pct">{{ m.pct }}%</span>
            </div>
            <div class="singing-result__bar">
              <div class="singing-result__bar-fill" :style="{ width: `${m.pct}%` }" />
            </div>
            <p class="singing-result__metric-raw">{{ m.real }} / {{ m.total }}</p>
          </article>
        </div>

        <button type="button" class="singing-result__btn" @click="close">
          {{ t('singing.result.ok') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.singing-result {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.singing-result__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(28, 12, 28, 0.55);
  backdrop-filter: blur(8px);
}

.singing-result__card {
  position: relative;
  width: min(100%, 420px);
  padding: 28px 24px 22px;
  border-radius: 24px;
  border: 1px solid rgba(255, 184, 208, 0.5);
  background: linear-gradient(165deg, #fff8fb 0%, #f7efff 55%, #fff5f8 100%);
  box-shadow:
    0 28px 64px rgba(40, 12, 36, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.singing-result__glow {
  position: absolute;
  inset: -35% -15% auto;
  height: 55%;
  background: radial-gradient(circle, rgba(255, 160, 196, 0.4), transparent 68%);
  pointer-events: none;
}

.singing-result__eyebrow {
  position: relative;
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b07a94;
  text-align: center;
}

.singing-result__hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
}

.singing-result__overall-ring {
  position: relative;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
}

.singing-result__overall-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.singing-result__ring-track,
.singing-result__ring-value {
  fill: none;
  stroke-width: 8;
}

.singing-result__ring-track {
  stroke: rgba(255, 184, 208, 0.35);
}

.singing-result__ring-value {
  stroke: #ff7aae;
  stroke-linecap: round;
  stroke-dasharray: 263.89;
  transition: stroke-dashoffset 0.55s ease;
}

.singing-result__overall-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.singing-result__overall-inner {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 1px;
  transform: translateY(1px);
}

.singing-result__overall-pct {
  font-size: 28px;
  font-weight: 800;
  color: #5c3d52;
  line-height: 1;
}

.singing-result__overall-unit {
  font-size: 13px;
  font-weight: 700;
  color: #b07a94;
  line-height: 1;
}

.singing-result__hero-copy {
  min-width: 0;
  text-align: left;
}

.singing-result__grade {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #5c3d52;
  letter-spacing: 0.02em;
}

.singing-result__hint {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: #9a7588;
}

.singing-result__metrics {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 22px;
}

.singing-result__metric {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 184, 208, 0.35);
}

.singing-result__metric-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.singing-result__metric-label {
  font-size: 13px;
  font-weight: 700;
  color: #6a4a5c;
}

.singing-result__metric-pct {
  font-size: 15px;
  font-weight: 800;
  color: #5c3d52;
}

.singing-result__bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 184, 208, 0.28);
  overflow: hidden;
}

.singing-result__bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.45s ease;
}

.singing-result__metric[data-tone='rose'] .singing-result__bar-fill {
  background: linear-gradient(90deg, #ff9ec0, #ff6b9d);
}

.singing-result__metric[data-tone='violet'] .singing-result__bar-fill {
  background: linear-gradient(90deg, #c4a8ff, #9b7bff);
}

.singing-result__metric[data-tone='mint'] .singing-result__bar-fill {
  background: linear-gradient(90deg, #8fdfc0, #4ec89a);
}

.singing-result__metric-raw {
  margin: 6px 0 0;
  font-size: 11px;
  color: #a88898;
}

.singing-result__btn {
  position: relative;
  display: block;
  width: 100%;
  margin-top: 20px;
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #ff8ab5, #d98cff);
  box-shadow: 0 10px 24px rgba(255, 120, 170, 0.35);
}

.singing-result__btn:hover {
  filter: brightness(1.04);
}
</style>
