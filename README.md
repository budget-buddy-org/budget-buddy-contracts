# Budget Buddy Contracts 🚀

[![OpenAPI Spec](https://img.shields.io/badge/OpenAPI-3.1.0-green.svg)](https://www.openapis.org/)
[![GitHub Release](https://img.shields.io/github/v/release/glebremniov/budget-buddy-contracts)](https://github.com/glebremniov/budget-buddy-contracts/releases)
[![npm (GitHub Packages)](https://img.shields.io/badge/npm-pkg.github.com-blue.svg)](https://github.com/glebremniov/budget-buddy-contracts/packages)
[![Maven (GitHub Packages)](https://img.shields.io/badge/maven-pkg.github.com-blue.svg)](https://github.com/glebremniov/budget-buddy-contracts/packages)
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
- **Consistency:** Standardized error handling (RFC 7807) across all platforms.

---

## 🛠 Developer Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation)
- [Spectral CLI](https://meta.stoplight.io/docs/spectral/docs/guides/1-getting-started.md)

```bash
npm install
```

### Core Commands

| Command | Description |
| :--- | :--- |
| `npm run lint` | Lints the spec with Spectral (enforces `operationId` and naming conventions). |
| `npm run validate` | Checks the structural integrity of the OpenAPI document. |
| `npm run generate` | Generates all clients (TS, Java, Swift) locally. |
| `npm run generate:swift` | Specifically updates the committed Swift source files. |

---

## 📦 Usage

### Swift (iOS/macOS)
Add this repository as a dependency in your `Package.swift`:
```swift
dependencies: [
    .package(url: "https://github.com/glebremniov/budget-buddy-contracts.git", from: "1.0.0")
]
```

### TypeScript (Web)
Install from GitHub Packages (requires `.npmrc` configuration):
```bash
npm install @glebremniov/budget-buddy-contracts
```

### Java (Spring Boot)
Add to your `pom.xml`:
```xml
<dependency>
    <groupId>com.budgetbuddy</groupId>
    <artifactId>budget-buddy-contracts</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## 🚦 Release Workflow

1. **Modify the Spec:** Edit `specs/openapi.yaml`.
2. **Sync Swift:** Run `npm run generate:swift` and commit the changes in `Sources/`.
3. **Version Bump:** Update `version` in `package.json` and document changes in `CHANGELOG.md`.
4. **Publish:**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
   *The GitHub Action will automatically generate and publish the TypeScript and Java artifacts to GitHub Packages.*

---

## 📝 API Design Conventions

- **Currency:** All monetary amounts are handled as `integers` in minor units (e.g., `$10.50` is represented as `1050`).
- **Errors:** We follow **RFC 7807** (Problem Details for HTTP APIs). Every error response uses the `application/problem+json` content type.
- **Pagination:** Collections use a standardized `PaginationMeta` object containing `total`, `limit`, and `offset`.
- **Auth:** Bearer Token (JWT) is used globally except for login/register endpoints.
