<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import musicScoreVue from '@deciphony/renderer'
import type { MusicScore, MusicScoreRenderOptions } from '@deciphony/renderer'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { CL_SHEET_EMBEDDED_HEIGHT_RANGE } from '@renderer/utils/fileHelper/clSheetFile'

const props = defineProps<{
  score: MusicScore
  height: number
  scale: number
  onlyChordName: boolean
  /** 下边缘可拖动调高度 */
  resizable?: boolean
}>()

const emit = defineEmits<{
  'update:height': [height: number]
}>()

const { t } = useI18n()
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

/** 渲染用副本：存档里的曲谱数据保持原样 */
const musicScore = ref<MusicScore | null>(null)

const renderOptions = computed<MusicScoreRenderOptions>(() => ({
  onlyChordName: props.onlyChordName
}))

watch(
  () => props.score,
  (score) => {
    const copy = structuredClone(toRaw(score))
    // 只看谱面内容（如节奏型），去掉标题区上方留白
    copy.topSpaceHeight = 0
    musicScore.value = copy
  },
  { immediate: true }
)

let dragStartY = 0
let dragStartHeight = 0

function onResizeMove(event: PointerEvent) {
  const next = dragStartHeight + event.clientY - dragStartY
  emit(
    'update:height',
    Math.round(
      Math.min(CL_SHEET_EMBEDDED_HEIGHT_RANGE.max, Math.max(CL_SHEET_EMBEDDED_HEIGHT_RANGE.min, next))
    )
  )
}

function stopResize() {
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
}

function startResize(event: PointerEvent) {
  event.preventDefault()
  dragStartY = event.clientY
  dragStartHeight = props.height
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

onBeforeUnmount(stopResize)
</script>

<template>
  <div class="cl-embedded-score" :style="{ height: `${height}px` }">
    <div class="cl-embedded-score__scroll">
      <div v-if="musicScore && scoreSkin" class="cl-embedded-score__score" :style="{ zoom: scale }">
        <musicScoreVue
          :key="scoreSkinName"
          :data="musicScore"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          :options="renderOptions"
        />
      </div>
    </div>
    <div
      v-if="resizable"
      class="cl-embedded-score__handle"
      :title="t('clSheet.embedded.resizeHint')"
      @pointerdown="startResize"
    />
  </div>
</template>

<style scoped>
.cl-embedded-score {
  position: relative;
  flex-shrink: 0;
  border-bottom: 1px solid #f0e6ee;
}

.cl-embedded-score__scroll {
  height: 100%;
  overflow: auto;
}

.cl-embedded-score__score {
  width: fit-content;
  margin: 0 auto;
}

.cl-embedded-score__handle {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  z-index: 1;
  height: 8px;
  cursor: ns-resize;
}

.cl-embedded-score__handle::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 2px;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #e0cfe0;
  transform: translateX(-50%);
  transition: background 0.15s ease;
}

.cl-embedded-score__handle:hover::after {
  background: #c9a8c9;
}
</style>
