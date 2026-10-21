<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClSheet, type ClSheetData } from '@deciphony/cl-sheet'
import '@deciphony/cl-sheet/dist/cl-sheet.css'
import {
  readClSheetDescription,
  readClSheetEmbeddedScore,
  readClSheetStyle
} from '@renderer/utils/fileHelper/clSheetFile'
import ClSheetEmbeddedScore from './ClSheetEmbeddedScore.vue'

/**
 * 只读展示一份和弦弹唱谱（标题、描述、顶部曲谱、歌词和弦）。
 * 高度随内容撑开，不在内部滚动；放进可滚动的容器里查看。
 */
const props = defineProps<{
  sheet: ClSheetData
}>()

const { t } = useI18n()

const style = computed(() => readClSheetStyle(props.sheet))
const description = computed(() => readClSheetDescription(props.sheet))
const embedded = computed(() => readClSheetEmbeddedScore(props.sheet))

const paperStyle = computed(() => ({
  width: `${props.sheet.width}px`,
  fontFamily: props.sheet.fontFamily || undefined
}))
</script>

<template>
  <div class="cl-sheet-reader" :style="paperStyle">
    <ClSheetEmbeddedScore
      v-if="embedded.score"
      :height="embedded.height"
      :score="embedded.score"
      :scale="embedded.scale"
      :only-chord-name="embedded.onlyChordName"
    />
    <div class="cl-sheet-reader__head">
      <h2 class="cl-sheet-reader__title">{{ sheet.title || t('clSheet.untitled') }}</h2>
      <div v-if="description || sheet.author" class="cl-sheet-reader__meta">
        <p class="cl-sheet-reader__description">{{ description }}</p>
        <p class="cl-sheet-reader__author">{{ sheet.author }}</p>
      </div>
      <p v-if="sheet.lyrics.length === 0" class="cl-sheet-reader__empty">
        {{ t('clSheet.emptyShow') }}
      </p>
    </div>
    <ClSheet
      class="cl-sheet-reader__body"
      :data="sheet"
      mode="show"
      :font-size="style.fontSize"
      :line-gap="style.lineGap"
      :color="style.color"
      :chord-color="style.chordColor"
    />
  </div>
</template>

<style scoped>
.cl-sheet-reader {
  box-sizing: border-box;
  border-radius: 14px;
  background: #fff;
}

.cl-sheet-reader__head {
  padding: 16px 16px 4px;
  text-align: center;
}

.cl-sheet-reader__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

/* 简谱习惯：描述（1=C 4/4）在左，作者在右 */
.cl-sheet-reader__meta {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.cl-sheet-reader__description,
.cl-sheet-reader__author {
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.cl-sheet-reader__description {
  text-align: left;
  color: #606266;
}

.cl-sheet-reader__author {
  text-align: right;
  color: #909399;
}

.cl-sheet-reader__empty {
  margin: 12px 0 0;
  font-size: 13px;
  color: #9a8aa8;
}

/* ClSheet 根节点按 data.height 定高并内部滚动；这里改为随内容撑开，由外层容器滚动 */
.cl-sheet-reader__body {
  height: auto !important;
  overflow: visible !important;
}
</style>
