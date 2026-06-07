<script setup lang="ts">
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { inject } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import { scorePlaybackKey } from '@renderer/utils/scorePagePlayback'
import ScoreToolbarShell from './ScoreToolbarShell.vue'

const playback = inject(scorePlaybackKey)

if (!playback) {
  throw new Error('PracticeModeToolbar requires scorePlayback from practice.vue')
}

const { playDisabled, pauseDisabled, stopDisabled, handlePlay, handlePause, handleStop } = playback
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/play" />
    </template>
    <template #center>
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
</style>
