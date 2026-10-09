<script lang="ts" setup>
import type { Chronaxie, Measure, MusicScore, NoteNumber, SlotData } from '@deciphony/renderer'
import { BeamTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { REST_CHRONAXIE_VALUES } from '../../renderEditAddNoteState'
import { asStaffOrNumber } from '../../asStaffOrNumber'
import {
  AUGMENTATION_DOT_VALUES,
  BEAM_TYPE_VALUES,
  setNotesNumberInfoAugmentationDot,
  setNotesNumberInfoBeamType,
  setNotesNumberInfoChronaxie,
  setNotesNumberInfoRelativeX
} from '../renderEditNumberHeadProperties'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import { useNoteSegmentOptions } from '../../components/panel/noteOptions'
import { usePanelTab } from '../../components/panel/usePanelTab'
import RelativeXOffsetControl from '../../standardStaff/components/RelativeXOffsetControl.vue'
import { readRelativeX } from '../../standardStaff/renderEditFrameProperties'

/** 简谱休止符 = notesInfo 全为 syllable 0 的 NoteNumber；时值 / 附点 / 减时线都在 notesInfo 上 */
const props = defineProps<{
  editSlot: SlotData & { measure: Measure }
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('numberRest', 'basic')

const note = computed(() => asStaffOrNumber(props.editSlot.self as never) as NoteNumber)
const info = computed(() => note.value.notesInfo[0])
const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const tabs = computed(() => [
  { name: 'basic', label: t('editor.panelTab.basic') },
  { name: 'marks', label: t('editor.panelTab.marks'), badge: note.value.affiliatedSymbols?.length ?? 0 }
])

const chronaxie = computed({
  get: () => info.value?.chronaxie ?? 64,
  set: (v: Chronaxie) => {
    if (info.value) setNotesNumberInfoChronaxie(info.value, v, note.value)
  }
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => info.value?.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => {
    for (const ni of note.value.notesInfo) setNotesNumberInfoAugmentationDot(ni, v)
  }
})

const beamType = computed({
  get: () => info.value?.beamType ?? BeamTypeEnum.None,
  set: (v: BeamTypeEnum) => {
    if (info.value) setNotesNumberInfoBeamType(info.value, v, note.value)
  }
})

const relativeX = computed({
  get: () => (info.value ? readRelativeX(info.value) : 0),
  set: (v: number) => {
    if (info.value) setNotesNumberInfoRelativeX(musicScore.value, info.value, v)
  }
})
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template v-if="info" #basic>
      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented
            v-model="chronaxie"
            :options="options.durations(REST_CHRONAXIE_VALUES, 'rest')"
          />
        </PanelField>
        <PanelField :label="t('editor.note.augmentationDot')">
          <PanelSegmented v-model="augmentationDot" :options="options.dots(AUGMENTATION_DOT_VALUES)" />
        </PanelField>
        <PanelField :label="t('editor.note.beamConnection')">
          <PanelSegmented v-model="beamType" :options="options.beams(BEAM_TYPE_VALUES)" />
        </PanelField>
      </PanelGroup>

      <PanelGroup :title="t('editor.note.relativeX')">
        <RelativeXOffsetControl v-model="relativeX" bare />
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette :host="note" :notation-type="musicScore.type" />
    </template>
  </PanelTabs>
</template>
