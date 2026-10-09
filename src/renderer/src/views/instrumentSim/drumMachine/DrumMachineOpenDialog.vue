<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { DrumMachineListItem } from '@renderer/types/drumMachine'
import { deleteDrumMachine, listDrumMachines } from '@renderer/utils/fileHelper/drumMachineFile'
import { toBcp47 } from '@renderer/i18n/locale'

const props = defineProps<{ modelValue: boolean; currentId: number | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open', id: number): void
  (e: 'deleted', id: number): void
}>()

const { t, locale } = useI18n()

const keyword = ref('')
const loading = ref(false)
const list = ref<DrumMachineListItem[]>([])

async function reload() {
  loading.value = true
  try {
    list.value = await listDrumMachines(keyword.value)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) void reload()
  }
)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(keyword, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void reload(), 250)
})

function formatTime(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString(toBcp47(locale.value))
}

function onOpen(row: DrumMachineListItem) {
  emit('open', row.id)
  emit('update:modelValue', false)
}

async function onDelete(row: DrumMachineListItem) {
  try {
    await ElMessageBox.confirm(
      t('instrumentSim.drumMachine.deleteConfirm', { name: row.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await deleteDrumMachine(row.id)
    ElMessage.success(t('instrumentSim.drumMachine.deleted'))
    emit('deleted', row.id)
    await reload()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('instrumentSim.drumMachine.openTitle')"
    width="560px"
    append-to-body
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-input
      v-model="keyword"
      :prefix-icon="Search"
      clearable
      :placeholder="t('instrumentSim.drumMachine.searchPlaceholder')"
    />
    <el-table
      v-loading="loading"
      :data="list"
      height="360"
      class="dm-open__table"
      :empty-text="t('instrumentSim.drumMachine.empty')"
      @row-dblclick="onOpen"
    >
      <el-table-column :label="t('instrumentSim.drumMachine.columnName')" min-width="200">
        <template #default="{ row }">
          <span class="dm-open__name">{{ row.name }}</span>
          <el-tag v-if="row.id === currentId" size="small" class="dm-open__tag">
            {{ t('instrumentSim.drumMachine.current') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('instrumentSim.drumMachine.updatedAt')" width="170">
        <template #default="{ row }">{{ formatTime(row.updated_at) }}</template>
      </el-table-column>
      <el-table-column width="130" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="onOpen(row)">
            {{ t('instrumentSim.drumMachine.open') }}
          </el-button>
          <el-button link type="danger" @click="onDelete(row)">
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<style scoped>
.dm-open__table {
  margin-top: 12px;
}

.dm-open__name {
  font-weight: 600;
}

.dm-open__tag {
  margin-left: 8px;
}
</style>
