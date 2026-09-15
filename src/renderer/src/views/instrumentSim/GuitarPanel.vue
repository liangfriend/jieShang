<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
import { Finger } from '@deciphony/finger'
import type { tabChord } from '@deciphony/renderer'
import guitarBodyUrl from '@renderer/assets/virtualInstruments/guitar-body.svg'
import guitarStringsUrl from '@renderer/assets/virtualInstruments/guitar-strings.svg'
import {
  GUITAR_VIEW,
  stringNumberToFretIndex,
  stringXAtY,
  tabChordToFrets
} from '@renderer/constant/guitar'
import {
  GUITAR_FINGER_CANVAS,
  buildChordHandPose,
  buildPickHandPose,
  buildRestFretHandPose,
  buildRestPickHandPose
} from '@renderer/utils/guitarFingerPose'

const props = defineProps<{
  chord: tabChord | null
  activeString: number | null
}>()

const emit = defineEmits<{
  pick: [stringNumber: number]
}>()

const frets = computed(() =>
  props.chord ? tabChordToFrets(props.chord) : [-1, -1, -1, -1, -1, -1]
)

const fretHand = reactive(buildRestFretHandPose())
const pickHand = reactive(buildRestPickHandPose())

function assignPose(
  target: ReturnType<typeof buildRestFretHandPose>,
  next: ReturnType<typeof buildRestFretHandPose>
) {
  target.thumbF = [...next.thumbF]
  target.indexF = [...next.indexF]
  target.middleF = [...next.middleF]
  target.ringF = [...next.ringF]
  target.littleF = [...next.littleF]
}

watch(
  () => props.chord,
  (chord) => assignPose(fretHand, buildChordHandPose(chord)),
  { immediate: true, deep: true }
)

watch(
  () => props.activeString,
  (n) => assignPose(pickHand, buildPickHandPose(n)),
  { immediate: true }
)

const muteMarks = computed(() => {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets.value.forEach((fret, fretIndex) => {
    if (fret !== -1) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
})

const openMarks = computed(() => {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets.value.forEach((fret, fretIndex) => {
    if (fret !== 0) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
})

function hitString(stringNumber: number) {
  emit('pick', stringNumber)
}

function stringHitPath(stringNumber: number): string {
  const i = stringNumberToFretIndex(stringNumber)
  const x0 = GUITAR_VIEW.nutXs[i]!
  const x1 = GUITAR_VIEW.bridgeXs[i]!
  return `M ${x0} ${GUITAR_VIEW.nutY} L ${x1} ${GUITAR_VIEW.nutY + GUITAR_VIEW.scaleLength}`
}
</script>

<template>
  <div class="guitar-panel">
    <div class="guitar-panel__stage">
      <svg
        class="guitar-panel__svg"
        :viewBox="`0 0 ${GUITAR_VIEW.width} ${GUITAR_VIEW.height}`"
        role="img"
        aria-label="guitar"
      >
        <image :href="guitarBodyUrl" x="0" y="0" width="400" height="1000" />
        <image :href="guitarStringsUrl" x="0" y="0" width="400" height="1000" />

        <path
          v-for="n in 6"
          :key="`hit-${n}`"
          class="guitar-panel__hit"
          :class="{ 'guitar-panel__hit--active': activeString === n }"
          :d="stringHitPath(n)"
          @click="hitString(n)"
        />

        <g v-for="m in openMarks" :key="`open-${m.stringNumber}`">
          <circle :cx="m.x" :cy="m.y" r="5" fill="none" stroke="#2ecc71" stroke-width="2" />
        </g>
        <g v-for="m in muteMarks" :key="`mute-${m.stringNumber}`">
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

        <g v-for="n in 6" :key="`label-${n}`">
          <text
            :x="stringXAtY(stringNumberToFretIndex(n), GUITAR_VIEW.pickY) + (n <= 3 ? -14 : 14)"
            :y="GUITAR_VIEW.pickY + 4"
            text-anchor="middle"
            fill="#5c4a6a"
            font-size="12"
            font-weight="700"
            opacity="0.75"
          >
            {{ n }}
          </text>
        </g>
      </svg>

      <!-- 左侧按弦手 / 右侧拨弦手：与吉他等大叠层 -->
      <Finger
        class="guitar-panel__finger"
        :width="GUITAR_FINGER_CANVAS.width"
        :height="GUITAR_FINGER_CANVAS.height"
        :thumb-f="fretHand.thumbF"
        :index-f="fretHand.indexF"
        :middle-f="fretHand.middleF"
        :ring-f="fretHand.ringF"
        :little-f="fretHand.littleF"
        :duration="GUITAR_FINGER_CANVAS.duration"
        :finger-size="GUITAR_FINGER_CANVAS.fingerSize"
      />
      <Finger
        class="guitar-panel__finger"
        :width="GUITAR_FINGER_CANVAS.width"
        :height="GUITAR_FINGER_CANVAS.height"
        :thumb-f="pickHand.thumbF"
        :index-f="pickHand.indexF"
        :middle-f="pickHand.middleF"
        :ring-f="pickHand.ringF"
        :little-f="pickHand.littleF"
        :duration="GUITAR_FINGER_CANVAS.duration"
        :finger-size="GUITAR_FINGER_CANVAS.fingerSize"
      />
    </div>
  </div>
</template>

<style scoped>
.guitar-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guitar-panel__stage {
  position: relative;
  height: 100%;
  width: auto;
  max-width: 100%;
  aspect-ratio: 400 / 1000;
}

.guitar-panel__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.guitar-panel__finger {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
}

.guitar-panel__hit {
  fill: none;
  stroke: transparent;
  stroke-width: 14;
  pointer-events: stroke;
  cursor: pointer;
}

.guitar-panel__hit--active {
  stroke: rgba(61, 139, 253, 0.35);
}
</style>
