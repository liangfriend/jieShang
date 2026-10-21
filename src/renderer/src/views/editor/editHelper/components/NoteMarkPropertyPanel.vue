<script lang="ts" setup>
import type { MusicScore, SingleNoteAffiliatedSymbolNameEnum, SlotData } from '@deciphony/renderer'
import { findExtraSymbol } from '@deciphony/extensions/dr-edit/score-builder'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { locateNoteAffiliatedById } from '../renderEditNoteAffiliatedDrag'
import {
  hasNoteMarkOffset,
  noteMarkGroup,
  noteMarkSkinKey,
  removeNoteMark,
  replaceNoteMark,
  resetNoteMarkOffset
} from '../renderEditNoteMarks'
import NoteMarkGlyph from './NoteMarkGlyph.vue'
import PanelGroup from './panel/PanelGroup.vue'
import CustomSymbolGlyph from './customSymbol/CustomSymbolGlyph.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const located = computed(() => {
  const self = props.editSlot.self as { id?: string }
  return self?.id ? locateNoteAffiliatedById(musicScore.value, self.id) : null
})

const symbol = computed(() => located.value?.symbol ?? null)
const group = computed(() => (symbol.value ? noteMarkGroup(symbol.value.name) : null))
const hasOffset = computed(() => (symbol.value ? hasNoteMarkOffset(symbol.value) : false))
/** 曲谱自定义音符符号（name 为 skinKey） */
const extra = computed(() => {
  if (!symbol.value) return null
  const found = findExtraSymbol(musicScore.value, symbol.value.name)
  return found?.kind === 'note' ? found.symbol : null
})

function markName(name: string) {
  return t(`editor.noteMark.name.${name}`)
}

function onReplace(name: SingleNoteAffiliatedSymbolNameEnum) {
  if (!located.value) return
  replaceNoteMark(located.value.host, located.value.symbol, name)
}

function readOffset(axis: 'relativeX' | 'relativeY') {
  return Math.round((symbol.value?.[axis] ?? 0) * 10) / 10
}

function writeOffset(axis: 'relativeX' | 'relativeY', value: number | undefined) {
  if (symbol.value) symbol.value[axis] = Number.isFinite(value) ? Number(value) : 0
}

function onResetOffset() {
  if (symbol.value) resetNoteMarkOffset(symbol.value)
}

function onRemove() {
  if (!located.value) return
  removeNoteMark(located.value.host, located.value.symbol.id)
}
</script>

<template>
  <div v-if="symbol" class="note-mark-props">
    <PanelGroup :title="t('editor.noteMark.current')">
      <div class="note-mark-props__current">
        <span class="note-mark-props__preview">
          <CustomSymbolGlyph
            v-if="extra"
            :content="extra.content"
            :w="extra.w"
            :h="extra.h"
            :size="32"
          />
          <NoteMarkGlyph
            v-else
            :skin-key="noteMarkSkinKey(symbol.name)"
            :notation-type="musicScore.type"
            :size="32"
            :fallback="symbol.name"
          />
        </span>
        <div class="note-mark-props__meta">
          <span class="note-mark-props__name">{{ extra ? extra.name : markName(symbol.name) }}</span>
          <span v-if="extra" class="note-mark-props__category">{{ t('editor.customSymbol.title') }}</span>
          <span v-else-if="group" class="note-mark-props__category">
            {{ t(`editor.noteMark.category.${group.category}`) }}
          </span>
        </div>
      </div>
      <div class="note-mark-props__offset">
        <span class="note-mark-props__axis">X</span>
        <el-input-number
          :model-value="readOffset('relativeX')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeX', v)"
        />
        <span class="note-mark-props__axis">Y</span>
        <el-input-number
          :model-value="readOffset('relativeY')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => writeOffset('relativeY', v)"
        />
      </div>
      <div class="note-mark-props__actions">
        <el-button size="small" :disabled="!hasOffset" @click="onResetOffset">
          {{ t('editor.noteMark.resetOffset') }}
        </el-button>
        <el-button size="small" type="danger" plain @click="onRemove">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </PanelGroup>

    <PanelGroup v-if="group && group.names.length > 1" :title="t('editor.noteMark.replaceWith')">
      <div class="note-mark-props__grid">
        <button
          v-for="name in group.names"
          :key="name"
          type="button"
          class="note-mark-props__item"
          :class="{ 'is-active': name === symbol.name }"
          :title="markName(name)"
          @click="onReplace(name)"
        >
          <NoteMarkGlyph
            :skin-key="noteMarkSkinKey(name)"
            :notation-type="musicScore.type"
            :fallback="name"
          />
        </button>
      </div>
    </PanelGroup>

    <p class="note-mark-props__hint">{{ t('editor.noteMark.dragHint') }}</p>
  </div>
</template>

<style scoped>
.note-mark-props__current {
  display: flex;
  align-items: center;
  gap: 10px;
}

.note-mark-props__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
}

.note-mark-props__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.note-mark-props__name {
  font-size: 14px;
  font-weight: 700;
  color: #5c4a6a;
}

.note-mark-props__category {
  font-size: 12px;
  color: #a39ab0;
}

.note-mark-props__offset {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 4px;
  margin: 10px 0 8px;
}

.note-mark-props__offset :deep(.el-input-number) {
  width: 100%;
}

.note-mark-props__axis {
  font-size: 11px;
  font-weight: 700;
  color: #a39ab0;
}

.note-mark-props__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.note-mark-props__actions :deep(.el-button) {
  margin: 0;
  width: 100%;
}

.note-mark-props__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 4px;
}

.note-mark-props__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 4px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.note-mark-props__item:hover {
  border-color: var(--el-color-primary-light-5);
}

.note-mark-props__item.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

.note-mark-props__hint {
  margin: 2px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
