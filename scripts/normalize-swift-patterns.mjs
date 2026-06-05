#!/usr/bin/env node
// Post-processing for the generated Swift sources.
//
// openapi-generator (swift6) emits string `pattern` rules wrapped in JS-style
// regex-literal delimiters, e.g. `StringRule(pattern: "/^[A-Z]{3}$/")`. The
// generated `Validator` feeds that pattern straight to `NSRegularExpression`,
// which treats the surrounding slashes as literal characters — so pattern
// validation (currency, month, slug, locale, …) never matches.
//
// This strips the leading/trailing `/` from generated pattern literals so the
// emitted regex is usable by NSRegularExpression. It is idempotent and is run
// automatically as the last step of `pnpm run generate:swift`.
//
// After normalizing, it re-scans the sources and exits non-zero if any wrapped
// `pattern: "/…/"` literal survives. CI does not smoke-test Swift generation,
// so this self-check is the guard that catches a future generator bump that
// changes the wrapping style — failing loudly instead of silently shipping
// regex rules that can never match.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Anchor to the repo root relative to this script, not the caller's cwd.
const ROOT = join(import.meta.dirname, "..", "Sources/BudgetBuddyContracts");
// Matches `pattern: "/<regex>/"` and captures the bare <regex>.
const WRAPPED_PATTERN = /pattern: "\/(.*)\/"/g;

function swiftFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".swift"))
    .map((entry) => join(entry.parentPath, entry.name));
}

let changedFiles = 0;
let changedRules = 0;

for (const file of swiftFiles(ROOT)) {
  const original = readFileSync(file, "utf8");
  let count = 0;
  const updated = original.replace(WRAPPED_PATTERN, (_match, inner) => {
    count += 1;
    return `pattern: "${inner}"`;
  });
  if (count > 0) {
    writeFileSync(file, updated);
    changedFiles += 1;
    changedRules += count;
  }
}

console.log(
  `normalize-swift-patterns: unwrapped ${changedRules} regex pattern(s) across ${changedFiles} file(s)`
);

// Guard against the bug *class*, not just the exact shape handled above: any
// `pattern: "…"` whose value still opens with a delimiter slash is broken for
// NSRegularExpression. This deliberately differs from WRAPPED_PATTERN so it can
// catch a future generator change (e.g. trailing regex flags like `/…/i`) that
// WRAPPED_PATTERN would silently fail to unwrap. CI does not smoke-test Swift
// generation, so fail loudly here rather than ship rules that can never match.
const LEADING_DELIMITER = /pattern: "\//;
const survivors = swiftFiles(ROOT).filter((file) =>
  LEADING_DELIMITER.test(readFileSync(file, "utf8"))
);
if (survivors.length > 0) {
  console.error(
    `normalize-swift-patterns: pattern literals still wrapped in regex ` +
      `delimiters after normalization in:\n  ${survivors.join("\n  ")}\n` +
      `The generator's pattern format may have changed — update WRAPPED_PATTERN.`
  );
  process.exit(1);
}
