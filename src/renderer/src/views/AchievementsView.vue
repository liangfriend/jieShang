<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import {
  formatAchievementCompletedAt,
  loadAchievementListItems,
  type AchievementListItem
} from '@renderer/utils/achievementHelper'
import {
  buildNoteSliceHighScoreMatrix,
  fetchNoteSliceHighScores,
  formatNoteSliceExtremeHighScore,
  type NoteSliceHighScoreRecord
} from '@renderer/utils/noteSliceHighScoreHelper'

const loading = ref(true)
const achievements = ref<AchievementListItem[]>([])
const highScores = ref<NoteSliceHighScoreRecord[]>([])

const highScoreMatrix = computed(() => buildNoteSliceHighScoreMatrix(highScores.value))

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

        <div
          v-for="modeRow in highScoreMatrix"
          :key="modeRow.mode"
          class="achievements-page__mode-block"
          :class="{ 'achievements-page__mode-block--single': modeRow.singleScore != null }"
        >
          <span class="achievements-page__mode-title">{{ modeRow.modeLabel }}</span>

          <div v-if="modeRow.scores" class="achievements-page__score-grid">
            <div
              v-for="scoreItem in modeRow.scores"
              :key="`${modeRow.mode}-${scoreItem.difficulty}`"
              class="achievements-page__score-card"
            >
              <span class="achievements-page__score-difficulty">{{
                scoreItem.difficultyLabel
              }}</span>
              <span class="achievements-page__score-value">{{ scoreItem.high_score }}</span>
            </div>
          </div>

          <span v-else class="achievements-page__single-score">{{
            formatNoteSliceExtremeHighScore(modeRow.singleScore ?? 0)
          }}</span>
        </div>
      </section>

      <h2 class="achievements-page__section-title">全部成就</h2>

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
              v-if="item.illustrationInactiveUrl && item.illustrationActiveUrl"
              :src="item.completed ? item.illustrationActiveUrl : item.illustrationInactiveUrl"
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
            <p class="achievement-card__reward">奖励：{{ item.reward }}</p>
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff8fb;
}

.achievements-page__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: #fff8fb;
}

.achievements-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
}

.achievements-page__main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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
  margin-bottom: 28px;
}

.achievements-page__mode-block {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 12px;
}

.achievements-page__mode-block + .achievements-page__mode-block {
  margin-top: 10px;
}

.achievements-page__mode-block--single {
  grid-template-columns: 72px auto;
}

.achievements-page__mode-title {
  font-size: 13px;
  font-weight: 600;
  color: #7a688a;
}

.achievements-page__score-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.achievements-page__score-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 12px;
  border: 2px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
}

.achievements-page__single-score {
  font-size: 22px;
  font-weight: 800;
  color: #5c4a6a;
  font-variant-numeric: tabular-nums;
}

.achievements-page__score-difficulty {
  font-size: 12px;
  color: #9a8aa8;
}

.achievements-page__score-value {
  font-size: 22px;
  font-weight: 800;
  color: #5c4a6a;
  font-variant-numeric: tabular-nums;
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
  object-fit: contain;
  padding: 4px;
  box-sizing: border-box;
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

.achievement-card__reward {
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
