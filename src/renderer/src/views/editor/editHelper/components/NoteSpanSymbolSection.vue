<script lang="ts" setup>
import type { MusicScore, SlotData } from '@deciphony/renderer'
import { DoubleSlotAffiliatedSymbolNameEnum, HairpinTypeEnum } from '@deciphony/renderer'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  listArpeggiosOnSlot,
  listLinesStartingAt,
  listPedalsStartingAt,
  listPitchesStartingAt,
  listPreludeBracketLeftOnSlot,
  listPreludeBracketRightOnSlot,
  removeScoreAffiliatedSymbol,
  resolveSelectedSlotId,
  SLOT_SYMBOL_SPAN_OPTIONS,
  tryAddArpeggioFromNote,
  tryAddHairpinFromNote,
  tryAddPedalFromNote,
  tryAddPitchFromNote,
  tryAddPreludeBracketLeftFromNote,
  tryAddPreludeBracketRightFromNote,
  tryAddTrillFromNote,
  warnNotEnoughSpanNotes,
  type SlotSymbolSpan
} from '../renderEditSlotSymbolAdd'
import {
  DEFAULT_SLUR_THICKNESS,
  getSlurThickness,
  listSlursStartingAtNotesInfo,
  setSlurThickness,
  SLUR_THICKNESS_MAX,
  SLUR_THICKNESS_MIN
} from '../renderEditSlurProperties'
import { slurColumnOptions } from '../renderEditSlurEndpoints'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'
import PanelSegmented from './panel/PanelSegmented.vue'
import { usePanelState } from './panel/usePanelTab'

const props = defineProps<{
  editSlot: SlotData
  /** 连音线起点（NotesInfo / NotesNumberInfo id） */
  notesInfoId: string
  /** 按跨度求默认终点 id；提供后终点列有多个音时可改选其中一个 */
  findSlurEnd?: (span: 2 | 3 | 4) => string | null
}>()

const emit = defineEmits<{
  'add-slur': [span: 2 | 3 | 4, endInfoId: string | null]
}>()

const { t } = useI18n()

const span = usePanelState<SlotSymbolSpan>('noteSpanSymbol:span', 2)

const spanOptions = computed(() =>
  SLOT_SYMBOL_SPAN_OPTIONS.map((value) => ({
    value,
    label: t('editor.spanSymbol.spanValue', { n: value })
  }))
)

const musicScore = computed(() => props.editSlot.musicScore as MusicScore)
const slotId = computed(() => resolveSelectedSlotId(props.editSlot) ?? '')

const defaultSlurEndId = computed(() =>
  span.value >= 2 ? props.findSlurEnd?.(span.value as 2 | 3 | 4) ?? null : null
)
const slurEndOptions = computed(() =>
  defaultSlurEndId.value ? slurColumnOptions(musicScore.value, defaultSlurEndId.value, t) : []
)
const slurEndId = ref<string | null>(null)
watch(defaultSlurEndId, (id) => (slurEndId.value = id), { immediate: true })

type SpanItem = {
  id: string
  label: string
  slurId?: string
}

const slurs = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  return listSlursStartingAtNotesInfo(musicScore.value, props.notesInfoId)
})

const arpeggios = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  return slotId.value ? listArpeggiosOnSlot(musicScore.value, slotId.value) : []
})

const preludeBracketLeft = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  return slotId.value ? listPreludeBracketLeftOnSlot(musicScore.value, slotId.value) : []
})

const preludeBracketRight = computed(() => {
  void musicScore.value.affiliatedSymbols.length
  return slotId.value ? listPreludeBracketRightOnSlot(musicScore.value, slotId.value) : []
})

const items = computed<SpanItem[]>(() => {
  void musicScore.value.affiliatedSymbols.length
  const id = slotId.value
  const list: SpanItem[] = slurs.value.map((sym) => ({
    id: sym.id,
    label: t('editor.note.slur'),
    slurId: sym.id
  }))
  if (!id) return list
  for (const sym of listPedalsStartingAt(musicScore.value, id)) {
    list.push({ id: sym.id, label: t('editor.note.pedal') })
  }
  for (const sym of listPitchesStartingAt(musicScore.value, id)) {
    const down = sym.name === DoubleSlotAffiliatedSymbolNameEnum.Pitch_down
    list.push({ id: sym.id, label: t(down ? 'editor.spanSymbol.pitchDown' : 'editor.spanSymbol.pitchUp') })
  }
  for (const sym of listLinesStartingAt(musicScore.value, id)) {
    if (sym.name === DoubleSlotAffiliatedSymbolNameEnum.Trill_line) {
      list.push({ id: sym.id, label: t('editor.spanSymbol.trill') })
    } else {
      const type = sym.data?.hairpin?.type ?? HairpinTypeEnum.Crescendo_hairpin
      list.push({ id: sym.id, label: t(`editor.line.hairpinType.${type}`) })
    }
  }
  return list
})

type AddAction = {
  key: string
  label: string
  disabled?: boolean
  run: () => void
}

function addSpanning(added: boolean) {
  if (!added) warnNotEnoughSpanNotes(t)
}

const addActions = computed<AddAction[]>(() => [
  {
    key: 'slur',
    label: t('editor.note.slur'),
    disabled: span.value < 2,
    run: () => emit('add-slur', span.value as 2 | 3 | 4, slurEndId.value)
  },
  {
    key: 'pedal',
    label: t('editor.note.pedal'),
    run: () => addSpanning(tryAddPedalFromNote(props.editSlot, span.value))
  },
  {
    key: 'pitchUp',
    label: t('editor.spanSymbol.pitchUp'),
    run: () => addSpanning(tryAddPitchFromNote(props.editSlot, span.value, 'up'))
  },
  {
    key: 'pitchDown',
    label: t('editor.spanSymbol.pitchDown'),
    run: () => addSpanning(tryAddPitchFromNote(props.editSlot, span.value, 'down'))
  },
  {
    key: 'trill',
    label: t('editor.spanSymbol.trill'),
    run: () => addSpanning(tryAddTrillFromNote(props.editSlot, span.value))
  },
  {
    key: 'cresc',
    label: t('editor.spanSymbol.crescendo'),
    run: () =>
      addSpanning(
        tryAddHairpinFromNote(props.editSlot, span.value, HairpinTypeEnum.Crescendo_hairpin)
      )
  },
  {
    key: 'dim',
    label: t('editor.spanSymbol.diminuendo'),
    run: () =>
      addSpanning(
        tryAddHairpinFromNote(props.editSlot, span.value, HairpinTypeEnum.Diminuendo_hairpin)
      )
  }
])

function slurById(id: string) {
  return slurs.value.find((sym) => sym.id === id)
}

function onThicknessChange(id: string, value: number | undefined) {
  const slur = slurById(id)
  if (slur) setSlurThickness(slur, value ?? DEFAULT_SLUR_THICKNESS)
}

function onRemove(id: string) {
  removeScoreAffiliatedSymbol(musicScore.value, id)
}
</script>

<template>
  <div class="span-symbols">
    <PanelGroup :title="t('editor.note.slotSymbols')">
      <div v-for="item in arpeggios" :key="item.id" class="span-symbols__item">
        <span class="span-symbols__name">{{ t('editor.note.arpeggio') }}</span>
        <el-button size="small" type="danger" text @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
      <div v-for="item in preludeBracketLeft" :key="item.id" class="span-symbols__item">
        <span class="span-symbols__name">{{ t('editor.note.preludeBracketLeft') }}</span>
        <el-button size="small" type="danger" text @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
      <div v-for="item in preludeBracketRight" :key="item.id" class="span-symbols__item">
        <span class="span-symbols__name">{{ t('editor.note.preludeBracketRight') }}</span>
        <el-button size="small" type="danger" text @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
      <div class="span-symbols__actions">
        <el-button
          v-if="!arpeggios.length"
          size="small"
          @click="tryAddArpeggioFromNote(editSlot)"
        >
          {{ t('editor.note.addArpeggio') }}
        </el-button>
        <el-button
          v-if="!preludeBracketLeft.length"
          size="small"
          @click="tryAddPreludeBracketLeftFromNote(editSlot)"
        >
          {{ t('editor.note.addPreludeBracketLeft') }}
        </el-button>
        <el-button
          v-if="!preludeBracketRight.length"
          size="small"
          @click="tryAddPreludeBracketRightFromNote(editSlot)"
        >
          {{ t('editor.note.addPreludeBracketRight') }}
        </el-button>
      </div>
      <p class="span-symbols__hint">{{ t('editor.spanSymbol.slotSymbolHint') }}</p>
    </PanelGroup>

    <PanelGroup :title="t('editor.spanSymbol.add')">
      <div class="span-symbols__span">
        <span class="span-symbols__span-label">{{ t('editor.spanSymbol.span') }}</span>
        <PanelSegmented v-model="span" :options="spanOptions" />
      </div>
      <PanelField v-if="slurEndOptions.length > 1" :label="t('editor.spanSymbol.slurEnd')">
        <PanelSegmented v-model="slurEndId" :options="slurEndOptions" />
      </PanelField>
      <div class="span-symbols__actions">
        <el-button
          v-for="action in addActions"
          :key="action.key"
          size="small"
          :disabled="action.disabled"
          @click="action.run"
        >
          {{ action.label }}
        </el-button>
      </div>
      <p class="span-symbols__hint">{{ t('editor.spanSymbol.spanHint') }}</p>
    </PanelGroup>

    <PanelGroup :title="t('editor.spanSymbol.existing')">
      <div v-if="items.length" class="span-symbols__list">
        <div v-for="item in items" :key="item.id" class="span-symbols__item">
          <span class="span-symbols__name">{{ item.label }}</span>
          <el-input-number
            v-if="item.slurId && slurById(item.slurId)"
            class="span-symbols__thickness"
            :model-value="getSlurThickness(slurById(item.slurId)!)"
            :min="SLUR_THICKNESS_MIN"
            :max="SLUR_THICKNESS_MAX"
            :step="1"
            size="small"
            controls-position="right"
            :title="t('editor.slur.thickness')"
            @update:model-value="onThicknessChange(item.slurId, $event)"
          />
          <el-button size="small" type="danger" text @click="onRemove(item.id)">
            {{ t('common.delete') }}
          </el-button>
        </div>
      </div>
      <p v-else class="span-symbols__empty">{{ t('editor.spanSymbol.empty') }}</p>
    </PanelGroup>
  </div>
</template>

<style scoped>
.span-symbols__span {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.span-symbols__span-label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.span-symbols__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.span-symbols__actions :deep(.el-button),
.span-symbols__single {
  margin: 0;
  width: 100%;
}

.span-symbols__hint,
.span-symbols__empty {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}

.span-symbols__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.span-symbols__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.span-symbols__name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13px;
  color: #606266;
}

.span-symbols__thickness {
  flex: 0 0 84px;
  width: 84px;
}

.span-symbols__item :deep(.el-button) {
  margin-left: 0;
}
</style>
