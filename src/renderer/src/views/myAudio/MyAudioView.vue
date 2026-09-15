<script lang="ts" setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import AudioCard from '@renderer/views/myAudio/AudioCard.vue'
import AudioDeleteDialog from '@renderer/views/myAudio/AudioDeleteDialog.vue'
import AudioDetailDialog from '@renderer/views/myAudio/AudioDetailDialog.vue'
import { useAudioListPlayer } from '@renderer/views/myAudio/useAudioListPlayer'
import { forgetAudioMetadata, probeAudioMetadata } from '@renderer/views/myAudio/audioMetadata'
import {
  createAudioInDatabase,
  deleteAudioFromDatabase,
  nameFromOriginalFile,
  searchAudiosFromDatabase,
  type AudioListItem
} from '@renderer/utils/fileHelper/audioFile'

defineOptions({ name: 'MyAudioView' })

const ACCEPTED =
  'audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.webm,.aiff,.aif'

const { t } = useI18n()
const player = useAudioListPlayer()

const keyword = ref('')
const loading = ref(false)
const uploading = ref(false)
const deletingId = ref<number | null>(null)
const items = ref<AudioListItem[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const deleteDialogRef = ref<InstanceType<typeof AudioDeleteDialog> | null>(null)
const detailVisible = ref(false)
const detailItem = ref<AudioListItem | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchItems() {
  loading.value = true
  try {
    items.value = await searchAudiosFromDatabase(keyword.value)
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
        const created = await createAudioInDatabase({
          name: nameFromOriginalFile(file.name),
          file: buffer,
          originalName: file.name
        })
        void probeAudioMetadata(created.id, created.url)
        ok += 1
      } catch (error) {
        ElMessage.error(
          error instanceof Error ? error.message : t('myAudio.uploadFailed')
        )
      }
    }
    if (ok > 0) {
      ElMessage.success(t('myAudio.uploadSuccess', { n: ok }))
      await fetchItems()
    }
  } finally {
    uploading.value = false
  }
}

function openDetail(item: AudioListItem) {
  detailItem.value = item
  detailVisible.value = true
}

async function deleteItem(item: AudioListItem, event: Event) {
  event.stopPropagation()
  if (deletingId.value != null) return

  const confirmed = await deleteDialogRef.value?.open()
  if (!confirmed) return

  deletingId.value = item.id
  try {
    if (player.isActive(item.id)) player.stop()
    await deleteAudioFromDatabase(item.id)
    forgetAudioMetadata(item.id)
    items.value = items.value.filter((row) => row.id !== item.id)
    if (detailItem.value?.id === item.id) {
      detailVisible.value = false
      detailItem.value = null
    }
    ElMessage.success(t('myAudio.deleteSuccess'))
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
  <div class="my-audio">
    <header class="my-audio__header">
      <div class="my-audio__nav">
        <BackButton fallback="/" />
      </div>
      <div class="my-audio__header-main">
        <div class="my-audio__title-row">
          <h1 class="my-audio__title">{{ t('myAudio.title') }}</h1>
          <button
            type="button"
            class="my-audio__add"
            :disabled="uploading"
            @click="openAdd"
          >
            <el-icon><Plus /></el-icon>
            <span>{{ uploading ? t('myAudio.uploading') : t('myAudio.add') }}</span>
          </button>
        </div>
        <el-input
          v-model="keyword"
          class="my-audio__search"
          clearable
          :placeholder="t('myAudio.searchPlaceholder')"
          :prefix-icon="Search"
        />
      </div>
    </header>

    <main v-loading="loading || uploading" class="my-audio__main">
      <div v-if="!loading && items.length === 0" class="my-audio__empty">
        {{ keyword.trim() ? t('myAudio.emptyFiltered') : t('myAudio.empty') }}
      </div>

      <div v-else class="audio-grid">
        <AudioCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :player="player"
          :deleting="deletingId === item.id"
          @open-detail="openDetail(item)"
          @delete="deleteItem(item, $event)"
        />
      </div>
    </main>

    <input
      ref="fileInputRef"
      class="my-audio__file"
      type="file"
      :accept="ACCEPTED"
      multiple
      @change="onFilesSelected"
    />

    <AudioDeleteDialog ref="deleteDialogRef" />
    <AudioDetailDialog v-model="detailVisible" :item="detailItem" />
  </div>
</template>

<style scoped>
.my-audio {
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

.my-audio__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto 28px;
}

.my-audio__nav {
  flex-shrink: 0;
  padding-top: 2px;
}

.my-audio__header-main {
  flex: 1;
  min-width: 0;
}

.my-audio__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.my-audio__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: linear-gradient(90deg, #ff8fb8, var(--lavender));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.my-audio__add {
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
  box-shadow: 0 4px 14px rgba(255, 143, 184, 0.35);
}

.my-audio__add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.my-audio__search {
  max-width: 360px;
}

.my-audio__search :deep(.el-input__wrapper) {
  border-radius: 999px;
  box-shadow: var(--shadow);
}

.my-audio__main {
  max-width: 960px;
  margin: 0 auto;
  min-height: 240px;
}

.my-audio__empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--text-soft);
  font-size: 14px;
}

.audio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.my-audio__file {
  display: none;
}
</style>
