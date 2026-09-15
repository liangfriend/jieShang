<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { VideoListItem } from '@renderer/utils/fileHelper/videoFile'
import {
  displayMediaName,
  formatByteSize,
  formatMediaDuration,
  mediaFileExtension,
  toPlayableMediaUrl
} from '@renderer/utils/fileHelper/mediaFile'
import {
  probeVideoMetadata,
  type VideoFileMetadata
} from '@renderer/views/myVideo/videoMetadata'

defineOptions({ name: 'VideoDetailDialog' })

const props = defineProps<{
  modelValue: boolean
  item: VideoListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t, locale } = useI18n()
const loading = ref(false)
const meta = ref<VideoFileMetadata | null>(null)
const error = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const src = computed(() =>
  props.item ? toPlayableMediaUrl('video', props.item.url) : ''
)

const createdText = computed(() => {
  const raw = props.item?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return date.toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN')
})

watch(
  () => [props.modelValue, props.item?.id] as const,
  async ([open]) => {
    meta.value = null
    error.value = ''
    if (!open || !props.item) return
    loading.value = true
    try {
      meta.value = await probeVideoMetadata(props.item.id, props.item.url)
      if (!meta.value) error.value = t('myVideo.detail.probeFailed')
    } finally {
      loading.value = false
    }
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('myVideo.detail.title')"
    width="560px"
    class="video-detail-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div v-loading="loading" class="video-detail">
      <template v-if="item">
        <div class="video-detail__preview">
          <video v-if="src" :src="src" controls preload="metadata" playsinline />
        </div>
        <h3 class="video-detail__name">{{ displayMediaName(item.name) }}</h3>
        <p v-if="error" class="video-detail__error">{{ error }}</p>
        <dl class="video-detail__grid">
          <div>
            <dt>{{ t('myVideo.detail.duration') }}</dt>
            <dd>{{ formatMediaDuration(meta?.duration) }}</dd>
          </div>
          <div>
            <dt>{{ t('myVideo.detail.dimensions') }}</dt>
            <dd>
              {{
                meta
                  ? t('myVideo.detail.dimensionsValue', {
                      w: meta.width,
                      h: meta.height
                    })
                  : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('myVideo.detail.size') }}</dt>
            <dd>{{ formatByteSize(meta?.byteLength) }}</dd>
          </div>
          <div>
            <dt>{{ t('myVideo.detail.format') }}</dt>
            <dd>{{ mediaFileExtension(item.url) || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('myVideo.detail.createdAt') }}</dt>
            <dd>{{ createdText }}</dd>
          </div>
        </dl>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped>
.video-detail {
  min-height: 160px;
}

.video-detail__preview {
  margin-bottom: 14px;
  border-radius: 14px;
  overflow: hidden;
  background: #1a1420;
}

.video-detail__preview video {
  width: 100%;
  max-height: 280px;
  display: block;
  background: #1a1420;
}

.video-detail__name {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}

.video-detail__error {
  margin: 0 0 12px;
  font-size: 13px;
  color: #b91c1c;
}

.video-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.video-detail__grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 248, 251, 0.95);
}

.video-detail__grid dt {
  font-size: 11px;
  color: #9a8aa8;
}

.video-detail__grid dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
}
</style>
