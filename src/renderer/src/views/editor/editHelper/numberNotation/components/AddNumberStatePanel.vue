<script lang="ts" setup>
import type {Chronaxie, NotesNumberInfo} from '@deciphony/renderer'
import { useI18n } from 'vue-i18n'
import { resolveAddNoteKindLabel, resolveNoteDurationLabel } from '@renderer/i18n/helpers'
import {
  ADD_NUMBER_KIND_VALUES,
  CHRONAXIE_VALUES,
  OCTAVE_DOT_PRESET_VALUES,
  type AddNumberSlotKind,
  type AddNumberState,
} from '../renderEditNumberAddState'

const model = defineModel<AddNumberState>({required: true})

const { t } = useI18n()

function setKind(kind: AddNumberSlotKind) {
  model.value = {...model.value, kind}
}

function setChronaxie(chronaxie: Chronaxie) {
  model.value = {...model.value, chronaxie}
}

function setOctaveDot(octaveDot: NotesNumberInfo['octaveDot']) {
  model.value = {...model.value, octaveDot}
}
</script>

<template>
  <div class="add-note-state">
    <div class="add-note-state__group">
      <span class="add-note-state__label">{{ t('editor.addNote.add') }}</span>
      <el-radio-group :model-value="model.kind" size="small" @change="setKind">
        <el-radio-button
          v-for="value in ADD_NUMBER_KIND_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveAddNoteKindLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="add-note-state__group">
      <span class="add-note-state__label">{{ t('editor.addNote.duration') }}</span>
      <el-radio-group :model-value="model.chronaxie" size="small" @change="setChronaxie">
        <el-radio-button
          v-for="value in CHRONAXIE_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveNoteDurationLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="model.kind !== 'rest'" class="add-note-state__group">
      <span class="add-note-state__label">{{ t('editor.addNote.octaveDot') }}</span>
      <el-radio-group :model-value="model.octaveDot" size="small" @change="setOctaveDot">
        <el-radio-button
          v-for="value in OCTAVE_DOT_PRESET_VALUES"
          :key="value"
          :label="value"
        >
          {{ value }}
        </el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<style scoped>
.add-note-state {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  padding: 4px 0;
}

.add-note-state__group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.add-note-state__label {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  white-space: nowrap;
}
</style>
