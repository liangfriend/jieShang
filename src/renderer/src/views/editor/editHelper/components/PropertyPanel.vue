<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SlotData } from '@deciphony/renderer'
import { tabStringCount } from '@deciphony/extensions/dr-edit'
import { isTabScore } from '../tab/renderEditTabSelection'
import type { PropertyPanelKind } from '../renderEditPropertyPanel'
import NumberHeadPropertyPanel from '../numberNotation/components/NumberHeadPropertyPanel.vue'
import NumberRestPropertyPanel from '../numberNotation/components/NumberRestPropertyPanel.vue'
import NoteHeadPropertyPanel from '../standardStaff/components/NoteHeadPropertyPanel.vue'
import RestPropertyPanel from '../standardStaff/components/RestPropertyPanel.vue'
import BendPropertyPanel from '../tab/components/BendPropertyPanel.vue'
import TabMeasurePropertyPanel from '../tab/components/TabMeasurePropertyPanel.vue'
import TabNotePropertyPanel from '../tab/components/TabNotePropertyPanel.vue'
import TabSlurPropertyPanel from '../tab/components/TabSlurPropertyPanel.vue'
import DrumNotePropertyPanel from '../drumNotation/components/DrumNotePropertyPanel.vue'
import DrumRestPropertyPanel from '../drumNotation/components/DrumRestPropertyPanel.vue'
import MeasurePropertyPanel from './MeasurePropertyPanel.vue'
import GracePropertyPanel from './GracePropertyPanel.vue'
import PitchPropertyPanel from './PitchPropertyPanel.vue'
import SlurPropertyPanel from './SlurPropertyPanel.vue'
import VoltaPropertyPanel from './VoltaPropertyPanel.vue'
import BracketPropertyPanel from './BracketPropertyPanel.vue'
import NoteMarkPropertyPanel from './NoteMarkPropertyPanel.vue'
import MeasureMarkPropertyPanel from './MeasureMarkPropertyPanel.vue'
import LinePropertyPanel from './LinePropertyPanel.vue'
import PedalPropertyPanel from './PedalPropertyPanel.vue'
import ArpeggioPropertyPanel from './ArpeggioPropertyPanel.vue'
import PreludeBracketPropertyPanel from './PreludeBracketPropertyPanel.vue'
import MultiNotePropertyPanel from './MultiNotePropertyPanel.vue'
import type { MultiSelectedItem } from '../renderEditMultiSelect'

const props = defineProps<{
  kind: PropertyPanelKind
  selected: SlotData | null
  /** 框选的多个音符；非空时优先显示多选属性栏 */
  multiNotes?: MultiSelectedItem[]
}>()

const emit = defineEmits<{
  'multi-deleted': []
}>()

const { t } = useI18n()

const hasMulti = computed(() => (props.multiNotes?.length ?? 0) > 0)

const stringCount = computed(() => tabStringCount(props.selected?.musicScore.type))
const isTab = computed(() => isTabScore(props.selected?.musicScore))

const panelTitleKey: Record<Exclude<PropertyPanelKind, null>, string> = {
  measure: 'editor.propertyPanel.measure',
  noteHead: 'editor.propertyPanel.noteHead',
  numberHead: 'editor.propertyPanel.noteHead',
  grace: 'editor.propertyPanel.grace',
  rest: 'editor.propertyPanel.rest',
  numberRest: 'editor.propertyPanel.rest',
  volta: 'editor.propertyPanel.volta',
  slur: 'editor.propertyPanel.slur',
  bracket: 'editor.propertyPanel.bracket',
  pitch: 'editor.propertyPanel.pitch',
  noteMark: 'editor.propertyPanel.noteMark',
  measureMark: 'editor.propertyPanel.measureMark',
  trillLine: 'editor.propertyPanel.trillLine',
  hairpin: 'editor.propertyPanel.hairpin',
  guzhengLian: 'editor.propertyPanel.guzhengLian',
  pedal: 'editor.propertyPanel.pedal',
  arpeggio: 'editor.propertyPanel.arpeggio',
  strumming: 'editor.propertyPanel.strumming',
  preludeBracket: 'editor.propertyPanel.preludeBracket',
  tabMeasure: 'editor.propertyPanel.measure',
  tabNote: 'editor.propertyPanel.noteHead',
  bend: 'editor.propertyPanel.bend',
  drumNote: 'editor.propertyPanel.noteHead',
  drumRest: 'editor.propertyPanel.rest'
}

const hasContent = computed(() => {
  if (!props.kind || !props.selected) return false
  if (props.kind === 'measure' || props.kind === 'tabMeasure') {
    return Boolean(props.selected.measure && props.selected.singleStaff) || props.kind === 'tabMeasure'
  }
  if (
    props.kind === 'noteHead' ||
    props.kind === 'numberHead' ||
    props.kind === 'tabNote' ||
    props.kind === 'drumNote' ||
    props.kind === 'grace'
  ) {
    return Boolean(props.selected.info && props.selected.note && props.selected.measure)
  }
  if (props.kind === 'rest' || props.kind === 'numberRest' || props.kind === 'drumRest') {
    return Boolean(props.selected.measure && props.selected.self)
  }
  return (
    props.kind === 'volta' ||
    props.kind === 'slur' ||
    props.kind === 'bend' ||
    props.kind === 'bracket' ||
    props.kind === 'pitch' ||
    props.kind === 'noteMark' ||
    props.kind === 'measureMark' ||
    props.kind === 'trillLine' ||
    props.kind === 'hairpin' ||
    props.kind === 'guzhengLian' ||
    props.kind === 'pedal' ||
    props.kind === 'arpeggio' ||
    props.kind === 'strumming' ||
    props.kind === 'preludeBracket'
  )
})

const headerTitle = computed(() => {
  if (hasMulti.value) return t('editor.propertyPanel.multiNote')
  if (props.kind && hasContent.value) {
    return t(panelTitleKey[props.kind])
  }
  return t('editor.propertyPanel.title')
})
</script>

<template>
  <aside class="property-panel">
    <header class="property-panel__header">
      <h3 class="property-panel__title">{{ headerTitle }}</h3>
    </header>
    <div class="property-panel__body">
      <MultiNotePropertyPanel
        v-if="hasMulti && multiNotes"
        :music-score="multiNotes[0]!.musicScore"
        :items="multiNotes"
        @deleted="emit('multi-deleted')"
      />
      <MeasurePropertyPanel
        v-else-if="kind === 'measure' && selected?.measure && selected.singleStaff"
        :edit-slot="selected"
      />
      <NoteHeadPropertyPanel
        v-else-if="kind === 'noteHead' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected as any"
      />
      <NumberHeadPropertyPanel
        v-else-if="kind === 'numberHead' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected as any"
      />
      <GracePropertyPanel
        v-else-if="kind === 'grace' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected"
      />
      <RestPropertyPanel
        v-else-if="kind === 'rest' && selected?.measure && selected.self"
        :edit-slot="selected as any"
      />
      <NumberRestPropertyPanel
        v-else-if="kind === 'numberRest' && selected?.measure && selected.self"
        :edit-slot="selected as any"
      />
      <DrumNotePropertyPanel
        v-else-if="kind === 'drumNote' && selected?.info && selected.note && selected.measure"
        :edit-slot="selected"
      />
      <DrumRestPropertyPanel
        v-else-if="kind === 'drumRest' && selected?.measure && selected.self"
        :edit-slot="selected"
      />
      <VoltaPropertyPanel v-else-if="kind === 'volta' && selected" :edit-slot="selected as any" />
      <BracketPropertyPanel
        v-else-if="kind === 'bracket' && selected"
        :edit-slot="selected as any"
      />
      <TabMeasurePropertyPanel
        v-else-if="kind === 'tabMeasure' && selected"
        :edit-slot="selected"
      />
      <TabNotePropertyPanel
        v-else-if="kind === 'tabNote' && selected"
        :edit-slot="selected"
        :string-count="stringCount"
      />
      <TabSlurPropertyPanel
        v-else-if="kind === 'slur' && selected && isTab"
        :edit-slot="selected"
      />
      <SlurPropertyPanel
        v-else-if="kind === 'slur' && selected"
        :edit-slot="selected as any"
      />
      <PitchPropertyPanel
        v-else-if="kind === 'pitch' && selected"
        :edit-slot="selected"
      />
      <NoteMarkPropertyPanel
        v-else-if="kind === 'noteMark' && selected"
        :key="(selected.self as { id?: string }).id"
        :edit-slot="selected"
      />
      <MeasureMarkPropertyPanel
        v-else-if="kind === 'measureMark' && selected"
        :key="(selected.self as { id?: string }).id"
        :edit-slot="selected"
      />
      <LinePropertyPanel
        v-else-if="(kind === 'trillLine' || kind === 'hairpin' || kind === 'guzhengLian') && selected"
        :key="(selected.self as { id?: string }).id"
        :edit-slot="selected"
      />
      <PedalPropertyPanel v-else-if="kind === 'pedal' && selected" :edit-slot="selected" />
      <ArpeggioPropertyPanel
        v-else-if="(kind === 'arpeggio' || kind === 'strumming') && selected"
        :key="(selected.self as { id?: string }).id"
        :edit-slot="selected"
      />
      <PreludeBracketPropertyPanel
        v-else-if="kind === 'preludeBracket' && selected"
        :key="(selected.self as { id?: string }).id"
        :edit-slot="selected"
      />
      <BendPropertyPanel v-else-if="kind === 'bend' && selected" :edit-slot="selected" />
      <div v-else class="property-panel__placeholder">
        <span class="property-panel__placeholder-emoji">🎼</span>
        <p class="property-panel__placeholder-text">
          {{ t('editor.propertyPanel.placeholder') }}
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.property-panel {
  flex: 0 0 288px;
  width: 288px;
  min-height: 0;
  overflow: auto;
  background: linear-gradient(180deg, rgba(255, 248, 251, 0.96) 0%, rgba(243, 235, 255, 0.94) 100%);
  border-left: 2px solid rgba(255, 184, 208, 0.35);
}

.property-panel__header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 14px 16px 12px;
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(201, 184, 255, 0.35);
  backdrop-filter: blur(6px);
}

.property-panel__title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--ec-text, #5c4a6a);
  letter-spacing: 0.04em;
}

.property-panel__body {
  padding: 10px 12px 20px;
}

.property-panel__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  padding: 24px 16px;
  text-align: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed rgba(201, 184, 255, 0.55);
}

.property-panel__placeholder-emoji {
  font-size: 32px;
  line-height: 1;
}

.property-panel__placeholder-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ec-text-soft, #9a8aa8);
}
</style>
