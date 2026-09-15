<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import type { AudioListItem } from '@renderer/utils/fileHelper/audioFile'
import { displayAudioName } from '@renderer/utils/fileHelper/audioFile'
import {
  formatAudioDuration,
  getCachedAudioMetadata,
  probeAudioMetadata
} from '@renderer/views/myAudio/audioMetadata'
import type { useAudioListPlayer } from '@renderer/views/myAudio/useAudioListPlayer'

defineOptions({ name: 'AudioCard' })

const props = defineProps<{
  item: AudioListItem
  player: ReturnType<typeof useAudioListPlayer>
  deleting?: boolean
}>()

const emit = defineEmits<{
  openDetail: []
  delete: [event: Event]
}>()

const { t } = useI18n()
const dragRatio = ref<number | null>(null)

const active = computed(() => props.player.isActive(props.item.id))
const playing = computed(() => active.value && props.player.state.playing)
const duration = computed(() => {
  if (active.value && props.player.state.duration > 0) return props.player.state.duration
  return getCachedAudioMetadata(props.item.id)?.duration ?? 0
})
const currentTime = computed(() => (active.value ? props.player.state.currentTime : 0))
/** 播放中，或已暂停但未回到起点时，停止才有意义 */
const canStop = computed(() => active.value && (playing.value || currentTime.value > 0.05))
const ratio = computed(() => {
  if (dragRatio.value != null) return dragRatio.value
  if (!duration.value) return 0
  return Math.min(1, Math.max(0, currentTime.value / duration.value))
})

watch(
  () => props.item.id,
  (id) => {
    void probeAudioMetadata(id, props.item.url)
  },
  { immediate: true }
)

async function onPlayPause(event: Event) {
  event.stopPropagation()
  try {
    await props.player.toggle(props.item.id, props.item.url)
  } catch {
    // ignore play failures (codec / missing file)
  }
}

function onStop(event: Event) {
  event.stopPropagation()
  if (!canStop.value) return
  props.player.stop()
}

function onDelete(event: Event) {
  emit('delete', event)
}

function onOpenDetail() {
  emit('openDetail')
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
  if (!active.value) {
    try {
      await props.player.load(props.item.id, props.item.url)
    } catch {
      props.player.endSeek(0)
      return
    }
  }
  dragRatio.value = ratioFromPointer(event, track)
}

function onSeekPointerMove(event: PointerEvent) {
  if (dragRatio.value == null) return
  event.stopPropagation()
  const track = event.currentTarget as HTMLElement
  dragRatio.value = ratioFromPointer(event, track)
}

function onSeekPointerUp(event: PointerEvent) {
  if (dragRatio.value == null) return
  event.stopPropagation()
  const track = event.currentTarget as HTMLElement
  const next = ratioFromPointer(event, track)
  props.player.endSeek(next)
  dragRatio.value = null
}
</script>

<template>
  <article class="audio-card" @click="onOpenDetail">
    <button
      type="button"
      class="audio-card__delete"
      :disabled="deleting"
      :aria-label="t('myAudio.deleteAria')"
      @click="onDelete"
    >
      <el-icon><Delete /></el-icon>
    </button>

    <h2 class="audio-card__title">{{ displayAudioName(item.name) }}</h2>

    <div class="audio-card__controls" @click.stop>
      <button
        type="button"
        class="ctrl-btn"
        :aria-label="playing ? t('myAudio.pause') : t('myAudio.play')"
        @click="onPlayPause"
      >
        <el-icon>
          <VideoPause v-if="playing" />
          <VideoPlay v-else />
        </el-icon>
      </button>
      <button
        type="button"
        class="ctrl-btn ctrl-btn--stop"
        :aria-label="t('myAudio.stop')"
        :disabled="!canStop"
        @click="onStop"
      >
        <span class="stop-icon" />
      </button>
      <span class="audio-card__time">
        {{ formatAudioDuration(currentTime) }} /
        {{ formatAudioDuration(duration || null) }}
      </span>
    </div>

    <div
      class="audio-card__progress"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.round(ratio * 100)"
      :aria-label="t('myAudio.seek')"
      tabindex="0"
      @click.stop
      @pointerdown="onSeekPointerDown"
      @pointermove="onSeekPointerMove"
      @pointerup="onSeekPointerUp"
      @pointercancel="onSeekPointerUp"
    >
      <div class="audio-card__progress-fill" :style="{ width: `${ratio * 100}%` }" />
    </div>
  </article>
</template>

<style scoped>
.audio-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 16px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.14);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  color: #5c4a6a;
}

.audio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 34px rgba(200, 140, 180, 0.22);
}

.audio-card__delete {
  position: absolute;
  top: 10px;
  right: 10px;
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
  transition: opacity 0.15s ease;
}

.audio-card:hover .audio-card__delete,
.audio-card:focus-within .audio-card__delete {
  opacity: 1;
  pointer-events: auto;
}

.audio-card__delete:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.audio-card__title {
  margin: 0 36px 0 0;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
}

.audio-card__controls {
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

.audio-card__time {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #9a8aa8;
}

.audio-card__progress {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(233, 220, 235, 0.95);
  overflow: hidden;
  touch-action: none;
  cursor: pointer;
}

.audio-card__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffb8d0, #8ec5ff);
  pointer-events: none;
}
</style>
