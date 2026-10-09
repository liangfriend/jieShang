<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import scoreSketchUrl from '@renderer/assets/score-layout-sketch.svg'

defineOptions({ name: 'ScoreLayoutPreview' })

const props = defineProps<{
  title?: string
  width: number
  height: number
  tSlotH: number
  sLSlotW: number
  sRSlotW: number
  instrumentName?: string
}>()

const { t } = useI18n()

/** 页面示意图宽度；旁侧总高度竖标另占约 28px */
const PREVIEW_W = 220

const scale = computed(() => PREVIEW_W / Math.max(1, props.width))
const leftW = computed(() => props.sLSlotW * scale.value)
const rightW = computed(() => props.sRSlotW * scale.value)
const bodyW = computed(() => Math.max(0, PREVIEW_W - leftW.value - rightW.value))
const titleH = computed(() => Math.max(14, props.tSlotH * scale.value))
</script>

<template>
  <div class="score-layout-preview">
    <div class="score-layout-preview__stage">
      <div class="score-layout-preview__page" :style="{ width: `${PREVIEW_W}px` }">
        <div
          class="score-layout-preview__title"
          :style="{
            height: `${titleH}px`,
            paddingLeft: `${leftW}px`,
            paddingRight: `${rightW}px`
          }"
        >
          <span class="score-layout-preview__title-text">
            {{ title || t('editor.layoutDialog.previewUntitled') }}
          </span>
          <span class="score-layout-preview__tag">
            {{ t('editor.layoutDialog.titleArea') }} {{ tSlotH }}
          </span>
        </div>
        <div class="score-layout-preview__body">
          <div class="score-layout-preview__side" :style="{ width: `${leftW}px` }">
            <span v-if="instrumentName" class="score-layout-preview__instrument">
              {{ instrumentName }}
            </span>
          </div>
          <img
            class="score-layout-preview__sketch"
            :src="scoreSketchUrl"
            :style="{ width: `${bodyW}px` }"
            alt=""
            draggable="false"
          />
          <div class="score-layout-preview__side" :style="{ width: `${rightW}px` }" />
        </div>
        <div class="score-layout-preview__more" />
      </div>

      <div class="score-layout-preview__height">
        <span class="score-layout-preview__height-line" />
        <span class="score-layout-preview__chip score-layout-preview__height-text">
          {{ t('editor.layoutDialog.pageHeight') }} {{ height }}
        </span>
        <span class="score-layout-preview__height-line" />
      </div>
    </div>

    <!-- 刻度条：只表示左右留白宽度，文案单独一行，避免挤在窄条里被裁掉 -->
    <div class="score-layout-preview__dims" :style="{ width: `${PREVIEW_W}px` }">
      <div class="score-layout-preview__dim" :style="{ width: `${leftW}px` }" />
      <div class="score-layout-preview__dim-gap" />
      <div class="score-layout-preview__dim" :style="{ width: `${rightW}px` }" />
    </div>
    <div class="score-layout-preview__margin-labels" :style="{ width: `${PREVIEW_W}px` }">
      <span v-if="sLSlotW > 0" class="score-layout-preview__chip">
        {{ t('editor.layoutDialog.sLSlotW') }} {{ sLSlotW }}
      </span>
      <span v-else class="score-layout-preview__margin-spacer" />
      <span v-if="sRSlotW > 0" class="score-layout-preview__chip">
        {{ t('editor.layoutDialog.sRSlotW') }} {{ sRSlotW }}
      </span>
      <span v-else class="score-layout-preview__margin-spacer" />
    </div>
    <div class="score-layout-preview__width" :style="{ width: `${PREVIEW_W}px` }">
      <span class="score-layout-preview__width-line" />
      <span class="score-layout-preview__chip">
        {{ t('editor.layoutDialog.pageWidth') }} {{ width }}
      </span>
      <span class="score-layout-preview__width-line" />
    </div>
  </div>
</template>

<style scoped>
.score-layout-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  color: #7a6a88;
}

.score-layout-preview__stage {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.score-layout-preview__page {
  position: relative;
  flex-shrink: 0;
  box-sizing: content-box;
  border: 1px solid rgba(201, 184, 255, 0.8);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.score-layout-preview__title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-bottom: 1px dashed rgba(255, 143, 186, 0.6);
  background: rgba(255, 214, 232, 0.35);
}

.score-layout-preview__title-text {
  overflow: hidden;
  max-width: 100%;
  font-size: 12px;
  font-weight: 800;
  color: #5c4a6a;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-layout-preview__tag {
  position: absolute;
  top: 1px;
  right: 3px;
  padding: 0 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 9px;
  color: #b58aa4;
}

.score-layout-preview__body {
  display: flex;
  align-items: stretch;
  padding: 8px 0 4px;
}

.score-layout-preview__side {
  position: relative;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    135deg,
    rgba(201, 184, 255, 0.28) 0 4px,
    rgba(255, 255, 255, 0) 4px 8px
  );
}

.score-layout-preview__instrument {
  position: absolute;
  top: 10px;
  right: 2px;
  max-width: calc(100% - 2px);
  overflow: hidden;
  font-size: 9px;
  color: #303133;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-layout-preview__sketch {
  display: block;
  flex-shrink: 0;
  height: auto;
  user-select: none;
}

.score-layout-preview__more {
  height: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(230, 220, 255, 0.55));
}

.score-layout-preview__more::after {
  content: '⋯';
  display: block;
  text-align: center;
  line-height: 18px;
  color: #9a8aa8;
}

.score-layout-preview__height {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 28px;
}

.score-layout-preview__height-line {
  flex: 1;
  width: 1px;
  background: rgba(154, 138, 168, 0.6);
}

.score-layout-preview__chip {
  flex-shrink: 0;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 3px rgba(120, 90, 140, 0.1);
  white-space: nowrap;
}

.score-layout-preview__height-text {
  padding: 5px 2px;
  writing-mode: vertical-rl;
}

.score-layout-preview__dims {
  display: flex;
  height: 10px;
}

.score-layout-preview__dim {
  position: relative;
  box-sizing: border-box;
  border-left: 1px solid rgba(154, 138, 168, 0.6);
  border-right: 1px solid rgba(154, 138, 168, 0.6);
}

.score-layout-preview__dim-gap {
  flex: 1;
}

.score-layout-preview__margin-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 18px;
}

.score-layout-preview__margin-spacer {
  flex: 1;
}

.score-layout-preview__width {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-layout-preview__width-line {
  flex: 1;
  height: 1px;
  background: rgba(154, 138, 168, 0.6);
}
</style>
