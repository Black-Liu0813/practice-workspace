# GSD-001: User Authentication

> 状态: active
> 优先级: P1
> 创建: 2025-05-17
> 更新: 2025-05-19

## Goal（目标）

让用户能安全地注册、登录和管理会话。

## Context（背景）

系统需要身份认证来保护 API 和用户数据。所有后续功能（权限、协作）都依赖认证基础。

## Scenarios（场景）

### S1: Email Login

**Given** 用户已注册
**When** 用邮箱和密码登录
**Then** 获得 JWT access token + refresh token

### S2: OAuth Login

**Given** 用户有第三方账号
**When** 通过 OAuth provider 授权
**Then** 自动创建/关联账号，获得 token

### S3: Session Refresh

**Given** access token 过期
**When** 用 refresh token 请求刷新
**Then** 获得新的 access token，无需重新登录

## Decisions（决策）

### D1: JWT vs Server Session

**选择:** JWT
**替代方案:** Server-side session (Redis)
**原因:** 无状态、易扩展、适合微服务

### D2: JWT vs PASETO

**选择:** JWT
**替代方案:** PASETO
**原因:** 生态成熟、库支持广泛、团队熟悉

## Success Criteria（验收标准）

- [ ] Email 注册 + 登录流程跑通
- [ ] OAuth (GitHub) 登录跑通
- [ ] Token 刷新正常工作
- [ ] rate limiting 防暴力破解

## Linked Specs

| Spec | 路径 | 状态 |
|------|------|------|
| auth-system | `specs/auth-system/spec.md` | draft |

## Notes

这是第一个 GSD，作为模板参考。后续 GSD 应从 TEMPLATE.md 复制创建。
