<script setup lang="ts">
import { ref, reactive, watch, PropType, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { EditorInfo, EditorNode } from '@renderer/types'
import { useStaticResource } from '@renderer/composables/useStaticResource'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  editorNodeList: { type: Array as PropType<EditorNode[]>, required: true },
  gameData: { type: String, required: true },
  editorInfo: { type: Object as PropType<EditorInfo>, required: true }
})
const emit = defineEmits(['update:modelValue'])

// 资源列表（只要图片）
const { imageList } = useStaticResource()

// visible v-model proxy
const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

// 表单
const form = reactive({
  name: '',
  description: '',
  front_cover: '' as string // 存储 url 字符串 | '' 表示无
})

// 选中高亮 id（根据 url 也可）——用于 UI 高亮当前在选择器中高亮那一项
const selectedUrl = computed({
  get: () => form.front_cover,
  set: (v: string) => {
    form.front_cover = v
  }
})

// 提交
async function publishGame() {
  if (!form.name.trim()) return ElMessage.warning('请输入游戏名称')
  // description 可以为空，按你业务决定，此处要求非空
  if (!form.description.trim()) return ElMessage.warning('请输入简介')

  const payload = {
    name: form.name,
    description: form.description,
    front_cover: form.front_cover || '',
    data: JSON.stringify({
      editorNodeList: props.editorNodeList,
      gameData: props.gameData,
      editorInfo: props.editorInfo
    })
  }

  await window.api.game.create(payload)

  ElMessage.success('游戏发布成功')

  // 清空
  form.name = ''
  form.description = ''
  form.front_cover = ''
  visible.value = false
}

// 清除封面
function clearCover() {
  form.front_cover = ''
}

// 用户点击某个封面资源
function pickCover(res: { id: number; url: string }) {
  form.front_cover = res.url
}
</script>

<template>
  <el-dialog v-model="visible" title="创建新游戏" width="760px">
    <div class="publish-grid">
      <!-- 左：预览区 -->
      <div class="preview-area">
        <div class="preview-box">
          <template v-if="form.front_cover">
            <img :src="form.front_cover" class="preview-img" />
          </template>
          <template v-else>
            <div class="preview-empty">
              <div>未选择封面</div>
              <div class="hint">请选择右侧图片作为封面（或点击“清除”）</div>
            </div>
          </template>
        </div>

        <div class="meta-form">
          <el-form label-width="80px" :model="form">
            <el-form-item label="名称">
              <el-input v-model="form.name" placeholder="输入游戏名称" />
            </el-form-item>

            <el-form-item label="简介">
              <el-input
                v-model="form.description"
                type="textarea"
                placeholder="请输入游戏简介"
                rows="3"
              />
            </el-form-item>

            <el-form-item label="封面">
              <div class="cover-controls">
                <el-button @click="clearCover">清除封面</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 右：图片选择器 -->
      <div class="selector-area">
        <div class="selector-header">
          <div class="title">可选封面（图片资源）</div>
          <div class="count">{{ imageList.length }} 张</div>
        </div>

        <div class="thumb-grid">
          <div
            v-for="img in imageList"
            :key="img.id"
            class="thumb-item"
            :class="{ active: selectedUrl === img.url || form.front_cover === img.url }"
            @click="pickCover(img)"
          >
            <img :src="img.url" />
            <div class="thumb-name">{{ img.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="publishGame">创建</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.publish-grid {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 左侧预览 + 表单 */
.preview-area {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 预览盒子 */
.preview-box {
  width: 100%;
  height: 280px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  display: block;
}

.preview-empty {
  text-align: center;
  color: #999;
}

.preview-empty .hint {
  margin-top: 8px;
  font-size: 12px;
  color: #bbb;
}

/* 表单区域位于预览下方 */
.meta-form {
  width: 100%;
}

/* 封面控制按钮 */
.cover-controls {
  display: flex;
  gap: 8px;
}

/* 右侧选择器 */
.selector-area {
  width: 55%;
  display: flex;
  flex-direction: column;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 6px;
}

.thumb-item {
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: 0.15s;
  background: #fff;
}

.thumb-item img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 4px;
}

.thumb-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thumb-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.thumb-item.active {
  border-color: #409eff;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.12);
}
</style>
