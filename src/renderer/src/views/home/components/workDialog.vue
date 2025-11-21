<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

// 组件对外暴露 v-model:visible
const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue', 'created', 'deleted'])

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

// ----------------------
// 数据
// ----------------------
const loading = ref(false)
const workList = ref<any[]>([])

const formVisible = ref(false)
const form = reactive({
  name: ''
})

// ----------------------
// 查询接口
// ----------------------
async function loadWorks() {
  loading.value = true
  try {
    workList.value = (await window.api.work.list()).data
  } finally {
    loading.value = false
  }
}

// ----------------------
// 新增 Work
// ----------------------
async function createWork() {
  if (!form.name.trim()) return ElMessage.warning('请输入作品名称')

  const payload = {
    name: form.name,
    data: JSON.stringify({
      editorNodeList: [],
      gameData: '{}',
      prefabList: [],
      editorInfo: {
        left: -5000,
        top: -5000,
        width: 10000,
        height: 10000,
        scale: 0.4
      }
    })
  }
  await window.api.work.create(payload)
  emit('created')
  ElMessage.success('创建成功')

  // 清空表单
  form.name = ''
  formVisible.value = false

  // 重新加载
  await loadWorks()
}

const router = useRouter()
// 用户点击作品
// ----------------------
function toEditor(work) {
  router.replace({ path: '/editor', query: { workId: work.id } })
  visible.value = false
}

function deleteWork(work) {
  ElMessageBox.confirm('确认删除?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await window.api.work.delete(work.id)
      await loadWorks()
      emit('deleted')
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
    .catch(() => {})
}

watch(visible, (v) => {
  if (v) {
    loadWorks()
  }
})
</script>

<template>
  <el-dialog v-model="visible" title="作品管理" width="600px" destroy-on-close>
    <div style="margin-bottom: 12px; display: flex; justify-content: flex-end">
      <el-button type="primary" @click="formVisible = true"> 新建作品</el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="workList" style="width: 100%" height="300">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="作品名称" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" @click="toEditor(row)">进入编辑器</el-button>
          <el-button link type="primary" @click="deleteWork(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 创建作品弹窗 -->
  <el-dialog v-model="formVisible" title="创建新作品" width="400px" destroy-on-close>
    <el-form label-width="80px" :model="form">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="输入作品名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="createWork">创建</el-button>
    </template>
  </el-dialog>
</template>
