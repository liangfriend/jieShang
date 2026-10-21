<script lang="ts" setup>
import type { Chronaxie, DrumHeadTypeEnum, DrumNote, DrumNotesInfo, SlotData } from '@deciphony/renderer'
import { BeamTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { warnNotEnoughSpanNotes } from '../../renderEditSlotSymbolAdd'
import {
  setDrumNoteAugmentationDot,
  setDrumNoteBeamType,
  setDrumNoteChronaxie,
  setDrumNotesInfoHeadType,
  setDrumNotesInfoRegion
} from '@deciphony/extensions/dr-edit'
import { BEAM_TYPE_VALUES } from '../../standardStaff/renderEditNoteHeadProperties'
import {
  findSlurEndFromNoteHead,
  tryAddSlurFromNoteHead,
  type SlurSpan
} from '../../standardStaff/renderEditSlurAdd'
import { DRUM_CHRONAXIE_VALUES, DRUM_DOT_VALUES, DRUM_HEAD_OPTIONS } from '../renderEditDrumAddState'
import NoteGraceSection from '../../components/NoteGraceSection.vue'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import NoteSpanSymbolSection from '../../components/NoteSpanSymbolSection.vue'
import RhythmGroupEndField from '../../components/RhythmGroupEndField.vue'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import { useNoteSegmentOptions } from '../../components/panel/noteOptions'
import { usePanelTab } from '../../components/panel/usePanelTab'

const props = defineProps<{
  editSlot: SlotData
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('drumNote', 'basic')

const info = computed(() => props.editSlot.info as unknown as DrumNotesInfo)
const note = computed(() => props.editSlot.note as unknown as DrumNote)

const tabs = computed(() => [
  { name: 'basic', label: t('editor.panelTab.basic') },
  { name: 'marks', label: t('editor.panelTab.marks'), badge: info.value.affiliatedSymbols?.length ?? 0 },
  { name: 'span', label: t('editor.panelTab.span') }
])

const headType = computed({
  get: () => info.value.headType,
  set: (value: DrumHeadTypeEnum) => setDrumNotesInfoHeadType(info.value, value)
})

const region = computed({
  get: () => info.value.region,
  set: (value: number) => {
    setDrumNotesInfoRegion(info.value, value, note.value)
  }
})

const chronaxie = computed({
  get: () => info.value.chronaxie,
  set: (value: Chronaxie) => setDrumNoteChronaxie(note.value, value)
})

const dot = computed({
  get: () => (info.value.augmentationDot?.count ?? 0) as 0 | 1 | 2 | 3,
  set: (value: 0 | 1 | 2 | 3) => setDrumNoteAugmentationDot(note.value, value)
})

const beamType = computed({
  get: () => info.value.beamType ?? BeamTypeEnum.None,
  set: (value: BeamTypeEnum) => setDrumNoteBeamType(note.value, value)
})

function onAddSlur(span: SlurSpan, endInfoId: string | null) {
  if (!tryAddSlurFromNoteHead(props.editSlot as never, span, endInfoId)) warnNotEnoughSpanNotes(t)
}

function findSlurEnd(span: SlurSpan) {
  return findSlurEndFromNoteHead(props.editSlot as never, span)?.id ?? null
}
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.panelGroup.pitch')">
        <PanelField :label="t('editor.drum.head')">
          <el-select v-model="headType" size="small">
            <el-option v-for="opt in DRUM_HEAD_OPTIONS" :key="opt.value" :label="t(opt.labelKey)" :value="opt.value" />
          </el-select>
        </PanelField>
        <PanelField :label="t('editor.drum.region')">
          <el-input-number v-model="region" :max="14" :min="-6" :step="1" size="small" />
        </PanelField>
      </PanelGroup>

      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented v-model="chronaxie" :options="options.durations(DRUM_CHRONAXIE_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.augmentationDot')">
          <PanelSegmented v-model="dot" :options="options.dots(DRUM_DOT_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.beam')">
          <PanelSegmented v-model="beamType" :options="options.beams(BEAM_TYPE_VALUES)" />
        </PanelField>
        <RhythmGroupEndField :measure="editSlot.measure" :symbol="note" />
      </PanelGroup>

      <PanelGroup :title="t('editor.note.grace')">
        <NoteGraceSection :edit-slot="editSlot" bare />
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette
        :host="info"
        :notation-type="editSlot.musicScore.type"
        :music-score="editSlot.musicScore"
      />
    </template>

    <template #span>
      <NoteSpanSymbolSection
        :edit-slot="editSlot"
        :notes-info-id="info.id"
        :find-slur-end="findSlurEnd"
        @add-slur="onAddSlur"
      />
    </template>
  </PanelTabs>
</template>
