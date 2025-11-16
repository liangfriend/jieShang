<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateStaticResource, useStaticResource } from '@renderer/composables/useStaticResource'

const props = defineProps({
  modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])

// -------------------------------
// 列表数据
// -------------------------------
const { imageList, audioList, videoList } = useStaticResource()

async function updateResource() {
  const resourceList = await window.api.resource.list()
  updateStaticResource(resourceList)
}

// -------------------------------
// 上传弹窗
// -------------------------------
const formVisible = ref(false)

const form = ref({
  name: '',
  file: null as File | null
})

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
  form.value = { name: '', file: null }
}

// -------------------------------
// 创建资源
// -------------------------------
async function createResource() {
  if (!form.value.name) return ElMessage.error('请填写名称')
  if (!form.value.file) return ElMessage.error('请选择文件')

  const file = form.value.file
  const type = getFileType(file)

  // 浏览器端只能用 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  // 上传时要传 file.name（带后缀）
  await window.api.file.upload(
    arrayBuffer,
    file.name, // ← 包含扩展名，例如 "test.png"
    type,
    form.value.name // ← 用户界面上的展示名称
  )

  ElMessage.success('上传成功！')
  formVisible.value = false

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

    // 1. 删除文件
    await window.api.file.delete(item.id)

    // 2. 删除 resource 表记录
    await window.api.resource.delete(item.id)

    ElMessage.success('删除成功')
    await updateResource()
  } catch {
    /* 用户取消 */
  }
}

// -------------------------------
// 加载资源列表
// -------------------------------
</script>
<template>
  <el-dialog
    v-model="props.modelValue"
    width="900px"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <!-- 顶部功能区 -->
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="openUpload">上传资源</el-button>
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

      <el-form-item label="文件">
        <input type="file" @change="(e: Event) => (form.file = e.target!.files[0])" />
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
