# GSD → Spec Index

> GSD 定义"为什么做"，Spec 定义"做什么"。
> 每个 GSD 可以关联多个 Spec。每个 Spec 必须关联一个 GSD。

## 如何新增

1. 从 `gsd/TEMPLATE.md` 复制创建 GSD
2. 从 `specs/TEMPLATE/` 复制创建 Spec
3. 在 GSD 的 `Linked Specs` 填入 Spec 路径
4. 在 Spec 的头部 `GSD:` 填入 GSD 路径
5. 更新本索引

## 当前 GSD

| GSD | 标题 | 优先级 | 状态 | Specs |
|-----|------|--------|------|-------|
| [GSD-001](gsd/GSD-001-auth.md) | User Authentication | P1 | active | [auth-system](specs/auth-system/spec.md) |

## Spec 状态汇总

| Spec | GSD | Owner | 状态 |
|------|-----|-------|------|
| [auth-system](specs/auth-system/spec.md) | GSD-001 | TBD | draft |

---

Last updated: 2025-05-19
