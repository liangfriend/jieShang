<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AudioListItem } from '@renderer/utils/fileHelper/audioFile'
import { audioFileExtension, displayAudioName } from '@renderer/utils/fileHelper/audioFile'
import {
  formatAudioDuration,
  formatByteSize,
  probeAudioMetadata,
  type AudioFileMetadata
} from '@renderer/views/myAudio/audioMetadata'

defineOptions({ name: 'AudioDetailDialog' })

const props = defineProps<{
  modelValue: boolean
  item: AudioListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t, locale } = useI18n()
const loading = ref(false)
const meta = ref<AudioFileMetadata | null>(null)
const error = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const createdText = computed(() => {
  const raw = props.item?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return date.toLocaleString(locale.value === 'en' ? 'en-US' : 'zh-CN')
})

watch(
  () => [props.modelValue, props.item?.id] as const,
  async ([open, id]) => {
    meta.value = null
    error.value = ''
    if (!open || !props.item || id == null) return
    loading.value = true
    try {
      meta.value = await probeAudioMetadata(props.item.id, props.item.url)
      if (!meta.value) error.value = t('myAudio.detail.probeFailed')
    } finally {
      loading.value = false
    }
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('myAudio.detail.title')"
    width="440px"
    class="audio-detail-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div v-loading="loading" class="audio-detail">
      <template v-if="item">
        <h3 class="audio-detail__name">{{ displayAudioName(item.name) }}</h3>
        <p v-if="error" class="audio-detail__error">{{ error }}</p>
        <dl class="audio-detail__grid">
          <div>
            <dt>{{ t('myAudio.detail.duration') }}</dt>
            <dd>{{ formatAudioDuration(meta?.duration) }}</dd>
          </div>
          <div>
            <dt>{{ t('myAudio.detail.sampleRate') }}</dt>
            <dd>
              {{
                meta?.sampleRate
                  ? t('myAudio.detail.sampleRateValue', { hz: meta.sampleRate })
                  : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('myAudio.detail.channels') }}</dt>
            <dd>
              {{
                meta?.numberOfChannels != null
                  ? t('myAudio.detail.channelsValue', { n: meta.numberOfChannels })
                  : '—'
              }}
            </dd>
          </div>
          <div>
            <dt>{{ t('myAudio.detail.size') }}</dt>
            <dd>{{ formatByteSize(meta?.byteLength) }}</dd>
          </div>
          <div>
            <dt>{{ t('myAudio.detail.format') }}</dt>
            <dd>{{ audioFileExtension(item.url) || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('myAudio.detail.createdAt') }}</dt>
            <dd>{{ createdText }}</dd>
          </div>
        </dl>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped>
.audio-detail {
  min-height: 120px;
}

.audio-detail__name {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}

.audio-detail__error {
  margin: 0 0 12px;
  font-size: 13px;
  color: #b91c1c;
}

.audio-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.audio-detail__grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 248, 251, 0.95);
}

.audio-detail__grid dt {
  font-size: 11px;
  color: #9a8aa8;
}

.audio-detail__grid dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
}
</style>
