<script setup lang="ts">
import { Setting, VideoPlay } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import VerticalDragSlider from '@renderer/components/VerticalDragSlider.vue'
import { PLAY_VOLUME_MAX, PLAY_VOLUME_MIN } from '@renderer/constant/play'
import { usePlayStore } from '@renderer/store/play.store'
import { beginnerPlaybackKey } from '@renderer/views/forBeginner/beginnerPlayback'
import type { MusicScoreTypeEnum } from 'deciphony-renderer'
import ScoreNotationTypeSelector from './ScoreNotationTypeSelector.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import ScoreToneColorAdjuster from './ScoreToneColorAdjuster.vue'
import BeginnerSettingsDialog from './BeginnerSettingsDialog.vue'

defineProps<{
  notationType: MusicScoreTypeEnum
  notationTypeDisabled?: boolean
}>()

const emit = defineEmits<{
  'notation-type-change': [value: MusicScoreTypeEnum]
}>()

const playback = inject(beginnerPlaybackKey)
const playStore = usePlayStore()
const { volume } = storeToRefs(playStore)

if (!playback) {
  throw new Error('BeginnerModeToolbar requires beginnerPlayback from forBeginner.vue')
}

const { playbackState, countingIn, playDisabled, stopDisabled, handlePlay, handleStop } = playback

const settingsVisible = ref(false)
const volumePanelOpen = ref(false)

const settingsDisabled = computed(() => playbackState.value !== 'stopped' || countingIn.value)
const toneColorDisabled = settingsDisabled
const volumeLabel = computed(() => `${Math.round(volume.value * 100)}%`)

function openSettings() {
  if (settingsDisabled.value) return
  settingsVisible.value = true
}

function toggleVolumePanel() {
  volumePanelOpen.value = !volumePanelOpen.value
}

function formatVolume(value: number) {
  return `${Math.round(value * 100)}%`
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-toolbar__adjuster')) {
    volumePanelOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/play" />
    </template>
    <template #center>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="settingsDisabled"
        @click="openSettings"
      >
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="playDisabled"
        @click="handlePlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>开始练习</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>停止</span>
      </button>
      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="toggleVolumePanel">
          音量 {{ volumeLabel }}
        </button>
        <div v-if="volumePanelOpen" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatVolume"
            label="音量"
            :max="PLAY_VOLUME_MAX"
            :min="PLAY_VOLUME_MIN"
            :model-value="volume"
            :step="0.01"
            @update:model-value="playStore.setVolume"
          />
        </div>
      </div>
      <ScoreToneColorAdjuster :disabled="toneColorDisabled" />
      <ScoreNotationTypeSelector
        :model-value="notationType"
        :disabled="notationTypeDisabled"
        @change="emit('notation-type-change', $event)"
      />
    </template>
  </ScoreToolbarShell>

  <BeginnerSettingsDialog v-model="settingsVisible" />
</template>

<style scoped>
.score-toolbar__stop-icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}

.score-toolbar__adjuster {
  position: relative;
}

.score-toolbar__popup {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: 40;
  padding: 12px 14px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 248, 251, 0.98);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.22);
  transform: translateX(-50%);
}
</style>
