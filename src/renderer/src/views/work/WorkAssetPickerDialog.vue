<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { MediaListItem } from '@renderer/utils/fileHelper/mediaFile'
import { displayMediaName, toPlayableMediaUrl } from '@renderer/utils/fileHelper/mediaFile'
import { searchImagesFromDatabase } from '@renderer/utils/fileHelper/imageFile'
import { searchAudiosFromDatabase } from '@renderer/utils/fileHelper/audioFile'

defineOptions({ name: 'WorkAssetPickerDialog' })

export type AssetPickKind = 'image' | 'audio'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: { kind: AssetPickKind; item: MediaListItem; file: File }]
}>()

const { t } = useI18n()
const tab = ref<'image' | 'audio' | 'video'>('image')
const loading = ref(false)
const images = ref<MediaListItem[]>([])
const audios = ref<MediaListItem[]>([])
const selectedId = ref<number | null>(null)

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const list = computed(() => (tab.value === 'audio' ? audios.value : images.value))

async function refresh() {
  loading.value = true
  try {
    ;[images.value, audios.value] = await Promise.all([
      searchImagesFromDatabase(''),
      searchAudiosFromDatabase('')
    ])
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    selectedId.value = null
    tab.value = 'image'
    void refresh()
  }
)

watch(tab, () => {
  selectedId.value = null
})

onMounted(() => {
  if (props.modelValue) void refresh()
})

function thumbSrc(item: MediaListItem, kind: AssetPickKind) {
  return toPlayableMediaUrl(kind, item.url)
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || undefined })
}

async function onConfirm() {
  if (tab.value === 'video') {
    ElMessage.warning(t('work.assets.videoUnavailable'))
    return
  }
  const kind = tab.value
  const item = list.value.find((row) => row.id === selectedId.value)
  if (!item) {
    ElMessage.warning(t('work.assets.selectOne'))
    return
  }
  const playable = toPlayableMediaUrl(kind, item.url)
  const ext = item.url.replace(/\\/g, '/').split('/').pop() || `${kind}.bin`
  const file = await urlToFile(playable, ext)
  emit('confirm', { kind, item, file })
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('work.assets.title')"
    width="640px"
    class="cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div class="asset-tabs">
      <button
        type="button"
        class="asset-tabs__btn"
        :class="{ 'is-on': tab === 'image' }"
        @click="tab = 'image'"
      >
        {{ t('work.assets.image') }}
      </button>
      <button
        type="button"
        class="asset-tabs__btn"
        :class="{ 'is-on': tab === 'audio' }"
        @click="tab = 'audio'"
      >
        {{ t('work.assets.audio') }}
      </button>
      <button
        type="button"
        class="asset-tabs__btn"
        :class="{ 'is-on': tab === 'video' }"
        @click="tab = 'video'"
      >
        {{ t('work.assets.video') }}
      </button>
    </div>

    <p v-if="tab === 'video'" class="asset-hint">{{ t('work.assets.videoUnavailable') }}</p>

    <div v-else v-loading="loading" class="asset-grid">
      <p v-if="!loading && !list.length" class="asset-empty">{{ t('work.assets.empty') }}</p>
      <button
        v-for="item in list"
        :key="item.id"
        type="button"
        class="asset-card"
        :class="{ 'is-selected': selectedId === item.id }"
        @click="selectedId = item.id"
      >
        <img
          v-if="tab === 'image'"
          class="asset-card__thumb"
          :src="thumbSrc(item, 'image')"
          :alt="displayMediaName(item.name)"
        />
        <div v-else class="asset-card__audio">♪</div>
        <span class="asset-card__name">{{ displayMediaName(item.name) }}</span>
      </button>
    </div>

    <template #footer>
      <div class="asset-footer">
        <button type="button" class="ghost-btn" @click="visible = false">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="primary-btn" :disabled="tab === 'video'" @click="onConfirm">
          {{ t('work.assets.confirm') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.asset-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.asset-tabs__btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
  cursor: pointer;
}

.asset-tabs__btn.is-on {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.asset-hint,
.asset-empty {
  margin: 24px 0;
  text-align: center;
  color: #9a8aa8;
  font-size: 13px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  min-height: 180px;
  max-height: 360px;
  overflow: auto;
}

.asset-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: rgba(255, 248, 251, 0.95);
  cursor: pointer;
  text-align: left;
}

.asset-card.is-selected {
  border-color: #ff8fb8;
}

.asset-card__thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.asset-card__audio {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #eaf7ff;
  font-size: 28px;
  color: #5eb8f0;
}

.asset-card__name {
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
  word-break: break-word;
}

.asset-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ghost-btn,
.primary-btn {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn {
  border: 1px solid rgba(201, 184, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #6a5a88;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
