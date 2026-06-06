<script lang="ts" setup>
import type {Chronaxie} from 'deciphony-renderer'
import {
  ADD_NOTE_KIND_OPTIONS,
  CHRONAXIE_OPTIONS,
  type AddNoteSlotKind,
  type AddNoteState,
} from '../renderEditAddNoteState'

const model = defineModel<AddNoteState>({required: true})

function setKind(kind: AddNoteSlotKind) {
  model.value = {...model.value, kind}
}

function setChronaxie(chronaxie: Chronaxie) {
  model.value = {...model.value, chronaxie}
}
</script>

<template>
  <div class="add-note-state">
    <div class="add-note-state__row">
      <span class="add-note-state__label">✏️ 添加</span>
      <el-radio-group :model-value="model.kind" size="small" @change="setKind">
        <el-radio-button
          v-for="opt in ADD_NOTE_KIND_OPTIONS"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="add-note-state__row">
      <span class="add-note-state__label">🎵 时值</span>
      <el-radio-group :model-value="model.chronaxie" size="small" @change="setChronaxie">
        <el-radio-button
          v-for="opt in CHRONAXIE_OPTIONS"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<style scoped>
.add-note-state {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: var(--ec-card, rgba(255, 255, 255, 0.9));
  border-bottom: 1px solid rgba(255, 184, 208, 0.3);
  box-shadow: 0 4px 16px rgba(200, 140, 180, 0.08);
}

.add-note-state__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.add-note-state__label {
  flex: 0 0 auto;
  min-width: 64px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ec-text-soft, #9a8aa8);
}
</style>
