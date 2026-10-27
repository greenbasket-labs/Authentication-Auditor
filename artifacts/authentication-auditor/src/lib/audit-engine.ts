export type SourceFile = {
  name: string;
  content: string;
};

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AuditConfidence = "high" | "medium" | "low";
export type AuditStatus = "likely" | "needs_human_review";

export type AuditFinding = {
  id: string;
  ruleId: string;
  title: string;
  category: string;
  severity: AuditSeverity;
  confidence: AuditConfidence;
  status: AuditStatus;
  file: string;
  line: number;
  summary: string;
  evidence: string;
  expectedBehavior: string;
  remediation: string;
  regressionTest: string;
  limitations: string;
};

export type InventoryItem = {
  label: string;
  category: string;
  file: string;
  line: number;
  detail: string;
};

export type AuditResult = {
  findings: AuditFinding[];
  inventory: InventoryItem[];
  summary: {
    filesScanned: number;
    authFiles: number;
    findings: number;
    completedAt: string;
  };
};

export const MAX_SOURCE_FILES = 500;
export const MAX_TOTAL_SOURCE_CHARACTERS = 8_000_000;
export const MAX_TOTAL_SOURCE_BYTES = 8_000_000;

type Rule = {
  id: string;
  title: string;
  category: string;
  severity: AuditSeverity;
  confidence: AuditConfidence;
  status: AuditStatus;
  summary: string;
  expectedBehavior: string;
  remediation: string;
  regressionTest: string;
  limitations: string;
  matches: (line: string, context: string) => boolean;
};

const rules: Rule[] = [
  {
    id: "AUTH-COOKIE-001",
    title: "HttpOnly is explicitly disabled",
    category: "Sessions & cookies",
    severity: "medium",
    confidence: "high",
    status: "likely",
    summary:
      "A cookie-related setting explicitly disables HttpOnly. If this is an authentication cookie, browser scripts may be able to read it.",
    expectedBehavior:
      "Authentication cookies should normally be inaccessible to client-side scripts.",
    remediation:
      "Enable HttpOnly for authentication cookies. Confirm the affected cookie is not intentionally used by client-side code.",
    regressionTest:
      "Add a configuration test that verifies authentication cookies are issued with HttpOnly enabled.",
    limitations:
      "The scanner cannot determine whether this is an authentication cookie, a test fixture, or an overridden value.",
    matches: (line, context) =>
      /\bhttpOnly\s*[:=]\s*false\b/i.test(line) &&
      /\b(cookie|session|auth|token)\b/i.test(context),
  },
  {
    id: "AUTH-COOKIE-002",
    title: "Secure is explicitly disabled for a cookie",
    category: "Sessions & cookies",
    severity: "medium",
    confidence: "high",
    status: "likely",
    summary:
      "A cookie-related setting explicitly disables Secure. Review whether the cookie can be sent over an unencrypted connection.",
    expectedBehavior:
      "Production authentication cookies should be restricted to secure transport.",
    remediation:
      "Enable Secure in production and make environment-specific behavior explicit. Verify the proxy and application agree about HTTPS.",
    regressionTest:
      "Assert that production authentication cookies include the Secure attribute.",
    limitations:
      "This may be a local development setting; the scan does not evaluate deployment configuration or transport.",
    matches: (line, context) =>
      /\bsecure\s*[:=]\s*false\b/i.test(line) &&
      /\b(cookie|session|auth|token)\b/i.test(context),
  },
  {
    id: "AUTH-COOKIE-003",
    title: "SameSite=None appears without Secure",
    category: "Sessions & cookies",
    severity: "medium",
    confidence: "medium",
    status: "needs_human_review",
    summary:
      "The nearby cookie configuration uses SameSite=None but no Secure=true setting was found in the inspected context.",
    expectedBehavior:
      "Cross-site cookies should use the required Secure setting and have a documented reason to allow cross-site delivery.",
    remediation:
      "Review the complete cookie configuration, enable Secure where appropriate, and restrict cross-site use to the flows that require it.",
    regressionTest:
      "Test the final Set-Cookie attributes in the deployed HTTPS configuration.",
    limitations:
      "Configuration may be split across files, helpers, or environment-specific branches.",
    matches: (line, context) =>
      /sameSite\s*[:=]\s*["']none["']/i.test(line) &&
      !/secure\s*[:=]\s*true/i.test(context),
  },
  {
    id: "AUTH-TOKEN-001",
    title: "Authentication token stored in browser storage",
    category: "Token handling",
    severity: "medium",
    confidence: "high",
    status: "likely",
    summary:
      "A token-like value is written to localStorage or sessionStorage, where same-origin scripts can access it.",
    expectedBehavior:
      "Choose token storage with the application's XSS and session threat model in mind; avoid exposing long-lived credentials to scripts where possible.",
    remediation:
      "Review whether the value is a credential and whether an HttpOnly cookie or short-lived token design is more appropriate. Address XSS risks independently.",
    regressionTest:
      "Add a test that verifies credentials are not persisted in script-readable storage unless this is an intentional, documented decision.",
    limitations:
      "The scanner cannot tell whether the stored value is a real credential, a short-lived test value, or non-sensitive data.",
    matches: (line, context) =>
      /\b(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|set)\s*\(/i.test(
        line,
      ) && /\b(?:access.?token|refresh.?token|auth.?token|jwt|token)\b/i.test(context),
  },
  {
    id: "AUTH-JWT-001",
    title: "JWT decode used without nearby verification",
    category: "JWT & tokens",
    severity: "medium",
    confidence: "low",
    status: "needs_human_review",
    summary:
      "A JWT decode helper appears in this code context, but a verification call was not found nearby.",
    expectedBehavior:
      "Treat token claims as untrusted until the token's signature and required claims have been verified.",
    remediation:
      "Trace how this value is used. For authorization decisions, use the framework's verification API and validate required issuer, audience, and time claims.",
    regressionTest:
      "Add tests that reject invalid signatures, expired tokens, and tokens with incorrect required claims.",
    limitations:
      "Verification may happen in another function or service. Decoding alone is not a vulnerability if the result is not trusted.",
    matches: (line, context) =>
      /\b(?:jwt|jsonwebtoken)\s*\.\s*decode\s*\(/i.test(line) &&
      !/\b(?:jwt|jsonwebtoken)\s*\.\s*verify\s*\(/i.test(context),
  },
  {
    id: "AUTH-JWT-002",
    title: "JWT validation appears weakened",
    category: "JWT & tokens",
    severity: "high",
    confidence: "high",
    status: "likely",
    summary:
      "The code appears to allow the unsigned none algorithm or to ignore a JWT time-validation check.",
    expectedBehavior:
      "JWT verification should use an explicit, trusted algorithm and enforce relevant expiration and not-before constraints.",
    remediation:
      "Remove the weakened verification option. Set an explicit algorithm allowlist and enforce time claims in the verifier.",
    regressionTest:
      "Add negative tests for unsigned tokens, expired tokens, and not-yet-valid tokens using the actual verification configuration.",
    limitations:
      "The scanner identifies a configuration pattern, not whether an attacker can reach or exploit this verifier.",
    matches: (line, context) =>
      /(?:algorithms?\s*:\s*\[\s*["']none["']|ignoreExpiration\s*:\s*true|ignoreNotBefore\s*:\s*true)/i.test(
        line,
      ) && /\b(jwt|token|verify|jsonwebtoken)\b/i.test(context),
  },
  {
    id: "AUTH-RESET-001",
    title: "Predictable randomness in a reset-token flow",
    category: "Password recovery",
    severity: "high",
    confidence: "medium",
    status: "needs_human_review",
    summary:
      "A password-reset or recovery context uses a non-cryptographic random source.",
    expectedBehavior:
      "Recovery tokens should be generated with a cryptographically secure random source and have a short, enforced lifetime.",
    remediation:
      "Use the platform's cryptographic random generator for reset tokens. Store only a verifier where practical, expire tokens, and make them single-use.",
    regressionTest:
      "Test that tokens are single-use and expire, and inspect the generator to confirm it uses a cryptographically secure source.",
    limitations:
      "The context match is heuristic; the random value may be unrelated to the reset token.",
    matches: (line, context) =>
      /\b(?:Math\s*\.\s*random\s*\(\s*\)|random\s*\.\s*random\s*\(\s*\)|randint\s*\()/i.test(
        line,
      ) && /\b(reset|recover|password|token)\b/i.test(context),
  },
  {
    id: "AUTH-RESET-002",
    title: "Recovery token may be written to logs",
    category: "Password recovery",
    severity: "high",
    confidence: "medium",
    status: "needs_human_review",
    summary:
      "A reset-token-like value and a logging call appear together. Confirm that sensitive recovery data is not emitted.",
    expectedBehavior:
      "Logs should not contain password-reset tokens, passwords, session identifiers, or other usable credentials.",
    remediation:
      "Remove the sensitive value from the log call. Log a non-sensitive event identifier instead.",
    regressionTest:
      "Capture application logs during a synthetic recovery flow and assert that the token is absent.",
    limitations:
      "The scanner redacts the displayed evidence, but it cannot prove the runtime log output or whether the value is synthetic.",
    matches: (line, context) =>
      /\b(?:console\.(?:log|info|debug)|logger\.(?:info|debug|warn)|logging\.(?:info|debug|warning))\s*\(/i.test(
        line,
      ) && /\b(?:reset.?token|recovery.?token|password.?token)\b/i.test(context),
  },
  {
    id: "AUTH-CREDENTIAL-001",
    title: "Common credential literal in authentication code",
    category: "Login & credentials",
    severity: "high",
    confidence: "medium",
    status: "needs_human_review",
    summary:
      "An authentication-related assignment contains a common placeholder or default credential literal.",
    expectedBehavior:
      "Authentication credentials should not be embedded in source code or used as defaults.",
    remediation:
      "Remove the literal, rotate it if it was ever used, and load secrets through a secure runtime secret store. Do not commit real credentials.",
    regressionTest:
      "Add a secret-scanning check to the repository and verify the application refuses to start without required credentials.",
    limitations:
      "Common values are sometimes present in documentation or fixtures. The literal is redacted in evidence and is never copied to reports.",
    matches: (line, context) =>
      /\b(?:password|passwd|secret|api[_-]?key|client[_-]?secret)\b\s*[:=]\s*["'](?:admin|password|changeme|change-me|123456|secret|default|test)["']/i.test(
        line,
      ) && /\b(auth|login|credential|password|secret|token)\b/i.test(context),
  },
  {
    id: "AUTH-DEV-001",
    title: "Authentication may be bypassed in a development branch",
    category: "Authentication enforcement",
    severity: "medium",
    confidence: "low",
    status: "needs_human_review",
    summary:
      "A development-mode condition and an authentication bypass-like return appear close together.",
    expectedBehavior:
      "Development shortcuts should not grant access in production or be reachable through production configuration.",
    remediation:
      "Trace the full control flow and deployment configuration. Prefer isolated test fixtures over request-time authentication bypasses.",
    regressionTest:
      "Add a production-mode test proving protected routes still require authentication when environment variables are misconfigured.",
    limitations:
      "A development branch may be isolated and unreachable in production; the scanner does not evaluate deployment settings.",
    matches: (line, context) =>
      /(?:NODE_ENV|FLASK_ENV|environment|debug)\s*={2,3}\s*["'](?:development|test)["']/i.test(
        line,
      ) && /\b(?:skipAuth|bypassAuth|disableAuth|return\s+true|allowAnonymous)\b/i.test(context),
  },
  {
    id: "AUTH-ENUM-001",
    title: "Distinct login failure messages may reveal account state",
    category: "Login & credentials",
    severity: "low",
    confidence: "low",
    status: "needs_human_review",
    summary:
      "This file contains separate messages for a missing user and an incorrect password.",
    expectedBehavior:
      "Unauthenticated responses should avoid revealing whether an account exists unless there is a documented reason.",
    remediation:
      "Review externally visible status codes, response bodies, and timing. Consider returning a consistent generic failure message.",
    regressionTest:
      "Compare responses for a nonexistent synthetic account and an incorrect password for a test account.",
    limitations:
      "The strings may be internal-only, used in tests, or never returned to unauthenticated clients.",
    matches: () => false,
  },
  {
    id: "AUTH-REDIRECT-001",
    title: "Redirect destination may come directly from request input",
    category: "Authentication flows",
    severity: "medium",
    confidence: "low",
    status: "needs_human_review",
    summary:
      "A redirect call appears to use a request query or body value directly. Review whether the destination is allowlisted.",
    expectedBehavior:
      "Post-login and recovery redirects should be restricted to safe, intended destinations.",
    remediation:
      "Validate redirect destinations against a strict same-origin or explicit allowlist policy before redirecting.",
    regressionTest:
      "Test that an external redirect destination is rejected while approved internal destinations still work.",
    limitations:
      "Validation may have occurred earlier or be enforced by a framework helper not visible in this line.",
    matches: (line) =>
      /\b(?:res|response)\s*\.\s*redirect\s*\(\s*(?:req(?:uest)?\.(?:query|body|params)|request\.(?:query_params|form))\b/i.test(
        line,
      ),
  },
  {
    id: "AUTH-SESSION-001",
    title: "Session identifier may be placed in a URL",
    category: "Sessions & cookies",
    severity: "medium",
    confidence: "low",
    status: "needs_human_review",
    summary:
      "A session-like parameter appears in a URL or query string, which can expose it through browser history or request metadata.",
    expectedBehavior:
      "Session identifiers should not be transported in URLs.",
    remediation:
      "Use a secure cookie or another session mechanism that does not place identifiers in URLs.",
    regressionTest:
      "Verify authenticated navigation and redirects do not include session identifiers in their URLs.",
    limitations:
      "The value may be a non-secret synthetic identifier; confirm its purpose and whether it grants access.",
    matches: (line, context) =>
      /(?:[?&](?:session|sid|sessionid)=|["'](?:session|sid|sessionid)["']\s*:)/i.test(
        line,
      ) && /\b(session|auth|login|cookie)\b/i.test(context),
  },
];

const inventoryDetectors: Array<{
  label: string;
  category: string;
  detail: string;
  pattern: RegExp;
}> = [
  {
    label: "Login or authentication route",
    category: "Authentication enforcement",
    detail: "Route or handler name suggests a login or authentication entry point.",
    pattern:
      /\b(?:app|router|server|bp|blueprint)\s*\.\s*(?:get|post|put|patch|route)\s*\([^)]*(?:login|signin|sign-in|authenticate|auth\/)/i,
  },
  {
    label: "Authentication guard or middleware",
    category: "Authentication enforcement",
    detail: "Authentication guard, middleware, or framework strategy reference.",
    pattern:
      /\b(?:requireAuth|authenticate|isAuthenticated|authMiddleware|verifyToken|passport\.authenticate|login_required|jwt_required)\b/i,
  },
  {
    label: "Session handling",
    category: "Sessions & cookies",
    detail: "Session creation, access, renewal, or invalidation reference.",
    pattern: /\b(?:session|regenerate|destroySession|invalidateSession)\b/i,
  },
  {
    label: "Cookie configuration",
    category: "Sessions & cookies",
    detail: "Cookie API or cookie security attribute reference.",
    pattern: /\b(?:setCookie|cookie|cookies|httpOnly|sameSite|secure)\b/i,
  },
  {
    label: "Password recovery",
    category: "Password recovery",
    detail: "Password-reset or account-recovery reference.",
    pattern: /\b(?:password.?reset|reset.?password|forgot.?password|recover.?account)\b/i,
  },
  {
    label: "Multi-factor authentication",
    category: "MFA",
    detail: "MFA enrollment, verification, or recovery reference.",
    pattern: /\b(?:mfa|2fa|totp|authenticator|one.?time.?password|webauthn)\b/i,
  },
  {
    label: "JWT or token validation",
    category: "JWT & tokens",
    detail: "Token creation, decoding, verification, or refresh reference.",
    pattern: /\b(?:jwt|jsonwebtoken|access.?token|refresh.?token|verifyToken)\b/i,
  },
  {
    label: "Rate-limiting control",
    category: "Abuse controls",
    detail: "Rate limiter or attempt-throttling reference.",
    pattern: /\b(?:rate.?limit|slowDown|throttle|login.?attempt)\b/i,
  },
];

const supportedExtension = /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts|py)$/i;

function normalizeName(name: string): string {
  return name.replace(/\\/g, "/").replace(/^\/+/, "").slice(0, 500);
}

function redactEvidence(value: string): string {
  return value
    .replace(
      /\b(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi,
      "$1[REDACTED]",
    )
    .replace(
      /((?:access[_-]?token|refresh[_-]?token|reset[_-]?token|recovery[_-]?token|token|jwt|api[_-]?key|client[_-]?secret|password|passwd|secret|cookie|session[_-]?id|authorization)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|`[^`]*`|[^,\s;]+)/gi,
      "$1[REDACTED]",
    )
    .replace(
      /(["'](?:access[_-]?token|refresh[_-]?token|reset[_-]?token|recovery[_-]?token|token|jwt|api[_-]?key|client[_-]?secret|password|passwd|secret|cookie|session[_-]?id|authorization)["']\s*:\s*)(?:"[^"]*"|'[^']*'|`[^`]*`|[^,\s;]+)/gi,
      "$1[REDACTED]",
    )
    .replace(
      /((?:setItem|set)\s*\(\s*["'][^"']*(?:token|secret|password|key)[^"']*["']\s*,\s*)(?:"[^"]*"|'[^']*'|`[^`]*`)/gi,
      "$1[REDACTED]",
    )
    .replace(
      /((?:setCookie|cookie)\s*\(\s*["'][^"']*(?:session|token|auth)[^"']*["']\s*,\s*)(?:"[^"]*"|'[^']*'|`[^`]*`)/gi,
      "$1[REDACTED]",
    )
    .replace(
      /(["'])([^"'\n]{0,80}(?:token|secret|password|api.?key|authorization|cookie)\s*[:=]\s*)[^"'\n]*\1/gi,
      '$1$2[REDACTED]$1',
    )
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
    .slice(0, 240);
}

function stableId(ruleId: string, file: string, line: number): string {
  const input = `${ruleId}:${file}:${line}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${ruleId}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function getContext(lines: string[], index: number, radius = 2): string {
  return lines
    .slice(Math.max(0, index - radius), Math.min(lines.length, index + radius + 1))
    .join("\n");
}

function makeFinding(
  rule: Rule,
  file: string,
  lineIndex: number,
  line: string,
): AuditFinding {
  const safeFile = normalizeName(file);
  return {
    id: stableId(rule.id, safeFile, lineIndex + 1),
    ruleId: rule.id,
    title: rule.title,
    category: rule.category,
    severity: rule.severity,
    confidence: rule.confidence,
    status: rule.status,
    file: safeFile,
    line: lineIndex + 1,
    summary: rule.summary,
    evidence: redactEvidence(line.trim() || "(matching code context)"),
    expectedBehavior: rule.expectedBehavior,
    remediation: rule.remediation,
    regressionTest: rule.regressionTest,
    limitations: rule.limitations,
  };
}

function scanFile(file: SourceFile): {
  findings: AuditFinding[];
  inventory: InventoryItem[];
  authRelated: boolean;
} {
  const lines = file.content.split(/\r?\n/);
  const fileName = normalizeName(file.name);
  const findings: AuditFinding[] = [];
  const inventory: InventoryItem[] = [];
  const seenInventory = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const context = getContext(lines, index);

    for (const detector of inventoryDetectors) {
      if (!detector.pattern.test(line)) continue;
      const key = `${detector.label}:${index + 1}`;
      if (seenInventory.has(key)) continue;
      seenInventory.add(key);
      inventory.push({
        label: detector.label,
        category: detector.category,
        file: fileName,
        line: index + 1,
        detail: detector.detail,
      });
    }

    for (const rule of rules) {
      if (rule.id === "AUTH-ENUM-001") continue;
      if (rule.matches(line, context)) {
        findings.push(makeFinding(rule, fileName, index, line));
      }
    }
  }

  const source = file.content;
  const lowerSource = source.toLowerCase();
  if (
    /\b(?:user|account)\s+(?:does not exist|not found|unknown)\b/i.test(source) &&
    /\b(?:incorrect|invalid|wrong)\s+(?:password|credential|passcode)\b/i.test(
      source,
    )
  ) {
    const rule = rules.find((candidate) => candidate.id === "AUTH-ENUM-001");
    const lineIndex = lines.findIndex((line) =>
      /\b(?:user|account)\s+(?:does not exist|not found|unknown)\b/i.test(line),
    );
    if (rule && lineIndex >= 0) {
      findings.push(makeFinding(rule, fileName, lineIndex, lines[lineIndex] ?? ""));
    }
  }

  const authRelated =
    inventory.length > 0 ||
    /\b(?:login|signin|authenticate|session|password|credential|cookie|jwt|token|mfa|2fa|reset.?password)\b/i.test(
      lowerSource,
    );

  return { findings, inventory, authRelated };
}

export function analyzeFiles(files: SourceFile[]): AuditResult {
  if (files.length === 0) {
    throw new Error("Select at least one JavaScript, TypeScript, or Python source file.");
  }
  if (files.length > MAX_SOURCE_FILES) {
    throw new Error(`Select no more than ${MAX_SOURCE_FILES} source files at a time.`);
  }

  let totalCharacters = 0;
  for (const file of files) {
    if (!supportedExtension.test(file.name)) {
      throw new Error(`Unsupported source file: ${normalizeName(file.name)}.`);
    }
    totalCharacters += file.content.length;
    if (totalCharacters > MAX_TOTAL_SOURCE_CHARACTERS) {
      throw new Error("The selected source exceeds the 8 MB analysis limit.");
    }
  }

  const uniqueFiles = new Map<string, SourceFile>();
  for (const file of files) {
    const name = normalizeName(file.name);
    uniqueFiles.set(name, { name, content: file.content });
  }

  const scanResults = [...uniqueFiles.values()].map(scanFile);
  const findings = scanResults
    .flatMap((result) => result.findings)
    .sort((a, b) => {
      const severityOrder: Record<AuditSeverity, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      return (
        severityOrder[a.severity] - severityOrder[b.severity] ||
        a.file.localeCompare(b.file) ||
        a.line - b.line
      );
    });
  const inventory = scanResults
    .flatMap((result) => result.inventory)
    .sort(
      (a, b) =>
        a.file.localeCompare(b.file) ||
        a.line - b.line ||
        a.label.localeCompare(b.label),
    );

  return {
    findings,
    inventory,
    summary: {
      filesScanned: uniqueFiles.size,
      authFiles: scanResults.filter((result) => result.authRelated).length,
      findings: findings.length,
      completedAt: new Date().toISOString(),
    },
  };
}

export function toMarkdownReport(result: AuditResult): string {
  const lines = [
    "# Authentication Auditor report",
    "",
    `Generated: ${result.summary.completedAt}`,
    "",
    "> Static source analysis only. Findings are review leads, not proof of exploitability. No uploaded code was executed and no live target was tested.",
    "",
    "## Summary",
    "",
    `- Files scanned: ${result.summary.filesScanned}`,
    `- Authentication-related files: ${result.summary.authFiles}`,
    `- Findings: ${result.summary.findings}`,
    "",
    "## Findings",
    "",
  ];

  if (result.findings.length === 0) {
    lines.push("No patterns matched the current rule set.", "");
  }

  for (const finding of result.findings) {
    lines.push(
      `### ${finding.title}`,
      "",
      `- ID: ${finding.id}`,
      `- Rule: ${finding.ruleId}`,
      `- Category: ${finding.category}`,
      `- Severity: ${finding.severity}`,
      `- Confidence: ${finding.confidence}`,
      `- Status: ${finding.status}`,
      `- Location: ${finding.file}:${finding.line}`,
      "",
      finding.summary,
      "",
      `**Evidence (redacted):** \`${finding.evidence.replace(/`/g, "\\`")}\``,
      "",
      `**Expected behavior:** ${finding.expectedBehavior}`,
      "",
      `**Remediation:** ${finding.remediation}`,
      "",
      `**Regression test:** ${finding.regressionTest}`,
      "",
      `**Limitations:** ${finding.limitations}`,
      "",
    );
  }

  lines.push("## Authentication inventory", "");
  if (result.inventory.length === 0) {
    lines.push("No authentication-related inventory items were detected.", "");
  } else {
    for (const item of result.inventory) {
      lines.push(
        `- ${item.label} — ${item.file}:${item.line} (${item.category}). ${item.detail}`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Limitations",
    "",
    "This report is based on deterministic text-pattern checks for JavaScript, TypeScript, and Python source. It does not parse every framework, resolve data flow across files, execute code, evaluate deployment configuration, or test a live application. A clean report does not establish that an application is secure.",
    "",
  );

  return lines.join("\n");
}

export function toJsonReport(result: AuditResult): string {
  return JSON.stringify(
    {
      tool: "Authentication Auditor",
      mode: "static",
      version: "0.1.0",
      ...result,
      limitations: [
        "Static pattern analysis only; findings are not confirmed vulnerabilities.",
        "No uploaded code was executed and no live application was contacted.",
        "Supported source extensions: JavaScript, TypeScript, and Python.",
      ],
    },
    null,
    2,
  );
}
