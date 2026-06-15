<script lang="ts" setup>
import { ref } from 'vue'
import NoteSliceExtremeGameOverDialog from '@renderer/views/noteSlice/NoteSliceExtremeGameOverDialog.vue'
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

  <NoteSliceExtremeGameOverDialog
    v-model="dialogVisible"
    :survival-ms="endPayload?.score ?? 0"
    @play-again="onPlayAgain"
  />
</template>
