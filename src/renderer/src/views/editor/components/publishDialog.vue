<script setup lang="ts">
import { ref, reactive, onMounted, watch, PropType } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditorInfo, EditorNode } from '@renderer/types'
import { editor } from 'monaco-editor'
import EditorLayoutInfo = editor.EditorLayoutInfo

// 组件对外暴露 v-model:visible
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  editorNodeList: {
    type: Object as PropType<EditorNode[]>,
    required: true
  },
  gameData: {
    type: String,
    required: true
  },
  editorInfo: {
    type: Object as PropType<EditorInfo>,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

// ----------------------
// 数据
// ----------------------

const form = reactive({
  name: ''
})
// ----------------------
// 新增 Game
// ----------------------
async function publishGame() {
  if (!form.name.trim()) return ElMessage.warning('请输入游戏名称')

  const payload = {
    name: form.name,
    data: JSON.stringify({
      editorNodeList: props.editorNodeList,
      gameData: props.gameData,
      editorInfo: props.editorInfo
    })
  }
  await window.api.game.create(payload)

  ElMessage.success('游戏发布成功')

  // 清空表单
  form.name = ''
  visible.value = false

  // 重新加载
}
</script>

<template>
  <!-- 发布游戏弹窗 -->
  <el-dialog v-model="visible" title="创建新游戏" width="400px">
    <el-form label-width="80px" :model="form">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="输入作品名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="publishGame">创建</el-button>
    </template>
  </el-dialog>
</template>
