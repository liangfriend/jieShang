<script setup lang="ts">
import { ref, reactive, watch, PropType, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditorInfo, EditorNode, GameModel } from '@renderer/types'
import { useStaticResource } from '@renderer/composables/useStaticResource'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  editorNodeList: { type: Array as PropType<EditorNode[]>, required: true },
  gameData: { type: String, required: true },
  editorInfo: { type: Object as PropType<EditorInfo>, required: true }
})
const emit = defineEmits(['update:modelValue'])

// visible v-model proxy
const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  async (v) => {
    await getGameList()
    visible.value = v
  }
)
watch(visible, (v) => emit('update:modelValue', v))

const targetGameId = ref(-1)
const gameList = ref<GameModel[]>([])
async function getGameList() {
  gameList.value = (await window.api.game.list()).data
  console.log('chicken', gameList.value)
}
function updateGame() {
  ElMessageBox.confirm('确认更新? 此操作会覆盖掉现在的游戏数据', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      console.log(
        'chicken',
        JSON.stringify({
          editorNodeList: props.editorNodeList,
          gameData: props.gameData,
          editorInfo: props.editorInfo
        })
      )
      await window.api.game.update(targetGameId.value, {
        data: JSON.stringify({
          editorNodeList: props.editorNodeList,
          gameData: props.gameData,
          editorInfo: props.editorInfo
        })
      })
      ElMessage({
        type: 'success',
        message: '更新成功'
      })
      visible.value = false
    })
    .catch((e) => {
      console.log('chicken', e)
    })
}
</script>

<template>
  <el-dialog v-model="visible" title="更新数据到游戏" width="760px">
    <div class="publish-grid">
      <el-select v-model="targetGameId">
        <el-option label="无" :value="-1"></el-option>
        <el-option v-for="item in gameList" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="updateGame">更新</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.publish-grid {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
</style>
