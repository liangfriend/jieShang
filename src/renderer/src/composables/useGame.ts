/*
 * 流程管理器 游戏的总调度指挥中心
 * */
import { useNodeManager } from '@renderer/composables/useNodeManager'
import { computed, ref } from 'vue'
import {
  ActionNode,
  AudioNode,
  AudioNodePlayer,
  CaptionNode,
  ConditionNode,
  CurtainNode,
  CustomNode,
  DialogueNode,
  EngineNode,
  ImageNode,
  LayoutNode,
  SceneNode,
  VideoNode,
  VideoNodePlayer,
  ViewerNode
} from '@renderer/types'
import { ActionTypeEnum, LayerEnum, NodeEnum } from '@renderer/enum'
import { ReactiveMap } from '@renderer/dataStructures/relativeMap'
import { useAudioManager } from '@renderer/composables/useAudioManager'
import { useVideoManager } from '@renderer/composables/useVideoManager'
import { useAnimateion } from '@renderer/composables/useAnimateion'
import { runCode } from '@renderer/utils/execJS'

const { editorNodeList, nodeMap, editorNodeMap, groupedNodes, clearNodeManager } = useNodeManager()
const { videoNodePLayerMap, removeVideoNodePlayer, addVideoNodePlayer } = useVideoManager()
const { audioNodePlayerMap, play, stop } = useAudioManager()
// 动画
const { animationMap, executeAnimation } = useAnimateion()

function setup() {
  // 当前场景id
  const curSceneId = ref(-1)
  // 当前对话id
  const curDialogueId = ref(-1)
  // 当前字幕id
  const curCaptionId = ref(-1)
  // 场景vueKey
  const viewerKeys = ref({
    [LayerEnum.Curtain]: 123
  })

  // 唯一可以外部增删的数据,视图上的数据
  const viewerNodeMap = ref(new Map<number, EngineNode>())
  // 对viewerNodeMap进行分组
  const viewerNodeGroups = computed((): ViewerNode => {
    const res: ViewerNode = {
      images: {
        [LayerEnum.Background]: [],
        [LayerEnum.BehindObject]: [],
        [LayerEnum.Character]: [],
        [LayerEnum.FrontObject]: [],
        [LayerEnum.Effect]: [],
        [LayerEnum.Operation]: [],
        [LayerEnum.Curtain]: []
      },
      videos: {
        [LayerEnum.Background]: [],
        [LayerEnum.BehindObject]: [],
        [LayerEnum.Character]: [],
        [LayerEnum.FrontObject]: [],
        [LayerEnum.Effect]: [],
        [LayerEnum.Operation]: [],
        [LayerEnum.Curtain]: []
      },
      customs: {
        [LayerEnum.Background]: [],
        [LayerEnum.BehindObject]: [],
        [LayerEnum.Character]: [],
        [LayerEnum.FrontObject]: [],
        [LayerEnum.Effect]: [],
        [LayerEnum.Operation]: [],
        [LayerEnum.Curtain]: []
      },
      audios: [],
      filters: [],
      captions: []
    }

    for (let [id, node] of viewerNodeMap.value) {
      if (!node) {
        console.error('有资源节点不存在')
        continue
      }
      if (node.nodeType === NodeEnum.Image) {
        const layout = nodeMap.value.get(node.layoutId) as LayoutNode
        res.images[layout.layer].push({
          node,
          layout
        })
      } else if (node.nodeType === NodeEnum.Custom) {
        const layout = nodeMap.value.get(node.layoutId) as LayoutNode
        res.customs[layout.layer].push({
          node,
          layout
        })
      } else if (node.nodeType === NodeEnum.Video) {
        const layout = nodeMap.value.get(node.layoutId) as LayoutNode
        res.videos[layout.layer].push({
          node,
          layout
        })
      } else if (node.nodeType === NodeEnum.Audio) {
        res.audios.push({
          node
        })
      } else if (node.nodeType === NodeEnum.Filter) {
        res.filters.push({
          node
        })
      } else if (node.nodeType === NodeEnum.Caption) {
        const layout = nodeMap.value.get(node.layoutId) as LayoutNode
        if (layout) {
          res.captions.push({
            node,
            layout
          })
        } else {
          console.error('字幕：', node.nodeName, '，缺少布局信息')
        }
      }
    }

    return res
  })
  // 幕布不能被场景切换清除，所以单独出一个数据
  const viewerCurtainNodeMap = ref(new ReactiveMap<number, CurtainNode>())

  function addViewerNodeMap(id: number, node: EngineNode) {
    viewerNodeMap.value.set(id, node)
    // 播放音频
    if (node?.nodeType === NodeEnum.Audio && id) {
      const player = audioNodePlayerMap.value.get(id) as AudioNodePlayer
      player?.play()
    }
  }

  function removeViewerNodeMap(id: number) {
    const node = nodeMap.value.get(id) as EngineNode
    viewerNodeMap.value.delete(id)
    // 停止音频
    if (node?.nodeType === NodeEnum.Audio && id) {
      const player = audioNodePlayerMap.value.get(id) as AudioNodePlayer
      player?.stop()
      // 音频播放器不用从audioNodePlayerMap移除，audioNodePlayerMap默认保持所有音频播放器
    }
    // 移除视频播放器
    if (node?.nodeType === NodeEnum.Video && id) {
      const player = videoNodePLayerMap.value.get(id) as VideoNodePlayer
      player?.stop()
      removeVideoNodePlayer(id)
    }
  }

  // 开始场景
  async function startScene(scenedId: number) {
    if (!scenedId || scenedId === -1) return

    // 启动结束幕布
    const preSceneNoode = nodeMap.value.get(curSceneId.value) as SceneNode
    if (preSceneNoode && preSceneNoode.endCurationId) {
      const endCurtain = nodeMap.value.get(preSceneNoode.endCurationId) as CurtainNode
      viewerCurtainNodeMap.value.set(preSceneNoode.endCurationId, endCurtain)
      // 幕布执行到一半的时间会进行场景切换
      await new Promise((resolve) =>
        setTimeout(resolve, (+endCurtain.anDuration + +endCurtain.delay) / 2)
      )
    }
    // 清空已存在资源
    viewerNodeMap.value.clear()
    // ================场景更替=======================
    curSceneId.value = scenedId
    const sceneNode = nodeMap.value.get(curSceneId.value) as SceneNode
    if (sceneNode) {
      // 执行初始化行为
      sceneNode.initActionIds?.forEach((actionId) => {
        doAction(actionId)
      })
      // 展示初始图片
      sceneNode.initImageIds?.forEach((nodeId) => {
        const node = nodeMap.value.get(nodeId) as ImageNode
        addViewerNodeMap(nodeId, node)
      })
      // 展示初始自定义
      sceneNode.initCustomIds?.forEach((nodeId) => {
        const node = nodeMap.value.get(nodeId) as CustomNode
        addViewerNodeMap(nodeId, node)
      })
      // 展示初始音频
      sceneNode.initAudioIds?.forEach((nodeId) => {
        const node = nodeMap.value.get(nodeId) as AudioNode
        addViewerNodeMap(nodeId, node)
      })
      // 展示初始视频
      sceneNode.initVideoIds?.forEach((nodeId) => {
        const node = nodeMap.value.get(nodeId) as VideoNode
        addViewerNodeMap(nodeId, node)
      })
      startDialogue(sceneNode.initDialogueIds[0])
    }
  }

  //开始对话， 切换对话的默认行为是清除上一条字幕和图片
  function startDialogue(dialogueId: number) {
    if (!dialogueId || dialogueId === -1) return
    // 删除上一条对话
    removeViewerNodeMap(curDialogueId.value)
    // 删除相关资源
    removeRelatedResources(curDialogueId.value)

    curDialogueId.value = dialogueId
    const dialogueNode = nodeMap.value.get(curDialogueId.value) as DialogueNode
    // 执行相关行为
    dialogueNode.initActionIds?.forEach((actionId) => {
      doAction(actionId)
    })
    // 展示初始图片
    dialogueNode.initImageIds?.forEach((nodeId) => {
      const node = nodeMap.value.get(nodeId) as ImageNode
      addViewerNodeMap(nodeId, node)
    })
    // 展示初始自定义
    dialogueNode.initCustomIds?.forEach((nodeId) => {
      const node = nodeMap.value.get(nodeId) as CustomNode
      addViewerNodeMap(nodeId, node)
    })
    // 展示初始音频
    dialogueNode.initAudioIds?.forEach((nodeId) => {
      const node = nodeMap.value.get(nodeId) as AudioNode
      addViewerNodeMap(nodeId, node)
    })
    // 展示初始视频
    dialogueNode.initVideoIds?.forEach((nodeId) => {
      const node = nodeMap.value.get(nodeId) as VideoNode
      addViewerNodeMap(nodeId, node)
    })
    if (dialogueNode && dialogueNode.autoShowFirstCaption) {
      if (dialogueNode.initCaptionIds[0]) {
        startCaption(dialogueNode.initCaptionIds[0])
      }
    }
  }

  // 开始字幕
  function startCaption(captionId: number) {
    // 删除上一条字幕
    removeViewerNodeMap(curCaptionId.value)
    const captionNode = nodeMap.value.get(captionId) as CaptionNode
    addViewerNodeMap(captionId, captionNode)
    curCaptionId.value = captionId
  }

  function removeRelatedResources(nodeId: number) {
    if (nodeId === -1) return
    const node = nodeMap.value.get(nodeId) as EngineNode

    if (node.nodeType === NodeEnum.Dialogue) {
      // 需要保留的资源列表
      const keepIds = node.keepIds
      node.initImageIds.forEach((id) => {
        if (!keepIds.some((e) => e === id)) {
          removeViewerNodeMap(id)
        }
      })
      node.initImageIds.forEach((id) => {
        if (!keepIds.some((e) => e === id)) {
          removeViewerNodeMap(id)
        }
      })
      node.initAudioIds.forEach((id) => {
        if (!keepIds.some((e) => e === id)) {
          if (!keepIds.some((e) => e === id)) {
            removeViewerNodeMap(id)
          }
        }
      })
      node.initVideoIds.forEach((id) => {
        if (!keepIds.some((e) => e === id)) {
          removeViewerNodeMap(id)
        }
      })
      node.initCaptionIds.forEach((id) => {
        if (!keepIds.some((e) => e === id)) {
          removeViewerNodeMap(id)
        }
      })
    }
  }

  // 行为执行
  function doAction(actionId: number) {
    const actionNode = nodeMap.value.get(actionId) as ActionNode
    if (actionNode) {
      let condition = true
      for (let id of actionNode.executeConditionIds) {
        const conditionNode = nodeMap.value.get(id) as ConditionNode
        const res = runCode(conditionNode.func)
        if (!res) condition = false
      }
      if (!condition) return
      setTimeout(() => {
        switch (actionNode.actionType) {
          case ActionTypeEnum.ShowImage: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Image) {
              addViewerNodeMap(targetNode.id, targetNode)
            }
            break
          }
          case ActionTypeEnum.HideImage: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Image) {
              removeViewerNodeMap(targetNode.id)
            }
            break
          }
          case ActionTypeEnum.ShowVideo: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Video) {
              addViewerNodeMap(targetNode.id, targetNode)
            }
            break
          }
          case ActionTypeEnum.HideVideo: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Video) {
              removeViewerNodeMap(targetNode.id)
            }
            break
          }
          case ActionTypeEnum.PlayVideo: {
            const videoNodePlayer = videoNodePLayerMap.value.get(actionNode.targetId)
            videoNodePlayer?.play()
            break
          }
          case ActionTypeEnum.StopVideo: {
            const videoNodePlayer = videoNodePLayerMap.value.get(actionNode.targetId)
            videoNodePlayer?.stop()
            break
          }
          case ActionTypeEnum.PlayAudio: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Audio) {
              addViewerNodeMap(targetNode.id, targetNode)
            }
            break
          }
          case ActionTypeEnum.StopAudio: {
            const targetNode = nodeMap.value.get(actionNode.targetId)

            if (targetNode?.nodeType === NodeEnum.Audio) {
              removeViewerNodeMap(targetNode.id)
            }
            break
          }
          case ActionTypeEnum.ShowFilter: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Filter) {
              addViewerNodeMap(targetNode.id, targetNode)
            }
            break
          }
          case ActionTypeEnum.HideFilter: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Filter) {
              removeViewerNodeMap(targetNode.id)
            }
            break
          }
          case ActionTypeEnum.ActiveCurtain: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Curtain) {
              addViewerNodeMap(targetNode.id, targetNode)
            }
            break
          }
          case ActionTypeEnum.Animation: {
            const animateion = actionNode.animation
            executeAnimation(actionNode.targetId, animateion)
            break
          }
          case ActionTypeEnum.Combined: {
            actionNode.actionIds.forEach((childActionNodeId) => {
              doAction(childActionNodeId)
            })
            break
          }
          case ActionTypeEnum.Next: {
            const targetNode = nodeMap.value.get(actionNode.targetId)
            if (targetNode?.nodeType === NodeEnum.Scene) {
              startScene(actionNode.targetId)
            }
            break
          }
          case ActionTypeEnum.Custom: {
            //
            break
          }
        }
      }, +actionNode.delay)
    }
  }

  return {
    curCaptionId,
    curSceneId,
    curDialogueId,
    doAction,
    viewerNodeMap,
    viewerNodeGroups,
    startCaption,
    startDialogue,
    startScene,
    viewerKeys,
    viewerCurtainNodeMap,
    addViewerNodeMap,
    removeViewerNodeMap
  }
}

const res = setup()

export function useGame() {
  return res
}
