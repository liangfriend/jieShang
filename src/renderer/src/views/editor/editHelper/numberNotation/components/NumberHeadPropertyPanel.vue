<script lang="ts" setup>
import type {Chronaxie, MusicScore} from 'deciphony-renderer'
import {AccidentalTypeEnum, BeamTypeEnum} from 'deciphony-renderer'
import {computed} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  resolveAccidentalSelectLabel,
  resolveAugmentationDotLabel,
  resolveBeamTypeLabel,
  resolveNoteDurationLabel,
  resolveOctaveDotLabel,
  resolveSyllableLabel
} from '@renderer/i18n/helpers'
import {CHRONAXIE_VALUES} from '../renderEditNumberAddState'
import {
  ACCIDENTAL_SELECT_VALUES,
  AUGMENTATION_DOT_VALUES,
  BEAM_TYPE_VALUES,
  OCTAVE_DOT_VALUES,
  SYLLABLE_VALUES,
  setNoteNumberBeamType,
  setNoteNumberChronaxie,
  setNotesNumberInfoAccidental,
  setNotesNumberInfoAccidentalRelativeX,
  setNotesNumberInfoAugmentationDot,
  setNotesNumberInfoOctaveDot,
  setNotesNumberInfoSyllable,
  type NumberHeadEditSlot,
} from '../renderEditNumberHeadProperties'
import {tryAddSlurFromNumberHead, type SlurSpan} from '../renderEditSlurAdd'
import NoteSlurListSection from '../../components/NoteSlurListSection.vue'
import RelativeXOffsetControl from '../../standardStaff/components/RelativeXOffsetControl.vue'

const props = defineProps<{
  editSlot: NumberHeadEditSlot
}>()

const { t } = useI18n()

const notesInfo = computed(() => props.editSlot.info)
const note = computed(() => props.editSlot.note)

const chronaxie = computed({
  get: () => note.value.chronaxie,
  set: (v: Chronaxie) => setNoteNumberChronaxie(note.value, v),
})

const beamType = computed({
  get: () => note.value.beamType ?? BeamTypeEnum.None,
  set: (v: BeamTypeEnum) => setNoteNumberBeamType(note.value, v),
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
  get: () => notesInfo.value.accidental?.relativeX ?? 0,
  set: (v: number) => setNotesNumberInfoAccidentalRelativeX(notesInfo.value, v),
})

const hasAccidental = computed(() => Boolean(notesInfo.value.accidental))

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)

function onAddSlur(span: SlurSpan) {
  tryAddSlurFromNumberHead(props.editSlot, span)
}
</script>

<template>
  <div class="note-head-props">
    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.syllable') }}</div>
      <el-select v-model="syllable" class="note-head-props__select" size="small">
        <el-option
          v-for="value in SYLLABLE_VALUES"
          :key="String(value)"
          :label="resolveSyllableLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.octaveDotLabel') }}</div>
      <el-select v-model="octaveDot" class="note-head-props__select" size="small">
        <el-option
          v-for="value in OCTAVE_DOT_VALUES"
          :key="value"
          :label="resolveOctaveDotLabel(value)"
          :value="value"
        />
      </el-select>
    </section>

    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.duration') }}</div>
      <el-radio-group v-model="chronaxie" class="note-head-props__radio" size="small">
        <el-radio-button
          v-for="value in CHRONAXIE_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveNoteDurationLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.beamConnection') }}</div>
      <el-radio-group v-model="beamType" class="note-head-props__radio" size="small">
        <el-radio-button
          v-for="value in BEAM_TYPE_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveBeamTypeLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.accidental') }}</div>
      <el-select v-model="accidental" class="note-head-props__select" size="small">
        <el-option
          v-for="value in ACCIDENTAL_SELECT_VALUES"
          :key="value || 'none'"
          :label="resolveAccidentalSelectLabel(value)"
          :value="value"
        />
      </el-select>
      <RelativeXOffsetControl
        v-if="hasAccidental"
        v-model="accidentalRelativeX"
        nested
      />
    </section>

    <section class="note-head-props__section">
      <div class="note-head-props__label">{{ t('editor.note.augmentationDot') }}</div>
      <el-radio-group v-model="augmentationDot" class="note-head-props__radio" size="small">
        <el-radio-button
          v-for="value in AUGMENTATION_DOT_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveAugmentationDotLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <NoteSlurListSection
      :music-score="musicScore"
      :notes-info-id="notesInfo.id"
      @add="onAddSlur"
    />
  </div>
</template>

<style scoped>
.note-head-props__section {
  margin-bottom: 14px;
}

.note-head-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.note-head-props__radio {
  display: flex;
  flex-wrap: wrap;
}

.note-head-props__select {
  width: 100%;
}

.note-head-props__row {
  display: flex;
  gap: 8px;
}
</style>
