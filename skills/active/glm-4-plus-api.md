# GLM-4-Plus API 调用

> 分类: api
> Agent: glm
> 标签: glm, zhipu, api, chat
> 创建: 2025-05-19
> 来源: 实践验证

## 什么时候用

需要调用智谱 GLM API 进行对话或代码生成。

## 具体做法

```
POST https://open.bigmodel.cn/api/paas/v4/chat/completions
Authorization: Bearer {GLM_API_KEY}
Content-Type: application/json

{
  "model": "glm-4-plus",
  "messages": [{"role": "user", "content": "..."}],
  "stream": false
}
```

CLI wrapper:

```bash
node bin/glm-chat --prompt "your prompt here"
```

## 注意事项

- API 端点是 `open.bigmodel.cn/api/paas/v4/`
- 默认模型 `glm-4-plus`，也可用 `glm-4-flash` 降低成本
