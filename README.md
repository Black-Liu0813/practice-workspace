# Practice Workspace

> 多 AI Agent 编排工作台 — 操作与维护指南

---

## 目录

1. [项目概览](#1-项目概览)
2. [环境准备](#2-环境准备)
3. [项目结构](#3-项目结构)
4. [Agent 插件](#4-agent-插件)
5. [Agent Orchestrator (AO)](#5-agent-orchestrator-ao)
6. [GSD 规格体系](#6-gsd-规格体系)
7. [Spec 功能规格](#7-spec-功能规格)
8. [GitHub PR/CI/Review](#8-github-prcireview)
9. [技能沉淀](#9-技能沉淀)
10. [日常操作速查](#10-日常操作速查)
11. [故障排除](#11-故障排除)

---

## 1. 项目概览

本项目是一个多 AI Agent 编排工作台，核心架构：

```
PAI 定方向 → GSD 固化规格 → Spec-Kitty 管规格
  → AO 编排执行 → Agent 分工交付
  → GitHub PR/CI 做工程事实源
  → 技能沉淀供复用
```

**Agent 池**: DeepSeek / Qwen / GLM — 通过 CLI wrapper 封装为 AO 插件

---

## 2. 环境准备

### 前置依赖

| 依赖 | 版本 | 安装 |
|------|------|------|
| Node.js | 22+ | `nvm install 22` |
| pnpm | 10.26.2 | `corepack enable` |
| tmux | latest | `brew install tmux` |
| gh CLI | latest | `brew install gh` |
| git | 2.25+ | 系统自带 |

### 安装 AO

```bash
pnpm add -g @aoagents/ao
```

### 配置 API Key

编辑项目根目录 `.env`：

```
DEEPSEEK_API_KEY=sk-xxx
QWEN_API_KEY=sk-xxx
GLM_API_KEY=xxx.yyy
```

> **安全提醒**: `.env` 已加入 `.gitignore`，不会提交到仓库。如果 API key 已经泄露，立即到对应平台轮换。

### 安装依赖并构建

```bash
pnpm install
pnpm build
```

### 验证

```bash
# 验证 AO
ao --version

# 验证三个 agent
pnpm test:api
```

---

## 3. 项目结构

```
practice-workspace/
├── agent-orchestrator.yaml   # AO 编排配置
├── .env                       # API keys（不入库）
├── package.json               # 构建脚本
├── CODEOWNERS                 # 代码所有权
│
├── bin/                       # Agent CLI wrappers
│   ├── deepseek-chat          #   DeepSeek API
│   ├── qwen-chat              #   Qwen 国际版 API
│   └── glm-chat               #   GLM API
│
├── plugins/                   # AO agent 插件
│   ├── agent-deepseek/        #   src/ → tsc → dist/
│   ├── agent-qwen/
│   └── agent-glm/
│
├── gsd/                       # GSD 规格文档（为什么做）
│   ├── TEMPLATE.md
│   └── GSD-001-auth.md
│
├── specs/                     # 功能规格（做什么）
│   ├── TEMPLATE/
│   └── auth-system/
│
├── skills/                    # 技能沉淀
│   ├── TEMPLATE.md
│   ├── active/                #   已入库
│   └── drafts/                #   待审核
│
├── docs/                      # 文档
│   ├── GSD-SPEC-INDEX.md      #   GSD↔Spec 索引
│   └── SKILLS-INDEX.md        #   技能索引
│
└── .github/                   # GitHub 配置
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   ├── feature_request.md
    │   └── agent_task.md
    └── workflows/
        └── ci.yml
```

---

## 4. Agent 插件

### 三个 Agent

| Agent | CLI Wrapper | API 端点 | 默认模型 |
|-------|-------------|----------|----------|
| DeepSeek | `bin/deepseek-chat` | `api.deepseek.com` | `deepseek-chat` |
| Qwen | `bin/qwen-chat` | `dashscope-intl.aliyuncs.com` | `qwen-flash` |
| GLM | `bin/glm-chat` | `open.bigmodel.cn` | `glm-4-plus` |

### 直接调用 CLI

```bash
node bin/deepseek-chat --prompt "解释这段代码的作用"
node bin/qwen-chat --prompt "写一个 express 中间件" --model qwen-plus
node bin/glm-chat --prompt "refactor 这个函数"
```

### 自定义 API 端点

通过环境变量覆盖：

```bash
DEEPSEEK_API_HOST=your-proxy.com node bin/deepseek-chat --prompt "test"
QWEN_API_HOST=your-proxy.com node bin/qwen-chat --prompt "test"
GLM_API_HOST=your-proxy.com node bin/glm-chat --prompt "test"
```

### 添加新 Agent

1. 在 `bin/` 创建 CLI wrapper（复制现有文件，改端点和默认模型）
2. 在 `plugins/` 创建插件（复制 `agent-deepseek/`，改 manifest 和 BIN_PATH）
3. 编译: `pnpm build`
4. 在 `agent-orchestrator.yaml` 的 `plugins:` 注册
5. 在 `.env` 添加 API key
6. 测试: `node bin/{name}-chat --prompt "hello"`

---

## 5. Agent Orchestrator (AO)

### 启动

```bash
# 在项目目录
ao start
```

浏览器打开 `http://localhost:3000` 查看 dashboard。

### 配置文件

`agent-orchestrator.yaml` 关键字段：

```yaml
defaults:
  runtime: tmux           # 运行时：tmux | process
  agent: deepseek         # 默认 agent
  workspace: worktree     # 隔离方式：worktree | clone

plugins:
  - name: deepseek
    source: local
    path: ./plugins/agent-deepseek
    enabled: true

projects:
  practice-workspace:
    path: /Users/cyber/.../practice-workspace
    agentConfig:
      permissions: permissionless  # agent 权限模式
```

### Reactions（自动化反馈）

在 `agent-orchestrator.yaml` 添加：

```yaml
reactions:
  ci-failed:
    auto: true
    action: send-to-agent    # CI 失败自动发回 agent
    retries: 2
  changes-requested:
    auto: true
    action: send-to-agent    # review 意见自动发回 agent
  approved-and-green:
    auto: false
    action: notify           # 审过+CI绿 通知你 merge
```

### 常用命令

```bash
ao --version           # 版本
ao start               # 启动 dashboard + orchestrator
ao stop                # 停止所有 sessions
ao config-help         # 查看完整配置参考
```

---

## 6. GSD 规格体系

GSD = **G**oal / **S**cenario / **D**ecision — 定义"为什么要做"。

### 新建 GSD

1. 从 `gsd/TEMPLATE.md` 复制
2. 重命名: `gsd/GSD-{编号}-{名称}.md`
3. 填写 Goal、Scenarios、Decisions、Success Criteria
4. 关联 Spec: 在 `Linked Specs` 表格填入路径

### GSD 状态流转

```
draft → active → completed
                → abandoned
```

### 索引

所有 GSD 和 Spec 的关系记录在 `docs/GSD-SPEC-INDEX.md`。

---

## 7. Spec 功能规格

Spec 定义"做什么"，每个 Spec 必须关联一个 GSD。

### 新建 Spec

1. 从 `specs/TEMPLATE/` 复制整个目录
2. 重命名目录: `specs/{spec-name}/`
3. 编辑 `spec.md` — 填写需求、API、决策、任务
4. 编辑 `decisions.md` — 记录技术决策
5. 编辑 `tasks.md` — 任务清单
6. 在关联的 GSD 的 `Linked Specs` 表格添加条目
7. 更新 `docs/GSD-SPEC-INDEX.md`

### Spec 状态流转

```
draft → in-progress → review → done
```

---

## 8. GitHub PR/CI/Review

### 创建 PR

在 GitHub 创建 PR 时会自动加载 `.github/PULL_REQUEST_TEMPLATE.md`，包含：
- 变更类型（feat/fix/refactor）
- 关联 Spec/GSD
- 验证方式
- Agent 签名

### CODEOWNERS

`CODEOWNERS` 文件按目录分配 review 权限：
- `bin/` — CLI wrappers
- `plugins/` — agent 插件
- `.github/` — CI/CD
- `*` — 默认项目负责人

### Issue 模板

GitHub 创建 Issue 时可选：
- **Bug Report** — `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature Request** — `.github/ISSUE_TEMPLATE/feature_request.md`
- **Agent Task** — `.github/ISSUE_TEMPLATE/agent_task.md`（给 agent 分配任务）

### CI

`.github/workflows/ci.yml` 在 push 和 PR 时自动运行：
- `pnpm install`
- `pnpm build`（编译所有插件）

---

## 9. 技能沉淀

### 半自动流程

```
Agent 完成复杂任务
  → 检测可复用模式
  → 从 skills/TEMPLATE.md 复制写入 skills/drafts/
  → 通知人 review

人 review
  → 修改完善
  → 移入 skills/active/
  → 删除 draft

Agent 下次类似任务
  → 从 skills/active/ 检索匹配技能
  → 直接复用
```

### 添加技能

1. 从 `skills/TEMPLATE.md` 复制
2. 填写: 分类、Agent、标签、适用场景、具体做法
3. 放入 `skills/drafts/` 等待 review
4. 审核通过后移入 `skills/active/`
5. 更新 `docs/SKILLS-INDEX.md`

### 技能分类

| 分类 | 说明 |
|------|------|
| `api` | API 调用方法和端点 |
| `prompt-pattern` | 高效 prompt 模板 |
| `code-template` | 可复用代码骨架 |
| `debug-method` | 调试和排错方法 |
| `workflow` | 工作流程和操作步骤 |

---

## 10. 日常操作速查

```bash
# 安装 & 构建
pnpm install
pnpm build

# 验证 agent
pnpm test:api

# 启动 AO
ao start

# 清理编译产物
pnpm clean

# 直接调 agent
node bin/deepseek-chat --prompt "你的问题"
node bin/qwen-chat --prompt "你的问题"
node bin/glm-chat --prompt "你的问题"
```

---

## 11. 故障排除

### Agent 调用失败

| 错误 | 原因 | 解决 |
|------|------|------|
| `DEEPSEEK_API_KEY environment variable is required` | .env 缺少 key | 在 `.env` 填入 API key |
| `Incorrect API key provided` | key 无效 | 检查 key 是否正确，Qwen 注意国际版/国内版 |
| `Request failed: ECONNREFUSED` | 网络问题 | 检查代理或 VPN |
| `API Error: model not found` | 模型名错误 | 用 `--model` 指定正确模型名 |

### AO 启动失败

| 错误 | 解决 |
|------|------|
| `ao: command not found` | `pnpm add -g @aoagents/ao` |
| 插件加载失败 | 确认 `pnpm build` 已执行，`dist/` 存在 |
| tmux 报错 | `brew install tmux` |

### CI 失败

| 错误 | 解决 |
|------|------|
| `pnpm build` 失败 | 本地 `pnpm build` 先验证 |
| TypeScript 编译错误 | 检查插件 `src/index.ts` 语法 |
