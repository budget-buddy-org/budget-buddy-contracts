# Budget Buddy Contracts 🚀

[![OpenAPI Spec](https://img.shields.io/badge/OpenAPI-3.1.0-green.svg)](https://www.openapis.org/)
[![GitHub Release](https://img.shields.io/github/v/release/budget-buddy-org/budget-buddy-contracts)](https://github.com/budget-buddy-org/budget-buddy-contracts/releases)
[![npm (GitHub Packages)](https://img.shields.io/badge/npm-pkg.github.com-blue.svg)](https://github.com/budget-buddy-org/budget-buddy-contracts/packages)
[![Maven (GitHub Packages)](https://img.shields.io/badge/maven-pkg.github.com-blue.svg)](https://github.com/budget-buddy-org/budget-buddy-contracts/packages)
[![Linting: Spectral](https://img.shields.io/badge/linting-spectral-blue.svg)](https://stoplight.io/open-source/spectral)
[![Validation: OpenAPI Generator](https://img.shields.io/badge/validation-openapi--generator-orange.svg)](https://openapi-generator.tech/)
[![Swift Package Manager](https://img.shields.io/badge/SPM-compatible-brightgreen.svg)](https://swift.org/package-manager/)

This repository serves as the **Single Source of Truth** for the Budget Buddy ecosystem. We use a "Contract-First" approach, where the API is defined in OpenAPI 3.1 and then used to generate strongly-typed clients and server interfaces for all supported platforms.

---

## 🏛 Architecture

The core of this project is the OpenAPI specification located in `specs/openapi.yaml`. From this single file, we derive three distinct targets:

| Target | Technology | Delivery Method | Usage |
| :--- | :--- | :--- | :--- |
| **Frontend** | TypeScript + Axios | GitHub Packages (npm) | Web dashboard |
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
- [pnpm](https://pnpm.io/) (v10+)
- [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation)
- [Spectral CLI](https://meta.stoplight.io/docs/spectral/docs/guides/1-getting-started.md)

```bash
pnpm install
```

### Core Commands

| Command | Description |
| :--- | :--- |
| `pnpm run lint` | Lints the spec with Spectral (enforces `operationId` and naming conventions). |
| `pnpm run validate` | Checks the structural integrity of the OpenAPI document. |
| `pnpm run mock` | Runs a Prism mock server locally at `http://localhost:4010`. |
| `pnpm run generate` | Generates all clients (TS, Java, Swift) locally. |
| `pnpm run generate:swift` | Specifically updates the committed Swift source files. |

---

## 📦 Usage

### Swift (iOS/macOS)
Add this repository as a dependency in your `Package.swift`:
```swift
dependencies: [
    .package(url: "https://github.com/budget-buddy-org/budget-buddy-contracts.git", from: "1.1.0")
]
```

### TypeScript (Web)
Install from GitHub Packages (requires `.npmrc` configuration):
```bash
pnpm add @budget-buddy-org/budget-buddy-contracts
```

### Java (Spring Boot)
Add to your `pom.xml`:
```xml
<dependency>
    <groupId>com.budgetbuddy</groupId>
    <artifactId>budget-buddy-contracts</artifactId>
    <version>1.1.0</version>
</dependency>
```

---

## 🚦 Release Workflow

1. **Modify the Spec:** Edit `specs/openapi.yaml`.
2. **Use Conventional Commits:** Merge changes to `main` with commit messages such as `feat(spec): add category color` or `fix(auth): clarify refresh token schema`.
3. **Automatic Release:** The `Release` GitHub Action runs on every push to `main`, calculates the next semantic version from commit history, then automatically:
   - bumps `package.json` and `specs/openapi.yaml` to the new version
   - regenerates and commits the Swift sources in `Sources/BudgetBuddyContracts/`
   - updates `CHANGELOG.md`
   - creates the Git tag and GitHub Release
   - publishes the generated TypeScript client to GitHub Packages
   - publishes the generated Java Spring stubs to GitHub Packages

### Commit Message Enforcement

- Local commits are checked by Husky + Commitlint.
- Pull requests are checked again in CI, so invalid commit messages cannot be merged accidentally.
- Release impact follows Conventional Commits:
  - `fix:` and `perf:` => patch
  - `feat:` => minor
  - `!` or `BREAKING CHANGE:` => major

---

## 📝 API Design Conventions

- **Currency:** All monetary amounts are handled as `integers` in minor units (e.g., `$10.50` is represented as `1050`).
- **Errors:** We follow **RFC 9457** (Problem Details for HTTP APIs). Every error response uses the `application/problem+json` content type.
- **Pagination:** Collections use a standardized `PaginationMeta` object containing `total`, `limit`, and `offset`.
- **Auth:** Bearer Token (JWT) is used globally except for login/register endpoints.
