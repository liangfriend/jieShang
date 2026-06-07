<script setup lang="ts">
import { Delete, Setting, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed, inject, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import { scorePlaybackKey } from '@renderer/utils/scorePagePlayback'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import PracticeSettingsDialog from './PracticeSettingsDialog.vue'

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
        <span>设置</span>
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
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="pauseDisabled"
        @click="handlePause"
      >
        <el-icon><VideoPause /></el-icon>
        <span>暂停</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>停止</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="clearDisabled"
        @click="clearPlayData"
      >
        <el-icon><Delete /></el-icon>
        <span>清空弹奏数据</span>
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
