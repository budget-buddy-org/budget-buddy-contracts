# Budget Buddy Contracts 🚀

[![OpenAPI Spec](https://img.shields.io/badge/OpenAPI-3.1.0-green.svg)](specs/openapi.yaml)
[![Release Status](https://github.com/budget-buddy-org/budget-buddy-contracts/actions/workflows/release.yml/badge.svg)](https://github.com/budget-buddy-org/budget-buddy-contracts/actions/workflows/release.yml)
[![GitHub Release](https://img.shields.io/github/v/release/budget-buddy-org/budget-buddy-contracts)](https://github.com/budget-buddy-org/budget-buddy-contracts/releases)
[![npm](https://img.shields.io/badge/npm-GPR-blue.svg?logo=npm)](https://github.com/budget-buddy-org/budget-buddy-contracts/pkgs/npm/budget-buddy-contracts)
[![Maven](https://img.shields.io/badge/maven-GPR-blue.svg?logo=apachemaven)](https://github.com/budget-buddy-org/budget-buddy-contracts/packages/2953418)
[![API Docs](https://img.shields.io/badge/docs-Swagger%20UI-85ea2d.svg?logo=swagger)](https://budget-buddy-org.github.io/budget-buddy-contracts/)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=budget-buddy-org_budget-buddy-contracts&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=budget-buddy-org_budget-buddy-contracts)

📖 **Interactive API reference:** <https://budget-buddy-org.github.io/budget-buddy-contracts/>

This repository serves as the **Single Source of Truth** for the Budget Buddy ecosystem. We use a "Contract-First" approach, where the API is defined in OpenAPI 3.1 and then used to generate strongly-typed clients and server interfaces for all supported platforms.

---

## 🏛 Architecture

The core of this project is the OpenAPI specification located in `specs/openapi.yaml`. From this single file, we derive three distinct targets:

| Target | Technology | Delivery Method | Usage |
| :--- | :--- | :--- | :--- |
| **Frontend** | TypeScript (fetch) | GitHub Packages (npm) | Web dashboard |
| **Backend** | Java + Spring Boot | GitHub Packages (Maven) | API Service implementation |
| **Mobile** | Swift 6 | Git Repo (SPM) | iOS / macOS application |

### Why Contract-First?
- **Type Safety:** Eliminate runtime errors caused by mismatched API schemas.
- **Parallel Development:** Frontend, Backend, and Mobile teams can work simultaneously against a shared interface.
- **Documentation:** The spec *is* the documentation.
- **Consistency:** Standardized error handling (RFC 9457) across all platforms.

---

## 🛠 Developer Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v24+)
- [pnpm](https://pnpm.io/) — pinned via Corepack from the `packageManager` field; run `corepack enable` once

```bash
pnpm install   # installs Spectral and openapi-generator-cli as devDeps
```

### Core Commands

| Command | Description |
| :--- | :--- |
| `pnpm run lint` | Lints the spec with Spectral (operationId, tags, descriptions, 500 responses). |
| `pnpm run validate` | Checks the structural integrity of the OpenAPI document. |
| `pnpm run mock` | Runs a Prism mock server locally at `http://localhost:4010`. |
| `pnpm run generate` | Generates all clients (TS, Java, Swift) locally. |
| `pnpm run generate:swift` | Regenerates the committed Swift sources under `Sources/BudgetBuddyContracts/`. |

---

## 📦 Usage

See the [GitHub Release badge](#) above for the latest version.

### Swift (iOS/macOS)
Add this repository as a dependency in your `Package.swift`:
```swift
dependencies: [
    .package(url: "https://github.com/budget-buddy-org/budget-buddy-contracts.git", from: "<latest>")
]
```

### TypeScript (Web)
Install from GitHub Packages (requires `.npmrc` configuration pointing `@budget-buddy-org` to `https://npm.pkg.github.com`):
```bash
pnpm add @budget-buddy-org/budget-buddy-contracts
```

### Java (Spring Boot)
Add to your `pom.xml` (requires Maven server credentials for GitHub Packages):
```xml
<dependency>
    <groupId>com.budgetbuddy</groupId>
    <artifactId>budget-buddy-contracts</artifactId>
    <version><!-- latest --></version>
</dependency>
```

---

## 🚦 Release Workflow

1. **Edit the spec:** `specs/openapi.yaml` (and/or `config/*.yaml`).
2. **Lint and validate:** `pnpm run lint && pnpm run validate`.
3. **Open a PR with a conventional-commit title** (`feat:`, `fix:`, `feat!:`, …). PRs are squash-merged, so the PR title becomes the commit on `main` and drives semantic-release.
4. **CI does the rest** — on push to `main`, the release pipeline:
   - calculates the next semver from commit history
   - bumps `package.json` and `specs/openapi.yaml` to that version
   - regenerates and commits the Swift sources under `Sources/BudgetBuddyContracts/`
   - updates `CHANGELOG.md`
   - creates the Git tag and GitHub Release
   - publishes the TypeScript client to GitHub Packages (npm)
   - publishes the Java Spring stubs to GitHub Packages (Maven)

### Commit message enforcement

- Local commits are checked by Husky + Commitlint.
- PRs are re-checked in CI; invalid messages cannot be merged.
- Release impact follows Conventional Commits:
  - `fix:` / `perf:` → patch
  - `feat:` → minor
  - `!` suffix or `BREAKING CHANGE:` footer → major

---

## 📝 API Design Conventions

- **Currency:** Monetary amounts are `integer` (`int64`) in minor units — e.g. `1050` = `€10.50`. ISO 4217 codes accompany every amount.
- **Errors:** Every error response uses `application/problem+json` per **RFC 9457**. Field-level validation errors are surfaced as `Problem.errors[]` on `400` responses.
- **Pagination:** List endpoints accept `page` (zero-based, default 0) and `size` (1–200, default 20) query parameters; the response carries a `PaginationMeta` with `page`, `size`, and `total`.
- **Auth:** Every endpoint requires a Bearer JWT issued by the OIDC provider — there are no auth endpoints in this spec.
