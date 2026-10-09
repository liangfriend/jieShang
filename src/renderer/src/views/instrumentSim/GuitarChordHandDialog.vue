<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Finger } from '@deciphony/finger'
import type { tabChord } from '@deciphony/renderer'
import guitarBodyUrl from '@renderer/assets/virtualInstruments/guitar-body.svg'
import guitarStringsUrl from '@renderer/assets/virtualInstruments/guitar-strings.svg'
import {
  GUITAR_VIEW,
  stringXAtY,
  tabChordToBarreMarks,
  tabChordToFrets
} from '@renderer/constant/guitar'
import {
  GUITAR_FINGER_CANVAS,
  buildRestFretHandPose,
  cloneFingerPoseMap,
  resolveFretHandPose,
  type FingerPoseMap
} from '@renderer/utils/guitarFingerPose'

const props = defineProps<{
  modelValue: boolean
  chord: tabChord
  handPose?: FingerPoseMap | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [pose: FingerPoseMap]
}>()

const { t } = useI18n()

const pose = reactive(buildRestFretHandPose())

function assignPose(target: FingerPoseMap, next: FingerPoseMap) {
  target.thumbF = [...next.thumbF]
  target.indexF = [...next.indexF]
  target.middleF = [...next.middleF]
  target.ringF = [...next.ringF]
  target.littleF = [...next.littleF]
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    assignPose(pose, resolveFretHandPose(props.handPose))
  }
)

const frets = () => tabChordToFrets(props.chord)

function muteMarks() {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets().forEach((fret, fretIndex) => {
    if (fret !== -1) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
}

function openMarks() {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets().forEach((fret, fretIndex) => {
    if (fret !== 0) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
}

function close() {
  emit('update:modelValue', false)
}

function apply() {
  emit('confirm', cloneFingerPoseMap(pose))
  close()
}

function resetRest() {
  assignPose(pose, buildRestFretHandPose())
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('instrumentSim.chords.handTitle')"
    width="520px"
    top="3vh"
    append-to-body
    destroy-on-close
    class="chord-hand-dialog"
    modal-class="chord-hand-dialog-overlay"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="chord-hand-dialog__hint">{{ t('instrumentSim.chords.handHint') }}</p>
    <div class="chord-hand-dialog__stage">
      <svg
        class="chord-hand-dialog__svg"
        :viewBox="`0 0 ${GUITAR_VIEW.width} ${GUITAR_VIEW.height}`"
        role="img"
        aria-label="guitar hand editor"
      >
        <image :href="guitarBodyUrl" x="0" y="0" width="400" height="1000" />
        <image :href="guitarStringsUrl" x="0" y="0" width="400" height="1000" />

        <line
          v-for="(b, i) in tabChordToBarreMarks(chord)"
          :key="`barre-${b.fret}-${i}`"
          :x1="b.x1"
          :y1="b.y"
          :x2="b.x2"
          :y2="b.y"
          stroke="#1a1a1a"
          stroke-width="11"
          stroke-linecap="round"
        />

        <g v-for="m in openMarks()" :key="`open-${m.stringNumber}`">
          <circle :cx="m.x" :cy="m.y" r="5" fill="none" stroke="#2ecc71" stroke-width="2" />
        </g>
        <g v-for="m in muteMarks()" :key="`mute-${m.stringNumber}`">
          <line
            :x1="m.x - 4"
            :y1="m.y - 4"
            :x2="m.x + 4"
            :y2="m.y + 4"
            stroke="#e74c3c"
            stroke-width="2"
          />
          <line
            :x1="m.x + 4"
            :y1="m.y - 4"
            :x2="m.x - 4"
            :y2="m.y + 4"
            stroke="#e74c3c"
            stroke-width="2"
          />
        </g>
      </svg>

      <Finger
        class="chord-hand-dialog__finger"
        mode="edit"
        :width="GUITAR_FINGER_CANVAS.width"
        :height="GUITAR_FINGER_CANVAS.height"
        v-model:thumb-f="pose.thumbF"
        v-model:index-f="pose.indexF"
        v-model:middle-f="pose.middleF"
        v-model:ring-f="pose.ringF"
        v-model:little-f="pose.littleF"
        :duration="0"
        :finger-size="GUITAR_FINGER_CANVAS.fingerSize"
      />
    </div>

    <template #footer>
      <el-button @click="resetRest">{{ t('instrumentSim.chords.handReset') }}</el-button>
      <el-button @click="close">{{ t('instrumentSim.chords.handCancel') }}</el-button>
      <el-button type="primary" @click="apply">{{ t('instrumentSim.chords.handApply') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.chord-hand-dialog__hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #7a6a88;
}

.chord-hand-dialog__stage {
  position: relative;
  width: 100%;
  max-height: min(72vh, 720px);
  margin: 0 auto;
  aspect-ratio: 400 / 1000;
}

.chord-hand-dialog__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.chord-hand-dialog__finger {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: auto;
}
</style>

<style>
.chord-hand-dialog-overlay {
  background-color: rgba(40, 24, 48, 0.18);
}

.chord-hand-dialog-overlay .el-overlay-dialog {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 3vh 2.5vw 24px 0;
}

.chord-hand-dialog-overlay .chord-hand-dialog.el-dialog {
  margin: 0 !important;
}
</style>
