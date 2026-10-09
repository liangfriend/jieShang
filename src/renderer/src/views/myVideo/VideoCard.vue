<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete } from '@element-plus/icons-vue'
import type { VideoListItem } from '@renderer/utils/fileHelper/videoFile'
import {
  displayMediaName,
  formatMediaDuration,
  toPlayableMediaUrl
} from '@renderer/utils/fileHelper/mediaFile'
import {
  getCachedVideoMetadata,
  probeVideoMetadata
} from '@renderer/views/myVideo/videoMetadata'

defineOptions({ name: 'VideoCard' })

const props = defineProps<{
  item: VideoListItem
  deleting?: boolean
}>()

const emit = defineEmits<{
  openDetail: []
  delete: [event: Event]
}>()

const { t } = useI18n()

const src = computed(() => toPlayableMediaUrl('video', props.item.url))
const duration = computed(
  () => getCachedVideoMetadata(props.item.id)?.duration ?? 0
)

const videoRef = ref<HTMLVideoElement | null>(null)

watch(
  () => props.item.id,
  (id) => {
    void probeVideoMetadata(id, props.item.url)
  },
  { immediate: true }
)

// 删除前释放 <video> 对文件的占用，否则 Windows 上无法删除源文件
watch(
  () => props.deleting,
  (deleting) => {
    const el = videoRef.value
    if (!deleting || !el) return
    el.removeAttribute('src')
    el.load()
  }
)
</script>

<template>
  <article class="video-card" @click="emit('openDetail')">
    <button
      type="button"
      class="video-card__delete"
      :disabled="deleting"
      :aria-label="t('myVideo.deleteAria')"
      @click="emit('delete', $event)"
    >
      <el-icon><Delete /></el-icon>
    </button>

    <div class="video-card__preview">
      <video
        ref="videoRef"
        class="video-card__el"
        :src="deleting ? undefined : src"
        preload="metadata"
        playsinline
        muted
      />
      <span v-if="duration > 0" class="video-card__duration">
        {{ formatMediaDuration(duration) }}
      </span>
    </div>

    <h2 class="video-card__title">{{ displayMediaName(item.name) }}</h2>
  </article>
</template>

<style scoped>
.video-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.14);
  cursor: pointer;
  color: #5c4a6a;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 34px rgba(200, 140, 180, 0.22);
}

.video-card__delete {
  position: absolute;
  top: 10px;
  right: 10px;
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

.video-card:hover .video-card__delete,
.video-card:focus-within .video-card__delete {
  opacity: 1;
  pointer-events: auto;
}

.video-card__preview {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #1a1420;
  aspect-ratio: 16 / 9;
  pointer-events: none;
}

.video-card__el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #1a1420;
}

.video-card__duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: rgba(26, 20, 32, 0.72);
}

.video-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}
</style>
