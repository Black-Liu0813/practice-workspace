# Auth System

> 状态: draft
> GSD: `gsd/GSD-001-auth.md`
> Owner: TBD
> 创建: 2025-05-17

## Overview

实现用户身份认证系统，支持邮箱登录、OAuth 和会话管理。

## Goals

- Email login
- OAuth login (GitHub)
- Session management via JWT

## Requirements

### R1: Email Registration & Login

用户可以用邮箱+密码注册和登录。密码必须 bcrypt hash 存储。

### R2: JWT Authentication

- Access token: 15min 有效期
- Refresh token: 7 天有效期
- 存储: HttpOnly cookie

### R3: Role Support

用户角色: admin, member, guest。角色存储在 JWT payload。

## Non Goals

- SSO
- Enterprise auth (SAML/LDAP)
- MFA（后续 GSD 覆盖）

## API

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/oauth/github
```

## Decisions

### D1: JWT vs Server Session

Use JWT instead of server session.

Reason:
- stateless
- scalable

See also: `gsd/GSD-001-auth.md` D1

## Tasks

- [ ] Create auth service
- [ ] Create JWT middleware
- [ ] Add OAuth login
- [ ] Add tests

## Acceptance

- [ ] 所有 requirements 满足
- [ ] `pnpm build` 通过
- [ ] CI green
