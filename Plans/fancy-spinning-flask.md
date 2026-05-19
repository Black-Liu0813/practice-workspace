# Plan: 安装 Agent Orchestrator + 创建 AI Agent 插件

## Context

用户正在构建多 AI 编排系统。当前 workspace 有 3 个简单的 agents（DeepSeek/Qwen/GLM）和简陋的 orchestrator.js。
目标是正确安装 Agent Orchestrator (AO) 并将 3 个 agents 转化为 AO 可管理的 agent 插件。

## Step 1: 清理并全局安装 AO

1. 删除 `orchestrator/` 目录（787MB 源码仓库，不需要）
2. 删除 workspace 根目录的 `agents/` 目录（旧实现）
3. 删除 `orchestrator.js`（旧编排器）
4. 删除 `agents/agent-base.js`（不再需要）
5. 全局安装 AO：`npm install -g @aoagents/ao`

## Step 2: 创建 CLI wrapper 脚本

AO 的 Agent interface 需要通过 `getLaunchCommand` 返回 shell 命令启动 agent。
DeepSeek/Qwen/GLM 是 API-based，需要薄 CLI 包装层。

在 workspace 创建 `bin/` 目录，添加 3 个 CLI wrapper：

- `bin/deepseek-chat` — 接收 prompt 参数，调用 DeepSeek API，输出结果
- `bin/qwen-chat` — 接收 prompt 参数，调用 Qwen API，输出结果
- `bin/glm-chat` — 接收 prompt 参数，调用 GLM API，输出结果

每个 wrapper：
- `#!/usr/bin/env node`，接收 `--prompt` 和 `--model` 参数
- 读取 API key 从环境变量（`DEEPSEEK_API_KEY`, `QWEN_API_KEY`, `GLM_API_KEY`）
- 输出到 stdout（AO 通过 tmux 捕获终端输出做 activity detection）
- `chmod +x` 使其可执行

## Step 3: 在 AO 插件目录创建 agent 插件

AO 的插件发现机制会在 `~/.agent-orchestrator/plugins/` 查找用户自定义插件。
创建 3 个插件：

### 目录结构（每个插件）
```
~/.agent-orchestrator/plugins/agent-{name}/
  package.json
  src/index.ts       → 需要编译为 dist/index.js
  tsconfig.json
```

### 插件实现（参考 Aider 插件模式）

每个插件 `src/index.ts`：
- `manifest`: name, slot: "agent", version
- `create()`: 返回 Agent interface 实现
  - `name` / `processName`: agent 名称
  - `getLaunchCommand`: 返回 `node /path/to/bin/{name}-chat --prompt "..."`
  - `getEnvironment`: 设置 `AO_SESSION_ID` + API key 环境变量
  - `detectActivity`: 解析终端输出（API 调用中=active, 等待输入=waiting_input, 完成=idle）
  - `getActivityState`: 检查进程状态 + JSONL fallback
  - `isProcessRunning`: PID signal-0 检查
  - `getSessionInfo`: 返回 null（API agents 无 session 内省）
  - `detect()`: 检查 CLI wrapper 是否存在

### 核心依赖
插件 import `@aoagents/ao-core` 的类型 — 但这些是纯 TypeScript 类型，插件可以独立编译，不需要 AO 的 dist。

**关键调整**: 由于 AO 的 plugin 系统设计为 workspace 内部包（`workspace:*`），用户自定义插件不能直接 import `@aoagents/ao-core`。
方案：在插件中直接声明 Agent interface 的类型（从 AO 的 types.ts 复制需要的类型），不依赖 core 包。

## Step 4: 配置 AO 使用新 agents

创建 `agent-orchestrator.yaml`：
```yaml
defaults:
  runtime: tmux
  agent: deepseek-chat
  workspace: worktree

projects:
  practice-workspace:
    path: /Users/cyber/Work/Projects/github/practice-workspace
    defaultBranch: main
```

## Step 5: 验证

1. `ao --version` — 确认安装成功
2. `ao start` — 启动 dashboard + orchestrator
3. 在 dashboard 中选择不同 agent 执行任务
4. `node bin/deepseek-chat --prompt "hello"` — CLI wrapper 独立测试

## 修改的文件

| 操作 | 路径 |
|------|------|
| 删除 | `orchestrator/` (整个目录) |
| 删除 | `agents/` (整个目录) |
| 删除 | `orchestrator.js` |
| 新建 | `bin/deepseek-chat` |
| 新建 | `bin/qwen-chat` |
| 新建 | `bin/glm-chat` |
| 新建 | `agent-orchestrator.yaml` |
| 新建 | `~/.agent-orchestrator/plugins/agent-deepseek/` |
| 新建 | `~/.agent-orchestrator/plugins/agent-qwen/` |
| 新建 | `~/.agent-orchestrator/plugins/agent-glm/` |
