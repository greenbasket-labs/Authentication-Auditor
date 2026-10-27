#!/usr/bin/env node
import { lstat, readdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  analyzeFiles,
  MAX_SOURCE_FILES,
  MAX_TOTAL_SOURCE_BYTES,
  toJsonReport,
  toMarkdownReport,
  type AuditResult,
  type SourceFile,
} from "./lib/audit-engine.ts";
import { demoFiles, safeValidationFiles } from "./lib/demo-fixtures.ts";

const VERSION = "0.1.0";
const sourceExtension = /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts|py)$/i;
const excludedDirectories = new Set([
  ".git",
  ".hg",
  ".svn",
  ".next",
  ".turbo",
  ".venv",
  "__pycache__",
  "build",
  "dist",
  "node_modules",
  "venv",
]);

type Options = {
  format: "json" | "markdown";
  output?: string;
  directory?: string;
};

const helpText = `Authentication Auditor ${VERSION}

Local static source review for JavaScript, TypeScript, and Python.
Selected code is read only. It is never executed or sent to a live target.

Usage:
  auth-auditor analyze <repository-folder> [--format markdown|json] [--output FILE]
  auth-auditor inventory <repository-folder> [--format markdown|json] [--output FILE]
  auth-auditor validate
  auth-auditor --help
  auth-auditor --version

Commands:
  analyze     Review source patterns and write a redacted report.
  inventory   List authentication-related code references.
  validate    Check the analyzer against local synthetic safe/unsafe examples.

Options:
  --format    Report format: markdown (default) or json.
  --output    Write to a new file; existing files are never overwritten.

Limits:
  Up to ${MAX_SOURCE_FILES} source files and ${Math.round(MAX_TOTAL_SOURCE_BYTES / 1_000_000)} MB of source.
  Dependency folders, build output, and symbolic links are skipped.
  A completed analysis returns exit code 2 when findings need review, 0 otherwise.
  Invalid usage or read errors return exit code 1.

This CLI does not run dynamic tests, contact URLs, or test live applications.`;

function parseOptions(args: string[]): Options {
  const options: Options = { format: "markdown" };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--format") {
      const value = args[index + 1];
      if (value === "json") options.format = "json";
      else if (value === "markdown" || value === "md") options.format = "markdown";
      else throw new Error("Use --format markdown or --format json.");
      index += 1;
    } else if (argument === "--output") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Provide a file path after --output.");
      }
      options.output = value;
      index += 1;
    } else if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (!options.directory) {
      options.directory = argument;
    } else {
      throw new Error("Provide only one repository folder.");
    }
  }
  return options;
}

async function collectSourceFiles(folder: string): Promise<SourceFile[]> {
  const root = await realpath(folder);
  const rootInfo = await lstat(root);
  if (!rootInfo.isDirectory()) {
    throw new Error("The selected path must be a folder.");
  }

  const pendingDirectories = [root];
  const files: SourceFile[] = [];
  let totalBytes = 0;

  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();
    if (!currentDirectory) continue;
    const entries = await readdir(currentDirectory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        if (!excludedDirectories.has(entry.name.toLowerCase())) {
          pendingDirectories.push(fullPath);
        }
        continue;
      }
      if (!entry.isFile() || !sourceExtension.test(entry.name)) continue;

      const fileInfo = await lstat(fullPath);
      totalBytes += fileInfo.size;
      if (totalBytes > MAX_TOTAL_SOURCE_BYTES) {
        throw new Error("Selected source exceeds the 8 MB analysis limit.");
      }
      if (files.length >= MAX_SOURCE_FILES) {
        throw new Error(`Selected source exceeds the ${MAX_SOURCE_FILES} file limit.`);
      }

      const content = await readFile(fullPath, "utf8");
      files.push({
        name: path.relative(root, fullPath).split(path.sep).join("/"),
        content,
      });
    }
  }

  if (files.length === 0) {
    throw new Error("No JavaScript, TypeScript, or Python source files were found.");
  }
  return files;
}

function makeInventoryReport(result: AuditResult, format: Options["format"]): string {
  if (format === "json") {
    return JSON.stringify(
      {
        tool: "Authentication Auditor",
        mode: "static",
        summary: result.summary,
        inventory: result.inventory,
        disclaimer:
          "Static source inventory only. Missing entries do not establish missing controls.",
      },
      null,
      2,
    );
  }

  const lines = [
    "# Authentication inventory",
    "",
    "> Static source inventory only. Missing entries do not establish missing controls.",
    "",
    `- Files scanned: ${result.summary.filesScanned}`,
    `- Authentication-related files: ${result.summary.authFiles}`,
    "",
  ];
  if (result.inventory.length === 0) {
    lines.push("No authentication-related inventory items were detected.", "");
  } else {
    for (const item of result.inventory) {
      lines.push(
        `- **${item.label}** — ${item.file}:${item.line} (${item.category}). ${item.detail}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function writeOrPrint(content: string, output?: string): Promise<void> {
  if (!output) {
    process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
    return;
  }
  const outputPath = path.resolve(output);
  await writeFile(outputPath, content, { encoding: "utf8", flag: "wx" });
  process.stderr.write(`Created report: ${outputPath}\n`);
}

function validateAnalyzer(): boolean {
  const demo = analyzeFiles(demoFiles);
  const safe = analyzeFiles(safeValidationFiles);
  const expected = [
    "AUTH-COOKIE-001",
    "AUTH-COOKIE-002",
    "AUTH-COOKIE-003",
    "AUTH-JWT-001",
    "AUTH-RESET-001",
    "AUTH-RESET-002",
    "AUTH-TOKEN-001",
  ];
  const observed = new Set(demo.findings.map((finding) => finding.ruleId));
  const missing = expected.filter((ruleId) => !observed.has(ruleId));
  if (missing.length > 0 || safe.findings.length > 0) {
    if (missing.length > 0) {
      process.stderr.write(`Synthetic unsafe example missed: ${missing.join(", ")}\n`);
    }
    if (safe.findings.length > 0) {
      process.stderr.write(
        `Synthetic safe example produced review leads: ${safe.findings.map((finding) => finding.ruleId).join(", ")}\n`,
      );
    }
    return false;
  }

  process.stdout.write(
    `PASS: detected ${expected.length} seeded review patterns; the matching secure fixture produced no findings.\n`,
  );
  return true;
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const cliArgs = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;
  const [command, ...args] = cliArgs;

  if (!command || command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(`${helpText}\n`);
    return;
  }
  if (command === "--version" || command === "-v") {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (command === "validate") {
    if (args.length > 0) throw new Error("The validate command does not take a folder or options.");
    if (!validateAnalyzer()) process.exitCode = 1;
    return;
  }
  if (command !== "analyze" && command !== "inventory") {
    throw new Error(`Unknown command: ${command}`);
  }

  const options = parseOptions(args);
  if (!options.directory) {
    throw new Error(`Provide a folder to ${command}. Run --help for usage.`);
  }

  const files = await collectSourceFiles(options.directory);
  const result = analyzeFiles(files);
  const report =
    command === "inventory"
      ? makeInventoryReport(result, options.format)
      : options.format === "json"
        ? toJsonReport(result)
        : toMarkdownReport(result);

  await writeOrPrint(report, options.output);
  if (command === "analyze" && result.findings.length > 0) {
    process.exitCode = 2;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
