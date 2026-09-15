<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import {
  RHYTHM_SENSE_BEAT_OPTIONS,
  RHYTHM_SENSE_MAX_ROUNDS,
  RHYTHM_SENSE_MIN_ROUNDS,
  type RhythmSenseBeatCount
} from '@renderer/constant/rhythmSenseTest'
import { useRhythmSenseTest } from '@renderer/views/abilityTest/useRhythmSenseTest'

defineOptions({ name: 'RhythmSenseTestView' })

const { t } = useI18n()
const {
  phase,
  beats,
  totalRounds,
  countdownLabel,
  currentBpm,
  tapCount,
  ringPulse,
  lastRoundResult,
  progressText,
  finalAvgDeviationMs,
  bestRound,
  setBeats,
  setTotalRounds,
  startTest,
  handleTap,
  playAgain,
  backToSetup
} = useRhythmSenseTest()

function formatMs(value: number) {
  if (!Number.isFinite(value)) return '—'
  return `${Math.round(value)}`
}

function onKeyDown(event: KeyboardEvent) {
  if (event.code !== 'Space' && event.key !== ' ') return
  if (event.repeat) return
  const target = event.target
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return
  }
  event.preventDefault()
  void handleTap()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="rhythm-page">
    <header class="rhythm-page__header">
      <BackButton fallback="/ability-test" />
      <h1 class="rhythm-page__title">{{ t('rhythmSenseTest.title') }}</h1>
      <span v-if="phase !== 'setup'" class="rhythm-page__progress">{{ progressText }}</span>
    </header>

    <main class="rhythm-page__main">
      <!-- 状态0：设置 -->
      <section v-if="phase === 'setup'" class="rhythm-panel">
        <h2 class="rhythm-panel__heading">{{ t('rhythmSenseTest.setup.heading') }}</h2>

        <label class="rhythm-field">
          <span class="rhythm-field__label">{{ t('rhythmSenseTest.setup.beats') }}</span>
          <div class="rhythm-field__options">
            <button
              v-for="option in RHYTHM_SENSE_BEAT_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': beats === option }"
              @click="setBeats(option as RhythmSenseBeatCount)"
            >
              {{ t('rhythmSenseTest.setup.beatsOption', { count: option }) }}
            </button>
          </div>
        </label>

        <label class="rhythm-field">
          <span class="rhythm-field__label">{{ t('rhythmSenseTest.setup.rounds') }}</span>
          <el-input-number
            :model-value="totalRounds"
            :min="RHYTHM_SENSE_MIN_ROUNDS"
            :max="RHYTHM_SENSE_MAX_ROUNDS"
            :step="1"
            controls-position="right"
            @update:model-value="(v) => setTotalRounds(Number(v ?? RHYTHM_SENSE_MIN_ROUNDS))"
          />
        </label>

        <button type="button" class="primary-btn" @click="startTest">
          {{ t('rhythmSenseTest.setup.start') }}
        </button>
      </section>

      <!-- 状态1：倒计时 -->
      <section v-else-if="phase === 'countdown'" class="rhythm-stage rhythm-stage--center">
        <p class="countdown-label" aria-live="polite">{{ countdownLabel }}</p>
      </section>

      <!-- 状态2：听拍 -->
      <section v-else-if="phase === 'listen'" class="rhythm-stage rhythm-stage--center">
        <p class="stage-kicker">{{ t('rhythmSenseTest.listen.kicker') }}</p>
        <p class="stage-bpm">BPM {{ currentBpm }}</p>
        <p class="stage-hint">{{ t('rhythmSenseTest.listen.hint', { count: beats }) }}</p>
      </section>

      <!-- 状态3：敲击 -->
      <section v-else-if="phase === 'tap'" class="rhythm-stage rhythm-stage--center">
        <p class="stage-kicker">{{ t('rhythmSenseTest.tap.kicker') }}</p>
        <p class="stage-bpm">BPM {{ currentBpm }}</p>
        <button
          type="button"
          class="tap-ring"
          :class="{ 'tap-ring--pulse': ringPulse > 0 }"
          :aria-label="t('rhythmSenseTest.tap.aria')"
          @click="handleTap"
        >
          <span :key="ringPulse" class="tap-ring__pulse" />
          <span class="tap-ring__label">{{ tapCount }} / {{ beats }}</span>
        </button>
        <p class="stage-hint">{{ t('rhythmSenseTest.tap.hint') }}</p>
      </section>

      <!-- 单轮结果 -->
      <section v-else-if="phase === 'roundResult'" class="rhythm-stage rhythm-stage--center">
        <p class="stage-kicker">{{ t('rhythmSenseTest.roundResult.kicker') }}</p>
        <p class="result-value">
          {{ t('rhythmSenseTest.roundResult.avgDeviation', { ms: formatMs(lastRoundResult?.avgDeviationMs ?? 0) }) }}
        </p>
        <p class="stage-hint">{{ t('rhythmSenseTest.roundResult.nextHint') }}</p>
      </section>

      <!-- 状态4：总结果 -->
      <section v-else class="rhythm-panel">
        <h2 class="rhythm-panel__heading">{{ t('rhythmSenseTest.final.heading') }}</h2>
        <p class="result-value">
          {{ t('rhythmSenseTest.final.avgDeviation', { ms: formatMs(finalAvgDeviationMs) }) }}
        </p>
        <p v-if="bestRound" class="final-best">
          {{
            t('rhythmSenseTest.final.bestRound', {
              round: bestRound.roundIndex,
              bpm: bestRound.bpm,
              ms: formatMs(bestRound.avgDeviationMs)
            })
          }}
        </p>
        <div class="final-actions">
          <button type="button" class="primary-btn" @click="playAgain">
            {{ t('rhythmSenseTest.final.playAgain') }}
          </button>
          <button type="button" class="ghost-btn" @click="backToSetup">
            {{ t('rhythmSenseTest.final.reset') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.rhythm-page {
  --text: #5c4a6a;
  --text-soft: #9a8aa8;
  --pink: #ff8fb8;
  --card: rgba(255, 255, 255, 0.86);
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--text);
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.rhythm-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.rhythm-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.rhythm-page__progress {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
}

.rhythm-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 40px;
}

.rhythm-panel {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 24px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--card);
  box-shadow: var(--shadow);
}

.rhythm-panel__heading {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.rhythm-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rhythm-field__label {
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.rhythm-field__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.8);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.chip--active {
  background: rgba(255, 143, 184, 0.22);
  border-color: var(--pink);
  color: #b64f7a;
}

.primary-btn,
.ghost-btn {
  min-height: 44px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
  box-shadow: 0 8px 20px rgba(255, 143, 184, 0.35);
}

.ghost-btn {
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.75);
  color: var(--text);
}

.final-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rhythm-stage {
  width: min(480px, 100%);
}

.rhythm-stage--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.countdown-label {
  margin: 0;
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 24px rgba(255, 220, 120, 0.55),
    0 0 48px rgba(255, 140, 180, 0.35);
  animation: countdown-pop 0.35s ease-out;
}

.stage-kicker {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.stage-bpm {
  margin: 0;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 0.04em;
  background: linear-gradient(90deg, #ff8fb8, #8ec5ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stage-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-soft);
}

.result-value {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.final-best {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-soft);
  text-align: center;
}

.tap-ring {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 6px solid rgba(255, 143, 184, 0.55);
  background: radial-gradient(circle at 35% 30%, #fff 0%, #ffe8f2 45%, #e8f4ff 100%);
  box-shadow: var(--shadow);
  cursor: pointer;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.tap-ring__label {
  position: relative;
  z-index: 1;
  font-size: 28px;
  font-weight: 800;
  color: #8a5a72;
}

.tap-ring__pulse {
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  border: 3px solid rgba(255, 143, 184, 0.65);
  animation: ring-jump 0.35s ease-out;
  pointer-events: none;
}

@keyframes countdown-pop {
  0% {
    transform: scale(0.6);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ring-jump {
  0% {
    transform: scale(0.72);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}
</style>
