<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ImageListItem } from '@renderer/utils/fileHelper/imageFile'
import {
  displayMediaName,
  formatByteSize,
  mediaFileExtension,
  toPlayableMediaUrl
} from '@renderer/utils/fileHelper/mediaFile'
import {
  probeImageMetadata,
  type ImageFileMetadata
} from '@renderer/views/myImage/imageMetadata'

defineOptions({ name: 'ImageDetailDialog' })

const props = defineProps<{
  modelValue: boolean
  item: ImageListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t, locale } = useI18n()
const loading = ref(false)
const meta = ref<ImageFileMetadata | null>(null)
const error = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const src = computed(() =>
  props.item ? toPlayableMediaUrl('image', props.item.url) : ''
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
      meta.value = await probeImageMetadata(props.item.id, props.item.url)
      if (!meta.value) error.value = t('myImage.detail.probeFailed')
    } finally {
      loading.value = false
    }
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('myImage.detail.title')"
    width="520px"
    class="image-detail-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div v-loading="loading" class="image-detail">
      <template v-if="item">
        <div class="image-detail__preview">
          <img v-if="src" :src="src" :alt="displayMediaName(item.name)" />
        </div>
        <h3 class="image-detail__name">{{ displayMediaName(item.name) }}</h3>
        <p v-if="error" class="image-detail__error">{{ error }}</p>
        <dl class="image-detail__grid">
          <div>
            <dt>{{ t('myImage.detail.dimensions') }}</dt>
            <dd>
              {{
                meta
                  ? t('myImage.detail.dimensionsValue', {
                      w: meta.width,
                      h: meta.height
                    })
                  : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('myImage.detail.size') }}</dt>
            <dd>{{ formatByteSize(meta?.byteLength) }}</dd>
          </div>
          <div>
            <dt>{{ t('myImage.detail.format') }}</dt>
            <dd>{{ mediaFileExtension(item.url) || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('myImage.detail.createdAt') }}</dt>
            <dd>{{ createdText }}</dd>
          </div>
        </dl>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped>
.image-detail {
  min-height: 160px;
}

.image-detail__preview {
  margin-bottom: 14px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 248, 251, 0.95);
  max-height: 280px;
  display: grid;
  place-items: center;
}

.image-detail__preview img {
  max-width: 100%;
  max-height: 280px;
  display: block;
  object-fit: contain;
}

.image-detail__name {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}

.image-detail__error {
  margin: 0 0 12px;
  font-size: 13px;
  color: #b91c1c;
}

.image-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.image-detail__grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 248, 251, 0.95);
}

.image-detail__grid dt {
  font-size: 11px;
  color: #9a8aa8;
}

.image-detail__grid dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
}
</style>
