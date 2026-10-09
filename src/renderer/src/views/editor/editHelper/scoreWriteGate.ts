import type { VDom } from '@deciphony/renderer'
import { ref, toRaw } from 'vue'

/** 源数据写入防抖。预览走 updateVDom(targetId, patch)，不进这个等待。 */
export const SCORE_WRITE_DEBOUNCE_MS = 100

/**
 * updateVDom 原地改节点时 vDomList（shallowRef）不会变；
 * 把手 computed 依赖此 epoch，才能在属性栏重置对齐等 mirror 后重算位置。
 */
export const vDomMirrorEpoch = ref(0)

/** musicScore.expose.updateVDom：按 targetId 原地 assign，不换节点引用 */
export type UpdateVDomFn = (targetId: string, patch: Partial<VDom>) => boolean

export type ScoreVDomMirror = {
  targetId: string
  patch: Partial<VDom>
}

export type ScorePatch = {
  /** 同一 key 只保留最后一次 commit */
  key: string
  commit: () => void
  /** 立刻 updateVDom(targetId, patch) */
  mirror?: ScoreVDomMirror
  /** 默认 100ms；结构变更用 0，立刻写入 */
  delay?: number
}

export type ScoreWriteGate = {
  patch: (spec: ScorePatch) => void
  flush: () => void
}

type GateInternal = ScoreWriteGate & {
  setGetUpdateVDom: (fn: () => UpdateVDomFn | undefined) => void
  setGetVDomList: (fn: () => VDom[] | undefined) => void
  getVDomList: () => VDom[] | undefined
  /** 整谱渲染后冻结的几何基准（updateVDom 不改这份） */
  baselineList: VDom[] | undefined
  setBaselineList: (list: VDom[]) => void
}

/** 只拷贝补丁需要的几何，避免与 live 节点共享引用 */
function cloneVDomBaseline(list: VDom[]): VDom[] {
  return list.map((node) => ({
    ...node,
    startPoint: { x: node.startPoint.x, y: node.startPoint.y },
    endPoint: { x: node.endPoint.x, y: node.endPoint.y },
    special: node.special ? { ...node.special } : {},
  }))
}

export function createScoreWriteGate(
  getUpdateVDom: () => UpdateVDomFn | undefined,
  getVDomList: () => VDom[] | undefined = () => undefined
): GateInternal {
  let updateGetter = getUpdateVDom
  let listGetter = getVDomList
  let baselineList: VDom[] | undefined
  const pending = new Map<string, () => void>()
  let timer: ReturnType<typeof setTimeout> | null = null

  function flush() {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
    if (!pending.size) return
    const jobs = [...pending.values()]
    pending.clear()
    for (const job of jobs) job()
  }

  function patch(spec: ScorePatch) {
    if (spec.mirror) {
      updateGetter()?.(spec.mirror.targetId, spec.mirror.patch)
      vDomMirrorEpoch.value++
    }
    const delay = spec.delay ?? SCORE_WRITE_DEBOUNCE_MS
    if (delay <= 0) {
      pending.delete(spec.key)
      spec.commit()
      return
    }
    pending.set(spec.key, spec.commit)
    if (timer != null) clearTimeout(timer)
    timer = setTimeout(flush, delay)
  }

  return {
    patch,
    flush,
    setGetUpdateVDom(fn) {
      updateGetter = fn
    },
    setGetVDomList(fn) {
      listGetter = fn
    },
    getVDomList() {
      return listGetter()
    },
    get baselineList() {
      return baselineList
    },
    setBaselineList(list: VDom[]) {
      baselineList = cloneVDomBaseline(list)
    },
  }
}

const gates = new WeakMap<object, GateInternal>()

/** 响应式代理和 raw 是两个引用，属性栏与 useRenderEdit 必须落到同一扇门 */
function recall(score: object): GateInternal | undefined {
  return gates.get(score) ?? gates.get(toRaw(score))
}

function remember(score: object, gate: GateInternal) {
  gates.set(score, gate)
  const raw = toRaw(score)
  if (raw !== score) gates.set(raw, gate)
}

/**
 * 每个 musicScore 一份门。
 * 传入 getter 时刷新绑定（useRenderEdit 挂载时）；属性栏可只传 musicScore。
 */
export function scoreWriteGateFor(
  musicScore: object,
  getUpdateVDom?: () => UpdateVDomFn | undefined,
  getVDomList?: () => VDom[] | undefined
): ScoreWriteGate {
  let gate = recall(musicScore)
  if (!gate) {
    gate = createScoreWriteGate(
      getUpdateVDom ?? (() => undefined),
      getVDomList ?? (() => undefined)
    )
  } else {
    if (getUpdateVDom) gate.setGetUpdateVDom(getUpdateVDom)
    if (getVDomList) gate.setGetVDomList(getVDomList)
  }
  remember(musicScore, gate)
  return gate
}

export function flushScoreWrites(musicScore: object) {
  recall(musicScore)?.flush()
}

/** 当前屏上的 vDom（与 renderMusicScore 回调同一批对象） */
export function scoreVDomList(musicScore: object): VDom[] {
  return recall(musicScore)?.getVDomList() ?? []
}

/**
 * 整谱 musicScoreToVDom 完成后调用：冻结几何基准。
 * 预览补丁必须相对这份基准，不能相对已被 updateVDom 改过的 live 节点。
 */
export function captureScoreVDomBaseline(musicScore: object, list: VDom[]) {
  let gate = recall(musicScore)
  if (!gate) {
    gate = createScoreWriteGate(() => undefined, () => list)
    remember(musicScore, gate)
  }
  gate.setBaselineList(list)
}

/**
 * 取整谱渲染基准节点（拖拽/滑块预览用）。
 * 优先 baseline；尚未 capture 时回退 live（仅首帧）。
 */
export function findScoreVDom(musicScore: object, targetId: string): VDom | undefined {
  const gate = recall(musicScore)
  if (!gate) return undefined
  const fromBaseline = gate.baselineList?.find((node) => node.targetId === targetId)
  if (fromBaseline) return fromBaseline
  return gate.getVDomList()?.find((node) => node.targetId === targetId)
}

/** 当前屏上的 live 节点（已被 updateVDom 改过）；同一 targetId 取最后一笔（全局层在行层之后） */
export function findLiveScoreVDom(musicScore: object, targetId: string): VDom | undefined {
  const list = recall(musicScore)?.getVDomList()
  if (!list) return undefined
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i]?.targetId === targetId) return list[i]
  }
  return undefined
}

/** 平移补丁：相对「整谱渲染时」的节点几何 + 总位移（勿用增量叠在 live 上） */
export function shiftVDomPatch(
  node: VDom,
  dx: number,
  dy: number
): Partial<VDom> {
  if (dx === 0 && dy === 0) return {}
  return {
    x: node.x + dx,
    y: node.y + dy,
    startPoint: { x: node.startPoint.x + dx, y: node.startPoint.y + dy },
    endPoint: { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
  }
}

/** Frame relative 总位移 → 绝对几何补丁（node 须为整谱渲染时的节点） */
export function frameShiftVDomPatch(
  node: VDom,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): Partial<VDom> {
  const shiftEnds =
    node.tag === 'noteBeam' || node.special?.slur != null || node.tag === 'bend'
  const patch: Partial<VDom> = {
    x: node.x + dx,
    y: node.y + dy,
    w: node.w + dw,
    h: node.h + dh
  }
  if (shiftEnds) {
    patch.startPoint = { x: node.startPoint.x + dx, y: node.startPoint.y + dy }
    patch.endPoint = { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
  }
  return patch
}

/** @deprecated 旧版整表 map；请用 UpdateVDomFn + Partial patch */
export type ScoreVDomUpdater = (vDom: VDom[]) => VDom[]
