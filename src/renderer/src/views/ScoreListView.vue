<script setup lang="ts">
import { Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import {
  deleteScoreFromDatabase,
  displayScoreName,
  searchScoresFromDatabase,
  type ScoreListItem
} from '@renderer/utils/fileHelper'

const router = useRouter()
const keyword = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)
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

async function deleteScore(score: ScoreListItem, event: Event) {
  event.stopPropagation()

  if (deletingId.value != null) return

  try {
    await ElMessageBox.confirm(
      `确定删除曲谱「${displayScoreName(score.name)}」吗？此操作不可恢复。`,
      '删除曲谱',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    return
  }

  deletingId.value = score.id
  try {
    await deleteScoreFromDatabase(score.id)
    scores.value = scores.value.filter((item) => item.id !== score.id)
    ElMessage.success('曲谱已删除')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  } finally {
    deletingId.value = null
  }
}

watch(keyword, scheduleSearch)

onMounted(() => {
  fetchScores()
})
</script>

<template>
  <div class="score-list">
    <header class="score-list__header">
      <div class="score-list__nav">
        <BackButton fallback="/" />
      </div>
      <div class="score-list__header-main">
        <h1 class="score-list__title">我的曲谱</h1>
        <el-input
          v-model="keyword"
          class="score-list__search"
          clearable
          placeholder="搜索曲谱名称"
          :prefix-icon="Search"
        />
      </div>
    </header>

    <main v-loading="loading" class="score-list__main">
      <div v-if="!loading && scores.length === 0" class="score-list__empty">
        {{ keyword.trim() ? '没有找到匹配的曲谱' : '还没有曲谱，先去制作一个吧～' }}
      </div>

      <div v-else class="score-grid">
        <div v-for="score in scores" :key="score.id" class="score-card">
          <button
            type="button"
            class="score-card__delete"
            :disabled="deletingId === score.id"
            aria-label="删除曲谱"
            @click="deleteScore(score, $event)"
          >
            <el-icon><Delete /></el-icon>
          </button>
          <button type="button" class="score-card__open" @click="openScore(score)">
            <div class="score-card__cover">
              <span class="score-card__name">{{ displayScoreName(score.name) }}</span>
            </div>
          </button>
        </div>
      </div>
    </main>
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
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto 28px;
}

.score-list__nav {
  flex-shrink: 0;
  padding-top: 2px;
}

.score-list__header-main {
  flex: 1;
  min-width: 0;
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
  position: relative;
  text-align: center;
}

.score-card__open {
  width: 100%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.score-card:hover .score-card__open {
  transform: translateY(-3px);
}

.score-card__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #c45656;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 8px rgba(200, 140, 180, 0.25);
  opacity: 0;
  transition:
    opacity 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.score-card:hover .score-card__delete,
.score-card__delete:focus-visible {
  opacity: 1;
}

.score-card__delete:hover:not(:disabled) {
  color: #fff;
  background: #f56c6c;
}

.score-card__delete:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.score-card__open:hover .score-card__cover {
  background: rgba(255, 214, 232, 0.72);
  box-shadow: 0 12px 40px rgba(200, 140, 180, 0.28);
}

.score-card__name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}
</style>
