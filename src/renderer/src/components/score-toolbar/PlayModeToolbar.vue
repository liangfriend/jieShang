<script setup lang="ts">
import { EditPen, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

type PlaybackState = 'idle' | 'playing' | 'paused'

const route = useRoute()
const router = useRouter()
const playbackState = ref<PlaybackState>('idle')

const playDisabled = computed(() => playbackState.value === 'playing')
const pauseDisabled = computed(() => playbackState.value !== 'playing')
const stopDisabled = computed(() => playbackState.value === 'idle')

function switchToEdit() {
  router.replace({
    name: 'edit',
    query: buildScoreRouteQuery(route)
  })
}

function handlePlay() {
  if (playbackState.value === 'idle' || playbackState.value === 'paused') {
    playbackState.value = 'playing'
  }
}

function handlePause() {
  if (playbackState.value === 'playing') {
    playbackState.value = 'paused'
  }
}

function handleStop() {
  playbackState.value = 'idle'
}

function goPractice() {
  router.push({
    name: 'practice',
    query: buildScoreRouteQuery(route)
  })
}

function goForBeginner() {
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
</style>
