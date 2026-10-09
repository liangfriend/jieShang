<script lang="ts" setup>
import type {Chronaxie, SlotData} from '@deciphony/renderer'
import {BeamTypeEnum} from '@deciphony/renderer'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {
  resolveAugmentationDotLabel,
  resolveBeamTypeLabel,
  resolveNoteDurationLabel,
  resolveStemDirectionLabel,
} from '@renderer/i18n/helpers'
import {CHRONAXIE_VALUES} from '../renderEditAddNoteState'
import {
  AUGMENTATION_DOT_VALUES,
  BEAM_TYPE_VALUES,
  STEM_DIRECTION_VALUES,
} from '../standardStaff/renderEditNoteHeadProperties'
import {
  resolveGracePlacement,
  setGraceAugmentationDot,
  setGraceBeamType,
  setGraceChronaxie,
  setGraceDirection,
} from '../renderEditGraceNotes'

const props = defineProps<{
  editSlot: SlotData
}>()

const {t} = useI18n()

type GraceInfo = {
  id: string
  chronaxie: Chronaxie
  beamType?: BeamTypeEnum
  direction?: 'up' | 'down'
  augmentationDot?: {count: 1 | 2 | 3}
}

const info = computed(() => props.editSlot.info as GraceInfo)
const placement = computed(() =>
  resolveGracePlacement(props.editSlot.note as never, info.value?.id),
)

/** 仅五线倚音有符杠方向 */
const showStemDirection = computed(() => 'direction' in (info.value ?? {}))

const chronaxie = computed({
  get: () => info.value.chronaxie ?? 32,
  set: (v: Chronaxie) => setGraceChronaxie(info.value, v),
})

const beamType = computed({
  get: () => info.value.beamType ?? BeamTypeEnum.None,
  set: (v: BeamTypeEnum) => setGraceBeamType(info.value, v),
})

const direction = computed({
  get: () => info.value.direction ?? 'up',
  set: (v: 'up' | 'down') => setGraceDirection(info.value, v),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => info.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setGraceAugmentationDot(info.value, v),
})

const titleKey = computed(() =>
  placement.value === 'after' ? 'editor.note.graceAfter' : 'editor.note.graceBefore',
)
</script>

<template>
  <div class="grace-props">
    <section class="grace-props__section">
      <div class="grace-props__hint">{{ t(titleKey) }}</div>
    </section>

    <section class="grace-props__section">
      <div class="grace-props__label">{{ t('editor.note.duration') }}</div>
      <el-radio-group v-model="chronaxie" class="grace-props__radio" size="small">
        <el-radio-button v-for="value in CHRONAXIE_VALUES" :key="value" :label="value">
          {{ resolveNoteDurationLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="grace-props__section">
      <div class="grace-props__label">{{ t('editor.note.beam') }}</div>
      <el-radio-group v-model="beamType" class="grace-props__radio" size="small">
        <el-radio-button v-for="value in BEAM_TYPE_VALUES" :key="value" :label="value">
          {{ resolveBeamTypeLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section v-if="showStemDirection" class="grace-props__section">
      <div class="grace-props__label">{{ t('editor.note.stemDirection') }}</div>
      <el-radio-group v-model="direction" class="grace-props__radio" size="small">
        <el-radio-button
          v-for="value in STEM_DIRECTION_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveStemDirectionLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="grace-props__section">
      <div class="grace-props__label">{{ t('editor.note.augmentationDot') }}</div>
      <el-radio-group v-model="augmentationDot" class="grace-props__radio" size="small">
        <el-radio-button
          v-for="value in AUGMENTATION_DOT_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveAugmentationDotLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>
  </div>
</template>

<style scoped>
.grace-props__section {
  margin-bottom: 14px;
}

.grace-props__hint {
  font-size: 12px;
  color: #909399;
}

.grace-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.grace-props__radio {
  display: flex;
  flex-wrap: wrap;
}
</style>
