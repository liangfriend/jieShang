<script setup lang="ts">
import { Delete, Setting, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { scorePlaybackKey } from '@renderer/utils/scorePagePlayback'
import type { MusicScoreTypeEnum } from 'deciphony-renderer'
import ScoreNotationTypeSelector from './ScoreNotationTypeSelector.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import ScoreToneColorAdjuster from './ScoreToneColorAdjuster.vue'
import PracticeSettingsDialog from './PracticeSettingsDialog.vue'

defineProps<{
  notationType: MusicScoreTypeEnum
  notationTypeDisabled?: boolean
}>()

const emit = defineEmits<{
  'notation-type-change': [value: MusicScoreTypeEnum]
}>()

const { t } = useI18n()

const playback = inject(scorePlaybackKey)

if (!playback) {
  throw new Error('PracticeModeToolbar requires scorePlayback from practice.vue')
}

const {
  playbackState,
  countingIn,
  playDisabled,
  pauseDisabled,
  stopDisabled,
  handlePlay,
  handlePause,
  handleStop,
  handleClearPlayData
} = playback

const settingsVisible = ref(false)

// 设置：仅停止状态可用；预备拍期间禁用
const settingsDisabled = computed(() => playbackState.value !== 'stopped' || countingIn.value)
const toneColorDisabled = settingsDisabled
// 清空：预备拍期间禁用
const clearDisabled = computed(() => countingIn.value)

function openSettings() {
  if (settingsDisabled.value) return
  settingsVisible.value = true
}

function clearPlayData() {
  if (clearDisabled.value) return
  handleClearPlayData?.()
}
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
        <span>{{ t('practice.toolbar.settings') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="playDisabled"
        @click="handlePlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>{{ t('practice.toolbar.play') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="pauseDisabled"
        @click="handlePause"
      >
        <el-icon><VideoPause /></el-icon>
        <span>{{ t('practice.toolbar.pause') }}</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>{{ t('practice.toolbar.stop') }}</span>
      </button>
      <ScoreToneColorAdjuster :disabled="toneColorDisabled" />
      <ScoreNotationTypeSelector
        :model-value="notationType"
        :disabled="notationTypeDisabled"
        @change="emit('notation-type-change', $event)"
      />
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="clearDisabled"
        @click="clearPlayData"
      >
        <el-icon><Delete /></el-icon>
        <span>{{ t('practice.toolbar.clearPlayData') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>

  <PracticeSettingsDialog v-model="settingsVisible" />
</template>

<style scoped>
.score-toolbar__stop-icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}
</style>
