<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClefTypeEnum, KeySignatureTypeEnum } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import { GAME_NOTATION_MODE_OPTIONS } from '@renderer/constant/gameSettings'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useVirtualPianoSkin } from '@renderer/utils/collection/useVirtualPianoSkin'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'
import NoteSliceBlockContent from '@renderer/views/noteSlice/NoteSliceBlockContent.vue'
import {
  NOTE_SLICE_BLOCK_SHELL_HEIGHT,
  NOTE_SLICE_BLOCK_SHELL_WIDTH
} from '@renderer/views/noteSlice/noteSliceGameConstants'
import { NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES } from '@renderer/views/noteSlice/noteSliceSpawnClefs'
import type { MidiBrickClef } from '@renderer/views/noteSlice/midiBrickBuilder'
import {
  NOTE_PRACTICE_ACCIDENTAL_OPTIONS,
  NOTE_PRACTICE_CLEF_OPTIONS,
  NOTE_PRACTICE_COUNT_MAX,
  NOTE_PRACTICE_COUNT_MIN,
  NOTE_PRACTICE_KEY_OPTIONS,
  NOTE_PRACTICE_MIDI_MAX,
  NOTE_PRACTICE_MIDI_MIN
} from '@renderer/views/abilityTest/notePractice'
import { useNotePractice } from '@renderer/views/abilityTest/useNotePractice'

defineOptions({ name: 'NotePracticeView' })

const { t } = useI18n()
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()
const { pianoSkin, virtualPianoSkinId } = useVirtualPianoSkin()
const {
  settings,
  candidateMidis,
  phase,
  current,
  feedback,
  feedbackSeq,
  completed,
  wrongPresses,
  elapsedMs,
  progressText,
  summary,
  pianoRange,
  setCount,
  setMidiRange,
  start,
  finish,
  backToSetup
} = useNotePractice()

const BLOCK_PAD = 16
const blockViewBox = `${-BLOCK_PAD} ${-BLOCK_PAD} ${NOTE_SLICE_BLOCK_SHELL_WIDTH + BLOCK_PAD * 2} ${NOTE_SLICE_BLOCK_SHELL_HEIGHT + BLOCK_PAD * 2}`

const startFailed = ref(false)

function midiLabel(midi: number): string {
  return noteNameToNoteString(midiToNoteName(midi)).replace('#', '♯')
}

function rangeLabel(range: { min: number; max: number }): string {
  return `${midiLabel(range.min)}–${midiLabel(range.max)}`
}

const isJianpu = computed(() => settings.notationMode === 'jianpu')

const midiRange = computed<number[]>({
  get: () => [settings.midiMin, settings.midiMax],
  set: (value) => setMidiRange([value[0] ?? settings.midiMin, value[1] ?? settings.midiMax])
})

const staffRangeHint = computed(() =>
  t('notePractice.setup.staffRangeHint', {
    treble: rangeLabel(NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES[ClefTypeEnum.Treble]),
    alto: rangeLabel(NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES[ClefTypeEnum.Alto]),
    bass: rangeLabel(NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES[ClefTypeEnum.Bass])
  })
)

const canStart = computed(() => candidateMidis.value.length > 0)

function toggleClef(clef: MidiBrickClef) {
  const index = settings.clefs.indexOf(clef)
  if (index >= 0) settings.clefs.splice(index, 1)
  else settings.clefs.push(clef)
}

function toggleKey(key: KeySignatureTypeEnum) {
  const index = settings.keySignatures.indexOf(key)
  if (index >= 0) settings.keySignatures.splice(index, 1)
  else settings.keySignatures.push(key)
}

function selectAllKeys() {
  settings.keySignatures = NOTE_PRACTICE_KEY_OPTIONS.map((option) => option.value)
}

function selectOnlyC() {
  settings.keySignatures = [KeySignatureTypeEnum.C]
}

function onStart() {
  startFailed.value = !start()
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatMs(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${Math.round(value)}`
}
</script>

<template>
  <div class="quiz-page">
    <header class="quiz-page__header">
      <BackButton fallback="/ability-test" />
      <h1 class="quiz-page__title">{{ t('notePractice.title') }}</h1>
      <span v-if="phase === 'running'" class="quiz-page__progress">{{ progressText }}</span>
    </header>

    <main class="quiz-page__main">
      <section v-if="phase === 'setup'" class="quiz-panel quiz-panel--wide">
        <h2 class="quiz-panel__heading">{{ t('notePractice.setup.heading') }}</h2>

        <div class="quiz-field">
          <span class="quiz-field__label">{{ t('notePractice.setup.notation') }}</span>
          <div class="quiz-field__options">
            <button
              v-for="option in GAME_NOTATION_MODE_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': settings.notationMode === option }"
              @click="settings.notationMode = option"
            >
              {{ t(`notePractice.setup.notationOptions.${option}`) }}
            </button>
          </div>
        </div>

        <div v-if="!isJianpu" class="quiz-field">
          <span class="quiz-field__label">{{ t('notePractice.setup.clefs') }}</span>
          <div class="quiz-field__options">
            <button
              v-for="option in NOTE_PRACTICE_CLEF_OPTIONS"
              :key="option.key"
              type="button"
              class="chip"
              :class="{ 'chip--active': settings.clefs.includes(option.value) }"
              @click="toggleClef(option.value)"
            >
              {{ t(`notePractice.setup.clefOptions.${option.key}`) }}
            </button>
          </div>
          <span class="quiz-field__hint">{{ staffRangeHint }}</span>
        </div>

        <div class="quiz-field">
          <span class="quiz-field__label">
            {{ t('notePractice.setup.keySignatures') }}
            <button type="button" class="link-btn" @click="selectAllKeys">
              {{ t('notePractice.setup.keyAll') }}
            </button>
            <button type="button" class="link-btn" @click="selectOnlyC">
              {{ t('notePractice.setup.keyOnlyC') }}
            </button>
          </span>
          <div class="quiz-field__options">
            <button
              v-for="option in NOTE_PRACTICE_KEY_OPTIONS"
              :key="option.value"
              type="button"
              class="chip chip--key"
              :class="{ 'chip--active': settings.keySignatures.includes(option.value) }"
              @click="toggleKey(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="quiz-field">
          <span class="quiz-field__label">{{ t('notePractice.setup.accidentals') }}</span>
          <div class="quiz-field__options">
            <button
              v-for="option in NOTE_PRACTICE_ACCIDENTAL_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ 'chip--active': settings.accidentals === option }"
              :disabled="isJianpu && option === 'double'"
              @click="settings.accidentals = option"
            >
              {{ t(`notePractice.setup.accidentalOptions.${option}`) }}
            </button>
          </div>
          <span v-if="isJianpu" class="quiz-field__hint">
            {{ t('notePractice.setup.jianpuDoubleHint') }}
          </span>
        </div>

        <div class="quiz-field">
          <span class="quiz-field__label">
            {{ t('notePractice.setup.range') }}
            <span class="quiz-field__value">
              {{ rangeLabel({ min: settings.midiMin, max: settings.midiMax }) }} · MIDI
              {{ settings.midiMin }}–{{ settings.midiMax }}
            </span>
          </span>
          <el-slider
            v-model="midiRange"
            range
            :min="NOTE_PRACTICE_MIDI_MIN"
            :max="NOTE_PRACTICE_MIDI_MAX"
            :format-tooltip="midiLabel"
          />
          <span class="quiz-field__hint" :class="{ 'quiz-field__hint--error': !canStart }">
            {{
              canStart
                ? t('notePractice.setup.candidateCount', { count: candidateMidis.length })
                : t('notePractice.setup.noCandidates')
            }}
          </span>
        </div>

        <div class="quiz-field">
          <span class="quiz-field__label">{{ t('notePractice.setup.count') }}</span>
          <div class="quiz-field__row">
            <el-input-number
              :model-value="settings.count"
              :min="NOTE_PRACTICE_COUNT_MIN"
              :max="NOTE_PRACTICE_COUNT_MAX"
              :disabled="settings.infinite"
              controls-position="right"
              @update:model-value="(v) => setCount(Number(v ?? NOTE_PRACTICE_COUNT_MIN))"
            />
            <el-checkbox v-model="settings.infinite">{{ t('notePractice.setup.infinite') }}</el-checkbox>
          </div>
        </div>

        <div class="quiz-field quiz-field--switches">
          <label class="switch-row">
            <span>{{ t('notePractice.setup.playTargetSound') }}</span>
            <el-switch v-model="settings.playTargetSound" />
          </label>
          <label class="switch-row">
            <span>{{ t('notePractice.setup.keySound') }}</span>
            <el-switch v-model="settings.keySound" />
          </label>
          <label class="switch-row">
            <span>{{ t('notePractice.setup.showPiano') }}</span>
            <el-switch v-model="settings.showPiano" />
          </label>
        </div>

        <p v-if="startFailed" class="quiz-field__hint quiz-field__hint--error">
          {{ t('notePractice.setup.noCandidates') }}
        </p>
        <button type="button" class="primary-btn" :disabled="!canStart" @click="onStart">
          {{ t('notePractice.setup.start') }}
        </button>
      </section>

      <section v-else-if="phase === 'running'" class="practice-stage">
        <div class="practice-stats">
          <span>{{ t('notePractice.play.completed', { count: completed }) }}</span>
          <span>{{ t('notePractice.play.wrong', { count: wrongPresses }) }}</span>
          <span>{{ t('notePractice.play.elapsed', { time: formatClock(elapsedMs) }) }}</span>
        </div>

        <div class="practice-block-wrap">
          <div v-if="current" :key="current.id" class="practice-block">
            <svg
              class="practice-block__svg"
              :viewBox="blockViewBox"
              xmlns="http://www.w3.org/2000/svg"
            >
              <NoteSliceBlockContent
                :x="0"
                :y="0"
                :music-score="current.musicScore"
                :skin="scoreSkin"
                :skin-name="scoreSkinName"
              />
            </svg>
          </div>
          <div
            v-if="feedback !== 'idle'"
            :key="feedbackSeq"
            class="practice-flash"
            :class="`practice-flash--${feedback}`"
          />
        </div>

        <p class="practice-hint">
          {{ settings.showPiano ? t('notePractice.play.hint') : t('notePractice.play.hintNoPiano') }}
        </p>

        <div class="practice-actions">
          <button type="button" class="primary-btn" @click="finish">
            {{ t('notePractice.play.finish') }}
          </button>
          <button type="button" class="ghost-btn" @click="backToSetup">
            {{ t('notePractice.play.abort') }}
          </button>
        </div>
      </section>

      <section v-else class="quiz-panel">
        <h2 class="quiz-panel__heading">{{ t('notePractice.final.heading') }}</h2>
        <p class="result-value">
          {{ t('notePractice.final.accuracy', { percent: `${Math.round(summary.accuracyPercent)}%` }) }}
        </p>
        <ul class="final-stats">
          <li>{{ t('notePractice.final.completed', { count: summary.completed }) }}</li>
          <li>{{ t('notePractice.final.wrong', { count: summary.wrongPresses }) }}</li>
          <li>{{ t('notePractice.final.avgResponse', { ms: formatMs(summary.avgResponseMs) }) }}</li>
          <li>{{ t('notePractice.final.bestStreak', { count: summary.bestStreak }) }}</li>
          <li>{{ t('notePractice.final.elapsed', { time: formatClock(summary.elapsedMs) }) }}</li>
        </ul>
        <div class="final-actions">
          <button type="button" class="primary-btn" @click="onStart">
            {{ t('notePractice.final.playAgain') }}
          </button>
          <button type="button" class="ghost-btn" @click="backToSetup">
            {{ t('notePractice.final.reset') }}
          </button>
        </div>
      </section>
    </main>

    <footer v-if="phase === 'running' && settings.showPiano && pianoSkin" class="practice-piano">
      <VirtualPiano
        :key="`${virtualPianoSkinId ?? 'default'}-${pianoRange.min}-${pianoRange.max}`"
        layout-mode="fillParent"
        height="140px"
        :midi="pianoRange"
        pitch-notation="None"
      />
    </footer>
  </div>
</template>

<style scoped>
.quiz-page {
  --text: #5c4a6a;
  --text-soft: #9a8aa8;
  --pink: #ff8fb8;
  --card: rgba(255, 255, 255, 0.86);
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--text);
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.quiz-page__header {
  flex-shrink: 0;
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
  min-height: 0;
  overflow: auto;
  display: flex;
  padding: 28px 20px 40px;
}

.quiz-panel {
  width: min(480px, 100%);
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px 24px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: var(--card);
  box-shadow: var(--shadow);
  box-sizing: border-box;
}

.quiz-panel--wide {
  width: min(600px, 100%);
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.quiz-field__value {
  font-weight: 600;
  color: var(--text-soft);
}

.quiz-field__hint {
  font-size: 12px;
  color: var(--text-soft);
}

.quiz-field__hint--error {
  margin: 0;
  color: #d9466f;
}

.quiz-field__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quiz-field__row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quiz-field--switches {
  gap: 6px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: #d0679a;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
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

.chip--key {
  min-width: 64px;
}

.chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.practice-stage {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.practice-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-soft);
}

.practice-block-wrap {
  position: relative;
  width: min(420px, 48vh, 80vw);
  aspect-ratio: 1;
}

.practice-block {
  position: absolute;
  inset: 0;
}

.practice-block__svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 28px rgba(200, 140, 180, 0.32));
}

.practice-flash {
  position: absolute;
  inset: 4%;
  border-radius: 18px;
  pointer-events: none;
  animation: practice-flash 0.45s ease-out forwards;
}

.practice-flash--wrong {
  box-shadow:
    0 0 0 5px rgba(239, 68, 68, 0.85),
    0 0 36px rgba(239, 68, 68, 0.6);
  animation-name: practice-flash, practice-shake;
}

.practice-hint {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-soft);
}

.practice-actions {
  display: flex;
  gap: 12px;
}

.practice-piano {
  flex-shrink: 0;
  padding: 0 12px 12px;
}

@keyframes practice-flash {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes practice-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
</style>
