<script lang="ts" setup>
import type { MusicScore, SlotData } from '@deciphony/renderer'
import { findExtraSymbol } from '@deciphony/extensions/dr-edit/score-builder'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  locateMeasureAffiliatedById,
  removeMeasureAffiliated
} from '../renderEditMeasureAffiliatedDrag'
import CustomSymbolGlyph from './customSymbol/CustomSymbolGlyph.vue'
import PanelGroup from './panel/PanelGroup.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const located = computed(() => {
  const self = props.editSlot.self as { id?: string }
  return self?.id ? locateMeasureAffiliatedById(musicScore.value, self.id) : null
})

const symbol = computed(() => located.value?.symbol ?? null)
/** 曲谱自定义小节符号（name 为 skinKey） */
const extra = computed(() => {
  if (!symbol.value) return null
  const found = findExtraSymbol(musicScore.value, String(symbol.value.name))
  return found?.kind === 'measure' ? found.symbol : null
})
const hasOffset = computed(
  () => (symbol.value?.relativeX ?? 0) !== 0 || (symbol.value?.relativeY ?? 0) !== 0
)

function readOffset(axis: 'relativeX' | 'relativeY') {
  return Math.round((symbol.value?.[axis] ?? 0) * 10) / 10
}

function writeOffset(axis: 'relativeX' | 'relativeY', value: number | undefined) {
  if (symbol.value) symbol.value[axis] = Number.isFinite(value) ? Number(value) : 0
}

function onResetOffset() {
  if (!symbol.value) return
  symbol.value.relativeX = 0
  symbol.value.relativeY = 0
}

function onRemove() {
  if (!located.value) return
  removeMeasureAffiliated(located.value.measure, located.value.symbol.id)
}
</script>

<template>
  <div v-if="symbol" class="measure-mark-props">
    <PanelGroup :title="t('editor.noteMark.current')">
      <div class="measure-mark-props__current">
        <span class="measure-mark-props__preview">
          <CustomSymbolGlyph
            v-if="extra"
            :content="extra.content"
            :w="extra.w"
            :h="extra.h"
            :size="32"
          />
        </span>
        <div class="measure-mark-props__meta">
          <span class="measure-mark-props__name">{{ extra ? extra.name : symbol.name }}</span>
          <span class="measure-mark-props__category">
            {{ extra ? t('editor.customSymbol.title') : t('editor.customSymbol.missing') }}
          </span>
        </div>
      </div>
      <div class="measure-mark-props__offset">
        <span class="measure-mark-props__axis">X</span>
        <el-input-number
          :model-value="readOffset('relativeX')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeX', v)"
        />
        <span class="measure-mark-props__axis">Y</span>
        <el-input-number
          :model-value="readOffset('relativeY')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeY', v)"
        />
      </div>
      <div class="measure-mark-props__actions">
        <el-button size="small" :disabled="!hasOffset" @click="onResetOffset">
          {{ t('editor.noteMark.resetOffset') }}
        </el-button>
        <el-button size="small" type="danger" plain @click="onRemove">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </PanelGroup>
    <p class="measure-mark-props__hint">{{ t('editor.customSymbol.dragHint') }}</p>
  </div>
</template>

<style scoped>
.measure-mark-props__current {
  display: flex;
  align-items: center;
  gap: 10px;
}

.measure-mark-props__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
}

.measure-mark-props__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.measure-mark-props__name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.measure-mark-props__category {
  font-size: 12px;
  color: #a39ab0;
}

.measure-mark-props__offset {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 4px;
  margin: 10px 0 8px;
}

.measure-mark-props__offset :deep(.el-input-number) {
  width: 100%;
}

.measure-mark-props__axis {
  font-size: 11px;
  font-weight: 700;
  color: #a39ab0;
}

.measure-mark-props__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.measure-mark-props__actions :deep(.el-button) {
  margin: 0;
  width: 100%;
}

.measure-mark-props__hint {
  margin: 2px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
