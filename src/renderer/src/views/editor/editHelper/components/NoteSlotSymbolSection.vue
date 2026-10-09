<script lang="ts" setup>
import type {MusicScore, SlotData} from '@deciphony/renderer'
import {DoubleSlotAffiliatedSymbolNameEnum} from '@deciphony/renderer'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {
  listArpeggiosOnSlot,
  listPedalsStartingAt,
  listPitchesStartingAt,
  listPreludeBracketLeftOnSlot,
  listPreludeBracketRightOnSlot,
  listStrummingsOnSlot,
  removeScoreAffiliatedSymbol,
  resolveSelectedSlotId,
  SLOT_SYMBOL_SPAN_OPTIONS,
  tryAddArpeggioFromNote,
  tryAddPedalFromNote,
  tryAddPitchFromNote,
  tryAddPreludeBracketLeftFromNote,
  tryAddPreludeBracketRightFromNote,
  tryAddStrummingFromNote,
  warnNotEnoughSpanNotes,
  type PitchDirection,
  type SlotSymbolSpan,
} from '../renderEditSlotSymbolAdd'

const props = withDefaults(
  defineProps<{
    editSlot: SlotData
    /** TAB：琶音 + 扫弦 */
    showStrumming?: boolean
    /** 五线 / 简谱：踏板 + 八度记号 */
    showPedalPitch?: boolean
  }>(),
  {
    showStrumming: false,
    showPedalPitch: false,
  },
)

const {t} = useI18n()

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)
const slotId = computed(() => resolveSelectedSlotId(props.editSlot) ?? '')

const arpeggios = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value) return []
  return listArpeggiosOnSlot(musicScore.value, slotId.value)
})

const strummings = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value || !props.showStrumming) return []
  return listStrummingsOnSlot(musicScore.value, slotId.value)
})

const preludeBracketLeft = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value) return []
  return listPreludeBracketLeftOnSlot(musicScore.value, slotId.value)
})

const preludeBracketRight = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value) return []
  return listPreludeBracketRightOnSlot(musicScore.value, slotId.value)
})

const pedals = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value || !props.showPedalPitch) return []
  return listPedalsStartingAt(musicScore.value, slotId.value)
})

const pitches = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  if (!slotId.value || !props.showPedalPitch) return []
  return listPitchesStartingAt(musicScore.value, slotId.value)
})

function onAddArpeggio() {
  tryAddArpeggioFromNote(props.editSlot)
}

function onAddStrumming() {
  tryAddStrummingFromNote(props.editSlot)
}

function onAddPreludeBracketLeft() {
  tryAddPreludeBracketLeftFromNote(props.editSlot)
}

function onAddPreludeBracketRight() {
  tryAddPreludeBracketRightFromNote(props.editSlot)
}

function onAddPedal(span: SlotSymbolSpan) {
  if (!tryAddPedalFromNote(props.editSlot, span)) warnNotEnoughSpanNotes(t)
}

function onAddPitch(span: SlotSymbolSpan, direction: PitchDirection) {
  if (!tryAddPitchFromNote(props.editSlot, span, direction)) warnNotEnoughSpanNotes(t)
}

function onRemove(id: string) {
  removeScoreAffiliatedSymbol(musicScore.value, id)
}

function pitchName(sym: {name: string}) {
  const key =
    sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_down ? 'addPitchDown' : 'addPitchUp'
  return t(`editor.note.${key}`)
}
</script>

<template>
  <section class="slot-symbol-add">
    <div class="slot-symbol-add__label">{{ t('editor.note.slotSymbols') }}</div>

    <div v-if="arpeggios.length" class="slot-symbol-add__items">
      <div v-for="item in arpeggios" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ t('editor.note.arpeggio') }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="showStrumming && strummings.length" class="slot-symbol-add__items">
      <div v-for="item in strummings" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ t('editor.note.strumming') }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="preludeBracketLeft.length" class="slot-symbol-add__items">
      <div v-for="item in preludeBracketLeft" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ t('editor.note.preludeBracketLeft') }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="preludeBracketRight.length" class="slot-symbol-add__items">
      <div v-for="item in preludeBracketRight" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ t('editor.note.preludeBracketRight') }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="showPedalPitch && pedals.length" class="slot-symbol-add__items">
      <div v-for="item in pedals" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ t('editor.note.pedal') }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="showPedalPitch && pitches.length" class="slot-symbol-add__items">
      <div v-for="item in pitches" :key="item.id" class="slot-symbol-add__item">
        <span class="slot-symbol-add__name">{{ pitchName(item) }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div class="slot-symbol-add__row">
      <el-button
        size="small"
        :disabled="arpeggios.length > 0"
        @click="onAddArpeggio"
      >
        {{ t('editor.note.addArpeggio') }}
      </el-button>
      <el-button
        v-if="showStrumming"
        size="small"
        :disabled="strummings.length > 0"
        @click="onAddStrumming"
      >
        {{ t('editor.note.addStrumming') }}
      </el-button>
      <el-button
        size="small"
        :disabled="preludeBracketLeft.length > 0"
        @click="onAddPreludeBracketLeft"
      >
        {{ t('editor.note.addPreludeBracketLeft') }}
      </el-button>
      <el-button
        size="small"
        :disabled="preludeBracketRight.length > 0"
        @click="onAddPreludeBracketRight"
      >
        {{ t('editor.note.addPreludeBracketRight') }}
      </el-button>
    </div>

    <template v-if="showPedalPitch">
      <div class="slot-symbol-add__group">
        <span class="slot-symbol-add__sub">{{ t('editor.note.addPedal') }}</span>
        <div class="slot-symbol-add__row">
          <el-button
            v-for="span in SLOT_SYMBOL_SPAN_OPTIONS"
            :key="`pedal-${span}`"
            size="small"
            @click="onAddPedal(span)"
          >
            {{ span }}
          </el-button>
        </div>
      </div>
      <div class="slot-symbol-add__group">
        <span class="slot-symbol-add__sub">{{ t('editor.note.addPitchUp') }}</span>
        <div class="slot-symbol-add__row">
          <el-button
            v-for="span in SLOT_SYMBOL_SPAN_OPTIONS"
            :key="`pitch-up-${span}`"
            size="small"
            @click="onAddPitch(span, 'up')"
          >
            {{ span }}
          </el-button>
        </div>
      </div>
      <div class="slot-symbol-add__group">
        <span class="slot-symbol-add__sub">{{ t('editor.note.addPitchDown') }}</span>
        <div class="slot-symbol-add__row">
          <el-button
            v-for="span in SLOT_SYMBOL_SPAN_OPTIONS"
            :key="`pitch-down-${span}`"
            size="small"
            @click="onAddPitch(span, 'down')"
          >
            {{ span }}
          </el-button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.slot-symbol-add {
  margin-bottom: 14px;
}

.slot-symbol-add__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.slot-symbol-add__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.slot-symbol-add__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.slot-symbol-add__name {
  font-size: 13px;
  color: #606266;
}

.slot-symbol-add__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slot-symbol-add__group {
  margin-top: 10px;
}

.slot-symbol-add__sub {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #909399;
}
</style>
