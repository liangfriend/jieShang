<script lang="ts" setup>
import type { Chronaxie } from 'deciphony-renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAddNoteKindLabel, resolveNoteDurationLabel, resolveRestDurationLabel } from '@renderer/i18n/helpers'
import {
  ADD_NOTE_KIND_VALUES,
  chronaxieValuesForKind,
  type AddNoteSlotKind,
  type AddNoteState
} from '../renderEditAddNoteState'

const model = defineModel<AddNoteState>({ required: true })

const { t } = useI18n()

const kind = computed({
  get: () => model.value.kind,
  set: (value: AddNoteSlotKind) => {
    model.value = { ...model.value, kind: value }
  }
})

const chronaxie = computed({
  get: () => model.value.chronaxie,
  set: (value: Chronaxie) => {
    model.value = { ...model.value, chronaxie: value }
  }
})

const chronaxieValues = computed(() => chronaxieValuesForKind(model.value.kind))
</script>

<template>
  <div class="add-note-state">
    <div class="add-note-state__row">
      <span class="add-note-state__label">{{ t('editor.addNote.add') }}</span>
      <el-radio-group v-model="kind" size="small">
        <el-radio-button v-for="value in ADD_NOTE_KIND_VALUES" :key="value" :label="value">
          {{ resolveAddNoteKindLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="add-note-state__row">
      <span class="add-note-state__label">{{ t('editor.addNote.duration') }}</span>
      <el-radio-group v-model="chronaxie" size="small">
        <el-radio-button v-for="value in chronaxieValues" :key="value" :label="value">
          {{
            model.kind === 'rest'
              ? resolveRestDurationLabel(value)
              : resolveNoteDurationLabel(value)
          }}
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
