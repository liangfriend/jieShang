<script lang="ts" setup>
import type { Chronaxie, DrumHeadTypeEnum } from '@deciphony/renderer'
import type { DrumVoice } from '@deciphony/extensions/dr-edit'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DRUM_ADD_KIND_OPTIONS,
  DRUM_CHRONAXIE_OPTIONS,
  DRUM_DOT_OPTIONS,
  DRUM_HEAD_OPTIONS,
  DRUM_VOICE_OPTIONS,
  normalizeAddDrumState,
  type AddDrumState,
  type DrumAddKind
} from '../renderEditDrumAddState'
import ChronaxieGlyph from '../../components/ChronaxieGlyph.vue'
import '../../addToolButtons.css'

const model = defineModel<AddDrumState>({ required: true })
const { t } = useI18n()

const glyphKind = computed(() => (model.value.kind === 'rest' ? 'rest' : 'note'))

function patch(next: Partial<AddDrumState>) {
  model.value = normalizeAddDrumState({ ...model.value, ...next })
}

function setVoice(voice: DrumVoice) {
  patch({ voice })
}

function setKind(kind: DrumAddKind) {
  patch({ kind })
}

function setHeadType(headType: DrumHeadTypeEnum) {
  patch({ headType, kind: 'note' })
}

function setChronaxie(chronaxie: Chronaxie) {
  patch({ chronaxie })
}

function setDot(dot: 0 | 1 | 2) {
  patch({ dot })
}
</script>

<template>
  <div class="add-drum-state">
    <div class="add-tool-row">
      <div class="add-tool-group" :aria-label="t('editor.drum.voice')">
        <button
          v-for="opt in DRUM_VOICE_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn"
          :class="{ 'is-active': model.voice === opt.value }"
          @click="setVoice(opt.value)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>
      <div class="add-tool-group" :aria-label="t('editor.addNote.add')">
        <button
          v-for="opt in DRUM_ADD_KIND_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn"
          :class="{ 'is-active': model.kind === opt.value }"
          @click="setKind(opt.value)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>
    </div>
    <div class="add-tool-row">
      <div class="add-tool-group" :aria-label="t('editor.drum.head')">
        <button
          v-for="opt in DRUM_HEAD_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn"
          :class="{ 'is-active': model.kind === 'note' && model.headType === opt.value }"
          @click="setHeadType(opt.value)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>
    </div>
    <div class="add-tool-row">
      <div class="add-tool-group" :aria-label="t('editor.note.duration')">
        <button
          v-for="opt in DRUM_CHRONAXIE_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn add-tool-btn--glyph"
          :class="{ 'is-active': model.chronaxie === opt.value }"
          :title="t(opt.labelKey)"
          @click="setChronaxie(opt.value)"
        >
          <ChronaxieGlyph :chronaxie="opt.value" :kind="glyphKind" />
        </button>
      </div>
      <div class="add-tool-group" :aria-label="t('editor.note.augmentationDot')">
        <button
          v-for="opt in DRUM_DOT_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn"
          :class="{ 'is-active': model.dot === opt.value }"
          @click="setDot(opt.value)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-drum-state {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
}
</style>
