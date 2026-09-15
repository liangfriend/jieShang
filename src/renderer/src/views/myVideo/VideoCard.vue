<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete, VideoPause, VideoPlay } from '@element-plus/icons-vue'
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
import type { useVideoListPlayer } from '@renderer/views/myVideo/useVideoListPlayer'

defineOptions({ name: 'VideoCard' })

const props = defineProps<{
  item: VideoListItem
  player: ReturnType<typeof useVideoListPlayer>
  deleting?: boolean
}>()

const emit = defineEmits<{
  openDetail: []
  delete: [event: Event]
}>()

const { t } = useI18n()
const dragRatio = ref<number | null>(null)
const src = computed(() => toPlayableMediaUrl('video', props.item.url))

const active = computed(() => props.player.isActive(props.item.id))
const playing = computed(() => active.value && props.player.state.playing)
const duration = computed(() => {
  if (active.value && props.player.state.duration > 0) return props.player.state.duration
  return getCachedVideoMetadata(props.item.id)?.duration ?? 0
})
const currentTime = computed(() => (active.value ? props.player.state.currentTime : 0))
const canStop = computed(() => active.value && (playing.value || currentTime.value > 0.05))
const ratio = computed(() => {
  if (dragRatio.value != null) return dragRatio.value
  if (!duration.value) return 0
  return Math.min(1, Math.max(0, currentTime.value / duration.value))
})

watch(
  () => props.item.id,
  (id) => {
    void probeVideoMetadata(id, props.item.url)
  },
  { immediate: true }
)

function onVideoRef(el: unknown) {
  props.player.bindElement(
    props.item.id,
    el instanceof HTMLVideoElement ? el : null
  )
}

async function onPlayPause(event: Event) {
  event.stopPropagation()
  try {
    await props.player.toggle(props.item.id)
  } catch {
    // ignore
  }
}

function onStop(event: Event) {
  event.stopPropagation()
  if (!canStop.value) return
  props.player.stop()
}

function ratioFromPointer(event: PointerEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0) return 0
  return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
}

async function onSeekPointerDown(event: PointerEvent) {
  event.stopPropagation()
  event.preventDefault()
  const track = event.currentTarget as HTMLElement
  track.setPointerCapture(event.pointerId)
  props.player.beginSeek()
  try {
    await props.player.ensureActive(props.item.id)
  } catch {
    props.player.endSeek(0)
    return
  }
  dragRatio.value = ratioFromPointer(event, track)
}

function onSeekPointerMove(event: PointerEvent) {
  if (dragRatio.value == null) return
  event.stopPropagation()
  dragRatio.value = ratioFromPointer(event, event.currentTarget as HTMLElement)
}

function onSeekPointerUp(event: PointerEvent) {
  if (dragRatio.value == null) return
  event.stopPropagation()
  const next = ratioFromPointer(event, event.currentTarget as HTMLElement)
  props.player.endSeek(next)
  dragRatio.value = null
}
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

    <div class="video-card__preview" @click.stop>
      <video
        :ref="onVideoRef"
        class="video-card__el"
        :src="src"
        preload="metadata"
        playsinline
      />
    </div>

    <h2 class="video-card__title">{{ displayMediaName(item.name) }}</h2>

    <div class="video-card__controls" @click.stop>
      <button
        type="button"
        class="ctrl-btn"
        :aria-label="playing ? t('myVideo.pause') : t('myVideo.play')"
        @click="onPlayPause"
      >
        <el-icon>
          <VideoPause v-if="playing" />
          <VideoPlay v-else />
        </el-icon>
      </button>
      <button
        type="button"
        class="ctrl-btn"
        :aria-label="t('myVideo.stop')"
        :disabled="!canStop"
        @click="onStop"
      >
        <span class="stop-icon" />
      </button>
      <span class="video-card__time">
        {{ formatMediaDuration(currentTime) }} /
        {{ formatMediaDuration(duration || null) }}
      </span>
    </div>

    <div
      class="video-card__progress"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.round(ratio * 100)"
      :aria-label="t('myVideo.seek')"
      tabindex="0"
      @click.stop
      @pointerdown="onSeekPointerDown"
      @pointermove="onSeekPointerMove"
      @pointerup="onSeekPointerUp"
      @pointercancel="onSeekPointerUp"
    >
      <div class="video-card__progress-fill" :style="{ width: `${ratio * 100}%` }" />
    </div>
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
  border-radius: 14px;
  overflow: hidden;
  background: #1a1420;
  aspect-ratio: 16 / 9;
}

.video-card__el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #1a1420;
}

.video-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}

.video-card__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
  cursor: pointer;
}

.ctrl-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.stop-icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}

.video-card__time {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #9a8aa8;
}

.video-card__progress {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(233, 220, 235, 0.95);
  overflow: hidden;
  touch-action: none;
  cursor: pointer;
}

.video-card__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffb8d0, #8ec5ff);
  pointer-events: none;
}
</style>
