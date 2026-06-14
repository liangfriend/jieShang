<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import {
  formatAchievementCompletedAt,
  loadAchievementListItems,
  type AchievementListItem
} from '@renderer/utils/achievementHelper'
import {
  fetchNoteSliceHighScores,
  NOTE_SLICE_HIGH_SCORE_MODE_LABELS,
  type NoteSliceHighScoreMode,
  type NoteSliceHighScoreRecord
} from '@renderer/utils/noteSliceHighScoreHelper'

const NOTE_SLICE_HIGH_SCORE_MODES: NoteSliceHighScoreMode[] = ['arcade', 'endless', 'extreme']

const loading = ref(true)
const achievements = ref<AchievementListItem[]>([])
const highScores = ref<NoteSliceHighScoreRecord[]>([])

const highScoreCards = computed(() => {
  const scoreMap = new Map(highScores.value.map((item) => [item.mode, item.high_score]))
  return NOTE_SLICE_HIGH_SCORE_MODES.map((mode) => ({
    mode,
    high_score: scoreMap.get(mode) ?? 0
  }))
})

function resolveHighScoreLabel(mode: NoteSliceHighScoreRecord['mode']): string {
  return NOTE_SLICE_HIGH_SCORE_MODE_LABELS[mode]
}

onMounted(async () => {
  loading.value = true
  try {
    const [achievementItems, scoreItems] = await Promise.all([
      loadAchievementListItems(),
      fetchNoteSliceHighScores()
    ])
    achievements.value = achievementItems
    highScores.value = scoreItems
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="achievements-page">
    <header class="achievements-page__header">
      <BackButton fallback="/" />
      <h1 class="achievements-page__title">成就</h1>
    </header>

    <main class="achievements-page__main">
      <section class="achievements-page__scores">
        <h2 class="achievements-page__section-title">历史最高分</h2>
        <div class="achievements-page__score-grid">
          <div
            v-for="item in highScoreCards"
            :key="item.mode"
            class="achievements-page__score-card"
          >
            <span class="achievements-page__score-mode">{{ resolveHighScoreLabel(item.mode) }}</span>
            <span class="achievements-page__score-value">{{ item.high_score }}</span>
          </div>
        </div>
      </section>

      <p v-if="loading" class="achievements-page__status">加载中…</p>

      <ul v-else class="achievements-page__list">
        <li
          v-for="item in achievements"
          :key="item.key"
          class="achievement-card"
          :class="{ 'achievement-card--completed': item.completed }"
        >
          <div class="achievement-card__illus" aria-hidden="true">
            <img
              v-if="item.illustrationUrl"
              :src="item.illustrationUrl"
              :alt="item.name"
              class="achievement-card__image"
            />
            <span v-else class="achievement-card__illus-placeholder">🏅</span>
          </div>

          <div class="achievement-card__body">
            <div class="achievement-card__head">
              <h2 class="achievement-card__name">{{ item.name }}</h2>
              <span v-if="item.completed" class="achievement-card__badge">已达成</span>
            </div>
            <p class="achievement-card__desc">{{ item.description }}</p>
            <p class="achievement-card__how">如何获得：{{ item.howToGet }}</p>
            <p v-if="item.completed && item.completedAt" class="achievement-card__time">
              完成于 {{ formatAchievementCompletedAt(item.completedAt) }}
            </p>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.achievements-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
}

.achievements-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
}

.achievements-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.achievements-page__main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 32px;
  box-sizing: border-box;
}

.achievements-page__section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
}

.achievements-page__scores {
  margin-bottom: 24px;
}

.achievements-page__score-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.achievements-page__score-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 2px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
}

.achievements-page__score-mode {
  font-size: 12px;
  color: #9a8aa8;
}

.achievements-page__score-value {
  font-size: 24px;
  font-weight: 800;
  color: #5c4a6a;
}

.achievements-page__status {
  margin: 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.achievements-page__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.achievement-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid rgba(255, 184, 208, 0.28);
  background: rgba(255, 255, 255, 0.72);
  opacity: 0.72;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease,
    box-shadow 0.15s ease;
}

.achievement-card--completed {
  opacity: 1;
  border-color: rgba(255, 200, 80, 0.75);
  background: linear-gradient(135deg, rgba(255, 248, 220, 0.95), rgba(255, 255, 255, 0.92));
  box-shadow: 0 8px 24px rgba(255, 190, 90, 0.18);
}

.achievement-card__illus {
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 184, 208, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.achievement-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.achievement-card__illus-placeholder {
  font-size: 32px;
  line-height: 1;
}

.achievement-card__body {
  flex: 1;
  min-width: 0;
}

.achievement-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.achievement-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #5c4a6a;
}

.achievement-card__badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #9a6b00;
  background: rgba(255, 220, 120, 0.55);
}

.achievement-card__desc {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #5c4a6a;
}

.achievement-card__how {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.achievement-card__time {
  margin: 8px 0 0;
  font-size: 12px;
  color: #b8860b;
}
</style>
