<script lang="ts" setup>
import type { Chronaxie } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAddNoteKindLabel, resolveNoteDurationLabel, resolveRestDurationLabel } from '@renderer/i18n/helpers'
import {
  ADD_NOTE_KIND_VALUES,
  chronaxieValuesForKind,
  type AddNoteSlotKind,
  type AddNoteState
} from '../renderEditAddNoteState'
import ChronaxieGlyph from './ChronaxieGlyph.vue'
import '../addToolButtons.css'

const model = defineModel<AddNoteState>({ required: true })

const { t } = useI18n()

const chronaxieValues = computed(() => chronaxieValuesForKind(model.value.kind))
const glyphKind = computed(() => (model.value.kind === 'rest' ? 'rest' : 'note'))

function setKind(kind: AddNoteSlotKind) {
  model.value = { ...model.value, kind }
}

function setChronaxie(chronaxie: Chronaxie) {
  model.value = { ...model.value, chronaxie }
}

function durationTitle(value: Chronaxie) {
  return model.value.kind === 'rest'
    ? resolveRestDurationLabel(value)
    : resolveNoteDurationLabel(value)
}
</script>

<template>
  <div class="add-note-state add-tool-row">
    <div class="add-tool-group" :aria-label="t('editor.addNote.add')">
      <button
        v-for="value in ADD_NOTE_KIND_VALUES"
        :key="value"
        type="button"
        class="add-tool-btn"
        :class="{ 'is-active': model.kind === value }"
        @click="setKind(value)"
      >
        {{ resolveAddNoteKindLabel(value) }}
      </button>
    </div>
    <div class="add-tool-group" :aria-label="t('editor.addNote.duration')">
      <button
        v-for="value in chronaxieValues"
        :key="value"
        type="button"
        class="add-tool-btn add-tool-btn--glyph"
        :class="{ 'is-active': model.chronaxie === value }"
        :title="durationTitle(value)"
        @click="setChronaxie(value)"
      >
        <ChronaxieGlyph :chronaxie="value" :kind="glyphKind" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-note-state {
  padding: 0;
}
</style>
