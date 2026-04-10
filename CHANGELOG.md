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
- `specs/openapi.yaml` was never version-bumped in release commits because `semantic-release-openapi` ran after `@semantic-release/git`; reordered plugins so the openapi spec is updated before the commit
- TypeScript and Java clients were never generated or published after a release because all four conditional steps referenced the non-existent step ID `after` instead of `detect`
- Swift sources (`Sources/BudgetBuddyContracts/`) are now regenerated during the semantic-release prepare phase via `@semantic-release/exec`, ensuring the tagged commit always contains up-to-date generated sources (required for SPM resolution)

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
