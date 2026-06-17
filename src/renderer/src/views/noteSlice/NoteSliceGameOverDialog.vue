<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { AchievementDefinition } from '@renderer/constant/achievements'
import { GAME_DIFFICULTY_OPTIONS } from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import { formatNoteSliceExtremeHighScore } from '@renderer/utils/noteSliceHighScoreHelper'
import type { NoteSliceGameEndReason, NoteSliceGameMode } from '@renderer/views/noteSlice/noteSliceGameMode'

const props = defineProps<{
  modelValue: boolean
  mode: NoteSliceGameMode
  score: number
  reason?: NoteSliceGameEndReason
  isNewPersonalBest: boolean
  previousBest: number
  newlyUnlockedAchievements?: AchievementDefinition[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  playAgain: []
}>()

const router = useRouter()
const gameSettings = useGameSettingsStore()
const { difficulty } = storeToRefs(gameSettings)

const isExtreme = computed(() => props.mode === 'extreme')

const title = computed(() => {
  if (props.mode === 'arcade' && props.reason === 'time_up') return '时间到'
  if (props.mode === 'endless') return '命用完了'
  if (props.mode === 'extreme') return '挑战结束'
  return '游戏结束'
})

const modeEmoji = computed(() => {
  if (props.mode === 'arcade') return '⚡'
  if (props.mode === 'endless') return '♾'
  return '🔥'
})

const difficultyLabel = computed(() => {
  if (isExtreme.value) return ''
  return GAME_DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty.value)?.label ?? ''
})

const primaryLabel = computed(() => (isExtreme.value ? '本局存活' : '本局得分'))

const primaryDisplay = computed(() =>
  isExtreme.value ? formatNoteSliceExtremeHighScore(props.score) : String(props.score)
)

const bestLabel = computed(() => (isExtreme.value ? '历史最长存活' : '历史最高分'))

const bestDisplay = computed(() => {
  const best = props.isNewPersonalBest ? props.score : props.previousBest
  return isExtreme.value ? formatNoteSliceExtremeHighScore(best) : String(best)
})

const unlockedAchievements = computed(() => props.newlyUnlockedAchievements ?? [])

function close(): void {
  emit('update:modelValue', false)
}

function onPlayAgain(): void {
  close()
  emit('playAgain')
}

function onGoHome(): void {
  close()
  router.push('/')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="note-slice-game-over" role="dialog" aria-modal="true">
      <div class="note-slice-game-over__backdrop" />

      <div class="note-slice-game-over__card">
        <span v-if="isNewPersonalBest" class="note-slice-game-over__corner-badge">新 PR</span>

        <div class="note-slice-game-over__glow" aria-hidden="true" />

        <div class="note-slice-game-over__emoji" aria-hidden="true">{{ modeEmoji }}</div>
        <h2 class="note-slice-game-over__title">{{ title }}</h2>
        <p v-if="difficultyLabel" class="note-slice-game-over__subtitle">
          {{ difficultyLabel }}难度
        </p>

        <div class="note-slice-game-over__stats">
          <div
            class="note-slice-game-over__stat note-slice-game-over__stat--current"
            :class="{ 'note-slice-game-over__stat--highlight': isNewPersonalBest }"
          >
            <span class="note-slice-game-over__stat-label">{{ primaryLabel }}</span>
            <span class="note-slice-game-over__stat-value">{{ primaryDisplay }}</span>
          </div>
          <div class="note-slice-game-over__divider" aria-hidden="true" />
          <div class="note-slice-game-over__stat note-slice-game-over__stat--best">
            <span class="note-slice-game-over__stat-label">{{ bestLabel }}</span>
            <span class="note-slice-game-over__stat-value">{{ bestDisplay }}</span>
          </div>
        </div>

        <section v-if="unlockedAchievements.length > 0" class="note-slice-game-over__achievements">
          <h3 class="note-slice-game-over__achievements-title">本局获得成就</h3>
          <div class="note-slice-game-over__achievements-scroll">
            <article
              v-for="item in unlockedAchievements"
              :key="item.key"
              class="note-slice-game-over__achievement"
            >
              <div class="note-slice-game-over__achievement-head">
                <span class="note-slice-game-over__achievement-name">{{ item.name }}</span>
                <span class="note-slice-game-over__achievement-badge">新</span>
              </div>
              <p class="note-slice-game-over__achievement-desc">{{ item.description }}</p>
              <p v-if="item.reward !== '无'" class="note-slice-game-over__achievement-reward">
                奖励：{{ item.reward }}
              </p>
            </article>
          </div>
        </section>

        <div class="note-slice-game-over__actions">
          <button type="button" class="note-slice-game-over__btn note-slice-game-over__btn--primary" @click="onPlayAgain">
            再来一局
          </button>
          <button type="button" class="note-slice-game-over__btn note-slice-game-over__btn--ghost" @click="onGoHome">
            回到首页
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.note-slice-game-over {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.note-slice-game-over__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 8, 24, 0.72);
  backdrop-filter: blur(6px);
}

.note-slice-game-over__card {
  position: relative;
  width: min(100%, 400px);
  padding: 28px 24px 22px;
  border-radius: 24px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background:
    linear-gradient(165deg, rgba(255, 248, 251, 0.98) 0%, rgba(245, 236, 255, 0.96) 100%);
  box-shadow:
    0 24px 64px rgba(20, 10, 40, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.35) inset;
  text-align: center;
  overflow: hidden;
}

.note-slice-game-over__corner-badge {
  position: absolute;
  top: 14px;
  right: -28px;
  z-index: 2;
  width: 108px;
  padding: 5px 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fff;
  text-align: center;
  background: linear-gradient(90deg, #7bc996, #5aad78);
  box-shadow: 0 4px 14px rgba(90, 173, 120, 0.45);
  transform: rotate(45deg);
  pointer-events: none;
}

.note-slice-game-over__glow {
  position: absolute;
  inset: -40% -20% auto;
  height: 55%;
  background: radial-gradient(circle, rgba(255, 184, 208, 0.35), transparent 70%);
  pointer-events: none;
}

.note-slice-game-over__emoji {
  position: relative;
  font-size: 40px;
  line-height: 1;
  margin-bottom: 8px;
}

.note-slice-game-over__title {
  position: relative;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #5c4a6a;
  letter-spacing: 0.02em;
}

.note-slice-game-over__subtitle {
  position: relative;
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #9a86a8;
}

.note-slice-game-over__stats {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 12px;
  margin-top: 22px;
  padding: 16px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(201, 184, 255, 0.35);
}

.note-slice-game-over__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.note-slice-game-over__stat-label {
  font-size: 12px;
  font-weight: 700;
  color: #9a86a8;
  white-space: nowrap;
}

.note-slice-game-over__stat-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  color: #4a3858;
  font-variant-numeric: tabular-nums;
}

.note-slice-game-over__stat--current .note-slice-game-over__stat-value {
  background: linear-gradient(135deg, #ff8fb8, #c9b8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.note-slice-game-over__stat--highlight {
  position: relative;
}

.note-slice-game-over__divider {
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(201, 184, 255, 0.55) 20%,
    rgba(201, 184, 255, 0.55) 80%,
    transparent
  );
}

.note-slice-game-over__achievements {
  position: relative;
  margin-top: 18px;
  text-align: left;
}

.note-slice-game-over__achievements-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 800;
  color: #7a6890;
  letter-spacing: 0.04em;
}

.note-slice-game-over__achievements-scroll {
  max-height: 168px;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-slice-game-over__achievements-scroll::-webkit-scrollbar {
  width: 6px;
}

.note-slice-game-over__achievements-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.55);
}

.note-slice-game-over__achievement {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 200, 120, 0.45);
  box-shadow: 0 4px 14px rgba(255, 180, 100, 0.12);
}

.note-slice-game-over__achievement-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.note-slice-game-over__achievement-name {
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.note-slice-game-over__achievement-badge {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
  background: linear-gradient(90deg, #ffb347, #ff8fb8);
}

.note-slice-game-over__achievement-desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #8a7898;
}

.note-slice-game-over__achievement-reward {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #c87820;
}

.note-slice-game-over__actions {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 22px;
}

.note-slice-game-over__btn {
  width: 100%;
  padding: 12px 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.note-slice-game-over__btn:hover {
  transform: translateY(-1px);
}

.note-slice-game-over__btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
  box-shadow: 0 8px 24px rgba(200, 140, 180, 0.35);
}

.note-slice-game-over__btn--ghost {
  border: 1px solid rgba(201, 184, 255, 0.55);
  color: #6e5a7c;
  background: rgba(255, 255, 255, 0.72);
}
</style>
