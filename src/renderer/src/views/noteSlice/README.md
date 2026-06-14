# 音符切切（noteSlice）

小游戏视图目录。玩法设计见项目根目录 `doc/游戏功能.md`。

## 页面结构

```
NoteSliceGameView.vue          入口：三层 stack + provide 游戏 session
├── NoteSliceStarfield.vue     背景：Canvas 星空
├── NoteSliceGameLayer.vue     游戏层：SVG 1920×1080，音符块与清除特效
└── NoteSliceGameHud.vue       UI：左返回 / 中分数 / 右连击（≥3 连击才显示）
```

本页**不渲染虚拟键盘**，仅通过 `useNoteSliceMidiInput` 监听物理 MIDI（及全局 `midiStore` 广播）。

## 文件一览

| 文件 | 职责 |
| --- | --- |
| **视图** | |
| `NoteSliceGameView.vue` | 页面入口，初始化 `provideNoteSliceGameSession` |
| `NoteSliceGameLayer.vue` | 主循环：生成、生命周期、MIDI 清除、渲染 |
| `NoteSliceGameHud.vue` | 顶栏分数与连击 |
| `NoteSliceBlockContent.vue` | 单个音符块：200×200 白底 rect + 居中 musicScore |
| `NoteSliceSlotClearEffect.vue` | 每格清除斩击特效，`play()` 可重复触发 |
| `NoteSliceSlotExplosionEffect.vue` | 每格炸弹爆炸特效，`play()` 可重复触发 |
| `NoteSliceStarfield.vue` | 星空背景 |
| **生成与数据** | |
| `noteSliceBlockFactory.ts` | 随机 / 指定 midi 生成块，组装 `NoteSliceActiveBlock` |
| `midiBrickBuilder.ts` | 单小节 MusicScore 生成（谱号 + 调号 + 四分音符） |
| `noteSliceBrickLayout.ts` | 谱面宽高、留白、staff 间距 |
| `noteSliceBlockShellLayout.ts` | 固定外壳内 musicScore 等比缩放居中 |
| **布局** | |
| `noteSliceGridLayout.ts` | 5×3 共 15 格，槽位坐标与空位选取 |
| **规则与常量** | |
| `noteSliceGameConstants.ts` | 逻辑坐标、生成/生命周期/外壳/测试模式等常量 |
| `noteSliceSpawn.ts` | `shouldSpawnByInterval` 按帧概率生成 |
| `noteSliceScoring.ts` | 计分、连击判定（`resolveNoteSliceClearComboState`）、连击倍率 |
| `noteSliceMidiBlacklist.ts` | spawn 范围内排除黑名单 midi 的选取工具 |
| `noteSlicePenaltyBombQueue.ts` | 乱按惩罚炸弹 midi 队列（FIFO、去重） |
| **状态与输入** | |
| `useNoteSliceGameSession.ts` | 分数、连击、批次 counter、midi 黑名单，provide/inject |
| `useNoteSliceMidiInput.ts` | 监听 MIDI note on |

## 核心逻辑

### 1. 游戏层坐标

- SVG `viewBox="0 0 1920 1080"`，`preserveAspectRatio="xMidYMid meet"` 适配屏幕。
- 音符块外壳固定 **200×200**，与 `musicScore.width/height` 无关；谱面在壳内缩放居中。

### 2. 网格与生成

- 屏幕划分为 **5 列 × 3 行 = 15 格**。
- 每帧 `requestAnimationFrame`：
  1. 更新各块 `ageMs`；
  2. 超过「实心 + 淡出」总时长则移除；
  3. **处理乱按惩罚炸弹队列**（见 §5.1）：在随机 spawn 之前，不占 spawn 冷却；
  4. 递减生成冷却；
  5. `shouldSpawnByInterval` 判定是否尝试生成**炸弹**（`NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS`，默认 5s）或**普通音符**（`NOTE_SLICE_SPAWN_AVG_SECONDS`）；
  6. 在**空槽位**中随机选一格 spawn；15 格满则不生成。
- 每次成功生成（含炸弹）后进入 **冷却**（`NOTE_SLICE_SPAWN_COOLDOWN_SECONDS`），冷却内不再生成。

### 3. 音符块生命周期

- `NOTE_SLICE_BLOCK_SOLID_SECONDS`：完全不透明；
- `NOTE_SLICE_BLOCK_FADE_SECONDS`：透明度 1→0；
- 到期自动从 `blocks` 移除（无需飞出屏幕）。

### 4. 生成批次（batch）

- 普通块：进入页面后从 **0** 递增，每生成一块调用 `nextBatch()` 分配 batch。
- 炸弹块：`batch = NOTE_SLICE_BOMB_BATCH`（**-1**），**不调用** `nextBatch()`，不影响下一个普通块的批次序号。
- 用于连击判定，逻辑在 `resolveNoteSliceClearComboState`（`noteSliceScoring.ts`）。

### 4.1 炸弹块（`type: 'bomb'`）

- 独立概率生成：`shouldSpawnByInterval(NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS)`，默认平均 **5s** 尝试一次。
- 外观：`NoteSliceBlockContent` 额外红色光晕（`note-slice-block__bomb-glow`）。
- 切中（MIDI 匹配）：播放 `NoteSliceSlotExplosionEffect`，**不参与** `onBlocksCleared` 计分（扣分/扣命待模式系统实现）。
- 与普通块共用生成冷却与 15 格占位规则。
- **midi 黑名单**：炸弹生成后立即 `addBlacklistedMidi`；炸弹被切掉或超时消失时 `removeBlacklistedMidi`。黑名单中的 midi **不会**出现在后续普通块/炸弹的随机生成中。炸弹生成时 additionally 排除屏上已有块的 midi。

### 5. MIDI 清除

- `useNoteSliceMidiInput` 收到 note on → `clearBlocksByMidi(midi)`。
- 若 `blocks` 中**没有**该 midi 的音符块 → **连击清零**（`resetCombo`），并将该 midi **入队**惩罚炸弹（见 §5.1）；不清除、不计分；
- 若有匹配块：从 `blocks` 移除；
  - **普通块**：`onBlocksCleared` 计分 + `NoteSliceSlotClearEffect.play()`；
  - **炸弹块**：`NoteSliceSlotExplosionEffect.play()`，不计分。

#### 5.1 乱按惩罚炸弹（防作弊）

- 错按时不立即 spawn，而是 `penaltyBombQueue.enqueue(midi)`（**FIFO**，同 midi **去重**）。
- 下一帧 tick **开头**（过期块移除后、随机 spawn 之前）调用 `processPendingPenaltyBombs()`：
  - 逐个出队，有空槽则用 `buildNoteSliceBlockWithMidi(..., { type: 'bomb' })` 生成**指定 midi** 的炸弹；
  - **15 格已满**时本帧不再生成，队列剩余项直接丢弃（不下帧重试）；midi 已在屏上则跳过；
  - **不占用** `spawnCooldownMs`，避免与随机普通块抢冷却或同帧时序错乱。
- 同一帧内连续错按多个不同 midi → 队列保留多个，本帧尽量全部生成（受空槽数量限制）。
- 若 midi 超出 spawn 范围或无法渲染谱面，仅连击清零，不入队。

### 6. 计分与连击

- 当前无和弦：`noteCount = 1`，每块基础 **1 分**；一次按键可清除多块，基础分累加。
- **连击判定**（`resolveNoteSliceClearComboState`）：
  1. 先算「连击所需批次」= `lastClearedBatch + 1`（首次清除前 `lastClearedBatch` 为 `null`，无所需批次）；
  2. 若本次参与评分的块中**含有**该批次 → `combo + 1`，`lastClearedBatch` 记为该连击批次（非简单取 max）；
  3. 否则 `combo` 归零；更新 `lastClearedBatch` 时，仅一块则记其批次，多块则取**最大**批次。
- **连击倍率**（`resolveNoteSliceComboMultiplier`）：
  - combo &lt; 3：×1；
  - 第 3 连击 ×2，第 4 ×4 … 第 10 ×256，之后封顶 ×256。
- 得分 = `基础分 × 连击倍率`。
- HUD 右侧连击数仅在 **combo ≥ 3** 时显示。

**示例**：`lastClearedBatch = 5` 时，连击所需批次为 6。一次清掉 batch 6 与 8 → 含 6，连击 +1，`lastClearedBatch = 6`。若只清 batch 7、8 → 不含 6，连击归零，`lastClearedBatch = 8`。

### 7. 生成约束（正常模式）

| 谱号 | midi 范围 |
| --- | --- |
| 低音 | 38–62 |
| 中音 | 48–72 |
| 高音 | 59–83 |

总 midi 范围 38–83；随机 midi 后只从**可用谱号**中随机。

### 8. 测试模式

`noteSliceGameConstants.ts` 中 `NOTE_SLICE_TEST_MODE = true` 时：

- 仅生成 **高音谱号**；
- midi 范围由 `NOTE_SLICE_TEST_SPAWN_MIDI_MIN/MAX` 控制（便于 MIDI 调试）。

## 数据流简图

```
NoteSliceGameView
  provideNoteSliceGameSession()  ──inject──► NoteSliceGameLayer / NoteSliceGameHud
                        │
                        ├─ nextBatch()        ◄── spawn 时分配 batch
                        └─ onBlocksCleared()  ◄── MIDI 清除后计分

NoteSliceGameLayer.tick()
  ├─ ageMs / 淡出 / 移除
  ├─ processPendingPenaltyBombs()  ◄── 乱按惩罚炸弹（先于随机 spawn）
  ├─ trySpawnBomb() / trySpawnBlock()
  └─ clearBlocksByMidi() ← useNoteSliceMidiInput（异步入队，下帧处理）
```

## 依赖

- `deciphony-renderer`：`musicScoreVue` 渲染谱面
- `@renderer/dr-extensions/scoreUtil`：`getAllNoteRegion` 等（经 `midiBrickBuilder`）
- `@renderer/store/midi.store`：MIDI 设备与消息
- `@renderer/utils/collection/useScoreSkin`：谱面皮肤

## 待实现（见 `doc/游戏功能.md`）

播音线、炸弹扣分/扣命、冰冻/加倍/治疗、三种模式、成就等。

---

**不许删注释。**

**任何逻辑更新也要更新文档。**
