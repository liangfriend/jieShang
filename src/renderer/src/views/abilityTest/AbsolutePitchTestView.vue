<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import OctavePiano from '@renderer/components/OctavePiano.vue'
import {
  ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_DEFAULT_ROUNDS,
  ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MAX_ROUNDS,
  ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MIN_ROUNDS,
  ABSOLUTE_PITCH_SCALE_OPTIONS,
  type AbsolutePitchScaleMode,
  type AbsolutePitchSoundRange,
  type OctavePianoLabelMode
} from '@renderer/constant/absolutePitchTest'
import { useAbsolutePitchTest } from '@renderer/views/abilityTest/useAbsolutePitchTest'

defineOptions({ name: 'AbsolutePitchTestView' })

const { t } = useI18n()
const {
  phase,
  scaleMode,
  soundRange,
  totalRounds,
  countdownSec,
  labelMode,
  countdownLeft,
  ringStatus,
  lastRoundResult,
  pianoKeyStates,
  progressText,
  summary,
  pianoDisabled,
  setScaleMode,
  setSoundRange,
  setLabelMode,
  setTotalRounds,
  setCountdownSec,
  startTest,
  replaySound,
  selectPitch,
  playAgain,
  backToSetup
} = useAbsolutePitchTest()

function formatMs(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${Math.round(value)}`
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
</script>

<template>
  <div class="pitch-page">
    <header class="pitch-page__header">
      <BackButton fallback="/ability-test" />
      <h1 class="pitch-page__title">{{ t('absolutePitchTest.title') }}</h1>
      <span v-if="phase !== 'setup'" class="pitch-page__progress">{{ progressText }}</span>
    </header>

    <main class="pitch-page__main">
      <!-- 状态0：设置 -->
      <section v-if="phase === 'setup'" class="pitch-panel">
        <h2 class="pitch-panel__heading">{{ t('absolutePitchTest.setup.heading') }}</h2>

        <label class="pitch-field">
          <span class="pitch-field__label">{{ t('absolutePitchTest.setup.scale') }}</span>
          <div class="pitch-field__options">
            <button
              v-for="option in ABSOLUTE_PITCH_SCALE_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': scaleMode === option }"
              @click="setScaleMode(option as AbsolutePitchScaleMode)"
            >
              {{ t(`absolutePitchTest.setup.scaleOptions.${option}`) }}
            </button>
          </div>
        </label>

        <label class="pitch-field">
          <span class="pitch-field__label">{{ t('absolutePitchTest.setup.soundRange') }}</span>
          <div class="pitch-field__options">
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': soundRange === 'standard' }"
              @click="setSoundRange('standard' as AbsolutePitchSoundRange)"
            >
              {{ t('absolutePitchTest.setup.soundRangeOptions.standard') }}
            </button>
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': soundRange === 'full' }"
              @click="setSoundRange('full' as AbsolutePitchSoundRange)"
            >
              {{ t('absolutePitchTest.setup.soundRangeOptions.full') }}
            </button>
          </div>
        </label>

        <label class="pitch-field">
          <span class="pitch-field__label">{{ t('absolutePitchTest.setup.labelMode') }}</span>
          <div class="pitch-field__options">
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': labelMode === 'noteName' }"
              @click="setLabelMode('noteName' as OctavePianoLabelMode)"
            >
              {{ t('absolutePitchTest.setup.labelModeOptions.noteName') }}
            </button>
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': labelMode === 'solfege' }"
              @click="setLabelMode('solfege' as OctavePianoLabelMode)"
            >
              {{ t('absolutePitchTest.setup.labelModeOptions.solfege') }}
            </button>
            <button
              type="button"
              class="chip"
              :class="{ 'chip--active': labelMode === 'number' }"
              @click="setLabelMode('number' as OctavePianoLabelMode)"
            >
              {{ t('absolutePitchTest.setup.labelModeOptions.number') }}
            </button>
          </div>
        </label>

        <label class="pitch-field">
          <span class="pitch-field__label">{{ t('absolutePitchTest.setup.rounds') }}</span>
          <el-input-number
            :model-value="totalRounds"
            :min="ABSOLUTE_PITCH_MIN_ROUNDS"
            :max="ABSOLUTE_PITCH_MAX_ROUNDS"
            :step="1"
            controls-position="right"
            @update:model-value="(v) => setTotalRounds(Number(v ?? ABSOLUTE_PITCH_DEFAULT_ROUNDS))"
          />
        </label>

        <label class="pitch-field">
          <span class="pitch-field__label">{{ t('absolutePitchTest.setup.countdown') }}</span>
          <el-input-number
            :model-value="countdownSec"
            :min="ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC"
            :max="ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC"
            :step="1"
            controls-position="right"
            @update:model-value="
              (v) => setCountdownSec(Number(v ?? ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC))
            "
          />
        </label>

        <button type="button" class="primary-btn" @click="startTest">
          {{ t('absolutePitchTest.setup.start') }}
        </button>
      </section>

      <!-- 状态1/2：答题与结果反馈 -->
      <section v-else-if="phase === 'question' || phase === 'result'" class="pitch-stage">
        <button
          type="button"
          class="pitch-ring"
          :class="{
            'pitch-ring--correct': ringStatus === 'correct',
            'pitch-ring--wrong': ringStatus === 'wrong'
          }"
          :aria-label="t('absolutePitchTest.question.replayAria')"
          :disabled="phase !== 'question'"
          @click="replaySound"
        >
          <template v-if="phase === 'question'">
            <span class="pitch-ring__countdown">{{ countdownLeft }}</span>
            <span class="pitch-ring__hint">{{ t('absolutePitchTest.question.replayHint') }}</span>
          </template>
          <template v-else>
            <span class="pitch-ring__result">
              {{
                lastRoundResult?.correct
                  ? t('absolutePitchTest.result.correct')
                  : lastRoundResult?.timedOut
                    ? t('absolutePitchTest.result.timeout')
                    : t('absolutePitchTest.result.wrong')
              }}
            </span>
          </template>
        </button>

        <OctavePiano
          class="pitch-stage__piano"
          :key-states="pianoKeyStates"
          :label-mode="labelMode"
          :disabled="pianoDisabled"
          height="168px"
          @select="selectPitch"
        />

        <button
          v-if="phase === 'question'"
          type="button"
          class="ghost-btn pitch-stage__abort"
          @click="backToSetup"
        >
          {{ t('absolutePitchTest.question.abort') }}
        </button>
      </section>

      <!-- 状态3：总结果 -->
      <section v-else class="pitch-panel">
        <h2 class="pitch-panel__heading">{{ t('absolutePitchTest.final.heading') }}</h2>
        <p class="result-value">
          {{
            t('absolutePitchTest.final.accuracy', {
              percent: formatPercent(summary.accuracyPercent)
            })
          }}
        </p>
        <ul class="final-stats">
          <li>
            {{
              t('absolutePitchTest.final.counts', {
                correct: summary.correctCount,
                wrong: summary.wrongCount,
                timeout: summary.timeoutCount,
                total: summary.total
              })
            }}
          </li>
          <li>
            {{
              t('absolutePitchTest.final.avgResponse', {
                ms: formatMs(summary.avgResponseMs)
              })
            }}
          </li>
          <li>
            {{
              t('absolutePitchTest.final.bestStreak', {
                count: summary.bestStreak
              })
            }}
          </li>
        </ul>
        <div class="final-actions">
          <button type="button" class="primary-btn" @click="playAgain">
            {{ t('absolutePitchTest.final.playAgain') }}
          </button>
          <button type="button" class="ghost-btn" @click="backToSetup">
            {{ t('absolutePitchTest.final.reset') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pitch-page {
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

.pitch-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.pitch-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.pitch-page__progress {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
}

.pitch-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 40px;
}

.pitch-panel {
  width: min(460px, 100%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px 24px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--card);
  box-shadow: var(--shadow);
}

.pitch-panel__heading {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.pitch-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pitch-field__label {
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.pitch-field__options {
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

.pitch-stage {
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.pitch-ring {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 6px solid rgba(255, 143, 184, 0.55);
  background: radial-gradient(circle at 35% 30%, #fff 0%, #ffe8f2 45%, #e8f4ff 100%);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text);
}

.pitch-ring:disabled {
  cursor: default;
}

.pitch-ring--correct {
  border-color: #22c55e;
}

.pitch-ring--wrong {
  border-color: #ef4444;
}

.pitch-ring__countdown {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
}

.pitch-ring__hint,
.pitch-ring__result {
  font-size: 14px;
  font-weight: 700;
}

.pitch-ring__result {
  font-size: 28px;
}

.pitch-stage__piano {
  width: 100%;
}

.pitch-stage__abort {
  min-width: 160px;
  padding: 0 20px;
}

.result-value {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  text-align: center;
}

.final-stats {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-soft);
  text-align: center;
}
</style>
