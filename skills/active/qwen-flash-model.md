# Qwen Flash API 调用

> 分类: api
> Agent: qwen
> 标签: qwen, api, international, flash
> 创建: 2025-05-19
> 来源: GSD-001 (auth-system spec 实践)

## 什么时候用

需要调用通义千问国际版 API 做快速推理时。

## 具体做法

使用 `dashscope-intl.aliyuncs.com` 端点，模型名 `qwen-flash`：

```bash
# CLI wrapper
node bin/qwen-chat --prompt "your prompt here"
```

或在代码中直接调用：

```
POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
Authorization: Bearer {QWEN_API_KEY}
Content-Type: application/json

{
  "model": "qwen-flash",
  "messages": [{"role": "user", "content": "..."}],
  "stream": false
}
```

## 注意事项

- 国际版域名是 `dashscope-intl.aliyuncs.com`，不是国内版 `dashscope.aliyuncs.com`
- API key 格式与国内版不同，需要单独申请
- `qwen-flash` 是低成本快速模型，适合简单任务，复杂推理考虑 `qwen-plus`
