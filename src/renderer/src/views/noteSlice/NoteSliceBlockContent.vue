<script lang="ts" setup>
import { computed } from 'vue'
import musicScoreVue from 'deciphony-renderer'
import type { MusicScore, Skin } from 'deciphony-renderer'
import type { NoteSliceBlockType } from '@renderer/views/noteSlice/noteSliceBlockFactory'
import { resolveNoteSliceScoreShellTransform } from '@renderer/views/noteSlice/noteSliceBlockShellLayout'
import {
  NOTE_SLICE_BLOCK_SHELL_HEIGHT,
  NOTE_SLICE_BLOCK_SHELL_WIDTH
} from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  x: number
  y: number
  opacity?: number
  type?: NoteSliceBlockType
  musicScore: MusicScore
  skin?: Skin
  skinName?: string
}>()

const isBomb = computed(() => props.type === 'bomb')
const isHeal = computed(() => props.type === 'heal')
const isFreeze = computed(() => props.type === 'freeze')
const isDouble = computed(() => props.type === 'double')
const scoreTransform = computed(() => resolveNoteSliceScoreShellTransform(props.musicScore))
</script>

<template>
  <g
    class="note-slice-block"
    :class="{
      'note-slice-block--bomb': isBomb,
      'note-slice-block--heal': isHeal,
      'note-slice-block--freeze': isFreeze,
      'note-slice-block--double': isDouble
    }"
    :transform="`translate(${x}, ${y})`"
    :opacity="opacity ?? 1"
  >
    <!-- 炸弹：红色光晕（在白底之下） -->
    <rect
      v-if="isBomb"
      class="note-slice-block__bomb-glow"
      x="-10"
      y="-10"
      :width="NOTE_SLICE_BLOCK_SHELL_WIDTH + 20"
      :height="NOTE_SLICE_BLOCK_SHELL_HEIGHT + 20"
      rx="14"
      ry="14"
    />
    <!-- 治疗：绿色光晕（在白底之下） -->
    <rect
      v-if="isHeal"
      class="note-slice-block__heal-glow"
      x="-10"
      y="-10"
      :width="NOTE_SLICE_BLOCK_SHELL_WIDTH + 20"
      :height="NOTE_SLICE_BLOCK_SHELL_HEIGHT + 20"
      rx="14"
      ry="14"
    />
    <!-- 冰冻：蓝白光晕（在白底之下） -->
    <rect
      v-if="isFreeze"
      class="note-slice-block__freeze-glow"
      x="-10"
      y="-10"
      :width="NOTE_SLICE_BLOCK_SHELL_WIDTH + 20"
      :height="NOTE_SLICE_BLOCK_SHELL_HEIGHT + 20"
      rx="14"
      ry="14"
    />
    <!-- 加倍：金色光晕（在白底之下） -->
    <rect
      v-if="isDouble"
      class="note-slice-block__double-glow"
      x="-10"
      y="-10"
      :width="NOTE_SLICE_BLOCK_SHELL_WIDTH + 20"
      :height="NOTE_SLICE_BLOCK_SHELL_HEIGHT + 20"
      rx="14"
      ry="14"
    />
    <!-- 固定 200×200 外壳 -->
    <rect
      class="note-slice-block__bg"
      :width="NOTE_SLICE_BLOCK_SHELL_WIDTH"
      :height="NOTE_SLICE_BLOCK_SHELL_HEIGHT"
      rx="8"
      ry="8"
    />
    <!-- musicScore 等比缩放后在壳内居中 -->
    <g
      :transform="`translate(${scoreTransform.offsetX}, ${scoreTransform.offsetY}) scale(${scoreTransform.scale})`"
    >
      <musicScoreVue
        class="note-slice-block__score"
        :data="musicScore"
        :skin="skin"
        :skin-name="skinName"
      />
    </g>
  </g>
</template>

<style scoped>
.note-slice-block__bomb-glow {
  fill: rgba(255, 48, 48, 0.28);
  stroke: rgba(255, 72, 72, 0.72);
  stroke-width: 5;
  filter: drop-shadow(0 0 14px rgba(255, 60, 60, 0.85));
}

.note-slice-block__heal-glow {
  fill: rgba(72, 220, 120, 0.28);
  stroke: rgba(96, 240, 144, 0.72);
  stroke-width: 5;
  filter: drop-shadow(0 0 14px rgba(72, 220, 120, 0.85));
}

.note-slice-block__freeze-glow {
  fill: rgba(140, 220, 255, 0.28);
  stroke: rgba(180, 235, 255, 0.75);
  stroke-width: 5;
  filter: drop-shadow(0 0 14px rgba(140, 220, 255, 0.85));
}

.note-slice-block__double-glow {
  fill: rgba(255, 200, 60, 0.28);
  stroke: rgba(255, 220, 100, 0.75);
  stroke-width: 5;
  filter: drop-shadow(0 0 14px rgba(255, 200, 60, 0.85));
}

.note-slice-block__bg {
  fill: #fff;
}

.note-slice-block--freeze .note-slice-block__bg {
  stroke: rgba(140, 220, 255, 0.45);
  stroke-width: 2;
}

.note-slice-block--double .note-slice-block__bg {
  stroke: rgba(255, 200, 80, 0.45);
  stroke-width: 2;
}

.note-slice-block--heal .note-slice-block__bg {
  stroke: rgba(96, 220, 140, 0.45);
  stroke-width: 2;
}

.note-slice-block--bomb .note-slice-block__bg {
  stroke: rgba(255, 90, 90, 0.45);
  stroke-width: 2;
}

.note-slice-block__score {
  pointer-events: none;
}
</style>
