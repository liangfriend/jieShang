<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import {
  displayScoreName,
  searchScoresFromDatabase,
  type ScoreListItem
} from '@renderer/utils/fileHelper'

const router = useRouter()
const keyword = ref('')
const loading = ref(false)
const scores = ref<ScoreListItem[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchScores() {
  loading.value = true
  try {
    scores.value = await searchScoresFromDatabase(keyword.value)
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchScores()
  }, 300)
}

function openScore(score: ScoreListItem) {
  router.push({
    name: 'play',
    query: {
      scoreId: String(score.id)
    }
  })
}

watch(keyword, scheduleSearch)

onMounted(() => {
  fetchScores()
})
</script>

<template>
  <div class="score-list">
    <header class="score-list__header">
      <h1 class="score-list__title">我的曲谱</h1>
      <el-input
        v-model="keyword"
        class="score-list__search"
        clearable
        placeholder="搜索曲谱名称"
        :prefix-icon="Search"
      />
    </header>

    <main v-loading="loading" class="score-list__main">
      <div v-if="!loading && scores.length === 0" class="score-list__empty">
        {{ keyword.trim() ? '没有找到匹配的曲谱' : '还没有曲谱，先去制作一个吧～' }}
      </div>

      <div v-else class="score-grid">
        <button
          v-for="score in scores"
          :key="score.id"
          type="button"
          class="score-card"
          @click="openScore(score)"
        >
          <div class="score-card__cover">
            <span class="score-card__name">{{ displayScoreName(score.name) }}</span>
          </div>
        </button>
      </div>
    </main>

    <BackButton class="score-list__back" fallback="/" />
  </div>
</template>

<style scoped>
.score-list {
  --cream: #fff8fb;
  --pink: #ffb8d0;
  --lavender: #c9b8ff;
  --text: #5c4a6a;
  --text-soft: #9a8aa8;
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  position: relative;
  min-height: 100vh;
  padding: 32px 32px 80px;
  box-sizing: border-box;
  color: var(--text);
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.score-list__header {
  max-width: 960px;
  margin: 0 auto 28px;
}

.score-list__title {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.score-list__search {
  max-width: 360px;
}

.score-list__search :deep(.el-input__wrapper) {
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.score-list__main {
  max-width: 960px;
  margin: 0 auto;
  min-height: 240px;
}

.score-list__empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--text-soft);
  font-size: 14px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.score-card {
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease;
}

.score-card:hover {
  transform: translateY(-3px);
}

.score-card__cover {
  aspect-ratio: 1;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.score-card:hover .score-card__cover {
  background: rgba(255, 214, 232, 0.72);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.score-card__name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.score-list__back {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 20;
}
</style>
