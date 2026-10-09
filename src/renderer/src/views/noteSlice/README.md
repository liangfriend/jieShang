# 音符切切（noteSlice）



小游戏视图目录。玩法设计见项目根目录 `doc/游戏功能.md`。



## 页面结构



```

NoteSliceArcadeView.vue / NoteSliceEndlessView.vue   路由页：包裹 GameView + 模式专属结束弹窗

└── NoteSliceGameView.vue                            共用游戏壳：session + 开局倒计时 + emit gameEnd

    ├── NoteSliceStarfield.vue                       背景：Canvas 星空

    ├── NoteSliceGameLayer.vue                       游戏层：SVG 1920×1080，手动 startTick/stopTick

    ├── NoteSliceGameHud.vue                         UI：返回+模式信息 / 分数 / 连击

    └── NoteSliceStartCountdown.vue                  开局 3→2→1→开始!，结束后 startTick



NoteSliceExtremeView.vue                             极限模式占位（暂未接入 GameView）

```



本页**不渲染虚拟键盘**，仅通过 `useNoteSliceMidiInput` 监听物理 MIDI（及全局 `midiStore` 广播）。



## 文件一览



| 文件 | 职责 |

| --- | --- |

| **路由页** | |

| `NoteSliceArcadeView.vue` | 街机路由页，`@game-end` → `NoteSliceArcadeGameOverDialog` |

| `NoteSliceEndlessView.vue` | 无限路由页，`@game-end` → `NoteSliceEndlessGameOverDialog` |

| `NoteSliceExtremeView.vue` | 极限模式占位 |

| **共用视图** | |

| `NoteSliceGameView.vue` | 按 `mode` provide session；倒计时结束后 `startGame` + `startTick`；结束时 emit |

| `NoteSliceGameLayer.vue` | 主循环：生成、生命周期、MIDI 清除、渲染；`defineExpose({ startTick, stopTick })` |

| `NoteSliceGameHud.vue` | 顶栏：左返回+街机倒计时/无限生命，中分数，右连击 |

| `NoteSliceStartCountdown.vue` | 开局 4 步倒计时 overlay |

| `NoteSliceArcadeGameOverDialog.vue` | 街机结束弹窗：分数、再来一局、回首页 |

| `NoteSliceEndlessGameOverDialog.vue` | 无限结束弹窗（布局暂同街机） |

| `NoteSliceBlockContent.vue` | 单个音符块：200×200 白底 rect + 居中 musicScore |

| `NoteSliceSlotClearEffect.vue` | 每格清除斩击特效，`play()` 可重复触发 |

| `NoteSliceSlotExplosionEffect.vue` | 每格炸弹爆炸特效，`play()` 可重复触发 |

| `NoteSliceStarfield.vue` | 星空背景 |

| **生成与数据** | |

| `noteSliceBlockFactory.ts` | 随机 / 指定 midi 生成块，组装 `NoteSliceActiveBlock` |

| `midiBrickBuilder.ts` | 线谱单小节 MusicScore 生成（谱号 + 调号 + 四分音符） |

| `jianpuBrickBuilder.ts` | 简谱单小节 MusicScore 生成（`1=X` 调号 + 拍号 + 数字音符，含八度点 / 升降号） |

| `noteSliceNotationMode.ts` | 本局谱面模式（线谱 / 简谱）绑定与读取，回退 `gameSettings.notationMode` |

| `noteSliceBrickLayout.ts` | 谱面宽高、留白、staff 间距（线谱按调号变宽；简谱固定尺寸） |

| `noteSliceBlockShellLayout.ts` | 固定外壳内 musicScore 等比缩放居中 |

| **布局** | |

| `noteSliceGridLayout.ts` | 5×3 共 15 格，槽位坐标与空位选取 |

| **规则与常量** | |

| `noteSliceGameConstants.ts` | 逻辑坐标、生命周期、外壳等常量 |

| `noteSliceGameMode.ts` | 玩法模式类型、街机/无限常量、倒计时文案 |

| `noteSliceDifficultyConfig.ts` | 四档难度预制参数，读取 `gameSettings` store |

| `noteSliceSpawnClefs.ts` | 谱号 midi 范围、按难度筛选可用谱号 |

| `noteSliceSpawn.ts` | `shouldSpawnByInterval` 按帧概率生成 |

| `noteSliceScoring.ts` | 计分、连击判定（`resolveNoteSliceClearComboState`）、连击倍率 |

| `noteSliceMidiBlacklist.ts` | spawn 范围内排除黑名单 midi 的选取工具；`isNoteSliceMidiRenderable` 按谱面模式判定可生成性 |

| `noteSlicePenaltyBombQueue.ts` | 乱按惩罚炸弹 midi 队列（FIFO、去重） |

| **状态与输入** | |

| `useNoteSliceGameSession.ts` | 分数、连击、批次、黑名单、模式状态（计时/生命/结束） |

| `useNoteSliceMidiInput.ts` | 监听 MIDI note on |

| **持久化（见 `doc/成就.md`）** | |

| `utils/noteSliceHighScoreHelper.ts` | 模式最高分 IPC；结束时按 (mode, difficulty, notation) upsert，线谱 / 简谱分开记录 |

| `utils/achievementHelper.ts` | 成就列表合并、unlock、藏品 `owned` 发奖 |
| `noteSliceSessionAchievementManager.ts` | 局内 peakCombo 记录；结束时判定并 unlock + 发奖 |



## 核心逻辑



### 1. 游戏层坐标



- SVG `viewBox="0 0 1920 1080"`，`preserveAspectRatio="xMidYMid meet"` 适配屏幕。

- 音符块外壳固定 **200×200**，与 `musicScore.width/height` 无关；谱面在壳内缩放居中。



### 2. 模式与生命周期



| 模式 | 路由 | 结束条件 | 炸弹惩罚 | HUD 左侧（返回旁） |

| --- | --- | --- | --- | --- |

| 街机 `arcade` | `/note-slice/arcade` | 60s 倒计时归零 | 扣 **10 分** | `M:SS` 倒计时 |

| 无限 `endless` | `/note-slice/endless` | 生命归零（初始 3） | 扣 **1 命** | 3 颗心 |

| 极限 `extreme` | 首页点击提示「加紧开发中…」 | — | — | — |



**开局流程：** 进入页面 → 全屏倒计时 `3 → 2 → 1 → 开始!`（各 1s）→ `session.startGame()` + `layer.startTick()`。



**结束流程：** 模式条件满足 → `session.endGame(reason)` → layer `stopTick()` → 写最高分 → `evaluateAndUnlock` 成就与藏品 → `NoteSliceGameView` emit `gameEnd` → `NoteSliceGameOverDialog`（含本局新成就滚动列表）。



**再来一局：** 模式页递增 `key` 重挂载 `NoteSliceGameView`，重新走倒计时。



**tick 不在 `onMounted` 自动启动**，须由 `NoteSliceGameView` 在倒计时结束后调用 `startTick()`。



### 3. 网格与生成



- 屏幕划分为 **5 列 × 3 行 = 15 格**。

- 每帧 `requestAnimationFrame`（`isRunning` 为 true 时）：

  1. 更新各块 `ageMs`；

  2. 超过「实心 + 淡出」总时长则移除；

  3. **处理乱按惩罚炸弹队列**（见 §6.1）：在随机 spawn 之前，不占 spawn 冷却；

  4. **`tickModeState`**（街机倒计时）；若已结束则 `stopTick`；

  5. 递减生成冷却；

  6. `shouldSpawnByInterval` 判定是否尝试生成**炸弹**或**普通音符**；

  7. 在**空槽位**中随机选一格 spawn；15 格满则不生成。

- 每次成功生成（含炸弹）后进入 **冷却**（`NOTE_SLICE_SPAWN_COOLDOWN_SECONDS`），冷却内不再生成。



### 4. 音符块生命周期



- `NOTE_SLICE_BLOCK_SOLID_SECONDS`：完全不透明；

- `NOTE_SLICE_BLOCK_FADE_SECONDS`：透明度 1→0；

- 到期自动从 `blocks` 移除（无需飞出屏幕）。



### 5. 生成批次（batch）



- 普通块：进入页面后从 **0** 递增，每生成一块调用 `nextBatch()` 分配 batch。

- 炸弹块：`batch = NOTE_SLICE_BOMB_BATCH`（**-1**），**不调用** `nextBatch()`。

- 用于连击判定，逻辑在 `resolveNoteSliceClearComboState`（`noteSliceScoring.ts`）。



### 5.1 炸弹块（`type: 'bomb'`）



- 独立概率生成：`shouldSpawnByInterval(NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS)`，默认平均 **5s** 尝试一次。

- 切中：爆炸特效 + `onBombCleared()`（街机扣分 / 无限扣命），**不参与** `onBlocksCleared` 计分。

- **midi 黑名单**：炸弹生成后 `addBlacklistedMidi`；消失时 `removeBlacklistedMidi`。



### 6. MIDI 清除



- `isRunning === false` 时（倒计时 / 已结束）忽略 MIDI。

- 若 `blocks` 中**没有**该 midi → **连击清零** + 惩罚炸弹入队（§6.1）；

- 若有匹配块：普通块计分 + 斩击特效；炸弹块爆炸 + `onBombCleared()`。



#### 6.1 乱按惩罚炸弹（防作弊）



- 错按入队；下一帧 tick 开头出队生成指定 midi 炸弹；15 格满则丢弃剩余项。

- 不占 spawn 冷却。



### 7. 计分与连击



- 街机 / 无限模式计分；连击倍率见 `noteSliceScoring.ts`。

- HUD 右侧连击数仅在 **combo ≥ 3** 时显示。



### 8. 游戏难度（首页设置 → localStorage `game.settings`）

难度由 `useGameSettingsStore` 持久化。**进入一局游戏时** `NoteSliceGameView` 在 `onMounted` 中 `init()` 并重绑 `bindNoteSliceGameDifficulty` / `bindNoteSliceSpawnManager`（不能放 setup：再来一局 `:key` 重挂载时旧实例 `onUnmounted` 会晚于新实例 setup，误清新局绑定，极限模式会回退到默认简单难度出全部调号）；clear 时带绑定世代号。生成逻辑通过 `getActiveNoteSliceDifficultyConfig()` 读取本局难度。

| 难度 | MIDI | 谱号 | 变音记号 | 生成间隔 / 冷却 / 炸弹 |
| --- | --- | --- | --- | --- |
| 测试 | 60–61 | 高音 | 全部 | 0.5s / 0.5s / 5s |
| 简单 | 38–83 | 高 + 低 | 无重升重降 | 0.65s / 0.55s / 5.5s |
| 标准 | 38–83 | 高 + 低 + 中 | 全部 | 0.5s / 0.5s / 5s |
| 困难 | 21–108 | 三种 | 全部 | 0.35s / 0.4s / 4s |

各谱号可写音域仍受 `NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES` 约束；随机 midi 时会跳过当前难度下无可用谱号的音高（仅线谱模式）。

### 8.1 谱面模式（首页设置 switch：线谱 / 简谱）

`gameSettings.notationMode`（`'staff' | 'jianpu'`，默认线谱）同样存于 localStorage `game.settings`。**对所有游戏模式（含极限）生效。**

- **绑定**：`NoteSliceGameView` 进入一局时 `bindNoteSliceGameNotationMode(gameSettings.notationMode)`，卸载时清除；生成逻辑通过 `isNoteSliceJianpuMode()` 分流，避免中途改设置影响本局。
- **生成分流**（`noteSliceBlockFactory.buildNoteSliceBlockWithMidi`）：
  - 线谱 → `midiBrickBuilder.generateRandomMidiBrickScore`（谱号 + 调号 + 四分音符），可写性看 `resolveSpawnClefsForMidi`。
  - 简谱 → `jianpuBrickBuilder.generateRandomJianpuBrickScore`：不看谱号，在难度允许的调号中随机选一个，`getOctaveAndSyllable(midi, 升/降优先, key)` 换算首调唱名 / 八度点 / 升降号；升号、降号写法各 50%。
- **可生成判定**（`noteSliceMidiBlacklist.isNoteSliceMidiRenderable`）：简谱模式下 midi 需至少有一个候选调可写；难度 `allowSingleAccidentals = false` 时仅保留该 midi 为自然音级的调（无则跳过该 midi）。简谱没有重升 / 重降写法，`allowDoubleAccidentals` 对简谱无意义。
- **布局**：简谱块尺寸固定（`NOTE_SLICE_JIANPU_BRICK_SCORE_WIDTH/HEIGHT`，130×93），与调号无关；仍由 `resolveNoteSliceScoreShellTransform` 等比缩放进 200×200 外壳。小节内含 `keySignature_f`（渲染为 `1=X`）与 `timeSignature_f`（4/4）。
- **MIDI 范围 / 生成节奏 / 炸弹等其它参数**与线谱共用同一难度配置。
- **最高分**：`finalizeNoteSliceGameScore(mode, score, difficulty, notation)` 按谱面模式分开记录；结算弹窗副标题显示「线谱 · 简单难度」等；成就页按线谱 / 简谱分组展示。成就判定不区分谱面模式。

### 9. 谱号音域参考

| 谱号 | midi 范围 |
| --- | --- |
| 低音 | 38–62 |
| 中音 | 48–72 |
| 高音 | 59–83 |

## 数据流简图



```

NoteSliceArcadeView / NoteSliceEndlessView

  └── NoteSliceGameView(mode)

        provideNoteSliceGameSession(mode)

        倒计时 complete → startGame() + layer.startTick()

        isGameOver → layer.stopTick() → emit('gameEnd')

        └── 模式专属 GameOverDialog



NoteSliceGameLayer.tick()  （isRunning 时）

  ├─ ageMs / 淡出 / 移除

  ├─ processPendingPenaltyBombs()

  ├─ tickModeState()  ◄── 街机 60s

  ├─ trySpawnBomb() / trySpawnBlock()

  └─ clearBlocksByMidi() ← useNoteSliceMidiInput

```



## 依赖



- `@deciphony/renderer`：`musicScoreVue` 渲染谱面

- `@renderer/store/midi.store`：MIDI 设备与消息

- `@renderer/utils/collection/useScoreSkin`：谱面皮肤



## 待实现（见 `doc/游戏功能.md`）

播音线等待办见 `doc/待办.md`。成就埋点、藏品发奖、冰冻/加倍/治疗、极限模式已实现，见 `doc/成就.md`。



---



**不许删注释。**



**任何逻辑更新也要更新文档。**

