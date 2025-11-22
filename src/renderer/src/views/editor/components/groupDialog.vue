<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

// ===================== 分组数据 ======================
const groupList = ref([])

async function loadGroupList() {
  const res = await window.api.group.list()
  groupList.value = res.data || []
}

// ===================== 新建 / 编辑弹窗 ======================
const editVisible = ref(false)

const editForm = ref({
  id: null as number | null,
  name: ''
})

function openCreate() {
  editForm.value = { id: null, name: '' }
  editVisible.value = true
}

function openEdit(item: any) {
  editForm.value = { id: item.id, name: item.name }
  editVisible.value = true
}

// 保存：自动判断 create / update
async function saveGroup() {
  const { id, name } = editForm.value

  if (!name.trim()) return ElMessage.error('请输入分组名称')

  if (id === null) {
    // 新建
    await window.api.group.create({ name })
    ElMessage.success('创建成功')
  } else {
    // 更新
    await window.api.group.update(id, { name })
    ElMessage.success('更新成功')
  }

  editVisible.value = false
  await loadGroupList()
}

// ===================== 删除 ======================
async function deleteGroup(item: any) {
  try {
    await ElMessageBox.confirm(`确定删除分组 "${item.name}" 吗？`, '删除分组', {
      type: 'warning'
    })

    await window.api.group.delete(item.id)
    ElMessage.success('删除成功')

    await loadGroupList()
  } catch {}
}

// ===================== 初始化 ======================
onMounted(async () => {
  await loadGroupList()
})
</script>

<template>
  <el-dialog
    v-model="props.modelValue"
    width="500px"
    @update:modelValue="emit('update:modelValue', $event)"
    title="分组管理"
  >
    <!-- 顶部按钮 -->
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="openCreate">新建分组</el-button>
    </div>

    <!-- 分组列表 -->
    <el-table :data="groupList" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分组名称" />

      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteGroup(scope.row)" plain>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <!-- 分组编辑弹窗 -->
  <el-dialog v-model="editVisible" title="编辑分组" width="400px">
    <el-form label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="editForm.name" placeholder="分组名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="editVisible = false">取消</el-button>
      <el-button type="primary" @click="saveGroup">保存</el-button>
    </template>
  </el-dialog>
</template>
