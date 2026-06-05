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

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "Sources/BudgetBuddyContracts";
// Matches `pattern: "/<regex>/"` and captures the bare <regex>.
const WRAPPED_PATTERN = /pattern: "\/(.*)\/"/g;

function swiftFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...swiftFiles(full));
    } else if (entry.endsWith(".swift")) {
      files.push(full);
    }
  }
  return files;
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
