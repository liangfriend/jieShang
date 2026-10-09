<script lang="ts" setup>
import type {Chronaxie, MusicScore, NotesNumberInfo} from '@deciphony/renderer'
import {AccidentalTypeEnum, BeamTypeEnum} from '@deciphony/renderer'
import {computed, ref} from 'vue'
import { useI18n } from 'vue-i18n'
import {resolveAccidentalSelectLabel} from '@renderer/i18n/helpers'
import {CHRONAXIE_VALUES} from '../../renderEditAddNoteState'
import {
  ACCIDENTAL_SELECT_VALUES,
  AUGMENTATION_DOT_VALUES,
  BEAM_TYPE_VALUES,
  OCTAVE_DOT_VALUES,
  SYLLABLE_VALUES,
  appendSameSlotNotesNumberInfo,
  setNotesNumberInfoAccidental,
  setNotesNumberInfoAccidentalRelativeX,
  setNotesNumberInfoAugmentationDot,
  setNotesNumberInfoBeamType,
  setNotesNumberInfoChronaxie,
  setNotesNumberInfoOctaveDot,
  setNotesNumberInfoRelativeX,
  setNotesNumberInfoSyllable,
  type NumberHeadEditSlot,
} from '../renderEditNumberHeadProperties'
import {findSlurEndFromNumberHead, tryAddSlurFromNumberHead, type SlurSpan} from '../renderEditSlurAdd'
import {warnNotEnoughSpanNotes} from '../../renderEditSlotSymbolAdd'
import NoteGraceSection from '../../components/NoteGraceSection.vue'
import NoteMarkPalette from '../../components/NoteMarkPalette.vue'
import NoteSpanSymbolSection from '../../components/NoteSpanSymbolSection.vue'
import PanelField from '../../components/panel/PanelField.vue'
import PanelGroup from '../../components/panel/PanelGroup.vue'
import PanelSegmented from '../../components/panel/PanelSegmented.vue'
import PanelTabs from '../../components/panel/PanelTabs.vue'
import {useNoteSegmentOptions} from '../../components/panel/noteOptions'
import {usePanelTab} from '../../components/panel/usePanelTab'
import RelativeXOffsetControl from '../../standardStaff/components/RelativeXOffsetControl.vue'
import {readRelativeX} from '../../standardStaff/renderEditFrameProperties'

const props = defineProps<{
  editSlot: NumberHeadEditSlot
}>()

const { t } = useI18n()
const options = useNoteSegmentOptions()
const tab = usePanelTab('numberHead', 'basic')

const notesInfo = computed(() => props.editSlot.info)
const note = computed(() => props.editSlot.note)
const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

const STACK_SYLLABLE_VALUES = [1, 2, 3, 4, 5, 6, 7] as const

const tabs = computed(() => [
  {name: 'basic', label: t('editor.panelTab.basic')},
  {name: 'marks', label: t('editor.panelTab.marks'), badge: note.value.affiliatedSymbols?.length ?? 0},
  {name: 'span', label: t('editor.panelTab.span')},
])

const chronaxie = computed({
  get: () =>
    notesInfo.value.chronaxie
    ?? (note.value as typeof note.value & { chronaxie?: Chronaxie }).chronaxie
    ?? 64,
  set: (v: Chronaxie) => setNotesNumberInfoChronaxie(notesInfo.value, v, note.value),
})

const beamType = computed({
  get: () =>
    notesInfo.value.beamType
    ?? (note.value as typeof note.value & { beamType?: BeamTypeEnum }).beamType
    ?? BeamTypeEnum.None,
  set: (v: BeamTypeEnum) => setNotesNumberInfoBeamType(notesInfo.value, v, note.value),
})

const syllable = computed({
  get: () => notesInfo.value.syllable,
  set: (v: typeof notesInfo.value.syllable) => setNotesNumberInfoSyllable(notesInfo.value, v),
})

const octaveDot = computed({
  get: () => notesInfo.value.octaveDot ?? 0,
  set: (v: typeof notesInfo.value.octaveDot) => setNotesNumberInfoOctaveDot(notesInfo.value, v),
})

const accidental = computed({
  get: () => notesInfo.value.accidental?.type ?? '',
  set: (v: AccidentalTypeEnum | '' | null | undefined) =>
    setNotesNumberInfoAccidental(notesInfo.value, v || ''),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => notesInfo.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setNotesNumberInfoAugmentationDot(notesInfo.value, v),
})

const accidentalRelativeX = computed({
  get: () => (notesInfo.value.accidental ? readRelativeX(notesInfo.value.accidental) : 0),
  set: (v: number) => setNotesNumberInfoAccidentalRelativeX(musicScore.value, notesInfo.value, v),
})

const relativeX = computed({
  get: () => readRelativeX(notesInfo.value),
  set: (v: number) => setNotesNumberInfoRelativeX(musicScore.value, notesInfo.value, v),
})

const hasAccidental = computed(() => Boolean(notesInfo.value.accidental))

/** 预设要添加到同一位置的多声部音符，点「添加」后才写入 */
const stackSyllable = ref<(typeof STACK_SYLLABLE_VALUES)[number]>(1)
const stackOctaveDot = ref<NotesNumberInfo['octaveDot']>(0)
const stackAccidental = ref<AccidentalTypeEnum | ''>('')

function onAddSlur(span: SlurSpan, endInfoId: string | null) {
  if (!tryAddSlurFromNumberHead(props.editSlot, span, endInfoId)) warnNotEnoughSpanNotes(t)
}

function findSlurEnd(span: SlurSpan) {
  return findSlurEndFromNumberHead(props.editSlot, span)?.id ?? null
}

function onAppendSameSlot() {
  const info = appendSameSlotNotesNumberInfo(
    note.value,
    notesInfo.value,
    stackSyllable.value,
    stackOctaveDot.value,
  )
  if (stackAccidental.value) setNotesNumberInfoAccidental(info, stackAccidental.value)
}
</script>

<template>
  <PanelTabs v-model="tab" :tabs="tabs">
    <template #basic>
      <PanelGroup :title="t('editor.panelGroup.pitch')">
        <PanelField :label="t('editor.note.syllable')" stacked>
          <PanelSegmented v-model="syllable" :options="options.syllables(SYLLABLE_VALUES)" :columns="8" />
        </PanelField>
        <PanelField :label="t('editor.note.octaveDotLabel')" stacked>
          <PanelSegmented v-model="octaveDot" :options="options.octaveDots(OCTAVE_DOT_VALUES)" :columns="7" />
        </PanelField>
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
      </PanelGroup>

      <PanelGroup :title="t('editor.note.addVoiceNote')">
        <PanelField :label="t('editor.note.syllable')" stacked>
          <PanelSegmented
            v-model="stackSyllable"
            :options="options.syllables([...STACK_SYLLABLE_VALUES])"
            :columns="7"
          />
        </PanelField>
        <PanelField :label="t('editor.note.octaveDotLabel')" stacked>
          <PanelSegmented
            v-model="stackOctaveDot"
            :options="options.octaveDots(OCTAVE_DOT_VALUES)"
            :columns="7"
          />
        </PanelField>
        <PanelField :label="t('editor.note.accidental')">
          <el-select v-model="stackAccidental" :placeholder="t('common.none')" size="small">
            <el-option
              v-for="value in ACCIDENTAL_SELECT_VALUES"
              :key="value || 'none'"
              :label="resolveAccidentalSelectLabel(value)"
              :value="value"
            />
          </el-select>
        </PanelField>
        <button type="button" class="number-props__stack-btn" @click="onAppendSameSlot">
          {{ t('editor.note.addVoiceNoteAction') }}
        </button>
      </PanelGroup>

      <PanelGroup :title="t('editor.panelGroup.rhythm')">
        <PanelField :label="t('editor.note.duration')" stacked>
          <PanelSegmented v-model="chronaxie" :options="options.durations(CHRONAXIE_VALUES)" />
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

      <PanelGroup :title="t('editor.note.grace')">
        <NoteGraceSection :edit-slot="editSlot" bare />
      </PanelGroup>
    </template>

    <template #marks>
      <NoteMarkPalette :host="note" :notation-type="musicScore.type" />
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

<style scoped>
.number-props__stack-btn {
  width: 100%;
  height: 28px;
  margin-top: 4px;
  padding: 0;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px dashed #c9b8ff;
  border-radius: 6px;
}

.number-props__stack-btn:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}
</style>
