## [6.0.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v5.0.0...v6.0.0) (2026-05-28)

### ⚠ BREAKING CHANGES

* PATCH endpoints removed. Clients must use PUT with the
full resource body; send `null` for nullable fields to clear them.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* refactor: clear via field omission instead of explicit null

Replaces the local Mustache template override with a schema-level fix
that uses only out-of-the-box openapi-generator behavior.

monthlyBudget and description (on Category, Transaction, CategorySpendingRow,
and their *Write counterparts) are no longer marked `required` and no longer
typed as `nullable`. Clients clear these fields by omitting them from the
PUT body; the server treats absence and the previous explicit-null as the
same state. This sidesteps the openapi-generator behavior where required +
nullable getters end up with @NotNull on a spec-legal null payload.

- Removed config/spring-server.yaml `templateDir`
- Removed templates/JavaSpring/beanValidation.mustache
- Updated CLAUDE.md: documented "optional clearable" convention, removed
  template override from Architecture, simplified PATCH-policy rationale

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* fix(spec): restore type: [..., null] on clearable fields

The previous commit dropped `nullable` to avoid the @NotNull-on-nullable
generator bug, but that left the spec lying about runtime behavior — the
server still accepts JSON `null` for these fields even though the schema
declared them strictly typed. That's contract drift.

Dropping `required` alone is enough to dodge the generator bug; `nullable`
can stay. The combination `nullable: true, required: false` is the
industry-conventional shape for "clearable" fields (Stripe, GitHub, MS
REST guidelines) and is what the runtime actually accepts.

- monthlyBudget on Category, CategoryWrite, CategorySpendingRow: back to
  `type: [integer, "null"]`
- description on Transaction, TransactionWrite: back to
  `type: [string, "null"]`
- Field docs now say "Send null (or omit) to clear any existing X"
- Read schemas emit the field with `null` when unset, so clients
  deserialize one shape (always-present), not two
- CLAUDE.md convention bullet rewritten to call out the
  required-AND-nullable combo as the antipattern, not nullable itself

Generated Java output is unchanged versus the previous commit (still
`@Nullable Long` / `@Nullable String`, no `@NotNull`, `@Min`/`@Size`
preserved). The only change is that the spec is now honest about what
the server accepts.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* chore(spec): consistency polish

- Reorder transaction paths to match categories: collection first, then
  /summary and /summary/trend, then the by-id route. Spec ordering matches
  /v1/categories now.
- Enrich info.description with a self-contained primer (auth, error
  format, money representation, pagination, mutation semantics) so anyone
  reading the generated docs doesn't have to cross-reference five pages.
- Document the "clearable field" rule (and the two distinct generator
  quirks that motivate it) in CLAUDE.md so future contributors don't
  re-introduce required+nullable on either read or write schemas.

No client-visible schema or operation changes versus the previous commit.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* chore(spec): final consistency polish

- Summary endpoints (/v1/categories/summary, /v1/transactions/summary,
  /v1/transactions/summary/trend) now use imperative `Get …` titles,
  matching every other GET operation in the spec.
- Add `example` values to TransactionWrite.date, TransactionWrite.description,
  and CategorySpendingRow.categoryName — read-side counterparts already had
  them, the write/derived schemas were missing.
- Document the implicit sort order on `GET /v1/categories` (by name asc) so
  clients don't have to rely on undocumented behavior.
- Rename `replaceCurrentUserClientSettings` → `upsertCurrentUserClientSettings`.
  The operation creates the resource when absent and replaces it when
  present; the operationId now matches the documented semantic, and the
  generated SDK method name reads correctly. Breaking for SDK consumers,
  but the PR is already feat! so the cost is bundled into the v6.0.0
  migration that consumers will have to do anyway.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

### Features

* drop PATCH endpoints and switch off openApiNullable ([#113](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/113)) ([0325643](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/032564327caac6e1ace53f0bc828421c00142d3e)), closes [#14766](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/14766) [openapi-generator#14766](https://github.com/budget-buddy-org/openapi-generator/issues/14766)
* publish interactive Swagger UI to GitHub Pages ([#114](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/114)) ([eda637a](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/eda637a8ed825f6c5da39b04d56de30c5ae11d3e))

## [5.0.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v4.1.0...v5.0.0) (2026-05-28)

### ⚠ BREAKING CHANGES

* read schemas no longer include `createdAt`/`updatedAt`;
write/update schemas reject unknown fields and require `description` /
`monthlyBudget` explicitly; transaction `description` is now nullable
across all variants.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

* refactor: tighten spec descriptions, DRY client settings payload

- Strip deployment-specific detail from server descriptions (Raspberry Pi,
  nginx, gradle bootRun command) — keep the spec agnostic to how the API is
  hosted or started locally.
- Extract reusable ClientSettingsPayload schema; ClientSettings.settings and
  ClientSettingsWrite.settings now $ref it instead of duplicating the inline
  opaque-object shape.
- Add additionalProperties: false to FieldError for parity with other strict
  schemas.
- Simplify Me.id description so it describes the value (stable owner id)
  instead of leaking how the server derives it from the OIDC subject.
- Drop "(PUT semantics)" parentheticals from replace operations and PUT
  request schemas — the HTTP verb and "Replace X" summary already convey it.
- Standardize null-clearing phrasing across Category/Transaction write and
  update schemas to "Pass null to clear the {budget|note}."
- Rewrite Problem.errors description to specify when the array is populated
  rather than restating that it's optional.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* chore: pin pnpm via packageManager, bump @hey-api/openapi-ts

- Pin pnpm@11.4.0 via Corepack's packageManager field so local dev and CI
  stay on the same version instead of drifting to whatever pnpm/action-setup
  resolves at run time.
- Bump @hey-api/openapi-ts 0.97.2 → 0.97.3 from pnpm up; lockfile refreshed.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* ci: drop pnpm version pin from workflows, defer to packageManager

The packageManager field added in 245f460 conflicts with the explicit
"version: 10" passed to pnpm/action-setup, which now errors out with
ERR_PNPM_BAD_PM_VERSION on every workflow run. Removing the explicit
pin so action-setup reads the version from package.json's packageManager
field — single source of truth, and CI matches local.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* docs: fix stale README claims and trim obsolete prerequisites

- Frontend client is fetch-based (@hey-api/client-fetch), not Axios.
- Pagination uses page/size/total, not the previously documented
  total/limit/offset.
- All endpoints require Bearer JWT — there are no login/register
  endpoints in the spec; remove the misleading exception.
- Drop hardcoded "1.1.0" version from Swift/Maven snippets; point at
  the release badge for the current version.
- Drop OpenAPI Generator CLI and Spectral CLI from prerequisites — they
  install transparently via "pnpm install".
- pnpm prerequisite reworded to reflect the Corepack-pinned setup.
- Release workflow steps rewritten to match the PR + squash-merge flow
  documented in CLAUDE.md.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

### Code Refactoring

* harden and DRY OpenAPI schema, modernize tooling ([#112](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/112)) ([4523155](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/45231558d2fda6813113be02b0f549c0ed068948))

## [4.1.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v4.0.0...v4.1.0) (2026-05-10)

### Features

* add user self-management endpoints ([#103](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/103)) ([41eb733](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/41eb7334856528a354ee6c5af95e21b713e74d2d))

## [4.0.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v3.4.0...v4.0.0) (2026-05-08)

### ⚠ BREAKING CHANGES

* GET /v1/transactions/summary no longer accepts the
`month` query parameter and now returns an array of MonthlySummary
instead of a single object. Callers must migrate to `from`/`to`.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

* feat: add getTransactionsSummaryTrend endpoint

Splits per-month bucket trends into a separate endpoint instead of
overloading getTransactionsSummary. The single-month endpoint stays
untouched (one MonthlySummary, no [0] unwrap on the client). The new
endpoint serves dashboard sparklines: from/to month range, returns
MonthlySummary[] oldest first, empty months zero-filled, max 24 months.

Each endpoint speaks its native shape; no consumer has to unwrap a
1-element array for the common case.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>

### Features

* add getTransactionsSummaryTrend endpoint ([#96](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/96)) ([84e4dc9](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/84e4dc91cffba101545f3b7b29e9507617765bfe))

## [3.4.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v3.3.0...v3.4.0) (2026-05-06)

### Features

* add GET /v1/transactions/summary for monthly totals ([#95](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/95)) ([7ed70af](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/7ed70af61854d5f8a4a250a2ab7daef426c9b526)), closes [#94](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/94)

## [3.3.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v3.2.0...v3.3.0) (2026-05-06)

### Features

* add per-category monthly budget and spending summary endpoint ([#93](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/93)) ([868969d](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/868969d1a3bd68cd20dcf5a15c89c4e4d036e53f))

## [3.2.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v3.1.0...v3.2.0) (2026-05-03)

### Features

* add search and amount-range filters to listTransactions ([#91](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/91)) ([b8709e1](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/b8709e1f6ac1bb8b943aaa393b7ff352e0c15128)), closes [#88](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/88) [#88](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/88)

## [3.1.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v3.0.0...v3.1.0) (2026-04-29)

### Features

* bump OpenApi generator to enable useJspecify flag ([#87](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/87)) ([b0e69da](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/b0e69da9cca6df74fe5d589c577c68b29c352bbb))

## [3.0.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.3.0...v3.0.0) (2026-04-18)

### ⚠ BREAKING CHANGES

* Auth endpoints and schemas removed from the spec.
Generated clients lose loginUser(), registerUser(), refreshToken(),
logoutUser() and all auth-related models. Consumers must integrate
Zitadel directly for authentication.

### Features

* remove auth endpoints from OpenAPI spec (closes [#73](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/73)) ([#76](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/76)) ([8bdd212](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/8bdd2121c195118f5dcc710d552b3de70b06e709))

## [2.3.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.2.0...v2.3.0) (2026-04-17)

### Features

* **spec:** add TransactionType schema and type filter for list transactions ([#75](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/75)) ([b2510f5](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/b2510f589eebd5c870c2fa4055b9c5e9aec51658))

## [2.2.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.1.2...v2.2.0) (2026-04-12)

### Features

* **spec:** add errors field to Problem schema and regenerate Java models ([bfcaed4](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/bfcaed45b1d9057c1d2a6c9e224b76a878ce9989))

## [2.1.2](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.1.1...v2.1.2) (2026-04-12)

### Bug Fixes

* **ci:** approve esbuild build scripts for pnpm v10 ([#71](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/71)) ([8527540](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/852754036c9562c5fbeed4e34fad184cb665e427))

## [2.1.1](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.1.0...v2.1.1) (2026-04-12)

### Bug Fixes

* **ci:** pin pnpm/action-setup to v5 and approve build scripts ([#70](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/70)) ([b5ca58b](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/b5ca58b73157cbf3fbc2002a3b998242bebde7eb))

## [2.1.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v2.0.0...v2.1.0) (2026-04-11)

### Features

* expose client.gen sub-path export in TypeScript package ([#65](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/65)) ([1fc217b](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/1fc217bf49d719a09321d7bdbc8e120c54871027))

## [2.0.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.4.2...v2.0.0) (2026-04-11)

### ⚠ BREAKING CHANGES

* switch pagination from offset/limit to page/size (closes #62) (#63)

### Features

* switch pagination from offset/limit to page/size (closes [#62](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/62)) ([#63](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/63)) ([528f60d](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/528f60d3b9f4783c3a2ca842f1e1ac6e13a5d285))

### Bug Fixes

* **release:** switch to conventionalcommits preset to support ! breaking changes ([#64](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/64)) ([4654a66](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/4654a661f2db9a8215534755373b9d89f50a3e1b))

## [1.4.2](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.4.1...v1.4.2) (2026-04-11)


### Bug Fixes

* **ci:** remove unused permissions, add lint gate, document publish recovery (closes [#48](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/48)) ([#61](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/61)) ([504cda5](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/504cda5f6c9f917e17ae4259604e862f9ae3fa2f))

## [1.4.1](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.4.0...v1.4.1) (2026-04-11)


### Bug Fixes

* **spec:** add missing format, constraints, and length bounds (closes [#46](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/46)) ([#60](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/60)) ([d6c1229](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/d6c1229e3dcca50ef410c2119bee2ef83381c4ca))

# [1.4.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.3.4...v1.4.0) (2026-04-11)


### Features

* **spec:** add 500 responses, property descriptions, and strengthen Spectral rules (closes [#47](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/47)) ([#59](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/59)) ([7d3989a](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/7d3989a2c9fa96de7334ca541d6416937b40efa5))

## [1.3.4](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.3.3...v1.3.4) (2026-04-10)


### Bug Fixes

* explicitly set GITHUB_TOKEN env for Maven publish step ([#45](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/45)) ([616b67c](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/616b67c79bcb543807a2b7b6ece87bd5eddc762b))

## [1.3.3](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.3.2...v1.3.3) (2026-04-10)


### Bug Fixes

* trigger build ([5c2d6db](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/5c2d6db15a92a35e87435a7a4500df8f12f47b92))

## [1.3.2](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.3.1...v1.3.2) (2026-04-10)


### Bug Fixes

* use positional dir arg in pnpm publish ([#41](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/41)) ([f07d9ac](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/f07d9ac2e11a199b011456e7de4f790b8bb5703d))

## [1.3.1](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.3.0...v1.3.1) (2026-04-10)


### Bug Fixes

* harden CI workflows and add generation smoke tests ([#39](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/39)) ([02436ca](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/02436ca3d2ca816d2f5b08f35f21cfd9bc7c4704))
* remove maven cache from setup-java ([#40](https://github.com/budget-buddy-org/budget-buddy-contracts/issues/40)) ([acfec05](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/acfec054133ab3762d3171613dc7aba3c38f07d9))

# [1.3.0](https://github.com/budget-buddy-org/budget-buddy-contracts/compare/v1.2.2...v1.3.0) (2026-04-10)


### Features

* clean up commands ([a73f63f](https://github.com/budget-buddy-org/budget-buddy-contracts/commit/a73f63f8c0ef68987340e1c9bdcaedaf3d4f8635))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- migrated package management from `npm` to `pnpm`
- added local API mocking via Prism (`pnpm run mock`)
- configured Dependabot for `pnpm` support (via `npm` ecosystem)
- updated Node.js engine requirement to v24+ (LTS)
- updated Java publish workflow to use Java 25 (LTS)
- updated all GitHub Actions to their latest versions (checkout@v6, setup-node@v6, setup-java@v5)
- introduced semantic-release for fully automated versioning and publishing on push to `main`

### Fixed
- replaced `semantic-release-openapi` (incompatible with semantic-release v25) with a direct `sed` command via `@semantic-release/exec` to bump `specs/openapi.yaml` version during prepare
- TypeScript and Java clients were never generated or published after a release because all four conditional steps referenced the non-existent step ID `after` instead of `detect`
- TypeScript build failed at publish time with `Cannot find module 'axios'` because the generated client's dependencies were never installed; added a `pnpm install --no-frozen-lockfile` step in `generated/typescript/` before publishing
- TypeScript package was being published under the wrong scope (`@glebremniov`) instead of the organisation scope (`@budget-buddy-org`); corrected `npmName` in `config/typescript-axios.yaml`
- `pnpm install` triggered the generated package's `prepare` script (which runs `tsc`) before the build succeeded; removed the invalid `"ignoreDeprecations": "6.0"` tsconfig patch from `release.yml` (TypeScript 6 does not exist; the deprecation warning from `moduleResolution: node10` is harmless)
- Swift sources (`Sources/BudgetBuddyContracts/`) are now regenerated during the semantic-release prepare phase via `@semantic-release/exec`, ensuring the tagged commit always contains up-to-date generated sources (required for SPM resolution)
- `@semantic-release/git` was blocked by the branch ruleset PR requirement when pushing the version-bump commit; switched to a GitHub App token (`RELEASE_BOT_ID` + `RELEASE_BOT_PRIVATE_KEY`) via `actions/create-github-app-token` — the app is added to the Ruleset bypass actor list so CI can push directly while the PR requirement still applies to human contributors

## [1.1.0] - 2026-04-09

### Changed
- aligned Problem Details references with RFC 9457
- replaced the placeholder production server URL with a templated server that defaults generated clients to `http://localhost:8080`
- clarified create-response `Location` headers across category and transaction endpoints
- made `CategoryUpdate` a true PATCH schema with optional fields and a non-empty object requirement
- required non-empty PATCH documents for `TransactionUpdate` as well

## [1.0.1] - 2026-04-05

### Added
- `description` field on all 16 operations (resolves Spectral `operation-description` warnings)
- `contact` field in `info` object (resolves Spectral `info-contact` warning)

## [1.0.0] - 2026-04-04

### Added
- OpenAPI 3.1.0 spec with auth, categories, and transactions endpoints
- JWT Bearer security scheme (global, except auth endpoints)
- RFC 9457 Problem Details error responses
- Separate Write/Update schemas for clean POST/PUT/PATCH semantics
- Pagination with limit/offset on list endpoints
- TypeScript axios client generation config (GitHub Packages)
- Java Spring Boot 3 server stubs generation config (GitHub Packages)
- Swift 5 URLSession client generation config (Swift Package Manager)
- GitHub Actions: spec validation on PRs, publish on version tags
