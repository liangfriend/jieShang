<script setup lang="ts">
import { Delete, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreDeleteDialog from '@renderer/components/ScoreDeleteDialog.vue'
import { HOME_TEMPLATE_TO_ROUTE } from '@renderer/utils/scoreRoute'
import {
  deleteScoreFromDatabase,
  displayScoreName,
  searchScoresFromDatabase,
  type ScoreListItem
} from '@renderer/utils/fileHelper'

const { t } = useI18n()
const router = useRouter()
const keyword = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)
const scores = ref<ScoreListItem[]>([])
const templateVisible = ref(false)
const deleteDialogRef = ref<InstanceType<typeof ScoreDeleteDialog> | null>(null)

const templateGroups = computed(() => [
  {
    title: t('scores.templateDialog.staff'),
    items: [
      { key: 'empty', label: t('scores.templateDialog.empty') },
      { key: 'single', label: t('scores.templateDialog.single') },
      { key: 'double', label: t('scores.templateDialog.double') }
    ]
  },
  {
    title: t('scores.templateDialog.jianpu'),
    items: [
      { key: 'jianpuEmpty', label: t('scores.templateDialog.empty') },
      { key: 'jianpuSingle', label: t('scores.templateDialog.single') },
      { key: 'jianpuDouble', label: t('scores.templateDialog.double') }
    ]
  }
])

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

function onTemplateSelect(key: string) {
  templateVisible.value = false
  router.push({
    name: 'edit',
    query: { template: HOME_TEMPLATE_TO_ROUTE[key] ?? 'empty' }
  })
}

async function deleteScore(score: ScoreListItem, event: Event) {
  event.stopPropagation()

  if (deletingId.value != null) return

  const confirmed = await deleteDialogRef.value?.open()
  if (!confirmed) return

  deletingId.value = score.id
  try {
    await deleteScoreFromDatabase(score.id)
    scores.value = scores.value.filter((item) => item.id !== score.id)
    ElMessage.success(t('scores.deleteSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.deleteFailed'))
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
        <div class="score-list__title-row">
          <h1 class="score-list__title">{{ t('scores.title') }}</h1>
          <button type="button" class="score-list__add" @click="templateVisible = true">
            <el-icon><Plus /></el-icon>
            <span>{{ t('scores.create') }}</span>
          </button>
        </div>
        <el-input
          v-model="keyword"
          class="score-list__search"
          clearable
          :placeholder="t('scores.searchPlaceholder')"
          :prefix-icon="Search"
        />
      </div>
    </header>

    <main v-loading="loading" class="score-list__main">
      <div v-if="!loading && scores.length === 0" class="score-list__empty">
        {{ keyword.trim() ? t('scores.emptyFiltered') : t('scores.empty') }}
      </div>

      <div v-else class="score-grid">
        <div v-for="score in scores" :key="score.id" class="score-card">
          <button
            type="button"
            class="score-card__delete"
            :disabled="deletingId === score.id"
            :aria-label="t('scores.deleteAria')"
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

    <el-dialog
      v-model="templateVisible"
      :title="t('scores.templateDialog.title')"
      width="480px"
      class="cute-dialog"
      append-to-body
      align-center
    >
      <p class="dialog-desc">{{ t('scores.templateDialog.desc') }}</p>
      <div class="template-groups">
        <section v-for="group in templateGroups" :key="group.title" class="template-group">
          <h3 class="template-group__title">{{ group.title }}</h3>
          <div class="template-list">
            <button
              v-for="tpl in group.items"
              :key="tpl.key"
              type="button"
              class="template-item"
              @click="onTemplateSelect(tpl.key)"
            >
              {{ tpl.label }}
            </button>
          </div>
        </section>
      </div>
    </el-dialog>

    <ScoreDeleteDialog ref="deleteDialogRef" />
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

.score-list__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.score-list__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.score-list__add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
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

.dialog-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-soft);
  text-align: center;
}

.template-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-group__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.template-item {
  min-width: 88px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.template-item:hover {
  background: rgba(255, 214, 232, 0.75);
}
</style>

<style>
.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.cute-dialog .el-dialog__header {
  padding: 20px 24px 8px;
}

.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}

.cute-dialog .el-dialog__body {
  padding: 8px 24px 12px;
}

.cute-dialog .el-dialog__footer {
  padding: 8px 24px 20px;
}
</style>
