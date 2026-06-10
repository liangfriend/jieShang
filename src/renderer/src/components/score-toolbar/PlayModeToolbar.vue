<script setup lang="ts">
import { EditPen, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import VerticalDragSlider from '@renderer/components/VerticalDragSlider.vue'
import { scorePlaybackKey } from '@renderer/utils/scorePagePlayback'
import {
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN
} from '@renderer/constant/play'
import { usePlayStore } from '@renderer/store/play.store'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import ScoreToneColorAdjuster from './ScoreToneColorAdjuster.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

const route = useRoute()
const router = useRouter()
const playback = inject(scorePlaybackKey)
const playStore = usePlayStore()
const { volume, bpm } = storeToRefs(playStore)

if (!playback) {
  throw new Error('PlayModeToolbar requires scorePlayback from play.vue')
}

const { playDisabled, pauseDisabled, stopDisabled, handlePlay, handlePause, handleStop } = playback

const activePanel = ref<'volume' | 'bpm' | null>(null)

const volumeLabel = computed(() => `${Math.round(volume.value * 100)}%`)
const bpmLabel = computed(() => `${Math.round(bpm.value)}`)

function togglePanel(panel: 'volume' | 'bpm') {
  activePanel.value = activePanel.value === panel ? null : panel
}

function formatVolume(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatBpm(value: number) {
  return `${Math.round(value)}`
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-toolbar__adjuster')) {
    activePanel.value = null
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

function switchToEdit() {
  handleStop()
  activePanel.value = null
  router.replace({
    name: 'edit',
    query: buildScoreRouteQuery(route)
  })
}

function goPractice() {
  handleStop()
  activePanel.value = null
  router.push({
    name: 'practice',
    query: buildScoreRouteQuery(route)
  })
}

function goForBeginner() {
  handleStop()
  activePanel.value = null
  router.push({
    name: 'forBeginner',
    query: buildScoreRouteQuery(route)
  })
}
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/" />
    </template>
    <template #center>
      <button type="button" class="score-toolbar__btn" @click="switchToEdit">
        <el-icon><EditPen /></el-icon>
        <span>编辑模式</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="playDisabled"
        @click="handlePlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>播放</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="pauseDisabled" @click="handlePause">
        <el-icon><VideoPause /></el-icon>
        <span>暂停</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>停止</span>
      </button>
      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('volume')">
          音量 {{ volumeLabel }}
        </button>
        <div v-if="activePanel === 'volume'" class="score-toolbar__popup" @pointerdown.stop>
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
      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('bpm')">
          BPM {{ bpmLabel }}
        </button>
        <div v-if="activePanel === 'bpm'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatBpm"
            label="BPM"
            :max="PLAY_BPM_MAX"
            :min="PLAY_BPM_MIN"
            :model-value="bpm"
            :step="1"
            @update:model-value="playStore.setBpm"
          />
        </div>
      </div>
      <ScoreToneColorAdjuster />
      <button type="button" class="score-toolbar__btn" @click="goPractice">
        <span>练习模式</span>
      </button>
      <button type="button" class="score-toolbar__btn" @click="goForBeginner">
        <span>新手模式</span>
      </button>
    </template>
  </ScoreToolbarShell>
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
