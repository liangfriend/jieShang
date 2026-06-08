<script setup lang="ts">
import { Setting, VideoPlay } from '@element-plus/icons-vue'
import { computed, inject, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import { beginnerPlaybackKey } from '@renderer/views/forBeginner/beginnerPlayback'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import BeginnerSettingsDialog from './BeginnerSettingsDialog.vue'

const playback = inject(beginnerPlaybackKey)

if (!playback) {
  throw new Error('BeginnerModeToolbar requires beginnerPlayback from forBeginner.vue')
}

const { playbackState, countingIn, playDisabled, stopDisabled, handlePlay, handleStop } = playback

const settingsVisible = ref(false)

const settingsDisabled = computed(() => playbackState.value !== 'stopped' || countingIn.value)

function openSettings() {
  if (settingsDisabled.value) return
  settingsVisible.value = true
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
        <span>开始练习</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>停止</span>
      </button>
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
</style>
