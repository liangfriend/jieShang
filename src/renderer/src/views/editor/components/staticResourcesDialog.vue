<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateStaticResource, useStaticResource } from '@renderer/composables/useStaticResource'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

// -------------------------------
// 列表数据 (仍用 composable 来维护 imageList/audioList/videoList)
// -------------------------------
const { imageList, audioList, videoList } = useStaticResource()

// -------------------------------
// group 筛选
// -------------------------------
const groupList = ref<Array<{ id: number; name: string }>>([])
const groupFilter = ref<number>(0) // 0 表示全部

async function getGroupList() {
  groupList.value = (await window.api.group.list()).data || []
}

// -------------------------------
// 从后端按筛选拉取资源并更新 composable
// 使用 query({}) 或 query({ group_id })：
// -------------------------------
async function updateResource() {
  const filters: any = {}
  if (groupFilter.value && groupFilter.value !== 0) {
    filters.group_id = groupFilter.value
  }
  // 当 filters 为空对象时，query({}) 与 list() 行为一致（按你所述）
  const res = await window.api.resource.query(filters)
  const resourceList = res.data || []
  updateStaticResource(resourceList)
}

// 监听 groupFilter 变化，触发服务端筛选请求
watch(groupFilter, async () => {
  await updateResource()
})

// -------------------------------
// 上传弹窗
// -------------------------------
const formVisible = ref(false)

const form = ref({
  name: '',
  file: null as File | null,
  group_id: null as number | null
})
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  form.value.file = target.files[0]
}
// -------------------------------
// 工具函数
// -------------------------------
function getFileType(file: File): 'image' | 'audio' | 'video' {
  if (file.type.startsWith('image')) return 'image'
  if (file.type.startsWith('audio')) return 'audio'
  if (file.type.startsWith('video')) return 'video'
  throw new Error('不支持的文件类型')
}

function openUpload() {
  formVisible.value = true
  form.value = { name: '', file: null, group_id: null }
}

// -------------------------------
// 创建资源（上传并尝试关联 group）
// -------------------------------
async function createResource() {
  if (!form.value.name) return ElMessage.error('请填写名称')
  if (!form.value.file) return ElMessage.error('请选择文件')

  const file = form.value.file
  const type = getFileType(file)

  // 浏览器端只能用 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  // 上传时要传 file.name（带后缀）
  // 假设 window.api.file.upload 返回创建好的资源信息或至少返回 id 在 data 中
  const uploadRes = await window.api.file.upload(
    arrayBuffer,
    file.name, // ← 包含扩展名，例如 "test.png"
    type,
    form.value.name // ← 用户界面上的展示名称
  )

  // 如果后端的 upload 返回了资源 id（常见：upload 返回 { data: { id, ... } }）
  const uploadedId = (uploadRes && (uploadRes.data?.id ?? uploadRes.id)) ?? null

  // 如果上传后需要单独关联 group（有些实现不支持直接在 upload 中传 group_id）
  if (uploadedId && form.value.group_id) {
    try {
      await window.api.resource.update(uploadedId, { group_id: form.value.group_id })
    } catch (err) {
      // 若更新失败也不用完全中断上传流程，只告知用户
      console.warn('关联 group 失败：', err)
    }
  }

  ElMessage.success('上传成功！')
  formVisible.value = false

  // 根据当前筛选重新拉取（如果当前筛选到了某个 group，上传的资源若属于该 group 会在结果中出现）
  await updateResource()
  return
}

// -------------------------------
// 删除资源
// -------------------------------
async function deleteResource(item: any) {
  try {
    await ElMessageBox.confirm(`确定要删除资源 "${item.name}" 吗？`, '删除资源', {
      type: 'warning'
    })

    // 1. 删除文件（如果 file.delete 接受 id）
    await window.api.file.delete(item.id)

    // 2. 删除 resource 表记录
    await window.api.resource.delete(item.id)

    ElMessage.success('删除成功')

    // 删除后依据当前筛选重新拉取
    await updateResource()
  } catch {
    /* 用户取消 */
  }
}

// -------------------------------
// 初始化
// -------------------------------
onMounted(async () => {
  await getGroupList()
  await updateResource()
})
</script>

<template>
  <el-dialog
    v-model="props.modelValue"
    width="900px"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <!-- 顶部功能区：上传 + 分组筛选 -->
    <div style="margin-bottom: 10px; display: flex; gap: 12px; align-items: center">
      <el-button type="primary" @click="openUpload">上传资源</el-button>

      <el-select v-model="groupFilter" placeholder="筛选分组" clearable style="width: 240px">
        <el-option :value="0" label="全部分组" />
        <el-option v-for="g in groupList" :key="g.id" :label="g.name" :value="g.id" />
      </el-select>
    </div>

    <!-- 三列展示区（可滚动） -->
    <div class="container">
      <!-- 图片 -->
      <div class="column">
        <h3>图片</h3>
        <div class="scroll">
          <div v-for="item in imageList" :key="item.id" class="card">
            <img :src="item.url" />
            {{ item.url }}
            <p>{{ item.name }}</p>

            <el-button type="danger" size="small" @click.stop="deleteResource(item)" plain>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 音频 -->
      <div class="column">
        <h3>音频</h3>
        <div class="scroll">
          <div v-for="item in audioList" :key="item.id" class="card">
            <audio :src="item.url" controls></audio>
            <p>{{ item.name }}</p>

            <el-button type="danger" size="small" @click.stop="deleteResource(item)" plain>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 视频 -->
      <div class="column">
        <h3>视频</h3>
        <div class="scroll">
          <div v-for="item in videoList" :key="item.id" class="card">
            <video :src="item.url" muted controls></video>
            <p>{{ item.name }}</p>

            <el-button type="danger" size="small" @click.stop="deleteResource(item)" plain>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 上传弹窗 -->
  <el-dialog v-model="formVisible" title="上传新资源" width="400px">
    <el-form label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="输入资源名称" />
      </el-form-item>

      <el-form-item label="分组">
        <el-select v-model="form.group_id" placeholder="选择分组">
          <el-option v-for="g in groupList" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="文件">
        <input type="file" @change="onFileChange" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="createResource">上传</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  height: 500px;
}

.column {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}

.card {
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
  margin-bottom: 10px;
}

img,
video {
  width: 100%;
  border-radius: 4px;
}

audio {
  width: 100%;
}

h3 {
  margin: 0 0 8px 4px;
  font-size: 16px;
}
</style>
