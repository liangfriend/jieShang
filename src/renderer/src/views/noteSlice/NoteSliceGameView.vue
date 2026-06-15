<script lang="ts" setup>
import { onUnmounted, ref, watch } from 'vue'
import NoteSliceGameHud from '@renderer/views/noteSlice/NoteSliceGameHud.vue'
import NoteSliceGameLayer from '@renderer/views/noteSlice/NoteSliceGameLayer.vue'
import NoteSliceStarfield from '@renderer/views/noteSlice/NoteSliceStarfield.vue'
import NoteSliceStartCountdown from '@renderer/views/noteSlice/NoteSliceStartCountdown.vue'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import type {
  NoteSliceGameEndPayload,
  NoteSliceGameMode
} from '@renderer/views/noteSlice/noteSliceGameMode'
import {
  bindNoteSliceGameDifficulty,
  bindNoteSliceSpawnManager,
  clearNoteSliceGameDifficulty
} from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import { createExtremeSpawnConfigManager } from '@renderer/views/noteSlice/noteSliceSpawnConfigManager'
import { provideNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'

const props = defineProps<{
  mode: NoteSliceGameMode
}>()

const emit = defineEmits<{
  gameEnd: [payload: NoteSliceGameEndPayload]
}>()

const gameSettings = useGameSettingsStore()

function syncSpawnConfigManager(): void {
  if (props.mode === 'extreme') {
    bindNoteSliceSpawnManager(createExtremeSpawnConfigManager())
    return
  }
  gameSettings.init()
  bindNoteSliceGameDifficulty(gameSettings.difficulty)
}

syncSpawnConfigManager()

onUnmounted(() => {
  clearNoteSliceGameDifficulty()
})

const session = provideNoteSliceGameSession(props.mode)

type GameLayerExpose = {
  startTick: () => void
  stopTick: () => void
}

const gameLayerRef = ref<GameLayerExpose | null>(null)
const showStartCountdown = ref(true)

function onStartCountdownComplete(): void {
  showStartCountdown.value = false
  session.startGame()
  gameLayerRef.value?.startTick()
}

watch(
  () => session.isGameOver.value,
  (isGameOver) => {
    if (!isGameOver || session.gameEndReason.value === null) return
    const survivalMs =
      props.mode === 'extreme' ? session.finalSurvivalMs.value : session.score.value
    gameLayerRef.value?.stopTick()
    emit('gameEnd', {
      score: survivalMs,
      reason: session.gameEndReason.value
    })
  }
)
</script>

<template>
  <div class="note-slice-game">
    <div class="stack">
      <!-- 背景层：星空 -->
      <div class="stackItem stackItem--bg">
        <NoteSliceStarfield />
      </div>

      <!-- 游戏层：音符块 + 清除特效 -->
      <div class="stackItem stackItem--game">
        <NoteSliceGameLayer ref="gameLayerRef" />
      </div>

      <!-- UI 层：返回、分数、连击、模式信息 -->
      <div class="stackItem stackItem--ui">
        <NoteSliceGameHud />
      </div>

      <!-- 开局倒计时：结束后手动 startTick -->
      <NoteSliceStartCountdown v-if="showStartCountdown" @complete="onStartCountdownComplete" />
    </div>
  </div>
</template>

<style scoped>
.note-slice-game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #070818;
}

.stack {
  position: relative;
  width: 100%;
  height: 100%;
}

.stackItem {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stackItem--bg {
  z-index: 0;
}

.stackItem--game {
  z-index: 1;
  pointer-events: none;
}

.stackItem--game > * {
  pointer-events: auto;
}

.stackItem--ui {
  z-index: 2;
  pointer-events: none;
}
</style>
