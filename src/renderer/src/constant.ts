import {
  ActionTypeEnum,
  CurtainTypeEnum,
  LayerEnum,
  LayoutPositionEnum,
  NodeEnum,
  ObjectFitEnum
} from '@renderer/enum'

export const nodeNameMap = {
  [NodeEnum.Story]: '故事节点',
  [NodeEnum.Scene]: '场景节点',
  [NodeEnum.Dialogue]: '对话节点',
  [NodeEnum.Caption]: '字幕节点',
  [NodeEnum.Option]: '选项节点',
  [NodeEnum.Action]: '行为节点',
  [NodeEnum.Layout]: '布局节点',
  [NodeEnum.Curtain]: '幕布节点',
  [NodeEnum.Image]: '图片节点',
  [NodeEnum.Audio]: '音频节点',
  [NodeEnum.Video]: '视频节点',
  [NodeEnum.Filter]: '滤镜节点',
  [NodeEnum.Custom]: '自定义节点',
  [NodeEnum.Condition]: '条件节点',
  [NodeEnum.Data]: '数据节点'
}

// 行为类型列表
export const actionTypeList: { value: ActionTypeEnum; label: string }[] = [
  { value: ActionTypeEnum.ShowImage, label: '展示图片' },
  { value: ActionTypeEnum.HideImage, label: '隐藏图片' },
  { value: ActionTypeEnum.ShowVideo, label: '展示视频' },
  { value: ActionTypeEnum.HideVideo, label: '隐藏视频' },
  { value: ActionTypeEnum.PlayVideo, label: '播放视频' },
  { value: ActionTypeEnum.StopVideo, label: '停止视频' },
  { value: ActionTypeEnum.PlayAudio, label: '播放音频' },
  { value: ActionTypeEnum.StopAudio, label: '停止音频' },
  { value: ActionTypeEnum.ShowFilter, label: '展示滤镜' },
  { value: ActionTypeEnum.HideFilter, label: '隐藏滤镜' },
  { value: ActionTypeEnum.ActiveCurtain, label: '激活幕布' },
  { value: ActionTypeEnum.Animation, label: '动画' },
  { value: ActionTypeEnum.Combined, label: '组合行为' },
  { value: ActionTypeEnum.Next, label: '跳转到下一个节点' },
  { value: ActionTypeEnum.Custom, label: '自定义行为' },
  { value: ActionTypeEnum.DataChange, label: '数据修改' }
]

// 布局节点坐标应用类型列表
export const layoutPositionTypeList: { value: LayoutPositionEnum; label: string }[] = [
  {
    value: LayoutPositionEnum.LT,
    label: '左上'
  },
  {
    value: LayoutPositionEnum.LB,
    label: '左下'
  },
  {
    value: LayoutPositionEnum.RT,
    label: '右上'
  },
  {
    value: LayoutPositionEnum.RB,
    label: '右下'
  }
]
// 层级列表
export const layerList: { value: LayerEnum; label: string }[] = [
  { value: LayerEnum.Background, label: '背景层' },
  { value: LayerEnum.BehindObject, label: '后景物体层' },
  { value: LayerEnum.Character, label: '角色层' },
  { value: LayerEnum.FrontObject, label: '前景物体层' },
  { value: LayerEnum.Effect, label: '特效层' },
  { value: LayerEnum.Operation, label: 'UI/交互层' },
  { value: LayerEnum.Curtain, label: '幕布层' }
]
// 幕布类型列表
export const curtainList: { value: CurtainTypeEnum; label: string }[] = [
  { value: CurtainTypeEnum.SlideUpInUpOut, label: '上移入/出' },
  { value: CurtainTypeEnum.FadeInOut, label: '渐显/渐隐' },
  { value: CurtainTypeEnum.Door, label: '双开门入/出' }
]

// 图片，视频展示策略列表
export const objectFitList = [
  {
    value: ObjectFitEnum.Fill,
    label: 'Fill'
  },
  {
    value: ObjectFitEnum.Contain,
    label: 'Contain'
  }
]
