<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePlayStore } from '@renderer/store/play.store'
import { PLAY_DEFAULT_BPM } from '@renderer/constant/play'
import NoteSliceBuffOverlay from '@renderer/views/noteSlice/NoteSliceBuffOverlay.vue'
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
import {
  bindNoteSliceGameNotationMode,
  clearNoteSliceGameNotationMode,
  getActiveNoteSliceNotationMode
} from '@renderer/views/noteSlice/noteSliceNotationMode'
import { provideNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'
import { createNoteSliceSessionAchievementManager } from '@renderer/views/noteSlice/noteSliceSessionAchievementManager'
import { finalizeNoteSliceGameScore } from '@renderer/utils/noteSliceHighScoreHelper'

const props = defineProps<{
  mode: NoteSliceGameMode
}>()

const emit = defineEmits<{
  gameEnd: [payload: NoteSliceGameEndPayload]
}>()

const gameSettings = useGameSettingsStore()
const playStore = usePlayStore()

/**
 * 必须在 onMounted 里绑定（不能放 setup 顶层）：
 * 「再来一局」靠 :key 重挂载时，Vue 会先跑新实例 setup，再跑旧实例 onUnmounted。
 * 若在 setup 里 bind、在 onUnmounted 里 clear，旧实例会把新局刚绑上的极限管理器清掉，
 * getActiveSpawnConfig 回退到默认简单难度（全部调号），开局就会出现 F 等调。
 * clear 时带上本局 generation，即使生命周期顺序变化也不会误清新局。
 */
let spawnConfigGeneration: number | undefined
let notationModeGeneration: number | undefined

function syncSpawnConfigManager(): void {
  gameSettings.init()
  // 谱面模式（线谱 / 简谱）对所有游戏模式生效，进入一局时绑定
  notationModeGeneration = bindNoteSliceGameNotationMode(gameSettings.notationMode)
  if (props.mode === 'extreme') {
    spawnConfigGeneration = bindNoteSliceSpawnManager(createExtremeSpawnConfigManager())
    return
  }
  spawnConfigGeneration = bindNoteSliceGameDifficulty(gameSettings.difficulty)
}

onMounted(async () => {
  syncSpawnConfigManager()
  await playStore.waitReady()
  await playStore.ensureCollectionToneColorInitialized()
  playStore.setBpm(PLAY_DEFAULT_BPM)
})

onUnmounted(() => {
  clearNoteSliceGameDifficulty(spawnConfigGeneration)
  clearNoteSliceGameNotationMode(notationModeGeneration)
})

const session = provideNoteSliceGameSession(props.mode)
const achievementManager = createNoteSliceSessionAchievementManager(props.mode)

watch(
  () => session.combo.value,
  (combo) => {
    achievementManager.recordCombo(combo)
  }
)

const playfieldBuffClass = computed(() => ({
  'note-slice-playfield--freeze': props.mode !== 'extreme' && session.isFrozen.value,
  'note-slice-playfield--double': props.mode !== 'extreme' && session.isDoubleScore.value
}))

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
  async (isGameOver) => {
    if (!isGameOver || session.gameEndReason.value === null) return
    const score =
      props.mode === 'extreme' ? session.finalSurvivalMs.value : session.score.value
    gameLayerRef.value?.stopTick()
    if (props.mode !== 'extreme') {
      gameSettings.init()
    }
    // 最高分按本局谱面模式（线谱 / 简谱）分开记录；成就判定与谱面模式无关
    const { isNewPersonalBest, previousBest } = await finalizeNoteSliceGameScore(
      props.mode,
      score,
      gameSettings.difficulty,
      getActiveNoteSliceNotationMode()
    )
    const newlyUnlockedAchievements = await achievementManager.evaluateAndUnlock({
      score: props.mode === 'extreme' ? 0 : session.score.value,
      survivalMs: props.mode === 'extreme' ? session.finalSurvivalMs.value : 0
    })
    emit('gameEnd', {
      score,
      reason: session.gameEndReason.value,
      isNewPersonalBest,
      previousBest,
      newlyUnlockedAchievements
    })
  }
)
</script>

<template>
  <div class="note-slice-game">
    <div class="stack">
      <div class="note-slice-playfield" :class="playfieldBuffClass">
        <!-- 背景层：星空 -->
        <div class="stackItem stackItem--bg">
          <NoteSliceStarfield />
        </div>

        <!-- 游戏层：音符块 + 清除特效 -->
        <div class="stackItem stackItem--game">
          <NoteSliceGameLayer ref="gameLayerRef" />
        </div>
      </div>

      <!-- 增益氛围：向内暗角 + 状态提示 -->
      <NoteSliceBuffOverlay />

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

.note-slice-playfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  transition: filter 0.45s ease;
}

.note-slice-playfield--freeze {
  filter: saturate(0.88) hue-rotate(-14deg) brightness(1.08) contrast(1.03);
}

.note-slice-playfield--double {
  filter: saturate(1.28) sepia(0.14) brightness(1.1) contrast(1.04);
}

.note-slice-playfield--freeze.note-slice-playfield--double {
  filter: saturate(1.06) hue-rotate(6deg) brightness(1.12) contrast(1.05);
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
  z-index: 3;
  pointer-events: none;
}
</style>
