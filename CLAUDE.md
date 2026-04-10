# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

API-first contracts for Budget Buddy. The OpenAPI spec in `specs/openapi.yaml` is the single source of truth. From it, three clients are generated:

| Target | Generator | Output | Published to |
|--------|-----------|--------|-------------|
| TypeScript | `@hey-api/openapi-ts` | `generated/typescript/` | GitHub Packages (npm) |
| Java Spring Boot | `openapi-generator` (`spring`) | `generated/java/` | GitHub Packages (Maven) |
| iOS/Swift | `openapi-generator` (`swift6`) | `Sources/BudgetBuddyContracts/` | Git repo (SPM) |

`generated/` is gitignored — TypeScript and Java are ephemeral CI/local artifacts. `Sources/BudgetBuddyContracts/` is committed because Swift Package Manager requires sources tracked in git.

## Commands

```bash
pnpm install               # Install openapi-generator-cli and spectral

pnpm run lint              # Lint spec with Spectral (must pass before PRs)
pnpm run validate          # Structural validation via openapi-generator
pnpm run mock              # Run Prism mock server at http://localhost:4010

pnpm run generate:ts       # → generated/typescript/
pnpm run generate:java     # → generated/java/
pnpm run generate:swift    # → Sources/BudgetBuddyContracts/  (commit this)
pnpm run generate          # All three
```

## Versioning strategy

Single unified version across all three artifacts. The git tag is the source of truth; `package.json` version and `specs/openapi.yaml` `info.version` are the in-repo canonical copies and must always match.

Config files (`config/*.yaml`, `config/typescript-package.json`, `openapi-ts.config.ts`) do **not** contain version fields — CI injects the version from the git tag at publish time; local generation scripts inject it from `package.json`.

### When to bump

| What changed | Affects generated output? | Action |
|---|---|---|
| `specs/openapi.yaml` | Yes (always) | Bump (PATCH/MINOR/MAJOR per semver rules below) |
| `config/*.yaml` / `openapi-ts.config.ts` | Sometimes | PATCH bump if generated output changes; skip otherwise |
| CI/tooling (workflows, scripts, Spectral rules) | No | No bump — just commit |

Semver:
- **MAJOR** — breaking change (removed endpoint, changed required field, renamed operationId)
- **MINOR** — additive change (new endpoint, new optional field)
- **PATCH** — non-breaking (generator config tweak, doc/comment update)

## Release workflow

Releases are fully automated via semantic-release on push to `main`.

1. Edit `specs/openapi.yaml` (and/or `config/*.yaml`)
2. `pnpm run lint && pnpm run validate`
3. Open a PR with a conventional commit title (`feat:`, `fix:`, `feat!:`, etc.) — the PR title becomes the merge commit because PRs are squash-merged
4. CI does the rest:
   - determines next version from commit history
   - bumps `package.json` on disk (used by generation scripts)
   - regenerates Swift sources
   - creates the git tag and GitHub Release
   - generates and publishes TypeScript (npm) and Java (Maven) to GitHub Packages

Do **not** manually bump versions, tag, or run `generate:swift` before merging — semantic-release owns all of that.

> **Squash-merge convention:** always use squash merge on GitHub. The PR title is what lands on `main` and what semantic-release reads to determine the next version. Individual commit messages within the PR are validated by CI but do not affect versioning.


## Architecture

- `specs/openapi.yaml` — OpenAPI 3.1.0, monolithic single file with internal `$ref` only
- `openapi-ts.config.ts` — `@hey-api/openapi-ts` config for TypeScript generation (types + SDK + fetch client)
- `config/typescript-package.json` — static `package.json` template for the published TypeScript package; version injected by CI at release time
- `config/spring-server.yaml`, `config/swift6.yaml` — `openapi-generator` options for Java and Swift targets
- `config/maven-settings.xml` — Maven server credentials template; references `${env.GITHUB_ACTOR}` and `${env.GITHUB_TOKEN}` so it is safe to commit (no hardcoded secrets)
- `openapitools.json` — pins openapi-generator version (currently 7.21.0; needed for OAS 3.1 `type: [string, "null"]`)
- `Package.swift` — makes this repo a valid Swift Package; points to `Sources/BudgetBuddyContracts/`
- `.spectral.yaml` — enforces `operationId` on every operation (error) and tags (warn); generators rely on both
- `.github/workflows/commitlint.yml` — runs on every PR: validates individual commit messages and the PR title against conventional commit rules (PR title is what lands on `main` via squash merge)
- `.github/workflows/validate.yml` — runs on PRs touching `specs/`, `config/`, `.spectral.yaml`, `openapi-ts.config.ts`, or `openapitools.json`: lints the spec, validates its structure, and smoke-tests TypeScript and Java generation
- `.github/workflows/release.yml` — on push to `main`: generates a GitHub App token (`RELEASE_BOT_ID` + `RELEASE_BOT_PRIVATE_KEY` org secrets) to bypass the branch ruleset PR requirement, then runs semantic-release and publishes TypeScript (npm) + Java (Maven) to GitHub Packages; has a 20-minute timeout
- `.releaserc.cjs` — semantic-release plugin config; plugin order matters: changelog → npm (version bump) → exec/swift prepare → exec/typescript publish → exec/java publish → git commit → github release

## Spec conventions

- All operations have an `operationId` (required by Spectral, used for generated method names)
- Error responses use `application/problem+json` with the `Problem` schema (RFC 9457)
- Amounts are `integer` in minor currency units (e.g. `1299` = €12.99)
- Write schemas (POST/PUT body) and Update schemas (PATCH body) are separate from read schemas
- PATCH schemas represent partial updates: fields are optional, and empty patch objects are invalid
- Auth endpoints override global security with `security: []`
