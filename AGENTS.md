# Agent Conventions & Guidance

This file provides guidance for AI agents (Claude Code, Junie, etc.) when working with this repository.

---

## What this repo is

API-first contracts for Budget Buddy. `specs/openapi.yaml` (OpenAPI 3.1.0, single file, internal `$ref` only) is the single source of truth. Three clients are generated from it:

| Target | Generator | Output | Published to |
|--------|-----------|--------|-------------|
| TypeScript | `@hey-api/openapi-ts` | `generated/typescript/` | GitHub Packages (npm) |
| Java Spring Boot | `openapi-generator` (`spring`) | `generated/java/` | GitHub Packages (Maven) |
| iOS/Swift | `openapi-generator` (`swift6`) | `Sources/BudgetBuddyContracts/` | Git repo (SPM) |

`generated/` is gitignored (ephemeral CI/local artifacts). `Sources/BudgetBuddyContracts/` is committed — SPM requires sources tracked in git.

## Commands

```bash
pnpm install            # tooling (openapi-generator-cli, spectral)
pnpm run lint           # Spectral lint — must pass before PRs
pnpm run validate       # structural validation
pnpm run mock           # Prism mock server at http://localhost:4010
pnpm run generate:ts    # → generated/typescript/
pnpm run generate:java  # → generated/java/
pnpm run generate:swift # → Sources/BudgetBuddyContracts/ (commit this)
pnpm run generate       # all three
```

## Versioning & release

Single unified version across all three artifacts. The git tag is the source of truth; `package.json` `version` and `specs/openapi.yaml` `info.version` are the in-repo copies and must match. Config files carry no version field — CI injects it from the tag at publish time (local scripts inject from `package.json`).

Releases are fully automated via **semantic-release** on push to `main` — never bump versions, tag, or run `generate:swift` manually:

1. Edit `specs/openapi.yaml` (and/or `config/*.yaml`)
2. `pnpm run lint && pnpm run validate`
3. Open a PR with a conventional-commit title. **PRs are squash-merged, so the PR title is what lands on `main` and what semantic-release reads** for the next version. Individual commits are commitlint-validated but don't affect versioning.
4. CI determines the version, bumps the files, regenerates + commits Swift sources, tags, and creates the GitHub Release — which triggers the Publish workflow (TS→npm, Java→Maven in parallel).

Semver: **MAJOR** = breaking (removed endpoint, changed required field, renamed operationId); **MINOR** = additive (new endpoint/optional field); **PATCH** = non-breaking (config tweak, docs). Bump whenever generated output changes; CI/tooling-only changes need none.

## Key files

- `openapi-ts.config.ts` — TypeScript generation (types + SDK + fetch client)
- `config/spring-server.yaml`, `config/swift6.yaml` — Java/Swift generator options
- `config/typescript-package.json` — `package.json` template for the published TS package
- `config/maven-settings.xml` — Maven creds via `${env.GITHUB_ACTOR}`/`${env.GITHUB_TOKEN}` (no hardcoded secrets)
- `openapitools.json` — pins openapi-generator 7.21.0 (needed for OAS 3.1 `type: [string, "null"]`)
- `.spectral.yaml` — enforces `operationId` (error) + tags, tag descriptions, 500 response, per-property `description` (warn)
- `.releaserc.cjs` — semantic-release config; plugin order matters: changelog → npm (version bump only) → swift prepare → git commit → github release
- `.github/workflows/` — `validate.yml` (PR lint/validate/smoke-gen); `release.yml` (semantic-release on `main`, uses a GitHub App token to bypass the branch ruleset, `GITHUB_TOKEN` scoped `contents: read`); `publish.yml` (`release: published` → publish, `workflow_dispatch` for retries); `commitlint.yml`

## Spec conventions

- Every operation: an `operationId` (drives generated method names) and a `500` response via the `InternalServerError` component.
- Every schema property and API tag: a `description` (Spectral-enforced).
- Errors: `application/problem+json` with the `Problem` schema (RFC 9457).
- Amounts: `integer` / `int64`, minor currency units (`1299` = €12.99). Currency: `string`, exactly 3 chars (ISO 4217). Free-text `description` fields: `maxLength: 255`.
- Write schemas (POST/PUT body) are separate from read schemas. **PUT-only — no PATCH** (see below).
- **Clearable fields** (e.g. `monthlyBudget`, `description`): `type: [..., "null"]`, omitted from `required`, on both read and write schemas. Clients clear via `null` in the PUT body; the server always emits the field (`null` when unset). **Never combine `required` with a nullable type** — on write schemas it triggers an `@NotNull`-on-nullable bug ([openapi-generator#14766](https://github.com/OpenAPITools/openapi-generator/pull/14766)); on read schemas `useJspecify` skips `@Nullable` on required getters, so the Java type lies and breaks static analysis.
- `openApiNullable: false` → Java uses plain types, not `JsonNullable<T>`. With `required: false`, Jackson maps both absent and `null` to the same value, matching the "clear with null" semantic — no overrides anywhere.
- List endpoints (`GET /v1/categories`, `/v1/transactions`): `page` (zero-based, default 0) + `size` (1–200, default 20); `PaginationMeta` returns `page`, `size`, `total`. `GET /v1/transactions` also filters by `query`, `amountMin`/`amountMax` (`int64`, inclusive, min equal to max = exact), `categoryId`, `start`/`end`, `type`, `sort` (`asc`/`desc`, default `desc`) — AND semantics.
- Auth is external (Zitadel OIDC); no auth endpoints. All endpoints require `BearerAuth`.
- To attach a `description` to a `$ref`, wrap in `allOf: [{$ref: ...}]` with `description` as a sibling — avoids Spectral false positives.

## PATCH policy

The API is **PUT-only**; PATCH is intentionally excluded. Mutable resources are small and flat (Category 2 fields, Transaction 6, UserPreferences 3) — clients hold the full resource on edit screens, so resending it is cheap. PATCH (JSON Merge Patch) would need `JsonNullable<T>` wrappers to distinguish absent vs null, leaking into every consumer for little gain. If a future large resource genuinely needs partial updates, add PATCH for that one resource — don't re-enable it globally.
