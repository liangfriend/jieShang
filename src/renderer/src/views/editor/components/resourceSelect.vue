<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String, // url
    required: true
  },
  resourceType: {
    type: String,
    default: 'all' // image audio video
  }
})

const emit = defineEmits(['update:modelValue'])

// 资源列表
const resourceList = ref<Array<{ id: number; name: string; url: string; group?: number }>>([])

// 分组列表
const groupList = ref<Array<{ id: number; name: string }>>([])

// 当前选中的分组
const curSelectedGroup = ref(-1)

// 获取资源列表
async function getResourceList() {
  const group = curSelectedGroup.value === -1 ? undefined : curSelectedGroup.value

  let res
  if (props.resourceType === 'all') {
    if (group !== undefined) {
      res = await window.api.resource.query({ group })
    } else {
      res = await window.api.resource.list()
    }
  } else {
    if (group !== undefined) {
      res = await window.api.resource.query({ type: props.resourceType, group })
    } else {
      res = await window.api.resource.query({ type: props.resourceType })
    }
  }

  resourceList.value = res.data
}

// 获取分组列表
async function getGroupList() {
  groupList.value = (await window.api.group.list()).data
}

onMounted(async () => {
  await getGroupList()
  await getResourceList()
})

// 当 group 变化时自动刷新资源列表
watch(curSelectedGroup, () => {
  getResourceList()
})
</script>

<template>
  <div>
    <!-- 分组选择器 -->
    <el-select
      v-model="curSelectedGroup"
      placeholder="选择分组"
      style="width: 200px; margin-right: 10px"
    >
      <el-option :value="-1" label="全部分组"></el-option>

      <el-option v-for="g in groupList" :key="g.id" :value="g.id" :label="g.name"></el-option>
    </el-select>

    <!-- 资源选择器 -->
    <el-select
      v-model="props.modelValue"
      placeholder="选择资源"
      style="width: 300px"
      @change="(val) => emit('update:modelValue', val)"
    >
      <el-option value="" label="无" />
      <el-option v-for="r in resourceList" :key="r.id" :value="r.url" :label="r.name" />
    </el-select>
  </div>
</template>

<style scoped></style>
