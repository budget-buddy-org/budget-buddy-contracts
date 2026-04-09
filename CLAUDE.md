# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

API-first contracts for Budget Buddy. The OpenAPI spec in `specs/openapi.yaml` is the single source of truth. From it, three clients are generated:

| Target | Generator | Output | Published to |
|--------|-----------|--------|-------------|
| TypeScript | `typescript-axios` | `generated/typescript/` | GitHub Packages (npm) |
| Java Spring Boot | `spring` (interfaceOnly) | `generated/java/` | GitHub Packages (Maven) |
| iOS/Swift | `swift6` | `Sources/BudgetBuddyContracts/` | Git repo (SPM) |

`generated/` is gitignored — TypeScript and Java are ephemeral CI/local artifacts. `Sources/BudgetBuddyContracts/` is committed because Swift Package Manager requires sources tracked in git.

## Commands

```bash
npm install               # Install openapi-generator-cli and spectral

npm run lint              # Lint spec with Spectral (must pass before PRs)
npm run validate          # Structural validation via openapi-generator

npm run generate:ts       # → generated/typescript/
npm run generate:java     # → generated/java/
npm run generate:swift    # → Sources/BudgetBuddyContracts/  (commit this)
npm run generate          # All three
```

## Versioning strategy

Single unified version across all three artifacts. The git tag is the source of truth; `package.json` version and `specs/openapi.yaml` `info.version` are the in-repo canonical copies and must always match.

Config files (`config/*.yaml`) do **not** contain version fields — CI injects the version from the git tag at publish time; local generation scripts inject it from `package.json`.

### When to bump

| What changed | Affects generated output? | Action |
|---|---|---|
| `specs/openapi.yaml` | Yes (always) | Bump (PATCH/MINOR/MAJOR per semver rules below) |
| `config/*.yaml` | Sometimes | PATCH bump if generated output changes; skip otherwise |
| CI/tooling (workflows, scripts, Spectral rules) | No | No bump — just commit |

Semver:
- **MAJOR** — breaking change (removed endpoint, changed required field, renamed operationId)
- **MINOR** — additive change (new endpoint, new optional field)
- **PATCH** — non-breaking (generator config tweak, doc/comment update)

## Release workflow

1. Edit `specs/openapi.yaml` (and/or `config/*.yaml`)
2. `npm run lint && npm run validate`
3. `npm run generate:swift` → commit `Sources/BudgetBuddyContracts/`
4. Bump `version` in `package.json` **and** `info.version` in `specs/openapi.yaml` to match; add entry to `CHANGELOG.md`
5. `git tag v<version> && git push --follow-tags`
6. CI generates TypeScript and Java, then publishes both to GitHub Packages

## Architecture

- `specs/openapi.yaml` — OpenAPI 3.1.0, monolithic single file with internal `$ref` only
- `config/*.yaml` — per-generator options (package names, base packages, output style)
- `openapitools.json` — pins openapi-generator version (currently 7.21.0; needed for OAS 3.1 `type: [string, "null"]`)
- `Package.swift` — makes this repo a valid Swift Package; points to `Sources/BudgetBuddyContracts/`
- `.spectral.yaml` — enforces `operationId` on every operation (error) and tags (warn); generators rely on both
- `.github/workflows/validate.yml` — runs lint + validate on PRs that touch `specs/` or `config/`
- `.github/workflows/publish.yml` — on `v*` tag: generates and publishes TypeScript (npm) + Java (Maven) to GitHub Packages using `GITHUB_TOKEN`

## Spec conventions

- All operations have an `operationId` (required by Spectral, used for generated method names)
- Error responses use `application/problem+json` with the `Problem` schema (RFC 9457)
- Amounts are `integer` in minor currency units (e.g. `1299` = €12.99)
- Write schemas (POST/PUT body) and Update schemas (PATCH body) are separate from read schemas
- PATCH schemas represent partial updates: fields are optional, and empty patch objects are invalid
- Auth endpoints override global security with `security: []`
