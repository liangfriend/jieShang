<script lang="ts" setup>
import { Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import { COLLECTION_TYPE_FILTER_OPTIONS } from '@renderer/constant/collection'
import type { CollectionDbType, CollectionRecord } from '@renderer/types/collection'
import {
  activateCollectionRecord,
  canDeleteCollection,
  collectionTypeLabel,
  deleteCollectionFromDatabase,
  fetchOwnedCollections,
  isCollectionRecordActive,
  resolveCollectionDescription,
  resolveCollectionHowToGet,
  resolveCollectionName,
  supportsCollectionUsage
} from '@renderer/utils/collection/collectionHelper'
import {
  collectionLevelCardClass,
  collectionLevelLabel,
  normalizeCollectionLevel
} from '@renderer/utils/collection/collectionLevel'
import {
  loadActiveCollectionSelection,
  type ActiveCollectionSelection
} from '@renderer/utils/collection/collectionActiveStorage'

const loading = ref(false)
const deleting = ref(false)
const keyword = ref('')
const typeFilter = ref<CollectionDbType | 'all'>('all')
const items = ref<CollectionRecord[]>([])
const selectedId = ref<number | null>(null)
const activeSelection = ref<ActiveCollectionSelection>(loadActiveCollectionSelection())

const filteredItems = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return items.value.filter((item) => {
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false
    if (!q) return true
    return resolveCollectionName(item).toLowerCase().includes(q)
  })
})

const selectedItem = computed(
  () => filteredItems.value.find((item) => item.id === selectedId.value) ?? null
)

const selectedName = computed(() =>
  selectedItem.value ? resolveCollectionName(selectedItem.value) : ''
)
const selectedDescription = computed(() =>
  selectedItem.value ? resolveCollectionDescription(selectedItem.value) : ''
)
const selectedHowToGet = computed(() =>
  selectedItem.value ? resolveCollectionHowToGet(selectedItem.value) : null
)
const selectedDeletable = computed(() =>
  selectedItem.value ? canDeleteCollection(selectedItem.value) : false
)
const selectedSupportsUsage = computed(() =>
  selectedItem.value ? supportsCollectionUsage(selectedItem.value) : false
)
const selectedInUse = computed(() =>
  selectedItem.value ? isCollectionRecordActive(selectedItem.value, activeSelection.value) : false
)

function isItemInUse(item: CollectionRecord) {
  return isCollectionRecordActive(item, activeSelection.value)
}

function refreshActiveSelection() {
  activeSelection.value = loadActiveCollectionSelection()
}

const emptyListText = computed(() => {
  if (items.value.length === 0) return '还没有已拥有的藏品'
  if (keyword.value.trim() || typeFilter.value !== 'all') return '没有匹配的藏品'
  return '还没有已拥有的藏品'
})

async function loadCollections() {
  loading.value = true
  try {
    items.value = await fetchOwnedCollections()
  } finally {
    loading.value = false
  }
}

function selectItem(item: CollectionRecord) {
  selectedId.value = item.id
}

function handleUseSelected() {
  const item = selectedItem.value
  if (!item || isItemInUse(item)) return
  activateCollectionRecord(item)
  refreshActiveSelection()
  ElMessage.success(`已使用「${resolveCollectionName(item)}」`)
}

async function handleDeleteSelected() {
  const item = selectedItem.value
  if (!item || !canDeleteCollection(item)) return

  const name = resolveCollectionName(item)
  try {
    await ElMessageBox.confirm(`确定删除藏品「${name}」吗？此操作不可恢复。`, '删除藏品', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
  } catch {
    return
  }

  deleting.value = true
  try {
    await deleteCollectionFromDatabase(item.id)
    items.value = items.value.filter((row) => row.id !== item.id)
    ElMessage.success('藏品已删除')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

watch(filteredItems, (list) => {
  if (list.length === 0) {
    selectedId.value = null
    return
  }
  if (!list.some((item) => item.id === selectedId.value)) {
    selectedId.value = list[0]!.id
  }
})

onMounted(() => {
  refreshActiveSelection()
  void loadCollections()
})
</script>

<template>
  <div class="collection-page">
    <header class="collection-page__header">
      <BackButton fallback="/" />
      <h1 class="collection-page__title">藏品</h1>
      <el-input
        v-model="keyword"
        class="collection-page__search"
        clearable
        placeholder="搜索藏品名称"
        :prefix-icon="Search"
      />
    </header>

    <div class="collection-page__body">
      <section v-loading="loading" class="collection-page__main">
        <div class="collection-page__filters">
          <button
            v-for="option in COLLECTION_TYPE_FILTER_OPTIONS"
            :key="option.value"
            type="button"
            class="collection-filter"
            :class="{ 'collection-filter--active': typeFilter === option.value }"
            @click="typeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <p v-if="!loading && filteredItems.length === 0" class="collection-page__main-empty">
          {{ emptyListText }}
        </p>

        <ul v-else class="collection-grid">
          <li v-for="item in filteredItems" :key="item.id">
            <button
              type="button"
              class="collection-card"
              :class="[
                collectionLevelCardClass(item.level),
                {
                  'collection-card--selected': item.id === selectedId,
                  'collection-card--in-use': isItemInUse(item)
                }
              ]"
              @click="selectItem(item)"
            >
              <span v-if="isItemInUse(item)" class="collection-card__badge">使用中</span>
              <div class="collection-card__thumb">
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="resolveCollectionName(item)"
                  class="collection-card__thumb-img"
                />
                <span v-else class="collection-card__thumb-placeholder">?</span>
              </div>
              <div class="collection-card__meta">
                <span class="collection-card__name">{{ resolveCollectionName(item) }}</span>
                <span class="collection-card__type">{{ collectionTypeLabel(item.type) }}</span>
              </div>
            </button>
          </li>
        </ul>
      </section>

      <aside class="collection-page__detail">
        <div v-if="!selectedItem" class="collection-page__detail-empty">选择藏品查看详情</div>

        <div v-else class="collection-detail">
          <div class="collection-detail__preview">
            <img
              v-if="selectedItem.thumbnail"
              :src="selectedItem.thumbnail"
              :alt="selectedName"
              class="collection-detail__image"
            />
            <div v-else class="collection-detail__placeholder">?</div>
          </div>

          <h2 class="collection-detail__name">{{ selectedName }}</h2>
          <p class="collection-detail__type">
            {{ collectionTypeLabel(selectedItem.type) }} ·
            {{ collectionLevelLabel(selectedItem.level) }}
          </p>

          <section v-if="selectedDescription" class="collection-detail__section">
            <h3 class="collection-detail__label">描述</h3>
            <p class="collection-detail__text">{{ selectedDescription }}</p>
          </section>

          <section v-if="selectedHowToGet" class="collection-detail__section">
            <h3 class="collection-detail__label">获取条件</h3>
            <p class="collection-detail__text">{{ selectedHowToGet }}</p>
          </section>

          <button
            v-if="selectedSupportsUsage"
            type="button"
            class="collection-detail__use"
            :class="{ 'collection-detail__use--active': selectedInUse }"
            :disabled="selectedInUse"
            @click="handleUseSelected"
          >
            {{ selectedInUse ? '已使用' : '使用' }}
          </button>

          <button
            v-if="selectedDeletable"
            type="button"
            class="collection-detail__delete"
            :disabled="deleting"
            @click="handleDeleteSelected"
          >
            <el-icon><Delete /></el-icon>
            删除
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.collection-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff8fb;
  overflow: hidden;
}

.collection-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  flex-shrink: 0;
}

.collection-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #5c4a6a;
  flex-shrink: 0;
}

.collection-page__search {
  flex: 1;
  max-width: 360px;
  margin-left: auto;
}

.collection-page__body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.collection-page__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  overflow: auto;
}

.collection-page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.collection-filter {
  padding: 6px 14px;
  border: 1px solid rgba(255, 184, 208, 0.35);
  border-radius: 999px;
  background: #fff;
  color: #8a5a72;
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.collection-filter:hover {
  border-color: rgba(255, 143, 186, 0.55);
}

.collection-filter--active {
  border-color: #ff8fba;
  background: rgba(255, 143, 186, 0.12);
  color: #d6336c;
  font-weight: 600;
}

.collection-page__main-empty {
  margin: 48px auto;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

.collection-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.collection-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  background: #f4f4f5;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.collection-card--level-1 {
  background: linear-gradient(165deg, #f6f6f7 0%, #ececee 100%);
  border-color: rgba(120, 120, 130, 0.18);
}

.collection-card--level-2 {
  background: linear-gradient(165deg, #eef8ef 0%, #d9f0db 100%);
  border-color: rgba(76, 175, 80, 0.28);
}

.collection-card--level-3 {
  background: linear-gradient(165deg, #eef4ff 0%, #d6e6ff 100%);
  border-color: rgba(66, 133, 244, 0.28);
}

.collection-card--level-4 {
  background: linear-gradient(165deg, #f3eeff 0%, #e2d4ff 100%);
  border-color: rgba(142, 99, 220, 0.32);
}

.collection-card--level-5 {
  background: linear-gradient(165deg, #fff8e8 0%, #ffe8a8 100%);
  border-color: rgba(212, 160, 23, 0.38);
}

.collection-card--level-6 {
  background: linear-gradient(165deg, #fff0f0 0%, #ffc9c9 100%);
  border-color: rgba(229, 72, 77, 0.38);
}

.collection-card:hover {
  border-color: rgba(255, 143, 186, 0.45);
}

.collection-card--selected {
  border-color: #ff8fba;
  box-shadow: 0 4px 14px rgba(255, 143, 186, 0.18);
}

.collection-card--in-use {
  //border-color: rgba(76, 175, 80, 0.45);
}

.collection-card--selected.collection-card--in-use {
  border-color: #ff8fba;
  box-shadow:
    0 4px 14px rgba(255, 143, 186, 0.18),
    inset 0 0 0 1px rgba(76, 175, 80, 0.35);
}

.collection-card__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(76, 175, 80, 0.92);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.4;
}

.collection-card__thumb {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 184, 208, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.collection-card__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-card__thumb-placeholder {
  font-size: 32px;
  font-weight: 700;
  color: #c9a0b8;
}

.collection-card__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collection-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #5c4a6a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-card__type {
  font-size: 11px;
  color: #a8899c;
}

.collection-page__detail {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid rgba(255, 184, 208, 0.25);
  padding: 20px 16px;
  overflow: auto;
  background: rgba(255, 255, 255, 0.55);
}

.collection-page__detail-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.collection-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.collection-detail__preview {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 184, 208, 0.12);
  border: 1px solid rgba(255, 184, 208, 0.25);
  margin-bottom: 14px;
}

.collection-detail__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-detail__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: #d4b5c8;
}

.collection-detail__name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #5c4a6a;
  word-break: break-word;
}

.collection-detail__type {
  margin: 0 0 16px;
  font-size: 12px;
  color: #a8899c;
}

.collection-detail__section {
  width: 100%;
  margin-bottom: 14px;
  text-align: left;
}

.collection-detail__label {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.collection-detail__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b566f;
  white-space: pre-wrap;
  word-break: break-word;
}

.collection-detail__use {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 143, 186, 0.45);
  border-radius: 10px;
  background: linear-gradient(180deg, #fff5fa 0%, #ffe8f3 100%);
  color: #d6336c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.collection-detail__use:hover:not(:disabled) {
  border-color: #ff8fba;
  background: rgba(255, 143, 186, 0.15);
}

.collection-detail__use--active,
.collection-detail__use:disabled {
  border-color: rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  cursor: not-allowed;
}

.collection-detail__delete {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(245, 108, 108, 0.35);
  border-radius: 8px;
  background: #fff;
  color: #f56c6c;
  font-size: 12px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.collection-detail__delete:hover:not(:disabled) {
  background: rgba(245, 108, 108, 0.06);
  border-color: #f56c6c;
}

.collection-detail__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
