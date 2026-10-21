<script lang="ts" setup>
import type { Chronaxie, NotesNumberInfo } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAddNoteKindLabel, resolveNoteDurationLabel } from '@renderer/i18n/helpers'
import {
  ADD_NUMBER_KIND_VALUES,
  CHRONAXIE_VALUES,
  OCTAVE_DOT_PRESET_VALUES,
  type AddNumberSlotKind,
  type AddNumberState
} from '../renderEditNumberAddState'
import ChronaxieGlyph from '../../components/ChronaxieGlyph.vue'
import '../../addToolButtons.css'

const model = defineModel<AddNumberState>({ required: true })

const { t } = useI18n()

const glyphKind = computed(() => (model.value.kind === 'rest' ? 'rest' : 'note'))

function setKind(kind: AddNumberSlotKind) {
  model.value = { ...model.value, kind }
}

function setChronaxie(chronaxie: Chronaxie) {
  model.value = { ...model.value, chronaxie }
}

function setOctaveDot(octaveDot: NotesNumberInfo['octaveDot']) {
  model.value = { ...model.value, octaveDot }
}
</script>

<template>
  <div class="add-note-state add-tool-row">
    <div class="add-tool-group" :aria-label="t('editor.addNote.add')">
      <button
        v-for="value in ADD_NUMBER_KIND_VALUES"
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
        v-for="value in CHRONAXIE_VALUES"
        :key="value"
        type="button"
        class="add-tool-btn add-tool-btn--glyph"
        :class="{ 'is-active': model.chronaxie === value }"
        :title="resolveNoteDurationLabel(value)"
        @click="setChronaxie(value)"
      >
        <ChronaxieGlyph :chronaxie="value" :kind="glyphKind" />
      </button>
    </div>
    <div
      v-if="model.kind !== 'rest'"
      class="add-tool-group"
      :aria-label="t('editor.addNote.octaveDot')"
    >
      <button
        v-for="value in OCTAVE_DOT_PRESET_VALUES"
        :key="value"
        type="button"
        class="add-tool-btn"
        :class="{ 'is-active': model.octaveDot === value }"
        @click="setOctaveDot(value)"
      >
        {{ value }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-note-state {
  padding: 0;
}
</style>
