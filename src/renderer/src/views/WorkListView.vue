<script lang="ts" setup>
import { Plus, Search, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import MediaDeleteDialog from '@renderer/components/MediaDeleteDialog.vue'
import { EDIT_NEW_WORK_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import {
  createEmptyWork,
  deleteWorkFromDatabase,
  displayWorkName,
  searchWorksFromDatabase,
  type WorkListItem
} from '@renderer/utils/fileHelper/workFile'

defineOptions({ name: 'WorkListView' })

const { t } = useI18n()
const router = useRouter()
const dataStore = useDataStore()

const keyword = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)
const items = ref<WorkListItem[]>([])
const deleteDialogRef = ref<InstanceType<typeof MediaDeleteDialog> | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchItems() {
  loading.value = true
  try {
    items.value = await searchWorksFromDatabase(keyword.value)
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void fetchItems()
  }, 300)
}

function openWork(item: WorkListItem) {
  router.push({
    name: 'workShow',
    query: { workId: String(item.id) }
  })
}

function createWork() {
  const work = createEmptyWork()
  dataStore.setTempWork(EDIT_NEW_WORK_TEMP_ID, work)
  dataStore.deleteTempWorkBlob(EDIT_NEW_WORK_TEMP_ID)
  router.push({
    name: 'workEdit',
    query: { tempId: EDIT_NEW_WORK_TEMP_ID }
  })
}

async function deleteItem(item: WorkListItem, event: Event) {
  event.stopPropagation()
  if (deletingId.value != null) return
  const confirmed = await deleteDialogRef.value?.open()
  if (!confirmed) return

  deletingId.value = item.id
  try {
    await deleteWorkFromDatabase(item.id)
    items.value = items.value.filter((row) => row.id !== item.id)
    ElMessage.success(t('work.deleteSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.deleteFailed'))
  } finally {
    deletingId.value = null
  }
}

watch(keyword, scheduleSearch)
onMounted(() => {
  void fetchItems()
})
</script>

<template>
  <div class="work-list">
    <header class="work-list__header">
      <div class="work-list__nav">
        <BackButton fallback="/" />
      </div>
      <div class="work-list__header-main">
        <div class="work-list__title-row">
          <h1 class="work-list__title">{{ t('work.listTitle') }}</h1>
          <button type="button" class="work-list__add" @click="createWork">
            <el-icon><Plus /></el-icon>
            <span>{{ t('work.create') }}</span>
          </button>
        </div>
        <el-input
          v-model="keyword"
          class="work-list__search"
          clearable
          :placeholder="t('work.searchPlaceholder')"
          :prefix-icon="Search"
        />
      </div>
    </header>

    <main v-loading="loading" class="work-list__main">
      <div v-if="!loading && items.length === 0" class="work-list__empty">
        {{ keyword.trim() ? t('work.emptyFiltered') : t('work.empty') }}
      </div>
      <div v-else class="work-grid">
        <div v-for="item in items" :key="item.id" class="work-card">
          <button
            type="button"
            class="work-card__delete"
            :disabled="deletingId === item.id"
            :aria-label="t('work.deleteAria')"
            @click="deleteItem(item, $event)"
          >
            <el-icon><Delete /></el-icon>
          </button>
          <button type="button" class="work-card__open" @click="openWork(item)">
            <div class="work-card__cover">
              <span class="work-card__name">{{ displayWorkName(item.name) }}</span>
            </div>
          </button>
        </div>
      </div>
    </main>

    <MediaDeleteDialog
      ref="deleteDialogRef"
      title-key="work.deleteTitle"
      message-key="work.deleteMessage"
      warning-key="work.deleteWarning"
    />
  </div>
</template>

<style scoped>
.work-list {
  --lavender: #c9b8ff;
  --text-soft: #9a8aa8;
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  min-height: 100vh;
  padding: 32px 32px 80px;
  box-sizing: border-box;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.work-list__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto 28px;
}

.work-list__nav {
  flex-shrink: 0;
  padding-top: 2px;
}

.work-list__header-main {
  flex: 1;
  min-width: 0;
}

.work-list__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.work-list__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.work-list__add {
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

.work-list__search {
  max-width: 360px;
}

.work-list__search :deep(.el-input__wrapper) {
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.work-list__main {
  max-width: 960px;
  margin: 0 auto;
  min-height: 240px;
}

.work-list__empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--text-soft);
  font-size: 14px;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.work-card {
  position: relative;
}

.work-card__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #ff9a9a, #f56c6c);
  opacity: 0;
  pointer-events: none;
  cursor: pointer;
}

.work-card:hover .work-card__delete,
.work-card:focus-within .work-card__delete {
  opacity: 1;
  pointer-events: auto;
}

.work-card__open {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.work-card__cover {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  padding: 12px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.95), #ffe8f2);
  box-shadow: var(--shadow);
  transition: transform 0.18s ease;
}

.work-card__open:hover .work-card__cover {
  transform: translateY(-2px);
}

.work-card__name {
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}
</style>
