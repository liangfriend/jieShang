<script lang="ts" setup>
import type {SlotData} from '@deciphony/renderer'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {isTabNotationType} from '@renderer/utils/isTabNotation'
import {MusicScoreTypeEnum} from '@deciphony/renderer'
import {
  listGraceNotes,
  removeGraceById,
  tryAddNumberGrace,
  tryAddStaffGrace,
  tryAddTabGrace,
  type GracePlacement,
} from '../renderEditGraceNotes'

const props = defineProps<{
  editSlot: SlotData
  /** 外层分组已有标题 */
  bare?: boolean
}>()

const {t} = useI18n()

const note = computed(() => props.editSlot.note)

const beforeList = computed(() => listGraceNotes(note.value as never, 'before'))
const afterList = computed(() => listGraceNotes(note.value as never, 'after'))

function add(placement: GracePlacement) {
  const score = props.editSlot.musicScore
  if (isTabNotationType(score.type)) {
    tryAddTabGrace(props.editSlot, placement)
    return
  }
  if (score.type === MusicScoreTypeEnum.NumberNotation) {
    tryAddNumberGrace(props.editSlot, placement)
    return
  }
  tryAddStaffGrace(props.editSlot, placement)
}

function onRemove(id: string) {
  if (!note.value) return
  removeGraceById(note.value as never, id)
}
</script>

<template>
  <section class="note-grace" :class="{ 'note-grace--bare': bare }">
    <div v-if="!bare" class="note-grace__label">{{ t('editor.note.grace') }}</div>

    <div v-if="beforeList.length" class="note-grace__items">
      <div v-for="(item, i) in beforeList" :key="item.id" class="note-grace__item">
        <span class="note-grace__name">{{ t('editor.note.graceBeforeItem', {n: i + 1}) }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="afterList.length" class="note-grace__items">
      <div v-for="(item, i) in afterList" :key="item.id" class="note-grace__item">
        <span class="note-grace__name">{{ t('editor.note.graceAfterItem', {n: i + 1}) }}</span>
        <el-button size="small" type="danger" plain @click="onRemove(item.id)">
          {{ t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div class="note-grace__row">
      <el-button size="small" @click="add('before')">
        {{ t('editor.note.addGraceBefore') }}
      </el-button>
      <el-button size="small" @click="add('after')">
        {{ t('editor.note.addGraceAfter') }}
      </el-button>
    </div>
  </section>
</template>

<style scoped>
.note-grace {
  margin-bottom: 14px;
}

.note-grace--bare {
  margin-bottom: 0;
}

.note-grace__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.note-grace__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.note-grace__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.note-grace__name {
  font-size: 13px;
  color: #606266;
}

.note-grace__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.note-grace__row :deep(.el-button) {
  margin: 0;
  width: 100%;
}
</style>
