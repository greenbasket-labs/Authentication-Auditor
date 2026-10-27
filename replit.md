# Authentication Auditor

A local-first workbench and CLI for reviewing authentication-related JavaScript, TypeScript, and Python source code. It produces redacted static-analysis leads and remediation notes; it does not execute source or test live targets.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/authentication-auditor run dev` — run the Authentication Auditor web app
- `pnpm --filter @workspace/authentication-auditor run typecheck` — typecheck the app and analyzer
- `pnpm --filter @workspace/authentication-auditor run test` — run local analyzer tests
- `pnpm --filter @workspace/authentication-auditor run auth-auditor -- --help` — show CLI usage
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The auditor does not require secrets or a database.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/authentication-auditor/src/App.tsx` — browser workbench
- `artifacts/authentication-auditor/src/lib/audit-engine.ts` — shared static rules, redaction, and report generation
- `artifacts/authentication-auditor/src/cli.ts` — read-only local repository CLI
- `artifacts/authentication-auditor/src/lib/demo-fixtures.ts` — synthetic demo and validation samples
- `artifacts/authentication-auditor/tests/` — local analyzer regression tests

## Architecture decisions

- Browser analysis runs against selected source in memory; it makes no API calls and does not persist source or reports.
- Browser and CLI use the same deterministic scanner rules. The CLI never follows symbolic links and skips dependency/build folders.
- Static matches remain review leads with separate confidence and severity; the tool does not mark findings confirmed.
- Live-target testing is intentionally not part of this app.

## Product

- Review selected source files or folders and inventory authentication-related code references.
- Filter findings, inspect redacted evidence and remediation guidance, and export JSON or Markdown reports.
- Run local synthetic checks through the CLI or the built-in demo source.

## User preferences

_No additional preferences recorded._

## Gotchas

- The CLI uses Node.js 24's built-in TypeScript stripping; it has no runtime package dependencies.
- The analyzer uses bounded text-pattern checks, not full parsing or cross-file data-flow analysis. A clean scan is not a security guarantee.
- Evidence redaction is pattern-based; review exported reports before sharing them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
