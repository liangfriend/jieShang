<script lang="ts" setup>
import {MusicScoreTypeEnum, type SlotData} from '@deciphony/renderer'
import {ElMessage} from 'element-plus'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {
  applySlurRelativeToScope,
  centerSlurControlPoint,
  getSlurThickness,
  setSlurThickness,
  SLUR_APPLY_SCOPES,
  type SlurApplyScope,
  type SlurEditSlot,
} from '../renderEditSlurProperties'
import {slurColumnOptions} from '../renderEditSlurEndpoints'
import EndpointOffsetSection from './EndpointOffsetSection.vue'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import PanelSegmented from './panel/PanelSegmented.vue'
import SlurThicknessControl from './SlurThicknessControl.vue'
import SpanResizeSection from './SpanResizeSection.vue'

const props = defineProps<{
  editSlot: SlotData
}>()

const {t} = useI18n()

const slurEditSlot = computed(() => props.editSlot as SlurEditSlot)
const musicScore = computed(() => slurEditSlot.value.musicScore)
const slur = computed(() => slurEditSlot.value.self)
/** 简谱连音线不用控制点 */
const showControlCenter = computed(() => musicScore.value.type !== MusicScoreTypeEnum.NumberNotation)

const thickness = computed({
  get: () => getSlurThickness(slur.value),
  set: (v: number) => setSlurThickness(slur.value, v),
})

/** 起止音可换成同一列（叠音 / 和弦）里的其它音 */
const startOptions = computed(() => slurColumnOptions(musicScore.value, slur.value.startId, t))
const endOptions = computed(() => slurColumnOptions(musicScore.value, slur.value.endId, t))

function setStartId(id: string) {
  if (id !== slur.value.endId) slur.value.startId = id
}

function setEndId(id: string) {
  if (id !== slur.value.startId) slur.value.endId = id
}

function applyTo(scope: SlurApplyScope) {
  const n = applySlurRelativeToScope(musicScore.value, slur.value, scope)
  if (n) ElMessage.success(t('editor.slurApply.applied', {n}))
  else ElMessage.info(t('editor.slurApply.none'))
}
</script>

<template>
  <div class="slur-props">
    <section class="slur-props__section">
      <SlurThicknessControl v-model="thickness" />
    </section>
    <SpanResizeSection :music-score="musicScore" :symbol="slur" />
    <PanelGroup v-if="startOptions.length > 1 || endOptions.length > 1" :title="t('editor.slur.notes')">
      <PanelField v-if="startOptions.length > 1" :label="t('editor.slur.startNote')">
        <PanelSegmented :model-value="slur.startId" :options="startOptions" @update:model-value="setStartId" />
      </PanelField>
      <PanelField v-if="endOptions.length > 1" :label="t('editor.slur.endNote')">
        <PanelSegmented :model-value="slur.endId" :options="endOptions" @update:model-value="setEndId" />
      </PanelField>
    </PanelGroup>
    <EndpointOffsetSection :symbol="slur" />
    <el-button
      v-if="showControlCenter"
      class="slur-props__wide"
      size="small"
      @click="centerSlurControlPoint(slur)"
    >
      {{ t('editor.slurApply.centerControl') }}
    </el-button>
    <PanelGroup :title="t('editor.slurApply.title')">
      <div class="slur-props__grid">
        <el-button v-for="scope in SLUR_APPLY_SCOPES" :key="scope" size="small" @click="applyTo(scope)">
          {{ t(`editor.slurApply.scope.${scope}`) }}
        </el-button>
      </div>
    </PanelGroup>
  </div>
</template>

<style scoped>
.slur-props {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slur-props__section {
  margin-bottom: 4px;
}

.slur-props__wide {
  width: 100%;
}

.slur-props__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.slur-props__grid :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
