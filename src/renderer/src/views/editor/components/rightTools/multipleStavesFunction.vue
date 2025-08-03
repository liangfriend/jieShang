<script setup lang="ts">

import {PropType, UnwrapRef} from "vue";
import {
  Measure,
  MsType,
  MultipleStaves,
  MusicScore, MusicScoreRef
} from "@/applications/ChuangKeApplication/components/musicScore/types";
import {
  multipleStavesTemplate
} from "@/applications/ChuangKeApplication/components/musicScore/utils/objectTemplateUtil.ts";
import {
  addMultipleStaves,
  removeMultipleStaves
} from "@/applications/ChuangKeApplication/components/musicScore/utils/changeStructureUtil.ts";


const props = defineProps({
  multipleStaves: {
    type: Object as PropType<MultipleStaves>,
    required: true
  },
  musicScore: {
    type: Object as PropType<MusicScore>,
    required: true
  },
  msRef: {
    type: Object as PropType<UnwrapRef<MusicScoreRef>>,
    required: true
  },
})

function handleRightToolsBtn(key: String, multipleStaves: MultipleStaves, musicScore: MusicScore) {
  switch (key) {
    case 'insertBefore': {
      const newMultipleStaves = multipleStavesTemplate({})
      if (!multipleStaves) return console.error("缺乏定位元素，复谱表添加失败")
      addMultipleStaves(newMultipleStaves, multipleStaves, musicScore, 'before')
      break
    }
    case 'insertAfter': {
      const newMultipleStaves = multipleStavesTemplate({})
      if (!multipleStaves) return console.error("缺乏定位元素，复谱表添加失败")
      addMultipleStaves(newMultipleStaves, multipleStaves, musicScore, 'after')
      break
    }
    case 'delete':
      removeMultipleStaves(multipleStaves, musicScore)
      break;

  }


}
</script>

<template>
  <div>
    <el-button @click="handleRightToolsBtn('insertBefore',multipleStaves,musicScore)"
    >
      向前插入复谱表
    </el-button>
    <el-button @click="handleRightToolsBtn('insertAfter',multipleStaves,musicScore)"
    >
      向后插入复谱表
    </el-button>
    <el-button @click="handleRightToolsBtn('delete',multipleStaves,musicScore)"
    >
      删除复谱表
    </el-button>
  </div>
</template>

<style scoped>

</style>