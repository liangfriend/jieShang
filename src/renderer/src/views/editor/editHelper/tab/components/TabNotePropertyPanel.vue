<script lang="ts" setup>
import type { Chronaxie, SlotData, TabNote, TabNoteInfo, tabChord } from '@deciphony/renderer'
import { BeamTypeEnum, BendTypeEnum } from '@deciphony/renderer'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  setTabNoteChord,
  setTabNoteInfoBeamType,
  setTabNoteInfoBend,
  setTabNoteInfoRegionRange,
  setTabNoteInfoValue,
  setTabNoteSlap
} from '@deciphony/extensions/dr-edit'
import { CHRONAXIE_VALUES } from '../../renderEditAddNoteState'
import { AUGMENTATION_DOT_VALUES, BEAM_TYPE_VALUES } from '../../standardStaff/renderEditNoteHeadProperties'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import { useNoteSegmentOptions } from '../../components/panel/noteOptions'
import { usePanelTab } from '../../components/panel/usePanelTab'
import { setTabInfoAugmentationDot, setTabInfoChronaxie, type TabDotCount } from '../renderEditTabNoteProperties'
import {
  findSlurEndFromNoteHead,
  tryAddSlurFromNoteHead,
  type SlurSpan
} from '../../standardStaff/renderEditSlurAdd'
import { BEND_TYPE_OPTIONS, TAB_FRET_OPTIONS, TAB_SEMITONE_OPTIONS } from '../renderEditTabAddState'
import { warnNotEnoughSpanNotes } from '../../renderEditSlotSymbolAdd'
import { previewRelativeX, readRelativeX } from '../../standardStaff/renderEditFrameProperties'
import RelativeXOffsetControl from '../../standardStaff/components/RelativeXOffsetControl.vue'
import NoteGraceSection from '../../components/NoteGraceSection.vue'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import NoteSpanSymbolSection from '../../components/NoteSpanSymbolSection.vue'
import RhythmGroupEndField from '../../components/RhythmGroupEndField.vue'
import {
  listGuitarChords,
  tabTypeForStringCount,
  type GuitarChordRecord,
  type GuitarChordTabType
} from '@renderer/utils/fileHelper/guitarChordFile'
import { applyScoreTabChordLayout } from '@renderer/constant/guitar'

const props = defineProps<{
  editSlot: SlotData
  stringCount: number
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('tabNote', 'basic')

const info = computed(() => props.editSlot.info as unknown as TabNoteInfo)
const note = computed(() => props.editSlot.note as unknown as TabNote)

const isHead = computed(() => info.value.type === 'normal' || info.value.type === 'harmonic')
const isGeometry = computed(() => info.value.type === 'arpeggio' || info.value.type === 'strumming')

const tabs = computed(() => [
  { name: 'basic', label: t('editor.panelTab.basic') },
  { name: 'marks', label: t('editor.panelTab.marks'), badge: info.value.affiliatedSymbols?.length ?? 0 },
  { name: 'span', label: t('editor.panelTab.span') }
])

const chordTabType = computed<GuitarChordTabType>(() => tabTypeForStringCount(props.stringCount))

const chordOptions = ref<GuitarChordRecord[]>([])
const chordLoading = ref(false)
/** null = 无和弦图 */
const selectedChordId = ref<number | null>(null)

const fret = computed({
  get: () => info.value.value,
  set: (value: number) => setTabNoteInfoValue(info.value, value)
})

const chronaxie = computed({
  get: () => info.value.chronaxie,
  set: (value: Chronaxie) => setTabInfoChronaxie(note.value, info.value, value)
})

const beamType = computed({
  get: () => info.value.beamType ?? BeamTypeEnum.None,
  set: (value: BeamTypeEnum) => setTabNoteInfoBeamType(info.value, value)
})

const augmentationDot = computed({
  get: () => (info.value.augmentationDot?.count ?? 0) as TabDotCount,
  set: (value: TabDotCount) => setTabInfoAugmentationDot(note.value, info.value, value)
})

const slap = computed({
  get: () => note.value.isSlap,
  set: (value: boolean) => setTabNoteSlap(note.value, value)
})

const relativeX = computed({
  get: () => readRelativeX(info.value),
  set: (value: number) => previewRelativeX(props.editSlot.musicScore, info.value, value)
})

function regionRangeOf(item: TabNoteInfo): { start: number; end: number } {
  return 'regionRange' in item ? item.regionRange : { start: 0, end: 0 }
}

const regionStartDisplay = computed({
  get: () => regionRangeOf(info.value).start + 1,
  set: (display: number) => writeRange(display - 1, regionRangeOf(info.value).end)
})

const regionEndDisplay = computed({
  get: () => regionRangeOf(info.value).end + 1,
  set: (display: number) => writeRange(regionRangeOf(info.value).start, display - 1)
})

const bend = computed(() => ('bend' in info.value ? info.value.bend ?? null : null))

const bendType = computed({
  get: () => bend.value?.type ?? BendTypeEnum.Bend,
  set: (type: BendTypeEnum) => {
    if (!bend.value) return
    setTabNoteInfoBend(info.value, {
      type,
      periodOne: bend.value.periodOne,
      periodTwo: bend.value.periodTwo
    })
  }
})

const periodOne = computed({
  get: () => bend.value?.periodOne ?? 1,
  set: (value: number) => {
    if (!bend.value) return
    setTabNoteInfoBend(info.value, {
      type: bend.value.type,
      periodOne: value,
      periodTwo: bend.value.periodTwo
    })
  }
})

const periodTwo = computed({
  get: () => bend.value?.periodTwo ?? 0,
  set: (value: number) => {
    if (!bend.value) return
    setTabNoteInfoBend(info.value, {
      type: bend.value.type,
      periodOne: bend.value.periodOne,
      periodTwo: value
    })
  }
})

function isMeaningfulChord(chord: tabChord | null | undefined): boolean {
  if (!chord) return false
  if (chord.name?.trim()) return true
  if (chord.stringStates?.some((state) => state.finger !== -1)) return true
  return chord.barres?.some((barre) => barre.startStringNumber <= barre.endStringNumber) ?? false
}

function chordFingerprint(chord: tabChord): string {
  return JSON.stringify({
    name: chord.name ?? '',
    baseFret: chord.baseFret ?? 0,
    stringCount: chord.stringCount,
    stringStates: chord.stringStates ?? [],
    barres: chord.barres ?? []
  })
}

function syncSelectedChordFromNote() {
  const chord = note.value.chord
  if (!isMeaningfulChord(chord)) {
    selectedChordId.value = null
    return
  }
  const fp = chordFingerprint(chord!)
  const match =
    chordOptions.value.find((item) => chordFingerprint(item.chord) === fp) ??
    chordOptions.value.find((item) => item.name === chord!.name)
  selectedChordId.value = match?.id ?? null
}

async function loadChordOptions() {
  chordLoading.value = true
  try {
    chordOptions.value = await listGuitarChords('', chordTabType.value)
    syncSelectedChordFromNote()
  } finally {
    chordLoading.value = false
  }
}

function onChordSelect(id: number | null) {
  selectedChordId.value = id
  if (id == null) {
    setTabNoteChord(note.value, null)
    return
  }
  const record = chordOptions.value.find((item) => item.id === id)
  if (!record) return
  const cloned = applyScoreTabChordLayout(
    JSON.parse(JSON.stringify(record.chord)) as tabChord
  )
  cloned.stringCount = props.stringCount
  setTabNoteChord(note.value, cloned)
}

function writeRange(start: number, end: number) {
  setTabNoteInfoRegionRange(info.value, start, end, props.stringCount)
}

function onAddSlur(span: SlurSpan, endInfoId: string | null) {
  if (!tryAddSlurFromNoteHead(props.editSlot as never, span, endInfoId)) warnNotEnoughSpanNotes(t)
}

function findSlurEnd(span: SlurSpan) {
  return findSlurEndFromNoteHead(props.editSlot as never, span)?.id ?? null
}

function onAddBend() {
  setTabNoteInfoBend(info.value, {
    type: BendTypeEnum.Bend,
    periodOne: 1,
    periodTwo: 0
  })
}

function onRemoveBend() {
  setTabNoteInfoBend(info.value, null)
}

onMounted(() => {
  void loadChordOptions()
})

watch(
  () => [props.editSlot.note?.id, chordTabType.value] as const,
  () => {
    void loadChordOptions()
  }
)
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.tabNote.chord')">
        <el-select
          :model-value="selectedChordId"
          clearable
          filterable
          :loading="chordLoading"
          :placeholder="t('editor.tabNote.chordNone')"
          style="width: 100%"
          size="small"
          @update:model-value="onChordSelect($event as number | null)"
        >
          <el-option :label="t('editor.tabNote.chordNone')" :value="null" />
          <el-option
            v-for="item in chordOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </PanelGroup>

      <PanelGroup v-if="isHead || isGeometry" :title="t('editor.panelGroup.pitch')">
        <PanelField v-if="isHead" :label="t('editor.addTab.fret')">
          <el-select v-model="fret" size="small">
            <el-option
              v-for="opt in TAB_FRET_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </PanelField>
        <template v-if="isGeometry">
          <PanelField :label="t('editor.addTab.regionStart', { n: regionStartDisplay })" stacked>
            <el-slider v-model="regionStartDisplay" :max="stringCount" :min="1" :step="1" />
          </PanelField>
          <PanelField :label="t('editor.addTab.regionEnd', { n: regionEndDisplay })" stacked>
            <el-slider v-model="regionEndDisplay" :max="stringCount" :min="1" :step="1" />
          </PanelField>
        </template>
      </PanelGroup>

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
        <RhythmGroupEndField :measure="editSlot.measure" :symbol="note" />
      </PanelGroup>

      <PanelGroup :title="t('editor.tabNote.technique')">
        <el-checkbox v-model="slap">{{ t('editor.tabNote.slap') }}</el-checkbox>
        <template v-if="isHead">
          <el-button v-if="!bend" size="small" class="tab-note-props__bend-add" @click="onAddBend">
            {{ t('editor.tabNote.addBend') }}
          </el-button>
          <template v-else>
            <PanelField :label="t('editor.tabNote.bend')">
              <el-select v-model="bendType" size="small">
                <el-option
                  v-for="opt in BEND_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="t(opt.labelKey)"
                  :value="opt.value"
                />
              </el-select>
            </PanelField>
            <PanelField :label="t('editor.tabNote.stage', { n: 1 })">
              <el-select v-model="periodOne" size="small">
                <el-option
                  v-for="opt in TAB_SEMITONE_OPTIONS"
                  :key="`a-${opt.value}`"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </PanelField>
            <PanelField :label="t('editor.tabNote.stage', { n: 2 })">
              <el-select v-model="periodTwo" size="small">
                <el-option
                  v-for="opt in TAB_SEMITONE_OPTIONS"
                  :key="`b-${opt.value}`"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </PanelField>
            <el-button size="small" class="tab-note-props__bend-add" @click="onRemoveBend">
              {{ t('editor.tabNote.removeBend') }}
            </el-button>
          </template>
        </template>
      </PanelGroup>

      <PanelGroup v-if="isHead" :title="t('editor.note.grace')">
        <NoteGraceSection :edit-slot="editSlot" bare />
      </PanelGroup>

      <PanelGroup :title="t('editor.note.relativeX')">
        <RelativeXOffsetControl v-model="relativeX" bare />
        <el-button
          size="small"
          class="tab-note-props__bend-add"
          :disabled="relativeX === 0"
          @click="relativeX = 0"
        >
          {{ t('editor.tabNote.resetPosition') }}
        </el-button>
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
        show-strumming
        @add-slur="onAddSlur"
      />
    </template>
  </PanelTabs>
</template>

<style scoped>
.tab-note-props__bend-add {
  width: 100%;
  margin: 0;
}
</style>
