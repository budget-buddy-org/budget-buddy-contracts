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
