import { useNodeManager } from '@renderer/composables/useNodeManager'
import {
  ActionNode,
  CaptionNode,
  DialogueNode,
  EditorNode,
  EngineNode,
  OptionNode,
  SceneNode,
  StoryNode
} from '@renderer/types'
import {
  ActionTypeEnum,
  EditorBoxEnum,
  LayerEnum,
  LayoutPositionEnum,
  NodeEnum,
  ObjectFitEnum
} from '@renderer/enum'
const { editorNodeList, nodeMap, editorNodeMap, addNode, groupedNodes, clearNodeManager } =
  useNodeManager()
import { editorNodeTemplate } from '@renderer/utils/nodeTemplate'
// 生成常用节点
export function generateNormalNode() {
  const storyNode = nodeMap.value.get(1) as StoryNode
  //底部字幕布局
  const bottomCaptionLayoutNode = {
    id: 2,
    nodeName: '底部字幕布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LB,
    objectFit: ObjectFitEnum.Fill,
    left: 0.1 * storyNode.width,
    right: 0,
    top: 0,
    bottom: 0.1 * storyNode.width,
    width: 0.8 * storyNode.width,
    height: 0.3 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const bottomCaptionLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  bottomCaptionLayoutNodeE.node = bottomCaptionLayoutNode
  addNode(bottomCaptionLayoutNodeE)

  // 左侧人物布局
  const leftCharacterLayoutNode = {
    id: 3,
    nodeName: '左侧人物布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LB,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0.25 * storyNode.width,
    height: 0.5 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const leftCharacterLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  leftCharacterLayoutNodeE.node = leftCharacterLayoutNode
  addNode(leftCharacterLayoutNodeE)
  // 右侧人物布局
  const rightCharacterLayoutNode = {
    id: 4,
    nodeName: '右侧人物布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.RB,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0.25 * storyNode.width,
    height: 0.5 * storyNode.width,
    rotation: 0,
    scale: 1
  } as EngineNode
  const rightCharacterLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  rightCharacterLayoutNodeE.node = rightCharacterLayoutNode
  addNode(rightCharacterLayoutNodeE)
  // 居中字幕布局
  const centerCaptionLayoutNode = {
    id: 5,
    nodeName: '居中字幕布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.FrontObject,
    applyPosition: LayoutPositionEnum.LT,
    objectFit: ObjectFitEnum.Fill,
    left: 0.3 * storyNode.width,
    right: 0,
    top: 0.3 * storyNode.height,
    bottom: 0,
    width: 0.4 * storyNode.width,
    height: 0.4 * storyNode.height,
    rotation: 0,
    scale: 1
  } as EngineNode
  const centerCaptionLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  centerCaptionLayoutNodeE.node = centerCaptionLayoutNode
  addNode(centerCaptionLayoutNodeE)
  // 全屏背景布局
  const fullScreenLayoutNode = {
    id: 6,
    nodeName: '全屏背景布局',
    nodeType: NodeEnum.Layout,
    layer: LayerEnum.Background,
    applyPosition: LayoutPositionEnum.LT,
    objectFit: ObjectFitEnum.Fill,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: storyNode.width,
    height: storyNode.height,
    rotation: 0,
    scale: 1
  } as EngineNode
  const fullScreenLayoutNodeE = editorNodeTemplate(NodeEnum.Custom)
  fullScreenLayoutNodeE.node = fullScreenLayoutNode
  addNode(fullScreenLayoutNodeE)
  // 爱心滤镜
  const loveFilterNode = {
    id: 7,
    nodeName: '爱心滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `// 清屏（可选）
ctx.clearRect(0, 0, width, height)

const hearts = []
for (let i = 0; i < 20; i++) {
  hearts.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 20 + Math.random() * 30
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)

  hearts.forEach(h => {
    ctx.globalAlpha = 0.3 + Math.random() * 0.7
    ctx.font = \`100px serif\`
    ctx.fillText("💗", h.x, h.y)
  })

  requestAnimationFrame(draw)
}

draw()`,
    filterStyle: `{
    backgroundColor: 'rgba(245,179,193,0.2)',
}`
  } as EngineNode
  const loveFilterNodeNodeE = editorNodeTemplate(NodeEnum.Filter)
  loveFilterNodeNodeE.node = loveFilterNode
  addNode(loveFilterNodeNodeE)
  // 星星滤镜
  const starFilterNode = {
    id: 8,
    nodeName: '星星闪烁滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `
ctx.clearRect(0, 0, width, height)

const stars = []
for (let i = 0; i < 40; i++) {
  stars.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  stars.forEach(s => {
    s.phase += 0.03
    const alpha = 0.5 + Math.sin(s.phase) * 0.5
    ctx.globalAlpha = alpha
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  })
  requestAnimationFrame(draw)
}

draw()
`,
    filterStyle: `{
    backgroundColor: 'rgba(20,20,40,0.3)',
}`
  } as EngineNode
  const starFilterNodeE = editorNodeTemplate(NodeEnum.Filter)
  starFilterNodeE.node = starFilterNode
  addNode(starFilterNodeE)
  // 樱花滤镜
  const sakuraFilterNode = {
    id: 9,
    nodeName: '樱花飘落滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `
ctx.clearRect(0, 0, width, height)

const petals = []
for (let i = 0; i < 25; i++) {
  petals.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 18 + Math.random() * 22,
    speed: 1 + Math.random() * 2,
    drift: Math.random() * 2,
    phase: Math.random() * Math.PI * 2
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  petals.forEach(p => {
    p.y += p.speed
    p.phase += 0.05
    p.x += Math.sin(p.phase) * p.drift

    if (p.y > height + 30) {
      p.y = -20
      p.x = Math.random() * width
    }

    ctx.globalAlpha = 0.7
    ctx.font = p.size + "px serif"
    ctx.fillText("🌸", p.x, p.y)
  })
  requestAnimationFrame(draw)
}

draw()
`,
    filterStyle: `{
    backgroundColor: 'rgba(255,182,193,0.15)',
}`
  } as EngineNode
  const sakuraFilterNodeE = editorNodeTemplate(NodeEnum.Filter)
  sakuraFilterNodeE.node = sakuraFilterNode
  addNode(sakuraFilterNodeE)
  // 雪花滤镜
  const snowFilterNode = {
    id: 10,
    nodeName: '雪花滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `
ctx.clearRect(0, 0, width, height)

const snow = []
for (let i = 0; i < 40; i++) {
  snow.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 10 + Math.random() * 10,
    speed: 0.5 + Math.random() * 1.5
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  snow.forEach(f => {
    f.y += f.speed
    if (f.y > height) {
      f.y = -20
      f.x = Math.random() * width
    }
    ctx.globalAlpha = 0.5 + Math.random() * 0.5
    ctx.font = f.size + "px serif"
    ctx.fillText("❄️", f.x, f.y)
  })
  requestAnimationFrame(draw)
}

draw()
`,
    filterStyle: `{
    backgroundColor: 'rgba(200,220,255,0.15)',
}`
  } as EngineNode
  const snowFilterNodeE = editorNodeTemplate(NodeEnum.Filter)
  snowFilterNodeE.node = snowFilterNode
  addNode(snowFilterNodeE)
  // 泡泡滤镜
  const bubbleFilterNode = {
    id: 11,
    nodeName: '泡泡滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `
ctx.clearRect(0, 0, width, height)

const bubbles = []
for (let i = 0; i < 25; i++) {
  bubbles.push({
    x: Math.random() * width,
    y: height + Math.random() * height,
    size: 10 + Math.random() * 25,
    speed: 0.8 + Math.random() * 1.2,
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  bubbles.forEach(b => {
    b.y -= b.speed
    if (b.y < -20) {
      b.y = height + 20
      b.x = Math.random() * width
    }
    ctx.globalAlpha = 0.3 + Math.random() * 0.4
    ctx.font = b.size + "px serif"
    ctx.fillText("🫧", b.x, b.y)
  })
  requestAnimationFrame(draw)
}

draw()
`,
    filterStyle: `{
    backgroundColor: 'rgba(180,230,255,0.15)',
}`
  } as EngineNode
  const bubbleFilterNodeE = editorNodeTemplate(NodeEnum.Filter)
  bubbleFilterNodeE.node = bubbleFilterNode
  addNode(bubbleFilterNodeE)
  // 光点粒子滤镜
  const lightParticleFilterNode = {
    id: 12,
    nodeName: '光点粒子滤镜',
    nodeType: NodeEnum.Filter,
    filterCanvasScript: `
const pts = []
for (let i = 0; i < 40; i++) {
  pts.push({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2
  })
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  pts.forEach(p => {
    p.phase += 0.02
    const alpha = 0.3 + Math.sin(p.phase) * 0.3
    ctx.globalAlpha = alpha
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  })
  requestAnimationFrame(draw)
}

draw()
`,
    filterStyle: `{
    backgroundColor: 'rgba(100,120,255,0.1)',
}`
  } as EngineNode
  const lightParticleFilterNodeE = editorNodeTemplate(NodeEnum.Filter)
  lightParticleFilterNodeE.node = lightParticleFilterNode
  addNode(lightParticleFilterNodeE)
}
