<script lang="ts" setup>
import type { Chronaxie } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CHRONAXIE_VALUES } from '../../renderEditAddNoteState'
import { resolveNoteDurationLabel } from '@renderer/i18n/helpers'
import {
  TAB_ADD_KIND_OPTIONS,
  TAB_FRET_OPTIONS,
  type AddTabState,
  type TabAddKind
} from '../renderEditTabAddState'
import ChronaxieGlyph from '../../components/ChronaxieGlyph.vue'
import '../../addToolButtons.css'

const props = defineProps<{
  stringCount: number
}>()

const { t } = useI18n()
const model = defineModel<AddTabState>({ required: true })

const showFret = computed(() => model.value.kind === 'normal' || model.value.kind === 'harmonic')
const showRange = computed(() => model.value.kind === 'arpeggio' || model.value.kind === 'strumming')
const glyphKind = computed(() => (model.value.kind === 'rest' ? 'rest' : 'note'))

const regionStartDisplay = computed({
  get: () => model.value.regionStart + 1,
  set: (display: number) => {
    model.value = { ...model.value, regionStart: clampDisplay(display) }
  }
})

const regionEndDisplay = computed({
  get: () => model.value.regionEnd + 1,
  set: (display: number) => {
    model.value = { ...model.value, regionEnd: clampDisplay(display) }
  }
})

function clampDisplay(display: number): number {
  const value = Math.round(display) - 1
  if (value < 0) return 0
  if (value > props.stringCount - 1) return props.stringCount - 1
  return value
}

function setKind(kind: TabAddKind) {
  const next = { ...model.value, kind }
  if (next.regionEnd > props.stringCount - 1) next.regionEnd = props.stringCount - 1
  model.value = next
}

function setChronaxie(chronaxie: Chronaxie) {
  model.value = { ...model.value, chronaxie }
}

function setFret(fret: number) {
  model.value = { ...model.value, fret }
}
</script>

<template>
  <div class="add-tab-state">
    <div class="add-tool-row">
      <div class="add-tool-group" :aria-label="t('editor.addNote.add')">
        <button
          v-for="opt in TAB_ADD_KIND_OPTIONS"
          :key="opt.value"
          type="button"
          class="add-tool-btn"
          :class="{ 'is-active': model.kind === opt.value }"
          @click="setKind(opt.value)"
        >
          {{ t(opt.labelKey) }}
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
      <div v-if="showFret" class="add-tool-group" :aria-label="t('editor.addTab.fret')">
        <el-select :model-value="model.fret" size="small" style="width: 88px" @change="setFret">
          <el-option
            v-for="opt in TAB_FRET_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </div>
    <div v-if="showRange" class="add-tab-state__range">
      <span class="add-tab-state__label">
        {{ t('editor.addTab.regionStart', { n: regionStartDisplay }) }}
      </span>
      <el-slider v-model="regionStartDisplay" :min="1" :max="stringCount" :step="1" />
      <span class="add-tab-state__label">
        {{ t('editor.addTab.regionEnd', { n: regionEndDisplay }) }}
      </span>
      <el-slider v-model="regionEndDisplay" :min="1" :max="stringCount" :step="1" />
    </div>
  </div>
</template>

<style scoped>
.add-tab-state {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
}

.add-tab-state__range {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  max-width: 280px;
}

.add-tab-state__label {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--ec-text-soft, #606266);
}

.add-tab-state__range :deep(.el-slider) {
  width: 180px;
  margin-left: 8px;
}
</style>
