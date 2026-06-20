<script lang="ts" setup>
import type {Chronaxie} from 'deciphony-renderer'
import {computed} from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAugmentationDotLabel, resolveRestDurationLabel } from '@renderer/i18n/helpers'
import {REST_CHRONAXIE_VALUES} from '../../renderEditAddNoteState'
import {AUGMENTATION_DOT_VALUES} from '../renderEditNoteHeadProperties'
import {
  setNoteRestAugmentationDot,
  setNoteRestChronaxie,
  setNoteRestRelativeX,
  type RestEditSlot,
} from '../renderEditRestProperties'
import RelativeXOffsetControl from './RelativeXOffsetControl.vue'

const props = defineProps<{
  editSlot: RestEditSlot
}>()

const { t } = useI18n()

const rest = computed(() => props.editSlot.self)

const chronaxie = computed({
  get: () => rest.value.chronaxie,
  set: (v: Chronaxie) => setNoteRestChronaxie(rest.value, v),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => rest.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setNoteRestAugmentationDot(rest.value, v),
})

const relativeX = computed({
  get: () => rest.value.relativeX ?? 0,
  set: (v: number) => setNoteRestRelativeX(rest.value, v),
})
</script>

<template>
  <div class="rest-props">
    <section class="rest-props__section">
      <div class="rest-props__label">{{ t('editor.note.duration') }}</div>
      <el-radio-group v-model="chronaxie" class="rest-props__radio" size="small">
        <el-radio-button
          v-for="value in REST_CHRONAXIE_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveRestDurationLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="rest-props__section">
      <div class="rest-props__label">{{ t('editor.note.augmentationDot') }}</div>
      <el-radio-group v-model="augmentationDot" class="rest-props__radio" size="small">
        <el-radio-button
          v-for="value in AUGMENTATION_DOT_VALUES"
          :key="value"
          :label="value"
        >
          {{ resolveAugmentationDotLabel(value) }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <RelativeXOffsetControl v-model="relativeX" />
  </div>
</template>

<style scoped>
.rest-props__section {
  margin-bottom: 14px;
}

.rest-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.rest-props__radio {
  display: flex;
  flex-wrap: wrap;
}
</style>
