# Agent notes — jieShang

## 数据库改动必须加 migration（软件已上线）

软件已上线，用户本地已有数据库。**任何数据库改动都必须在 `src/main/database/migrations.ts` 追加新的 migration**，包括：

- 表结构：建表、加/改/删列、索引（`Model.sync()` 不会给已有表补列，用 `sequelize.getQueryInterface()`）。
- 内置数据内容更新：乐谱皮肤（`resources/scoreSkins`）、钢琴/演奏皮肤、音色、内置和弦等。

规则：

1. **只追加，不改已发布的 migration**：已执行过的 id 记录在用户库 `migration` 表里，改旧 migration 不会再跑。
2. id 按 `NNN-描述` 递增（如 `002-update-builtin-score-skins`）。
3. `up` 要同时兼容老库和全新安装（全新安装时内置藏品由启动时的 `syncBuiltinCollections` 插入，migration 执行时行可能还不存在）。
4. `down` 能回滚就回滚；数据覆盖类无法还原的，写空实现并注明原因。

## 编辑 / drEdit 能力边界

涉及乐谱编辑（小节属性、音符属性、增删结构等）时：

1. **先确认** `@deciphony/extensions` 的 `dr-edit`（及 renderer 数据模型）是否已有对应 API / 字段 / 工厂方法。
2. **若不确定是否支持，或确认不支持：不要改 jieShang 业务代码去硬接或绕过**；直接通知维护者（用户）去补 drEdit / 模型，补齐后再回来接 UI。
3. 仅在已有明确可调用的 drEdit / score-builder / 模型字段时，才在 jieShang 写属性栏与调用层。

## @deciphony/number-notation-omr（图片转简谱）

- 源码在同级 `../number-notation-omr`（不在 `../deciphony/packages` 下），走私有 registry 安装，不走 Vite alias，`dev:local` 也读 `node_modules`。
- 只在主进程用（`src/main/services/omrService.ts`，worker_threads）；必须保持 externalize，不能打进 main bundle，否则找不到 `dist/worker.cjs`。
- 改识别逻辑：在 OMR 仓库发版，再在本仓库 bump 版本；同样禁止改 `node_modules/@deciphony/number-notation-omr`。

## @deciphony 本地包：开发 alias / 打包走私有 npm

日常开发（尤其 `npm run dev:local`）通过 Vite `--mode deciphony` 把 `@deciphony/*` **alias 到本机源码**，**不依赖** `node_modules` 里已发布的包内容。

| 项 | 说明 |
|---|---|
| 本地源码根 | 与本仓库同级：`../deciphony/packages/` |
| 开关 | `electron.vite.config.ts` 中 `mode === 'deciphony'` |
| 脚本 | `dev:local` → `electron-vite dev --mode deciphony` |
| 打包 / 默认 `dev` | 走 `node_modules` 中私有 registry（`localhost:4873`）已发布版本 |

本地映射的包（见 `electron.vite.config.ts` 的 `LOCAL_PACKAGE_ENTRY`）：

- `@deciphony/renderer` → `deciphony-renderer/src`
- `@deciphony/player` → `deciphony-player/src`
- `@deciphony/tune-judge` → `deciphony-tune-judge/src`
- `@deciphony/work` → `deciphony-work/src`
- `@deciphony/finger` → `deciphony-finger/src`
- `@deciphony/pitch-detection` → `deciphony-pitch-detection/src`
- `@deciphony/puff` → `deciphony-puff/src`
- `@deciphony/cl-sheet` → `deciphony-cl-sheet/src`（和弦弹唱谱；样式 `@deciphony/cl-sheet/dist/cl-sheet.css` 在本地模式下指向空占位，由 SFC 注入）
- `@deciphony/extensions`（含子路径）→ `deciphony-extensions/src`

### 硬性约束（禁止）

1. **禁止修改** `node_modules/@deciphony/**` 来“补 API / 修 bug / 加功能”。开发时运行时读的是 alias 源码，改 `node_modules` 无效或会被重装覆盖，且会误导后续维护。
2. 若 API 在本地库已有、但 `node_modules` 类型还旧：以 **本地包源码**（`../deciphony/packages/...`）为准；需要发布时再在对应包仓库发版并更新本仓库 `package.json` 依赖。
3. 改 `@deciphony/*` 行为时，改 **deciphony 本地包源码**，不要在 jieShang 里对 `node_modules` 打补丁。

### 正确做法

```text
✅ 改 ../deciphony/packages/deciphony-tune-judge/src/...
✅ jieShang 只写业务调用；用 dev:local 联调
✅ 发版：在包仓库 publish → 本仓库 bump @deciphony/* 版本

❌ 编辑 node_modules/@deciphony/tune-judge/dist/...
❌ 用 patch-package / 手改 tgz 冒充“已加 API”
```
