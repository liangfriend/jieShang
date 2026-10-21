<script lang="ts" setup>
import type {Chronaxie, MusicScore} from '@deciphony/renderer'
import {AccidentalTypeEnum, BeamTypeEnum, ClefTypeEnum} from '@deciphony/renderer'
import {computed} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  resolveAccidentalSelectLabel,
  resolveClefSelectLabel,
} from '@renderer/i18n/helpers'
import {CHRONAXIE_VALUES} from '../../renderEditAddNoteState'
import {
  ACCIDENTAL_SELECT_VALUES,
  AUGMENTATION_DOT_VALUES,
  BEAM_TYPE_VALUES,
  NOTE_CLEF_SELECT_VALUES,
  STEM_DIRECTION_VALUES,
  setNoteClef,
  setNotesInfoAccidental,
  setNotesInfoAccidentalRelativeX,
  setNotesInfoAugmentationDot,
  setNotesInfoBeamType,
  setNotesInfoChronaxie,
  setNotesInfoDirection,
  setNotesInfoRelativeX,
  setNoteClefRelativeX,
  type NoteHeadEditSlot,
} from '../renderEditNoteHeadProperties'
import {readRelativeX} from '../renderEditFrameProperties'
import {findSlurEndFromNoteHead, tryAddSlurFromNoteHead, type SlurSpan} from '../renderEditSlurAdd'
import {warnNotEnoughSpanNotes} from '../../renderEditSlotSymbolAdd'
import NoteGraceSection from '../../components/NoteGraceSection.vue'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import NoteSpanSymbolSection from '../../components/NoteSpanSymbolSection.vue'
import RhythmGroupEndField from '../../components/RhythmGroupEndField.vue'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import {useNoteSegmentOptions} from '../../components/panel/noteOptions'
import {usePanelTab} from '../../components/panel/usePanelTab'
import RelativeXOffsetControl from './RelativeXOffsetControl.vue'

const props = defineProps<{
  editSlot: NoteHeadEditSlot
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('noteHead', 'basic')

const notesInfo = computed(() => props.editSlot.info)
const note = computed(() => props.editSlot.note)
const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const tabs = computed(() => [
  {name: 'basic', label: t('editor.panelTab.basic')},
  {name: 'marks', label: t('editor.panelTab.marks'), badge: notesInfo.value.affiliatedSymbols?.length ?? 0},
  {name: 'span', label: t('editor.panelTab.span')},
])

const noteClef = computed({
  get: () => note.value.clef?.type ?? '',
  set: (v: ClefTypeEnum | '') => setNoteClef(note.value, v),
})

const chronaxie = computed({
  get: () => notesInfo.value.chronaxie,
  set: (v: Chronaxie) => setNotesInfoChronaxie(notesInfo.value, v),
})

const beamType = computed({
  get: () => notesInfo.value.beamType ?? BeamTypeEnum.None,
  set: (v: BeamTypeEnum) => setNotesInfoBeamType(notesInfo.value, v),
})

const direction = computed({
  get: () => notesInfo.value.direction,
  set: (v: 'up' | 'down') => setNotesInfoDirection(notesInfo.value, v),
})

const accidental = computed({
  get: () => notesInfo.value.accidental?.type ?? '',
  set: (v: AccidentalTypeEnum | '' | null | undefined) =>
    setNotesInfoAccidental(notesInfo.value, v || ''),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => notesInfo.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setNotesInfoAugmentationDot(notesInfo.value, v),
})

const relativeX = computed({
  get: () => readRelativeX(notesInfo.value),
  set: (v: number) => setNotesInfoRelativeX(musicScore.value, notesInfo.value, v),
})

const noteClefRelativeX = computed({
  get: () => (note.value.clef ? readRelativeX(note.value.clef) : 0),
  set: (v: number) => setNoteClefRelativeX(musicScore.value, note.value, v),
})

const accidentalRelativeX = computed({
  get: () => (notesInfo.value.accidental ? readRelativeX(notesInfo.value.accidental) : 0),
  set: (v: number) => setNotesInfoAccidentalRelativeX(musicScore.value, notesInfo.value, v),
})

const hasNoteClef = computed(() => Boolean(note.value.clef))
const hasAccidental = computed(() => Boolean(notesInfo.value.accidental))

function onAddSlur(span: SlurSpan, endInfoId: string | null) {
  if (!tryAddSlurFromNoteHead(props.editSlot, span, endInfoId)) warnNotEnoughSpanNotes(t)
}

function findSlurEnd(span: SlurSpan) {
  return findSlurEndFromNoteHead(props.editSlot, span)?.id ?? null
}
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented v-model="chronaxie" :options="options.durations(CHRONAXIE_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.augmentationDot')">
          <PanelSegmented v-model="augmentationDot" :options="options.dots(AUGMENTATION_DOT_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.beam')">
          <PanelSegmented v-model="beamType" :options="options.beams(BEAM_TYPE_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.stemDirection')">
          <PanelSegmented v-model="direction" :options="options.stems(STEM_DIRECTION_VALUES)" />
        </PanelField>
        <RhythmGroupEndField :measure="editSlot.measure" :symbol="note" />
      </PanelGroup>

      <PanelGroup :title="t('editor.panelGroup.pitch')">
        <PanelField :label="t('editor.note.accidental')">
          <el-select v-model="accidental" :placeholder="t('common.none')" size="small">
            <el-option
              v-for="value in ACCIDENTAL_SELECT_VALUES"
              :key="value || 'none'"
              :label="resolveAccidentalSelectLabel(value)"
              :value="value"
            />
          </el-select>
        </PanelField>
        <PanelField v-if="hasAccidental" :label="t('editor.note.relativeX')">
          <RelativeXOffsetControl v-model="accidentalRelativeX" bare />
        </PanelField>
        <PanelField :label="t('editor.note.noteClef')">
          <el-select v-model="noteClef" :placeholder="t('common.none')" size="small">
            <el-option
              v-for="value in NOTE_CLEF_SELECT_VALUES"
              :key="value || 'none'"
              :label="resolveClefSelectLabel(value)"
              :value="value"
            />
          </el-select>
        </PanelField>
        <PanelField v-if="hasNoteClef" :label="t('editor.note.relativeX')">
          <RelativeXOffsetControl v-model="noteClefRelativeX" bare />
        </PanelField>
      </PanelGroup>

      <PanelGroup :title="t('editor.note.relativeX')">
        <RelativeXOffsetControl v-model="relativeX" bare />
      </PanelGroup>

      <PanelGroup :title="t('editor.note.grace')">
        <NoteGraceSection :edit-slot="editSlot" bare />
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette :host="notesInfo" :notation-type="musicScore.type" :music-score="musicScore" />
    </template>

    <template #span>
      <NoteSpanSymbolSection
        :edit-slot="editSlot"
        :notes-info-id="notesInfo.id"
        :find-slur-end="findSlurEnd"
        @add-slur="onAddSlur"
      />
    </template>
  </PanelTabs>
</template>
