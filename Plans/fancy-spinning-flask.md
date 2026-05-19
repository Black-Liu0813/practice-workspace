# Plan: GitHub PR/CI/Review 工程基础补齐

## Context

当前项目是 AI agent 编排系统（PAI + AO），多个 agent 会并行提交代码。需要补齐 GitHub PR/CI/Review 基础设施，作为所有 agent 代码提交的工程事实源。

## 创建文件

### 1. `.github/PULL_REQUEST_TEMPLATE.md` — PR 模板

Agent 提交 PR 时自动填充，确保每个 PR 包含：
- 变更类型（feat/fix/refactor）
- 关联的 spec/GSD 编号
- 测试验证方式
- Agent 签名（哪个 agent 做的）

### 2. `CODEOWNERS` — 代码所有权

定义哪些目录由谁 review：
- `bin/` → CLI wrappers
- `plugins/` → agent 插件
- `.github/` → CI/CD
- 默认 → 项目负责人

### 3. `.github/workflows/review.yml` — Review 自动化

PR 创建时自动：
- 添加标签（基于文件路径）
- 跑 build 验证（CI 已有，这里补充 PR-specific 检查）

### 4. `.github/ISSUE_TEMPLATE/` — Issue 模板

- `bug_report.md` — bug 报告
- `feature_request.md` — 功能请求（关联 GSD/spec）

## 修改文件

| 操作 | 路径 |
|------|------|
| 新建 | `.github/PULL_REQUEST_TEMPLATE.md` |
| 新建 | `CODEOWNERS` |
| 新建 | `.github/ISSUE_TEMPLATE/bug_report.md` |
| 新建 | `.github/ISSUE_TEMPLATE/feature_request.md` |

## 验证

- 创建测试 PR 验证模板生效
- `CODEOWNERS` 在 PR 上自动 request review
- Issue 模板在 GitHub UI 可选
