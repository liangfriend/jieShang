<script lang="ts" setup>
import type { VDom } from '@deciphony/renderer'
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
let scrollHost: HTMLElement | null = null

function findScrollHost(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    const overflowX = getComputedStyle(node).overflowX
    if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') return node
  }
  return null
}

/** 滚动容器可视区域换算到画布父级（与曲谱同尺寸）坐标 */
function getViewport() {
  const parent = canvasRef.value?.parentElement
  if (!scrollHost || !parent) return null
  const hostRect = scrollHost.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  return {
    x: hostRect.left - parentRect.left,
    y: hostRect.top - parentRect.top,
    w: scrollHost.clientWidth,
    h: scrollHost.clientHeight
  }
}

function onHostScroll() {
  overlay?.onViewportChange()
}

onMounted(() => {
  scrollHost = findScrollHost(canvasRef.value)
  scrollHost?.addEventListener('scroll', onHostScroll, { passive: true })
  window.addEventListener('resize', onHostScroll)
  overlay = createScoreNoteHeadOverlay({
    getCanvas: () => canvasRef.value,
    getWidth: () => props.width,
    getHeight: () => props.height,
    findElementByVDom: props.findElementByVDom,
    getViewport
  })
  overlay.resize()
})

onBeforeUnmount(() => {
  scrollHost?.removeEventListener('scroll', onHostScroll)
  window.removeEventListener('resize', onHostScroll)
  scrollHost = null
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
  resize: () => overlay?.resize(),
  onViewportChange: () => overlay?.onViewportChange()
})
</script>

<template>
  <canvas ref="canvasRef" class="score-note-head-overlay" aria-hidden="true" />
</template>

<style scoped>
.score-note-head-overlay {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 2;
}
</style>
