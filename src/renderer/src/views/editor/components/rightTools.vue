<script lang="ts" setup>
// 流程节点信息 story scene dialogue，
import { NodeEnum } from '@renderer/enum'
import DynamicSelectGroup from '@renderer/components/dynamicSelectGroup.vue'
import { captionBoxList, nodeNameMap } from '@renderer/constant'
import { useRouter } from 'vue-router'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { inject, Ref } from 'vue'
import { EditorNode } from '@renderer/types'
import MonacoEditor from '@renderer/components/monacoEditor.vue'

const {
  editorNodeList,
  nodeMap,
  editorNodeMap,
  addNode,
  removeNode,
  groupedNodes,
  clearNodeManager
} = useNodeManager()
const curSelectedNode: Ref<EditorNode> = inject('curSelectedNode')!

function deleteNode() {
  if (curSelectedNode.value) {
    removeNode(curSelectedNode.value.node.id)
  }
}

const router = useRouter()

// 游戏预览
function startGame(sceneId: number = -1) {
  const url = router.resolve({ path: '/jieShang/game/game', query: { sceneId } }).href
  window.open(url, '_blank')
}
</script>

<template>
  <div v-if="curSelectedNode">
    <div v-if="curSelectedNode.node.nodeType === NodeEnum.Scene">
      <el-button @click="startGame(curSelectedNode.node.id)">预览此场景节点</el-button>
    </div>
    <div class="font-bold">布局信息</div>
    <div class="flex mt-2">
      <div class="w-16 shrink-0">left:</div>
      <el-input v-model="curSelectedNode.layout.left" :style="{ width: '8rem' }"></el-input>
      <div class="w-16 shrink-0">top:</div>
      <el-input v-model="curSelectedNode.layout.left" :style="{ width: '8rem' }"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-16 shrink-0">width:</div>
      <el-input v-model="curSelectedNode.layout.width" :style="{ width: '8rem' }"></el-input>
      <div class="w-16 shrink-0">height:</div>
      <el-input v-model="curSelectedNode.layout.height" :style="{ width: '8rem' }"></el-input>
    </div>
    <div class="mt-4 mb-4">
      <div class="font-bold">节点信息</div>
      <div class="mt-2">
        <div class="w-16 shrink-0">id：{{ curSelectedNode.node.id }}</div>
        <div class="w-full shrink-0 flex items-center">
          <div class="w-20">节点名：</div>
          <el-input v-model="curSelectedNode.node.nodeName"></el-input>
        </div>
        <div class="shrink-0">节点类型：{{ nodeNameMap[curSelectedNode.node.nodeType] }}</div>
      </div>
    </div>
  </div>

  <template v-if="curSelectedNode && curSelectedNode.node.nodeType === NodeEnum.Story">
    <div class="flex mt-2">
      <div class="w-16 shrink-0">窗口宽:</div>
      <el-input v-model="curSelectedNode.node.width" :style="{ width: '8rem' }"></el-input>
      <div class="w-16 shrink-0">窗口高:</div>
      <el-input v-model="curSelectedNode.node.height" :style="{ width: '8rem' }"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">入口场景:</div>
      <el-select v-model="curSelectedNode.node.entrySceneId" :style="{ width: '16rem' }">
        <el-option :value="-1" label="无" />
        <el-option
          v-for="item in groupedNodes[NodeEnum.Scene]"
          :label="item.node.nodeName"
          :value="item.node.id"
        ></el-option>
      </el-select>
    </div>
  </template>

  <template v-if="curSelectedNode && curSelectedNode.node.nodeType === NodeEnum.Scene">
    <div class="flex mt-2">
      <div class="w-24 shrink-0">图片节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initImageIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Image]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自定义节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initCustomIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Custom]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">音频节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initAudioIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Audio]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">视频节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initVideoIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Video]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">对话节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initDialogueIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Dialogue]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">行为节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">结束幕布:</div>
      <el-select v-model="curSelectedNode.node.endCurationId" :style="{ width: '16rem' }">
        <el-option :value="-1" label="无" />
        <el-option
          v-for="item in groupedNodes[NodeEnum.Curtain]"
          :label="item.node.nodeName"
          :value="item.node.id"
        ></el-option>
      </el-select>
    </div>
  </template>
  <template v-if="curSelectedNode && curSelectedNode.node.nodeType === NodeEnum.Dialogue">
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自动开始首字幕:</div>
      <el-switch v-model="curSelectedNode.node.autoShowFirstCaption"></el-switch>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">需要保留到场景的资源:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.keepIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="[
          ...groupedNodes[NodeEnum.Image],
          ...groupedNodes[NodeEnum.Video],
          ...groupedNodes[NodeEnum.Audio]
        ]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">图片节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initImageIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Image]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自定义节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initCustomIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Custom]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">音频节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initAudioIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Audio]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">视频节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initVideoIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Video]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initCaptionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Caption]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">行为节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
  </template>
  <template v-if="curSelectedNode && curSelectedNode.node.nodeType === NodeEnum.Caption">
    <div class="flex mt-2">
      <div class="w-24 shrink-0">内容文本:</div>
      <el-input v-model="curSelectedNode.node.content" type="textarea"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕框样式:</div>
      <el-select v-model="curSelectedNode.node.boxType" :style="{ width: '16rem' }">
        <el-option
          v-for="item in captionBoxList"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自动播放:</div>
      <el-switch v-model="curSelectedNode.node.autoPlay"></el-switch>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自动跳转下一条字幕/对话:</div>
      <el-switch v-model="curSelectedNode.node.autoNext"></el-switch>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕大小:</div>
      <el-input v-model="curSelectedNode.node.fontSize" type="number"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕颜色:</div>
      <el-input v-model="curSelectedNode.node.fontColor"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕播放速度:</div>
      <el-input v-model="curSelectedNode.node.speed" type="number"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">字幕语音:</div>
      <el-select v-model="curSelectedNode.node.audioId" :style="{ width: '16rem' }">
        <el-option :value="-1" label="无" />
        <el-option
          v-for="item in groupedNodes[NodeEnum.Audio]"
          :label="item.node.nodeName"
          :value="item.node.id"
        ></el-option>
      </el-select>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">自动播放延时触发:</div>
      <el-input v-model="curSelectedNode.node.autoPlayDelay" type="number"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">布局节点:</div>
      <el-select v-model="curSelectedNode.node.layoutId" :style="{ width: '16rem' }">
        <el-option :value="-1" label="无" />
        <el-option
          v-for="item in groupedNodes[NodeEnum.Layout]"
          :label="item.node.nodeName"
          :value="item.node.id"
        ></el-option>
      </el-select>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">初始行为节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.initActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">完成态节点行为:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.finishActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">销毁前节点行为:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.doneActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">选项节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.optionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Option]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
  </template>
  <template v-if="curSelectedNode && curSelectedNode.node.nodeType === NodeEnum.Option">
    <div class="flex mt-2">
      <div class="w-24 shrink-0">文本:</div>
      <el-input v-model="curSelectedNode.node.text" type="textarea"></el-input>
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">激活态行为节点:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.activeActionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Action]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">展示条件:</div>
      <DynamicSelectGroup
        v-model="curSelectedNode.node.visibleConditionIds"
        :defaultNewValue="-1"
        :max="50"
        :min="0"
        :options="groupedNodes[NodeEnum.Condition]"
        labelField="node.nodeName"
        value-field="node.id"
      />
    </div>

    <div class="flex mt-2">
      <div class="w-24 shrink-0">样式:</div>
      <monaco-editor v-model="curSelectedNode.node.normalStyle" />
    </div>
    <div class="flex mt-2">
      <div class="w-24 shrink-0">鼠标悬浮样式:</div>
      <monaco-editor v-model="curSelectedNode.node.hoverStyle" />
    </div>
  </template>
  <div>
    <div class="font-bold">节点操作</div>
    <el-button @click="deleteNode">删除节点</el-button>
  </div>
</template>

<style scoped></style>
