<script lang="ts" setup>
import type {SlotData} from 'deciphony-renderer'
import {computed} from 'vue'
import {
  canMoveSlurEndEarlier,
  canMoveSlurEndLater,
  getSlurThickness,
  moveSlurEndEarlier,
  moveSlurEndLater,
  setSlurThickness,
  type SlurEditSlot,
} from '../renderEditSlurProperties'
import SlurThicknessControl from './SlurThicknessControl.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const slurEditSlot = computed(() => props.editSlot as SlurEditSlot)
const musicScore = computed(() => slurEditSlot.value.musicScore)
const slur = computed(() => slurEditSlot.value.self)

const canEarlier = computed(() => canMoveSlurEndEarlier(musicScore.value, slur.value))
const canLater = computed(() => canMoveSlurEndLater(musicScore.value, slur.value))

const thickness = computed({
  get: () => getSlurThickness(slur.value),
  set: (v: number) => setSlurThickness(slur.value, v),
})

function onMoveEarlier() {
  moveSlurEndEarlier(musicScore.value, slur.value)
}

function onMoveLater() {
  moveSlurEndLater(musicScore.value, slur.value)
}
</script>

<template>
  <div class="slur-props">
    <section class="slur-props__section">
      <SlurThicknessControl v-model="thickness" />
    </section>
    <section class="slur-props__section">
      <div class="slur-props__label">尾部锚点</div>
      <div class="slur-props__row">
        <el-button :disabled="!canEarlier" size="small" @click="onMoveEarlier">尾部前移</el-button>
        <el-button :disabled="!canLater" size="small" @click="onMoveLater">尾部后移</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.slur-props__section {
  margin-bottom: 14px;
}

.slur-props__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.slur-props__row {
  display: flex;
  gap: 8px;
}
</style>
