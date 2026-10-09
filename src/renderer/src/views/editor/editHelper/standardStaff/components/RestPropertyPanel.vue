<script lang="ts" setup>
import type {Chronaxie, MusicScore} from '@deciphony/renderer'
import {computed} from 'vue'
import { useI18n } from 'vue-i18n'
import {REST_CHRONAXIE_VALUES} from '../../renderEditAddNoteState'
import {AUGMENTATION_DOT_VALUES} from '../renderEditNoteHeadProperties'
import {
  setNoteRestAugmentationDot,
  setNoteRestChronaxie,
  setNoteRestRelativeX,
  type RestEditSlot,
} from '../renderEditRestProperties'
import {readRelativeX} from '../renderEditFrameProperties'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import {useNoteSegmentOptions} from '../../components/panel/noteOptions'
import {usePanelTab} from '../../components/panel/usePanelTab'
import RelativeXOffsetControl from './RelativeXOffsetControl.vue'

const props = defineProps<{
  editSlot: RestEditSlot
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('rest', 'basic')

const rest = computed(() => props.editSlot.self)
const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const tabs = computed(() => [
  {name: 'basic', label: t('editor.panelTab.basic')},
  {name: 'marks', label: t('editor.panelTab.marks'), badge: rest.value.affiliatedSymbols?.length ?? 0},
])

const chronaxie = computed({
  get: () => rest.value.chronaxie,
  set: (v: Chronaxie) => setNoteRestChronaxie(rest.value, v),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => rest.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setNoteRestAugmentationDot(rest.value, v),
})

const relativeX = computed({
  get: () => readRelativeX(rest.value),
  set: (v: number) => setNoteRestRelativeX(musicScore.value, rest.value, v),
})
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented v-model="chronaxie" :options="options.durations(REST_CHRONAXIE_VALUES, 'rest')" />
        </PanelField>
        <PanelField :label="t('editor.note.augmentationDot')">
          <PanelSegmented v-model="augmentationDot" :options="options.dots(AUGMENTATION_DOT_VALUES)" />
        </PanelField>
      </PanelGroup>

      <PanelGroup :title="t('editor.note.relativeX')">
        <RelativeXOffsetControl v-model="relativeX" bare />
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette :host="rest" :notation-type="musicScore.type" />
    </template>
  </PanelTabs>
</template>
