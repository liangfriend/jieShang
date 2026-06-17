<script lang="ts" setup>
import type { VDom } from 'deciphony-renderer'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createScoreNoteHeadOverlay } from './createScoreNoteHeadOverlay'
import type { ScoreNoteHeadOverlayApi } from './types'

const props = defineProps<{
  width: number
  height: number
  findElementByVDom?: (node: VDom) => SVGElement | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let overlay: ScoreNoteHeadOverlayApi | null = null

onMounted(() => {
  overlay = createScoreNoteHeadOverlay({
    getCanvas: () => canvasRef.value,
    getWidth: () => props.width,
    getHeight: () => props.height,
    findElementByVDom: props.findElementByVDom
  })
  overlay.resize()
})

onBeforeUnmount(() => {
  overlay?.clearAll()
  overlay = null
})

watch(
  () => [props.width, props.height] as const,
  () => overlay?.resize()
)

function onRenderMusicScore(list: readonly VDom[]) {
  overlay?.onRenderMusicScore(list)
}

defineExpose<ScoreNoteHeadOverlayApi>({
  onRenderMusicScore,
  setPlayActive: (noteId, active) => overlay?.setPlayActive(noteId, active),
  clearPlay: () => overlay?.clearPlay(),
  setNoteResult: (noteId, result) => overlay?.setNoteResult(noteId, result),
  clearResults: () => overlay?.clearResults(),
  setResultsVisible: (visible) => overlay?.setResultsVisible(visible),
  setBeginnerState: (noteId, state) => overlay?.setBeginnerState(noteId, state),
  clearBeginner: () => overlay?.clearBeginner(),
  markBeginnerBatchDone: (noteIds) => overlay?.markBeginnerBatchDone(noteIds),
  setBeginnerCurrentBatch: (noteIds) => overlay?.setBeginnerCurrentBatch(noteIds),
  clearAll: () => overlay?.clearAll(),
  resize: () => overlay?.resize()
})
</script>

<template>
  <canvas ref="canvasRef" class="score-note-head-overlay" aria-hidden="true" />
</template>

<style scoped>
.score-note-head-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
</style>
