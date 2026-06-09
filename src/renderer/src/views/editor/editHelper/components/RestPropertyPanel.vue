<script lang="ts" setup>
import type {Chronaxie} from 'deciphony-renderer'
import {computed} from 'vue'
import {REST_CHRONAXIE_OPTIONS} from '../renderEditAddNoteState'
import {AUGMENTATION_DOT_OPTIONS} from '../renderEditNoteHeadProperties'
import {
  setNoteRestAugmentationDot,
  setNoteRestChronaxie,
  type RestEditSlot,
} from '../renderEditRestProperties'

const props = defineProps<{
  editSlot: RestEditSlot
}>()

const rest = computed(() => props.editSlot.self)

const chronaxie = computed({
  get: () => rest.value.chronaxie,
  set: (v: Chronaxie) => setNoteRestChronaxie(rest.value, v),
})

const augmentationDot = computed({
  get: (): 0 | 1 | 2 | 3 => rest.value.augmentationDot?.count ?? 0,
  set: (v: 0 | 1 | 2 | 3) => setNoteRestAugmentationDot(rest.value, v),
})
</script>

<template>
  <div class="rest-props">
    <section class="rest-props__section">
      <div class="rest-props__label">时值</div>
      <el-radio-group v-model="chronaxie" class="rest-props__radio" size="small">
        <el-radio-button
          v-for="opt in REST_CHRONAXIE_OPTIONS"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </section>

    <section class="rest-props__section">
      <div class="rest-props__label">附点</div>
      <el-radio-group v-model="augmentationDot" class="rest-props__radio" size="small">
        <el-radio-button
          v-for="opt in AUGMENTATION_DOT_OPTIONS"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </section>
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
