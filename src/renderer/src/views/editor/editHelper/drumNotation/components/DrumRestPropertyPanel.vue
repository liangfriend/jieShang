<script lang="ts" setup>
import type { Chronaxie, DrumRest, SlotData } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setDrumRestAugmentationDot, setDrumRestChronaxie, setDrumRestRegion } from '@deciphony/extensions/dr-edit'
import { DRUM_CHRONAXIE_VALUES, DRUM_DOT_VALUES } from '../renderEditDrumAddState'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
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
const tab = usePanelTab('drumRest', 'basic')

const rest = computed(() => props.editSlot.self as unknown as DrumRest)

const tabs = computed(() => [
  { name: 'basic', label: t('editor.panelTab.basic') },
  { name: 'marks', label: t('editor.panelTab.marks'), badge: rest.value.affiliatedSymbols?.length ?? 0 }
])

const region = computed({
  get: () => rest.value.region,
  set: (value: number) => {
    setDrumRestRegion(rest.value, value)
  }
})

/** 五线谱正中（第三线） */
const DRUM_REST_CENTER_REGION = 4

function centerRest() {
  region.value = DRUM_REST_CENTER_REGION
}

const chronaxie = computed({
  get: () => rest.value.chronaxie,
  set: (value: Chronaxie) => setDrumRestChronaxie(rest.value, value)
})

const dot = computed({
  get: () => (rest.value.augmentationDot?.count ?? 0) as 0 | 1 | 2 | 3,
  set: (value: 0 | 1 | 2 | 3) => setDrumRestAugmentationDot(rest.value, value)
})
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented v-model="chronaxie" :options="options.durations(DRUM_CHRONAXIE_VALUES, 'rest')" />
        </PanelField>
        <PanelField :label="t('editor.note.augmentationDot')">
          <PanelSegmented v-model="dot" :options="options.dots(DRUM_DOT_VALUES)" />
        </PanelField>
        <RhythmGroupEndField :measure="editSlot.measure" :symbol="rest" />
      </PanelGroup>

      <PanelGroup :title="t('editor.drum.region')">
        <div class="drum-rest-props__row">
          <el-input-number v-model="region" :max="14" :min="-6" :step="1" size="small" />
          <el-button size="small" :disabled="region === DRUM_REST_CENTER_REGION" @click="centerRest">
            {{ t('editor.drum.center') }}
          </el-button>
        </div>
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette
        :host="rest"
        :notation-type="editSlot.musicScore.type"
        :music-score="editSlot.musicScore"
      />
    </template>
  </PanelTabs>
</template>

<style scoped>
.drum-rest-props__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
