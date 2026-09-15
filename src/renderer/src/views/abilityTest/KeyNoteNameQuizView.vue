<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import OctavePiano from '@renderer/components/OctavePiano.vue'
import {
  ABSOLUTE_PITCH_DEFAULT_ROUNDS,
  ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MAX_ROUNDS,
  ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MIN_ROUNDS,
  ABSOLUTE_PITCH_SCALE_OPTIONS,
  KEY_NOTE_DEFAULT_COUNTDOWN_SEC,
  KEY_NOTE_OPTION_LABEL_MODES,
  type AbsolutePitchScaleMode,
  type KeyNoteOptionLabelMode
} from '@renderer/constant/absolutePitchTest'
import { useKeyNoteNameQuiz } from '@renderer/views/abilityTest/useKeyNoteNameQuiz'

defineOptions({ name: 'KeyNoteNameQuizView' })

const { t } = useI18n()
const {
  phase,
  scaleMode,
  labelMode,
  totalRounds,
  countdownSec,
  countdownLeft,
  ringStatus,
  choices,
  selectedPitchClass,
  lastRoundResult,
  pianoKeyStates,
  progressText,
  summary,
  setScaleMode,
  setLabelMode,
  setTotalRounds,
  setCountdownSec,
  startTest,
  selectChoice,
  playAgain,
  backToSetup
} = useKeyNoteNameQuiz()

function formatMs(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${Math.round(value)}`
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function choiceClass(pitchClass: number) {
  if (phase.value !== 'result' || !lastRoundResult.value) return {}
  const target = lastRoundResult.value.targetPitchClass
  const selected = selectedPitchClass.value
  return {
    'choice--correct': pitchClass === target,
    'choice--wrong': selected === pitchClass && pitchClass !== target
  }
}
</script>

<template>
  <div class="quiz-page">
    <header class="quiz-page__header">
      <BackButton fallback="/ability-test" />
      <h1 class="quiz-page__title">{{ t('keyNoteNameQuiz.title') }}</h1>
      <span v-if="phase !== 'setup'" class="quiz-page__progress">{{ progressText }}</span>
    </header>

    <main class="quiz-page__main">
      <section v-if="phase === 'setup'" class="quiz-panel">
        <h2 class="quiz-panel__heading">{{ t('keyNoteNameQuiz.setup.heading') }}</h2>

        <label class="quiz-field">
          <span class="quiz-field__label">{{ t('keyNoteNameQuiz.setup.scale') }}</span>
          <div class="quiz-field__options">
            <button
              v-for="option in ABSOLUTE_PITCH_SCALE_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': scaleMode === option }"
              @click="setScaleMode(option as AbsolutePitchScaleMode)"
            >
              {{ t(`keyNoteNameQuiz.setup.scaleOptions.${option}`) }}
            </button>
          </div>
        </label>

        <label class="quiz-field">
          <span class="quiz-field__label">{{ t('keyNoteNameQuiz.setup.labelMode') }}</span>
          <div class="quiz-field__options">
            <button
              v-for="option in KEY_NOTE_OPTION_LABEL_MODES"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': labelMode === option }"
              @click="setLabelMode(option as KeyNoteOptionLabelMode)"
            >
              {{ t(`keyNoteNameQuiz.setup.labelModeOptions.${option}`) }}
            </button>
          </div>
        </label>

        <label class="quiz-field">
          <span class="quiz-field__label">{{ t('keyNoteNameQuiz.setup.rounds') }}</span>
          <el-input-number
            :model-value="totalRounds"
            :min="ABSOLUTE_PITCH_MIN_ROUNDS"
            :max="ABSOLUTE_PITCH_MAX_ROUNDS"
            controls-position="right"
            @update:model-value="(v) => setTotalRounds(Number(v ?? ABSOLUTE_PITCH_DEFAULT_ROUNDS))"
          />
        </label>

        <label class="quiz-field">
          <span class="quiz-field__label">{{ t('keyNoteNameQuiz.setup.countdown') }}</span>
          <el-input-number
            :model-value="countdownSec"
            :min="ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC"
            :max="ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC"
            controls-position="right"
            @update:model-value="
              (v) => setCountdownSec(Number(v ?? KEY_NOTE_DEFAULT_COUNTDOWN_SEC))
            "
          />
        </label>

        <button type="button" class="primary-btn" @click="startTest">
          {{ t('keyNoteNameQuiz.setup.start') }}
        </button>
      </section>

      <section v-else-if="phase === 'question' || phase === 'result'" class="quiz-stage">
        <div
          class="quiz-ring"
          :class="{
            'quiz-ring--correct': ringStatus === 'correct',
            'quiz-ring--wrong': ringStatus === 'wrong'
          }"
        >
          <template v-if="phase === 'question'">
            <span class="quiz-ring__countdown">{{ countdownLeft }}</span>
            <span class="quiz-ring__hint">{{ t('keyNoteNameQuiz.question.hint') }}</span>
          </template>
          <template v-else>
            <span class="quiz-ring__result">
              {{
                lastRoundResult?.correct
                  ? t('keyNoteNameQuiz.result.correct')
                  : lastRoundResult?.timedOut
                    ? t('keyNoteNameQuiz.result.timeout')
                    : t('keyNoteNameQuiz.result.wrong')
              }}
            </span>
          </template>
        </div>

        <OctavePiano
          class="quiz-stage__piano"
          :key-states="pianoKeyStates"
          label-mode="none"
          disabled
          height="160px"
        />

        <div class="choice-grid">
          <button
            v-for="choice in choices"
            :key="choice.pitchClass"
            type="button"
            class="choice"
            :class="choiceClass(choice.pitchClass)"
            :disabled="phase !== 'question'"
            @click="selectChoice(choice.pitchClass)"
          >
            {{ choice.label }}
          </button>
        </div>

        <button
          v-if="phase === 'question'"
          type="button"
          class="ghost-btn"
          @click="backToSetup"
        >
          {{ t('keyNoteNameQuiz.question.abort') }}
        </button>
      </section>

      <section v-else class="quiz-panel">
        <h2 class="quiz-panel__heading">{{ t('keyNoteNameQuiz.final.heading') }}</h2>
        <p class="result-value">
          {{
            t('keyNoteNameQuiz.final.accuracy', { percent: formatPercent(summary.accuracyPercent) })
          }}
        </p>
        <ul class="final-stats">
          <li>
            {{
              t('keyNoteNameQuiz.final.counts', {
                correct: summary.correctCount,
                wrong: summary.wrongCount,
                timeout: summary.timeoutCount,
                total: summary.total
              })
            }}
          </li>
          <li>
            {{ t('keyNoteNameQuiz.final.avgResponse', { ms: formatMs(summary.avgResponseMs) }) }}
          </li>
          <li>
            {{ t('keyNoteNameQuiz.final.bestStreak', { count: summary.bestStreak }) }}
          </li>
        </ul>
        <div class="final-actions">
          <button type="button" class="primary-btn" @click="playAgain">
            {{ t('keyNoteNameQuiz.final.playAgain') }}
          </button>
          <button type="button" class="ghost-btn" @click="backToSetup">
            {{ t('keyNoteNameQuiz.final.reset') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.quiz-page {
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

.quiz-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.quiz-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.quiz-page__progress {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
}

.quiz-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px 40px;
}

.quiz-panel {
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

.quiz-panel__heading {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.quiz-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-field__label {
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.quiz-field__options {
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
  padding: 0 20px;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
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

.quiz-stage {
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.quiz-ring {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 6px solid rgba(255, 143, 184, 0.55);
  background: radial-gradient(circle at 35% 30%, #fff 0%, #ffe8f2 45%, #e8f4ff 100%);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quiz-ring--correct {
  border-color: #22c55e;
}

.quiz-ring--wrong {
  border-color: #ef4444;
}

.quiz-ring__countdown {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
}

.quiz-ring__hint {
  font-size: 13px;
  font-weight: 700;
}

.quiz-ring__result {
  font-size: 28px;
  font-weight: 800;
}

.quiz-stage__piano {
  width: 100%;
}

.choice-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.choice {
  min-height: 48px;
  border-radius: 14px;
  border: 2px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.88);
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.choice:disabled {
  cursor: default;
}

.choice--correct {
  border-color: #22c55e;
  color: #15803d;
  background: rgba(34, 197, 94, 0.12);
}

.choice--wrong {
  border-color: #ef4444;
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
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
  color: var(--text-soft);
  text-align: center;
}
</style>
