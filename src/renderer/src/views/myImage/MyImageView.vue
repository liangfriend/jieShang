<script lang="ts" setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import MediaDeleteDialog from '@renderer/components/MediaDeleteDialog.vue'
import ImageCard from '@renderer/views/myImage/ImageCard.vue'
import ImageDetailDialog from '@renderer/views/myImage/ImageDetailDialog.vue'
import { forgetImageMetadata, probeImageMetadata } from '@renderer/views/myImage/imageMetadata'
import {
  createImageInDatabase,
  deleteImageFromDatabase,
  nameFromOriginalImageFile,
  searchImagesFromDatabase,
  type ImageListItem
} from '@renderer/utils/fileHelper/imageFile'

defineOptions({ name: 'MyImageView' })

const ACCEPTED = 'image/*,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg'

const { t } = useI18n()
const keyword = ref('')
const loading = ref(false)
const uploading = ref(false)
const deletingId = ref<number | null>(null)
const items = ref<ImageListItem[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const deleteDialogRef = ref<InstanceType<typeof MediaDeleteDialog> | null>(null)
const detailVisible = ref(false)
const detailItem = ref<ImageListItem | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchItems() {
  loading.value = true
  try {
    items.value = await searchImagesFromDatabase(keyword.value)
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

function openAdd() {
  fileInputRef.value?.click()
}

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length || uploading.value) return

  uploading.value = true
  let ok = 0
  try {
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const created = await createImageInDatabase({
          name: nameFromOriginalImageFile(file.name),
          file: buffer,
          originalName: file.name
        })
        void probeImageMetadata(created.id, created.url)
        ok += 1
      } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : t('myImage.uploadFailed'))
      }
    }
    if (ok > 0) {
      ElMessage.success(t('myImage.uploadSuccess', { n: ok }))
      await fetchItems()
    }
  } finally {
    uploading.value = false
  }
}

function openDetail(item: ImageListItem) {
  detailItem.value = item
  detailVisible.value = true
}

async function deleteItem(item: ImageListItem, event: Event) {
  event.stopPropagation()
  if (deletingId.value != null) return
  const confirmed = await deleteDialogRef.value?.open()
  if (!confirmed) return

  deletingId.value = item.id
  try {
    await deleteImageFromDatabase(item.id)
    forgetImageMetadata(item.id)
    items.value = items.value.filter((row) => row.id !== item.id)
    if (detailItem.value?.id === item.id) {
      detailVisible.value = false
      detailItem.value = null
    }
    ElMessage.success(t('myImage.deleteSuccess'))
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
  <div class="my-image">
    <header class="my-image__header">
      <div class="my-image__nav">
        <BackButton fallback="/" />
      </div>
      <div class="my-image__header-main">
        <div class="my-image__title-row">
          <h1 class="my-image__title">{{ t('myImage.title') }}</h1>
          <button type="button" class="my-image__add" :disabled="uploading" @click="openAdd">
            <el-icon><Plus /></el-icon>
            <span>{{ uploading ? t('myImage.uploading') : t('myImage.add') }}</span>
          </button>
        </div>
        <el-input
          v-model="keyword"
          class="my-image__search"
          clearable
          :placeholder="t('myImage.searchPlaceholder')"
          :prefix-icon="Search"
        />
      </div>
    </header>

    <main v-loading="loading || uploading" class="my-image__main">
      <div v-if="!loading && items.length === 0" class="my-image__empty">
        {{ keyword.trim() ? t('myImage.emptyFiltered') : t('myImage.empty') }}
      </div>
      <div v-else class="image-grid">
        <ImageCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :deleting="deletingId === item.id"
          @open-detail="openDetail(item)"
          @delete="deleteItem(item, $event)"
        />
      </div>
    </main>

    <input
      ref="fileInputRef"
      class="my-image__file"
      type="file"
      :accept="ACCEPTED"
      multiple
      @change="onFilesSelected"
    />

    <MediaDeleteDialog
      ref="deleteDialogRef"
      title-key="myImage.deleteTitle"
      message-key="myImage.deleteMessage"
      warning-key="myImage.deleteWarning"
    />
    <ImageDetailDialog v-model="detailVisible" :item="detailItem" />
  </div>
</template>

<style scoped>
.my-image {
  --lavender: #c9b8ff;
  --text-soft: #9a8aa8;
  --shadow: 0 8px 32px rgba(200, 140, 180, 0.18);

  min-height: 100vh;
  padding: 32px 32px 80px;
  box-sizing: border-box;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.my-image__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto 28px;
}

.my-image__nav {
  flex-shrink: 0;
  padding-top: 2px;
}

.my-image__header-main {
  flex: 1;
  min-width: 0;
}

.my-image__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.my-image__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.my-image__add {
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

.my-image__add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.my-image__search {
  max-width: 360px;
}

.my-image__search :deep(.el-input__wrapper) {
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.my-image__main {
  max-width: 960px;
  margin: 0 auto;
  min-height: 240px;
}

.my-image__empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--text-soft);
  font-size: 14px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.my-image__file {
  display: none;
}
</style>
