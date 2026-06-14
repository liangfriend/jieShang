<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import NoteSliceArcadeGameOverDialog from '@renderer/views/noteSlice/NoteSliceArcadeGameOverDialog.vue'
import NoteSliceGameView from '@renderer/views/noteSlice/NoteSliceGameView.vue'
import type { NoteSliceGameEndPayload } from '@renderer/views/noteSlice/noteSliceGameMode'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import { upsertNoteSliceHighScoreIfHigher } from '@renderer/utils/noteSliceHighScoreHelper'

const { difficulty } = storeToRefs(useGameSettingsStore())

const gameKey = ref(0)
const dialogVisible = ref(false)
const endPayload = ref<NoteSliceGameEndPayload | null>(null)

function onGameEnd(payload: NoteSliceGameEndPayload): void {
  endPayload.value = payload
  dialogVisible.value = true
  void upsertNoteSliceHighScoreIfHigher('arcade', difficulty.value, payload.score)
}

function onPlayAgain(): void {
  endPayload.value = null
  gameKey.value += 1
}
</script>

<template>
  <NoteSliceGameView :key="gameKey" mode="arcade" @game-end="onGameEnd" />

  <NoteSliceArcadeGameOverDialog
    v-model="dialogVisible"
    :score="endPayload?.score ?? 0"
    @play-again="onPlayAgain"
  />
</template>
