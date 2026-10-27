# Authentication Auditor

A local-first tool for reviewing authentication-related JavaScript, TypeScript, and Python source. It combines a browser workbench with a read-only command-line scanner.

## Safety and privacy

- Browser analysis runs in the current tab. Selected source is not uploaded, persisted, or executed.
- The CLI reads source files only. It does not modify the selected repository.
- Reports include redacted evidence and relative file locations.
- The tool does not accept URLs, make network requests, use credentials, or run live tests.
- Findings are static review leads. They are not confirmed vulnerabilities, and a clean scan does not prove that an application is secure.

The analyzer is intentionally deterministic and local. Its checks are text-pattern rules, not a complete parser or data-flow engine. Framework wrappers, split configuration, generated code, comments, and custom authentication flows may create false positives or missed findings. Review every result in context.

## Browser workbench

Choose source files or a source folder, then select **Run local analysis**. Supported extensions are `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`, and `.py`.

The workbench supports:

- Authentication-related route and control inventory.
- Static checks for explicit cookie weaknesses, script-readable token storage, suspicious JWT handling, weak reset-token generation, token logging, common credential defaults, development bypass patterns, distinct login errors, request-controlled redirects, and session IDs in URLs.
- Search and severity/status filters.
- Finding details with redacted evidence, expected behavior, remediation, regression-test ideas, and limitations.
- Markdown and JSON report downloads.
- An opt-in synthetic demo containing both secure examples and intentionally weak examples.

Selection is limited to 500 files and 8 MB of source. No results are retained after the tab is closed or cleared.

## Command line

The CLI requires Node.js 24 or newer and pnpm in this workspace. It reads only JavaScript, TypeScript, and Python source, skips common dependency/build folders and symbolic links, and defaults to writing reports to standard output.

From the workspace root in PowerShell:

```powershell
pnpm --filter @workspace/authentication-auditor run auth-auditor -- --help
pnpm --filter @workspace/authentication-auditor run auth-auditor -- analyze .\path\to\repository --format markdown
pnpm --filter @workspace/authentication-auditor run auth-auditor -- inventory .\path\to\repository --format json
pnpm --filter @workspace/authentication-auditor run auth-auditor -- validate
```

To save a report, provide `--output .\audit-report.md` or a JSON filename. The CLI creates a new file and refuses to overwrite an existing one.

`analyze` returns exit code `2` when findings need review, `0` when no rules matched, and `1` for usage or read errors. `inventory` returns `0` after a successful inventory. `validate` runs local synthetic checks only; it does not contact a target.

## Checks and limitations

Run the type check and local unit tests with:

```powershell
pnpm --filter @workspace/authentication-auditor run typecheck
pnpm --filter @workspace/authentication-auditor run test
```

The rule set does not prove authentication enforcement across every route, assess deployed cookie behavior, validate an account-recovery flow, or confirm session invalidation. It does not scan Git history, inspect dependencies, or perform dynamic testing. MFA and rate-limiting references are inventoried but not assessed as confirmed controls.
