<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { EditorNode, ImageNode, ResourceModel } from '@renderer/types'
import { ActionTypeEnum, EditorBoxEnum, NodeEnum } from '@renderer/enum'
import DynamicSelectGroup from '@renderer/components/dynamicSelectGroup.vue'
import {
  actionTypeList,
  curtainList,
  layerList,
  layoutPositionTypeList,
  nodeNameMap,
  objectFitList
} from '@renderer/constant'
import { useNodeManager } from '@renderer/composables/useNodeManager'
import monacoEditor from '@renderer/components/monacoEditor.vue'
import MonacoEditor from '@renderer/components/monacoEditor.vue'
import ResourceSelect from '@renderer/views/editor/components/resourceSelect.vue'
import { useStaticResource } from '@renderer/composables/useStaticResource'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  nodeId: {
    type: Number,
    required: true
  }
})
const {
  editorNodeList,
  nodeMap,
  editorNodeMap,
  addNode,
  removeNode,
  groupedNodes,
  clearNodeManager
} = useNodeManager()

const emit = defineEmits(['update:modelValue'])

watch(
  () => props.nodeId,
  () => {
    if (editorNodeMap.value.has(props.nodeId)) {
      editorNode.value = editorNodeMap.value.get(props.nodeId) as EditorNode
    }
  }
)
const editorNode = ref<EditorNode>(null!)
const actionType = computed(() => {
  if (editorNode.value?.node && 'actionType' in editorNode.value?.node) {
    return editorNode.value.node.actionType
  }
  return null
})
// 行为节点行为类型变化时，清空目标id
watch(actionType, (value, oldValue) => {
  // oldvalue不存在说明是初始化
  if (!oldValue) return
  if (editorNode.value.node && 'targetId' in editorNode.value.node) {
    editorNode.value.node.targetId = -1
  }
})

const imageList = ref<ResourceModel[]>([])

onMounted(async () => {
  const staticResource = await useStaticResource()
  imageList.value = staticResource.imageList.value
})
</script>

<template>
  <el-dialog v-model="props.modelValue" @update:modelValue="emit('update:modelValue', $event)">
    <div v-if="editorNode && editorNode.boxType !== EditorBoxEnum.None">
      <div class="font-bold">布局信息</div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">left:</div>
        <el-input v-model="editorNode.layout.left" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">top:</div>
        <el-input v-model="editorNode.layout.left" :style="{ width: '8rem' }"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">width:</div>
        <el-input v-model="editorNode.layout.left" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">height:</div>
        <el-input v-model="editorNode.layout.left" :style="{ width: '8rem' }"></el-input>
      </div>
    </div>
    <div class="mt-4 mb-4">
      <div class="font-bold">节点信息</div>
      <div class="mt-2">
        <div class="w-16 shrink-0">id：{{ editorNode.node.id }}</div>
        <div class="w-full shrink-0 flex items-center mt-2">
          <div class="w-20">节点名：</div>
          <el-input v-model="editorNode.node.nodeName"></el-input>
        </div>
        <div class="shrink-0 mt-2">节点类型：{{ nodeNameMap[editorNode.node.nodeType] }}</div>
      </div>
    </div>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Story">
      <div class="flex mt-2">
        <div class="w-16 shrink-0">窗口宽:</div>
        <el-input v-model="editorNode.node.width" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">窗口高:</div>
        <el-input v-model="editorNode.node.height" :style="{ width: '8rem' }"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">入口场景:</div>
        <el-select v-model="editorNode.node.entrySceneId" :style="{ width: '16rem' }">
          <el-option :value="-1" label="无" />
          <el-option
            v-for="item in groupedNodes[NodeEnum.Scene]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <el-select v-model="editorNode.node.bgUrl" :style="{ width: '16rem' }">
        <el-option value="" label="无" />
        <el-option
          v-for="item in groupedNodes[NodeEnum.Image]"
          :label="item.node.nodeName"
          :value="(item.node as ImageNode).url"
        ></el-option>
      </el-select>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">选项文字颜色:</div>
        <el-input v-model="editorNode.node.fontColor" :style="{ width: '16rem' }"></el-input>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Scene">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">图片节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initImageIds"
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
          v-model="editorNode.node.initCustomIds"
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
          v-model="editorNode.node.initAudioIds"
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
          v-model="editorNode.node.initVideoIds"
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
          v-model="editorNode.node.initDialogueIds"
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
          v-model="editorNode.node.initActionIds"
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
        <el-select v-model="editorNode.node.endCurationId" :style="{ width: '16rem' }">
          <el-option :value="-1" label="无" />
          <el-option
            v-for="item in groupedNodes[NodeEnum.Curtain]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Dialogue">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自动开始首字幕:</div>
        <el-switch v-model="editorNode.node.autoShowFirstCaption"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">需要保留到场景的资源:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.keepIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="[
            ...groupedNodes[NodeEnum.Image],
            ...groupedNodes[NodeEnum.Video],
            ...groupedNodes[NodeEnum.Audio],
            ...groupedNodes[NodeEnum.Custom]
          ]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">图片节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initImageIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Custom]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自定义节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initCustomIds"
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
          v-model="editorNode.node.initAudioIds"
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
          v-model="editorNode.node.initVideoIds"
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
          v-model="editorNode.node.initCaptionIds"
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
          v-model="editorNode.node.initActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Option">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">文本:</div>
        <el-input v-model="editorNode.node.text"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">选项激活行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.activeActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">展示条件节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.visibleConditionIds"
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
        <monaco-editor v-model="editorNode.node.normalStyle" />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">鼠标移入样式:</div>
        <monaco-editor v-model="editorNode.node.hoverStyle" />
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Caption">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">文本内容:</div>
        <el-input v-model="editorNode.node.content" type="textarea"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">发言人名称:</div>
        <el-input v-model="editorNode.node.title" />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自动播放:</div>
        <el-switch v-model="editorNode.node.autoPlay"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自动跳转下一条字幕/对话:</div>
        <el-switch v-model="editorNode.node.autoNext"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">打字机效果速度:</div>
        <el-input v-model="editorNode.node.speed" type="number"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">字幕框样式:</div>
        <monaco-editor v-model="editorNode.node.boxStyle"></monaco-editor>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">字幕样式:</div>
        <monaco-editor v-model="editorNode.node.captionTextStyle"></monaco-editor>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">名称样式:</div>
        <monaco-editor v-model="editorNode.node.captionTitleStyle"></monaco-editor>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">字幕语音:</div>
        <el-select v-model="editorNode.node.audioId" :style="{ width: '16rem' }">
          <el-option :value="-1" label="无" />
          <el-option
            v-for="item in groupedNodes[NodeEnum.Audio]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自动触发播放延时:</div>
        <el-input v-model="editorNode.node.autoPlayDelay" type="number"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">布局节点:</div>
        <el-select v-model="editorNode.node.layoutId" :style="{ width: '16rem' }">
          <el-option :value="-1" label="无" />
          <el-option
            v-for="item in groupedNodes[NodeEnum.Layout]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initActionIds"
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
          v-model="editorNode.node.optionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Option]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">完成态行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.finishActionIds"
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
          v-model="editorNode.node.doneActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">选项容器样式:</div>
        <monaco-editor v-model="editorNode.node.optionContainerStyle"></monaco-editor>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Action">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为类型:</div>
        <el-select v-model="editorNode.node.actionType" :style="{ width: '16rem' }">
          <el-option
            v-for="item in actionTypeList"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div v-if="editorNode.node.actionType !== ActionTypeEnum.Combined" class="flex mt-2">
        <div class="w-24 shrink-0">目标Id:</div>
        <el-select
          v-if="editorNode.node.actionType === ActionTypeEnum.Next"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in [...groupedNodes[NodeEnum.Scene]]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.ShowImage"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Image]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.HideImage"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Image]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.ShowVideo"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Video]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.HideVideo"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Video]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.PlayVideo"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Video]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.StopVideo"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Video]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.PlayAudio"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Audio]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.StopAudio"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Audio]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.ShowFilter"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Filter]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.HideFilter"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Filter]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.ActiveCurtain"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in groupedNodes[NodeEnum.Curtain]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>

        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.Animation"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in editorNodeList"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="editorNode.node.actionType === ActionTypeEnum.Custom"
          v-model="editorNode.node.targetId"
          :style="{ width: '16rem' }"
        >
          <el-option :value="-1" label="无"></el-option>
          <el-option
            v-for="item in editorNodeList"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">执行延时:</div>
        <el-input v-model="editorNode.node.delay" type="number"></el-input>
      </div>
      <template v-if="editorNode.node.actionType === ActionTypeEnum.Animation">
        <div class="flex mt-2">
          <div class="w-24 shrink-0">缩放:</div>
          <el-input v-model="editorNode.node.animation.scale" type="number"></el-input>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">透明度:</div>
          <el-input v-model="editorNode.node.animation.opacity" type="number"></el-input>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">x轴移动值:</div>
          <el-input v-model="editorNode.node.animation.offsetX" type="number"></el-input>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">y轴移动值:</div>
          <el-input v-model="editorNode.node.animation.offsetY" type="number"></el-input>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">旋转角度:</div>
          <el-input v-model="editorNode.node.animation.rotate" type="number"></el-input>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">变形锚点:</div>
          <div class="flex">
            <el-input
              v-model="editorNode.node.animation.transformOrigin[0]"
              type="number"
            ></el-input>
            <el-input
              v-model="editorNode.node.animation.transformOrigin[1]"
              type="number"
            ></el-input>
          </div>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">保持最终态:</div>
          <el-switch v-model="editorNode.node.animation.keepFinalState"></el-switch>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">循环动画:</div>
          <el-switch v-model="editorNode.node.animation.loop"></el-switch>
        </div>
        <div class="flex mt-2">
          <div class="w-24 shrink-0">动画时长:</div>
          <el-input v-model="editorNode.node.animation.duration" type="number"></el-input>
        </div>
      </template>
      <div v-if="editorNode.node.actionType === ActionTypeEnum.Combined" class="flex mt-2">
        <div class="w-24 shrink-0">组合行为列表:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.actionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">执行条件:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.executeConditionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Condition]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div v-if="editorNode.node.actionType === ActionTypeEnum.Custom" class="flex mt-2">
        <div class="w-24 shrink-0">自定义行为数据（json格式）:</div>
        <el-input v-model="editorNode.node.data" type="textarea"></el-input>
      </div>
      <div v-if="editorNode.node.actionType === ActionTypeEnum.DataChange" class="flex mt-2">
        <div class="w-24 shrink-0">数据修改函数:</div>
        <monaco-editor v-model="editorNode.node.dataChangeFunc"></monaco-editor>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Layout">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">层级:</div>
        <el-select v-model="editorNode.node.layer" :style="{ width: '16rem' }">
          <el-option v-for="item in layerList" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">布局类型:</div>
        <el-select v-model="editorNode.node.applyPosition" :style="{ width: '16rem' }">
          <el-option
            v-for="item in layoutPositionTypeList"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">展示策略:</div>
        <el-select v-model="editorNode.node.objectFit" :style="{ width: '16rem' }">
          <el-option
            v-for="item in objectFitList"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">left:</div>
        <el-input v-model="editorNode.node.left" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">right:</div>
        <el-input v-model="editorNode.node.right" :style="{ width: '8rem' }"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">top:</div>
        <el-input v-model="editorNode.node.top" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">bottom:</div>
        <el-input v-model="editorNode.node.bottom" :style="{ width: '8rem' }"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">width:</div>
        <el-input v-model="editorNode.node.width" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">height:</div>
        <el-input v-model="editorNode.node.height" :style="{ width: '8rem' }"></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-16 shrink-0">旋转角度:</div>
        <el-input v-model="editorNode.node.rotation" :style="{ width: '8rem' }"></el-input>
        <div class="w-16 shrink-0">缩放倍数:</div>
        <el-input v-model="editorNode.node.scale" :style="{ width: '8rem' }"></el-input>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Curtain">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">幕布类型:</div>
        <el-select v-model="editorNode.node.curtainType" :style="{ width: '16rem' }">
          <el-option
            v-for="item in curtainList"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">动画时长:</div>
        <el-input
          v-model="editorNode.node.anDuration"
          :style="{ width: '8rem' }"
          type="number"
        ></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">播放延时:</div>
        <el-input
          v-model="editorNode.node.delay"
          :style="{ width: '8rem' }"
          type="number"
        ></el-input>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">幕布图片:</div>
        <el-select v-model="editorNode.node.url" :style="{ width: '16rem' }">
          <el-option v-for="item in imageList" :label="item.name" :value="item.url"></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">幕布颜色:</div>
        <el-input v-model="editorNode.node.color" :style="{ width: '8rem' }"></el-input>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Image">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">布局:</div>
        <el-select v-model="editorNode.node.layoutId" :style="{ width: '16rem' }">
          <el-option
            v-for="item in groupedNodes[NodeEnum.Layout]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">资源:</div>
        <resource-select v-model="editorNode.node.url" resourceType="image"></resource-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Audio">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">资源:</div>
        <resource-select v-model="editorNode.node.url" resourceType="audio"></resource-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">循环播放:</div>
        <el-switch v-model="editorNode.node.loop"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Video">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">布局:</div>
        <el-select v-model="editorNode.node.layoutId" :style="{ width: '16rem' }">
          <el-option
            v-for="item in groupedNodes[NodeEnum.Layout]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">循环播放:</div>
        <el-switch v-model="editorNode.node.loop"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自动播放:</div>
        <el-switch v-model="editorNode.node.autoplay"></el-switch>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">资源:</div>
        <resource-select v-model="editorNode.node.url" resourceType="video"></resource-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Custom">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">布局:</div>
        <el-select v-model="editorNode.node.layoutId" :style="{ width: '16rem' }">
          <el-option
            v-for="item in groupedNodes[NodeEnum.Layout]"
            :label="item.node.nodeName"
            :value="item.node.id"
          ></el-option>
        </el-select>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">行为节点:</div>
        <DynamicSelectGroup
          v-model="editorNode.node.initActionIds"
          :defaultNewValue="-1"
          :max="50"
          :min="0"
          :options="groupedNodes[NodeEnum.Action]"
          labelField="node.nodeName"
          value-field="node.id"
        />
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">自定义数据:</div>
        <el-input v-model="editorNode.node.data" type="textarea"></el-input>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Filter">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">滤镜样式:</div>
        <monaco-editor v-model="editorNode.node.filterStyle"></monaco-editor>
      </div>
      <div class="flex mt-2">
        <div class="w-24 shrink-0">滤镜自定义canvas脚本:</div>
        <monaco-editor v-model="editorNode.node.filterCanvasScript"></monaco-editor>
      </div>
    </template>
    <template v-if="editorNode && editorNode.node.nodeType === NodeEnum.Condition">
      <div class="flex mt-2">
        <div class="w-24 shrink-0">条件函数:</div>
        <monaco-editor v-model="editorNode.node.func"></monaco-editor>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
