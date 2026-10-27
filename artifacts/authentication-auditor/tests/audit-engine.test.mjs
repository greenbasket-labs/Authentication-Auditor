import assert from "node:assert/strict";
import test from "node:test";

import { analyzeFiles, toJsonReport, toMarkdownReport } from "../src/lib/audit-engine.ts";
import { demoFiles, safeValidationFiles } from "../src/lib/demo-fixtures.ts";

test("detects seeded authentication review leads in synthetic demo source", () => {
  const result = analyzeFiles(demoFiles);
  const ruleIds = new Set(result.findings.map((finding) => finding.ruleId));

  for (const expected of [
    "AUTH-COOKIE-001",
    "AUTH-COOKIE-002",
    "AUTH-COOKIE-003",
    "AUTH-JWT-001",
    "AUTH-RESET-001",
    "AUTH-RESET-002",
    "AUTH-TOKEN-001",
  ]) {
    assert.ok(ruleIds.has(expected), `Expected ${expected} to be detected`);
  }
  assert.ok(result.inventory.length > 0);
  assert.ok(result.findings.every((finding) => finding.status !== "confirmed"));
});

test("does not flag the matching secure synthetic fixture", () => {
  const result = analyzeFiles(safeValidationFiles);
  assert.deepEqual(result.findings, []);
});

test("redacts token-like literals from evidence and report exports", () => {
  const result = analyzeFiles([
    {
      name: "src/auth/recovery.ts",
      content: [
        'localStorage.setItem("accessToken", "browser-secret-sentinel");',
        'console.log("reset token: reset-secret-sentinel");',
      ].join("\n"),
    },
  ]);
  const report = `${toJsonReport(result)}\n${toMarkdownReport(result)}`;

  assert.match(report, /\[REDACTED\]/);
  assert.doesNotMatch(report, /browser-secret-sentinel/);
  assert.doesNotMatch(report, /reset-secret-sentinel/);
});

test("finding identifiers are stable for the same source location", () => {
  const source = [
    {
      name: "src/auth/session.ts",
      content: 'res.cookie("session", value, { httpOnly: false });',
    },
  ];
  assert.equal(
    analyzeFiles(source).findings[0]?.id,
    analyzeFiles(source).findings[0]?.id,
  );
});

test("rejects unsupported source extensions", () => {
  assert.throws(
    () => analyzeFiles([{ name: "notes.txt", content: "login" }]),
    /Unsupported source file/,
  );
});
