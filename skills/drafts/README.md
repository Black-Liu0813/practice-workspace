# Draft Queue — 待审技能

Agent 完成任务后，将可复用的经验写入此目录，等待人工确认后移入 `../active/`。

## 半自动流程

```
Agent 完成复杂任务
  → 检测到可复用模式
  → 从 TEMPLATE.md 复制，写入 skills/drafts/{名称}.md
  → 通知人 review

人 review draft
  → 修改完善
  → 移入 skills/active/{名称}.md
  → 从 drafts/ 删除

Agent 下次类似任务
  → 从 skills/active/ 检索匹配的 skill
  → 直接复用
```

## 命名规则

- 用小写 kebab-case: `qwen-flash-api.md`
- 按分类前缀: `{分类}-{描述}.md`
- 分类: api, prompt-pattern, code-template, debug-method, workflow

## Draft 模板

每个 draft 直接从 `../TEMPLATE.md` 复制，填入内容即可。
