https://github.com/battysh/batty

https://github.com/hesamsheikh/octogent

Framework ： 以 Better-T-Stack 为主，cherry-pick next-forge&create-t3-turbo；不要反过来。

manual code generator：
Drizzle/Prisma/ZenStack
Zod
oRPC
Hono
TanStack Query
shadcn
Plop / Hygen / ts-morph

需求 / 会议 / 客户输入
  ↓
Spec Draft Agent
  ↓
HTML Planning Artifact
  ↓
人选择/修改/确认
  ↓
YAML / Markdown / Gherkin Spec
  ↓
Codegen
  ↓
Coding Agent Patch
  ↓
Auto Test
  ↓
HTML Test Evidence Artifact
  ↓
Review Agent
  ↓
HTML PR Review Artifact
  ↓
Human Review
  ↓
CI/CD
  ↓
Excel / PDF / HTML Delivery Package

Runtime Layer:
- Next.js
- Hono/oRPC
- Better Auth
- Drizzle/PostgreSQL
- Agent runtime

Spec Layer:
- entity spec
- screen spec
- workflow spec
- policy spec
- test spec

Generation Layer:
- DB generator
- API generator
- UI generator
- test generator
- Excel generator
- Agent tool generator

Automation Layer:
- Trigger.dev/Temporal
- CI/CD
- Playwright
- Vitest
- ESLint/Biome
- Typecheck
- Review Agent

Delivery Layer:
- Excel 設計書
- API 仕様書
- 試験仕様書
- 試験結果
- 変更履歴
- evidence package