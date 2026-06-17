<script lang="ts" setup>
import { ref } from 'vue'
import NoteSliceGameOverDialog from '@renderer/views/noteSlice/NoteSliceGameOverDialog.vue'
import NoteSliceGameView from '@renderer/views/noteSlice/NoteSliceGameView.vue'
import type { NoteSliceGameEndPayload } from '@renderer/views/noteSlice/noteSliceGameMode'

const gameKey = ref(0)
const dialogVisible = ref(false)
const endPayload = ref<NoteSliceGameEndPayload | null>(null)

function onGameEnd(payload: NoteSliceGameEndPayload): void {
  endPayload.value = payload
  dialogVisible.value = true
}

function onPlayAgain(): void {
  endPayload.value = null
  gameKey.value += 1
}
</script>

<template>
  <NoteSliceGameView :key="gameKey" mode="extreme" @game-end="onGameEnd" />

  <NoteSliceGameOverDialog
    v-model="dialogVisible"
    mode="extreme"
    :score="endPayload?.score ?? 0"
    :reason="endPayload?.reason"
    :is-new-personal-best="endPayload?.isNewPersonalBest ?? false"
    :previous-best="endPayload?.previousBest ?? 0"
    :newly-unlocked-achievements="endPayload?.newlyUnlockedAchievements ?? []"
    @play-again="onPlayAgain"
  />
</template>
