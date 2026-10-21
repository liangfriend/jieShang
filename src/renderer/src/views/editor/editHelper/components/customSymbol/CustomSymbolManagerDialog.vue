<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCustomSymbolStore } from '@renderer/store/customSymbol.store'
import type {
  CustomSymbolData,
  CustomSymbolKind,
  CustomSymbolRecord
} from '@renderer/types/customSymbol'
import CustomSymbolEditDialog from './CustomSymbolEditDialog.vue'
import CustomSymbolGlyph from './CustomSymbolGlyph.vue'

const CUSTOM_SYMBOL_KINDS: CustomSymbolKind[] = ['note', 'measure', 'slot']

type ExportPayload = {
  version?: number
  symbols?: Array<{ name?: unknown; kind?: unknown; data?: unknown }>
}

function isCustomSymbolKind(value: unknown): value is CustomSymbolKind {
  return typeof value === 'string' && (CUSTOM_SYMBOL_KINDS as string[]).includes(value)
}

function parseImportPayload(raw: string): Array<{ name: string; kind: CustomSymbolKind; data: CustomSymbolData }> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('invalid-json')
  }
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as ExportPayload)?.symbols)
      ? (parsed as ExportPayload).symbols!
      : null
  if (!list?.length) throw new Error('empty')

  const items: Array<{ name: string; kind: CustomSymbolKind; data: CustomSymbolData }> = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const name = typeof item.name === 'string' ? item.name.trim() : ''
    const kind = item.kind
    const data = item.data as CustomSymbolData | undefined
    if (!name || !isCustomSymbolKind(kind) || !data || typeof data.content !== 'string') continue
    if (!(Number(data.w) > 0) || !(Number(data.h) > 0)) continue
    items.push({ name, kind, data })
  }
  if (!items.length) throw new Error('empty')
  return items
}

const props = defineProps<{
  /** 打开时默认显示的种类 */
  kind: CustomSymbolKind
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  updated: [record: CustomSymbolRecord]
}>()

const { t } = useI18n()
const store = useCustomSymbolStore()

const activeKind = ref<CustomSymbolKind>(props.kind)
const editVisible = ref(false)
const editing = ref<CustomSymbolRecord | null>(null)

/** slot 符号暂未开放，库里有时才显示该页 */
const kinds = computed<CustomSymbolKind[]>(() =>
  store.listByKind('slot').length ? ['note', 'measure', 'slot'] : ['note', 'measure']
)
const list = computed(() => store.listByKind(activeKind.value))

watch(visible, (open) => {
  if (!open) return
  activeKind.value = props.kind
  void store.ensureLoaded().catch((err) => ElMessage.error(err instanceof Error ? err.message : String(err)))
})

function onEdit(record: CustomSymbolRecord) {
  editing.value = record
  editVisible.value = true
}

function onSaved(record: CustomSymbolRecord) {
  emit('updated', record)
}

async function onDelete(record: CustomSymbolRecord) {
  try {
    await ElMessageBox.confirm(
      t('editor.customSymbol.deleteConfirm', { name: record.name }),
      t('common.delete'),
      { type: 'warning', confirmButtonText: t('common.delete'), cancelButtonText: t('common.cancel') }
    )
  } catch {
    return
  }
  try {
    await store.remove(record.id)
    ElMessage.success(t('editor.customSymbol.deleted'))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  }
}

/** 导出当前符号库为 JSON（含全部种类；不含数据库 id，方便换机导入） */
async function onExport() {
  try {
    await store.ensureLoaded()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
    return
  }
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    symbols: store.symbols.map((item) => ({
      name: item.name,
      kind: item.kind,
      data: item.data
    }))
  }
  try {
    const res = await window.api.file.exportJson(
      JSON.stringify(payload, null, 2),
      'custom-symbols',
      t('editor.customSymbol.exportTitle')
    )
    if (res?.canceled) return
    ElMessage.success(t('editor.customSymbol.exported'))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  }
}

/** 从 JSON 导入符号，逐条新建进符号库（不覆盖已有） */
async function onImport() {
  try {
    const res = await window.api.file.importJson(t('editor.customSymbol.importTitle'))
    if (res?.canceled || !res.content) return
    let items: Array<{ name: string; kind: CustomSymbolKind; data: CustomSymbolData }>
    try {
      items = parseImportPayload(res.content)
    } catch {
      ElMessage.error(t('editor.customSymbol.importInvalid'))
      return
    }
    let created = 0
    for (const item of items) {
      await store.create(item.name, item.kind, item.data)
      created += 1
    }
    ElMessage.success(t('editor.customSymbol.imported', { count: created }))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.customSymbol.managerTitle')"
    width="520px"
    append-to-body
    class="custom-symbol-manager"
  >
    <div class="custom-symbol-manager__toolbar">
      <el-radio-group v-model="activeKind" size="small" class="custom-symbol-manager__tabs">
        <el-radio-button v-for="k in kinds" :key="k" :value="k">
          {{ t(`editor.customSymbol.kind.${k}`) }}
        </el-radio-button>
      </el-radio-group>
      <div class="custom-symbol-manager__actions">
        <el-button size="small" @click="onImport">
          {{ t('editor.customSymbol.import') }}
        </el-button>
        <el-button size="small" :disabled="!store.symbols.length" @click="onExport">
          {{ t('editor.customSymbol.export') }}
        </el-button>
      </div>
    </div>

    <el-scrollbar max-height="420px">
      <ul v-if="list.length" class="custom-symbol-manager__list">
        <li v-for="item in list" :key="item.id" class="custom-symbol-manager__item">
          <span class="custom-symbol-manager__glyph">
            <CustomSymbolGlyph :content="item.data.content" :w="item.data.w" :h="item.data.h" :size="32" />
          </span>
          <div class="custom-symbol-manager__meta">
            <span class="custom-symbol-manager__name">{{ item.name }}</span>
            <span class="custom-symbol-manager__size">{{ item.data.w }} × {{ item.data.h }}</span>
          </div>
          <el-button size="small" @click="onEdit(item)">{{ t('editor.customSymbol.edit') }}</el-button>
          <el-button size="small" type="danger" plain @click="onDelete(item)">
            {{ t('common.delete') }}
          </el-button>
        </li>
      </ul>
      <p v-else class="custom-symbol-manager__empty">{{ t('editor.customSymbol.emptyList') }}</p>
    </el-scrollbar>
    <p class="custom-symbol-manager__hint">{{ t('editor.customSymbol.managerHint') }}</p>

    <CustomSymbolEditDialog
      v-model="editVisible"
      :kind="editing?.kind ?? activeKind"
      :record="editing"
      @saved="onSaved"
    />
  </el-dialog>
</template>

<style scoped>
.custom-symbol-manager__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.custom-symbol-manager__tabs {
  margin-bottom: 0;
}

.custom-symbol-manager__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-symbol-manager__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.custom-symbol-manager__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #ebe6f3;
  border-radius: 10px;
}

.custom-symbol-manager__item :deep(.el-button + .el-button) {
  margin-left: 0;
}

.custom-symbol-manager__glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  background: #fbf9fe;
  border-radius: 8px;
}

.custom-symbol-manager__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.custom-symbol-manager__name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-symbol-manager__size {
  font-size: 11px;
  color: #a39ab0;
}

.custom-symbol-manager__empty {
  padding: 24px 0;
  margin: 0;
  font-size: 13px;
  color: #a39ab0;
  text-align: center;
}

.custom-symbol-manager__hint {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: #a39ab0;
}
</style>
