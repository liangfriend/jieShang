import {
  ActionTypeEnum,
  CaptionBoxEnum,
  CurtainTypeEnum,
  EditorBoxEnum,
  FilterTypeEnum,
  LayerEnum,
  LayoutPositionEnum,
  NodeEnum,
  ObjectFitEnum
} from '@renderer/enum'
import {
  ActionNode,
  AudioNode,
  CaptionNode,
  ConditionNode,
  CurtainNode,
  CustomNode,
  DialogueNode,
  EditorNode,
  FilterNode,
  ImageNode,
  LayoutNode,
  OptionNode,
  SceneNode,
  StoryNode,
  VideoNode
} from '@renderer/types'

export function storyNodeTemplate(): StoryNode {
  return {
    id: 1,
    nodeName: '故事节点',
    nodeType: NodeEnum.Story,
    width: 1920,
    height: 1680,
    entrySceneId: -1
  }
}

export function sceneNodeTemplate(): SceneNode {
  return {
    id: Date.now(),
    nodeName: '场景节点',
    nodeType: NodeEnum.Scene,
    initImageIds: [],
    initCustomIds: [],
    initAudioIds: [],
    initVideoIds: [],
    initDialogueIds: [],
    initActionIds: [],
    endCurationId: -1
  }
}

export function dialogueNodeTemplate(): DialogueNode {
  return {
    id: Date.now(),
    nodeName: '对话节点',
    nodeType: NodeEnum.Dialogue,
    autoShowFirstCaption: true, // 是否自动展示首字幕
    keepIds: [],
    initImageIds: [],
    initCustomIds: [],
    initAudioIds: [],
    initVideoIds: [],
    initCaptionIds: [],
    initActionIds: []
  }
}

export function optionNodeTemplate(): OptionNode {
  return {
    id: Date.now(),
    nodeName: '选项节点',
    nodeType: NodeEnum.Option,
    text: '',
    activeActionIds: [],
    visibleConditionIds: [],
    normalStyle: `{
    backgroundColor: '#555',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    fontSize: '2rem',
    color: 'white',
    width: '100%',
    height: '50%',
    transform: 'translateY(50%)',
}`,
    hoverStyle: `{
  backgroundColor: '#4096ff',
}`
  }
}

export function captionNodeTemplate(): CaptionNode {
  return {
    id: Date.now(),
    nodeName: '字幕节点',
    nodeType: NodeEnum.Caption,
    content: '',
    autoPlay: true,
    autoNext: true,
    fontSize: 50,
    fontColor: '#ffffff',
    speed: 50,
    boxType: CaptionBoxEnum.Origin,
    audioId: -1,
    autoPlayDelay: 0,
    layoutId: -1,
    initActionIds: [],
    optionIds: [],
    finishActionIds: [],
    doneActionIds: []
  }
}

export function actionNodeTemplate(): ActionNode {
  return {
    id: Date.now(),
    nodeName: '行为节点',
    nodeType: NodeEnum.Action,
    actionType: ActionTypeEnum.Next,
    targetId: -1,
    delay: 0,
    animation: {
      // 动画类型专用
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotate: 0,
      opacity: 1,
      keepFinalState: false,
      transformOrigin: [0, 0],
      duration: 0, // 动画时长
      loop: false
    },
    actionIds: [], // 组合行为专用
    data: null,
    executeConditionIds: [],
    dataChangeFunc: `const data = gameData`
  }
}

export function layoutNodeTemplate(): LayoutNode {
  return {
    id: Date.now(),
    nodeName: '布局节点',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.Background,
    applyPosition: LayoutPositionEnum.LT,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    rotation: 0,
    scale: 1
  }
}

export function curtainNodeTemplate(): CurtainNode {
  return {
    id: Date.now(),
    nodeName: '幕布节点',
    nodeType: NodeEnum.Curtain,
    curtainType: CurtainTypeEnum.FadeInOut,
    anDuration: 2000,
    delay: 0,
    url: '',
    color: '#000'
  }
}

export function imageNodeTemplate(): ImageNode {
  return {
    id: Date.now(),
    nodeName: '图片节点',
    nodeType: NodeEnum.Image,
    layoutId: -1,
    url: '',
    initActionIds: []
  }
}

export function audioNodeTemplate(): AudioNode {
  return {
    id: Date.now(),
    nodeName: '音频节点',
    nodeType: NodeEnum.Audio,
    loop: false,
    url: '',
    initActionIds: []
  }
}

export function videoNodeTemplate(): VideoNode {
  return {
    id: Date.now(),
    nodeName: '视频节点',
    nodeType: NodeEnum.Video,
    layoutId: -1,
    loop: false,
    autoplay: true,
    url: '',
    initActionIds: []
  }
}

export function customNodeTemplate(): CustomNode {
  return {
    id: Date.now(),
    nodeName: '自定义节点',
    nodeType: NodeEnum.Custom,
    layoutId: -1,
    data: '',
    initActionIds: []
  }
}

export function filterNodeTemplate(): FilterNode {
  return {
    id: Date.now(),
    nodeName: '滤镜节点',
    nodeType: NodeEnum.Filter,
    filterType: FilterTypeEnum.Normal
  }
}

export function conditionNodeTemplate(): ConditionNode {
  return {
    id: Date.now(),
    nodeName: '条件节点',
    nodeType: NodeEnum.Condition,
    func: `const storyNode = editorNodeMap.get(1).node
const data = gameData
return true`
  }
}

// 先建立映射表（NodeEnum => 模板函数）
const nodeTemplateFactoryMap = {
  [NodeEnum.Story]: storyNodeTemplate,
  [NodeEnum.Scene]: sceneNodeTemplate,
  [NodeEnum.Dialogue]: dialogueNodeTemplate,
  [NodeEnum.Caption]: captionNodeTemplate,
  [NodeEnum.Action]: actionNodeTemplate,
  [NodeEnum.Layout]: layoutNodeTemplate,
  [NodeEnum.Curtain]: curtainNodeTemplate,
  [NodeEnum.Image]: imageNodeTemplate,
  [NodeEnum.Video]: videoNodeTemplate,
  [NodeEnum.Audio]: audioNodeTemplate,
  [NodeEnum.Custom]: customNodeTemplate,
  [NodeEnum.Option]: optionNodeTemplate,
  [NodeEnum.Filter]: filterNodeTemplate,
  [NodeEnum.Condition]: conditionNodeTemplate
}

export function editorNodeTemplate(nodeType: NodeEnum): EditorNode {
  const createNode = nodeTemplateFactoryMap[nodeType]
  if (!createNode) {
    throw new Error(`未找到节点模板: ${nodeType}`)
  }
  return {
    layout: {
      top: 0,
      left: 0,
      width: 200,
      height: 120
    },
    boxType: EditorBoxEnum.None,
    node: createNode() // ✅ 这里自动生成对应 EngineNode 模板
  }
}
