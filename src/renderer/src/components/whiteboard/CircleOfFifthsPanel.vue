<script setup lang="ts">
import { KeySignatureTypeEnum } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FloatingPanel from '../FloatingPanel.vue'

const props = defineProps<{
  modelValue: KeySignatureTypeEnum
  /** 首次打开时弹窗出现在它上方 */
  anchor?: HTMLElement | null
}>()

const emit = defineEmits<{
  'update:modelValue': [KeySignatureTypeEnum]
  close: []
}>()

const { t } = useI18n()

type KeyCell = { key: KeySignatureTypeEnum; major: string; minor: string; count: string }

/** 五度圈 12 个位置（C 在正上方，顺时针升号递增）；等音位置 flat 为降号写法 */
const POSITIONS: { sharp: KeyCell; flat?: KeyCell }[] = [
  { sharp: { key: KeySignatureTypeEnum.C, major: 'C', minor: 'Am', count: '0' } },
  { sharp: { key: KeySignatureTypeEnum.G, major: 'G', minor: 'Em', count: '1♯' } },
  { sharp: { key: KeySignatureTypeEnum.D, major: 'D', minor: 'Bm', count: '2♯' } },
  { sharp: { key: KeySignatureTypeEnum.A, major: 'A', minor: 'F♯m', count: '3♯' } },
  { sharp: { key: KeySignatureTypeEnum.E, major: 'E', minor: 'C♯m', count: '4♯' } },
  {
    sharp: { key: KeySignatureTypeEnum.B, major: 'B', minor: 'G♯m', count: '5♯' },
    flat: { key: KeySignatureTypeEnum.C_flat, major: 'C♭', minor: 'A♭m', count: '7♭' }
  },
  {
    sharp: { key: KeySignatureTypeEnum.F_sharp, major: 'F♯', minor: 'D♯m', count: '6♯' },
    flat: { key: KeySignatureTypeEnum.G_flat, major: 'G♭', minor: 'E♭m', count: '6♭' }
  },
  {
    sharp: { key: KeySignatureTypeEnum.C_sharp, major: 'C♯', minor: 'A♯m', count: '7♯' },
    flat: { key: KeySignatureTypeEnum.D_flat, major: 'D♭', minor: 'B♭m', count: '5♭' }
  },
  { sharp: { key: KeySignatureTypeEnum.A_flat, major: 'A♭', minor: 'Fm', count: '4♭' } },
  { sharp: { key: KeySignatureTypeEnum.E_flat, major: 'E♭', minor: 'Cm', count: '3♭' } },
  { sharp: { key: KeySignatureTypeEnum.B_flat, major: 'B♭', minor: 'Gm', count: '2♭' } },
  { sharp: { key: KeySignatureTypeEnum.F, major: 'F', minor: 'Dm', count: '1♭' } }
]

const SIZE = 340
/** 实际显示像素；几何与字号按 SIZE 坐标定义，随 viewBox 等比缩放 */
const DISPLAY_SIZE = 460
const CENTER = SIZE / 2
const R_OUTER = 164
const R_MAJOR_SPLIT = 139
const R_MID = 114
const R_MINOR_SPLIT = 92
const R_INNER = 70

type Region = {
  id: string
  key: KeySignatureTypeEnum
  path: string
  kind: 'major' | 'minor'
  label: string
  /** 大调整格：音名下方再写升降号数 */
  count?: string
  labelX: number
  labelY: number
  countX?: number
  countY?: number
  split: boolean
}

function point(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) }
}

function sectorPath(r0: number, r1: number, a0: number, a1: number) {
  const p1 = point(r1, a0)
  const p2 = point(r1, a1)
  const p3 = point(r0, a1)
  const p4 = point(r0, a0)
  return `M${p1.x} ${p1.y}A${r1} ${r1} 0 0 1 ${p2.x} ${p2.y}L${p3.x} ${p3.y}A${r0} ${r0} 0 0 0 ${p4.x} ${p4.y}Z`
}

function region(
  cell: KeyCell,
  kind: Region['kind'],
  r0: number,
  r1: number,
  angle: number,
  split: boolean
): Region {
  const full = kind === 'major' && !split
  const label = point(full ? r0 + (r1 - r0) * 0.62 : (r0 + r1) / 2, angle)
  const count = full ? point(r0 + (r1 - r0) * 0.24, angle) : undefined
  return {
    id: `${kind}-${cell.key}`,
    key: cell.key,
    path: sectorPath(r0, r1, angle - 15, angle + 15),
    kind,
    label: kind === 'major' ? cell.major : cell.minor,
    count: full ? cell.count : undefined,
    labelX: label.x,
    labelY: label.y,
    countX: count?.x,
    countY: count?.y,
    split
  }
}

const regions: Region[] = POSITIONS.flatMap(({ sharp, flat }, i) => {
  const angle = i * 30
  if (!flat) {
    return [
      region(sharp, 'major', R_MID, R_OUTER, angle, false),
      region(sharp, 'minor', R_INNER, R_MID, angle, false)
    ]
  }
  return [
    region(sharp, 'major', R_MAJOR_SPLIT, R_OUTER, angle, true),
    region(flat, 'major', R_MID, R_MAJOR_SPLIT, angle, true),
    region(sharp, 'minor', R_MINOR_SPLIT, R_MID, angle, true),
    region(flat, 'minor', R_INNER, R_MINOR_SPLIT, angle, true)
  ]
})

const currentCell = computed(() => {
  for (const { sharp, flat } of POSITIONS) {
    if (sharp.key === props.modelValue) return sharp
    if (flat?.key === props.modelValue) return flat
  }
  return POSITIONS[0]!.sharp
})
</script>

<template>
  <FloatingPanel
    :title="t('whiteboard.toolbar.circleOfFifths')"
    position-key="circleOfFifths"
    :anchor="anchor"
    @close="emit('close')"
  >
    <svg class="circle-of-fifths__svg" :viewBox="`0 0 ${SIZE} ${SIZE}`" :width="DISPLAY_SIZE" :height="DISPLAY_SIZE">
      <g
        v-for="item in regions"
        :key="item.id"
        class="circle-of-fifths__region"
        :class="[
          `circle-of-fifths__region--${item.kind}`,
          { 'circle-of-fifths__region--active': item.key === modelValue }
        ]"
        @click="emit('update:modelValue', item.key)"
      >
        <path :d="item.path" />
        <text
          class="circle-of-fifths__label"
          :class="{ 'circle-of-fifths__label--split': item.split }"
          :x="item.labelX"
          :y="item.labelY"
        >
          {{ item.label }}
        </text>
        <text
          v-if="item.count"
          class="circle-of-fifths__count"
          :x="item.countX"
          :y="item.countY"
        >
          {{ item.count }}
        </text>
      </g>
      <circle class="circle-of-fifths__center" :cx="CENTER" :cy="CENTER" :r="R_INNER" />
      <text class="circle-of-fifths__current" :x="CENTER" :y="CENTER - 8">{{ currentCell.major }}</text>
      <text class="circle-of-fifths__current-sub" :x="CENTER" :y="CENTER + 18">
        {{ currentCell.count }} · {{ currentCell.minor }}
      </text>
    </svg>
  </FloatingPanel>
</template>

<style scoped>
/* 中文字体里 ♯ ♭ 是全角字形，音名会被撑开 */
.circle-of-fifths__svg {
  display: block;
  font-family: 'Segoe UI', 'Segoe UI Symbol', Arial, sans-serif;
}

.circle-of-fifths__region {
  cursor: pointer;
}

.circle-of-fifths__region path {
  stroke: rgba(201, 184, 255, 0.85);
  stroke-width: 1;
  transition: fill 0.12s;
}

.circle-of-fifths__region--major path {
  fill: #fff;
}

.circle-of-fifths__region--minor path {
  fill: #f6efff;
}

.circle-of-fifths__region:hover path {
  fill: rgba(201, 184, 255, 0.4);
}

.circle-of-fifths__region--active path,
.circle-of-fifths__region--active:hover path {
  fill: rgba(167, 224, 186, 0.9);
}

.circle-of-fifths__label,
.circle-of-fifths__count,
.circle-of-fifths__current,
.circle-of-fifths__current-sub {
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}

.circle-of-fifths__label {
  fill: #5c4a6a;
  font-weight: 700;
}

.circle-of-fifths__region--major .circle-of-fifths__label {
  font-size: 17px;
}

.circle-of-fifths__region--minor .circle-of-fifths__label {
  font-size: 13px;
  font-weight: 600;
}

.circle-of-fifths__region--major .circle-of-fifths__label--split {
  font-size: 13px;
}

.circle-of-fifths__region--minor .circle-of-fifths__label--split {
  font-size: 11px;
}

.circle-of-fifths__count {
  fill: #9a86ab;
  font-size: 10px;
}

.circle-of-fifths__region--active .circle-of-fifths__label,
.circle-of-fifths__region--active .circle-of-fifths__count {
  fill: #2f6b45;
}

.circle-of-fifths__center {
  fill: rgba(255, 248, 251, 1);
  stroke: rgba(201, 184, 255, 0.85);
}

.circle-of-fifths__current {
  fill: #2f6b45;
  font-size: 30px;
  font-weight: 800;
}

.circle-of-fifths__current-sub {
  fill: #5c4a6a;
  font-size: 12px;
  font-weight: 600;
}
</style>
