<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'WorkSaveDialog' })

const props = defineProps<{
  modelValue: boolean
  name: string
  author: string
  /** 已有作品：点保存直接确认，仍可改名 */
  existing?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: { name: string; author: string }]
}>()

const { t } = useI18n()
const draftName = ref('')
const draftAuthor = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    draftName.value = props.name
    draftAuthor.value = props.author
  }
)

function onConfirm() {
  const name = draftName.value.trim()
  if (!name) return
  emit('confirm', { name, author: draftAuthor.value.trim() })
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('work.saveDialog.title')"
    width="400px"
    class="cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <label class="field">
      <span>{{ t('work.saveDialog.name') }}</span>
      <el-input v-model="draftName" :placeholder="t('work.saveDialog.namePlaceholder')" />
    </label>
    <label class="field">
      <span>{{ t('work.saveDialog.author') }}</span>
      <el-input v-model="draftAuthor" :placeholder="t('work.saveDialog.authorPlaceholder')" />
    </label>
    <template #footer>
      <div class="footer">
        <button type="button" class="ghost-btn" @click="visible = false">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="primary-btn" :disabled="!draftName.trim()" @click="onConfirm">
          {{ t('work.saveDialog.confirm') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ghost-btn,
.primary-btn {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn {
  border: 1px solid rgba(201, 184, 255, 0.65);
  background: rgba(255, 255, 255, 0.85);
  color: #6a5a88;
}

.primary-btn {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
