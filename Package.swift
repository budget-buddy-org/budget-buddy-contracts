// swift-tools-version:6.0
// This file makes the repo a Swift Package — iOS apps add this repo as a dependency.
// Sources live in Sources/BudgetBuddyContracts/ (regenerated via: npm run generate:swift).
import PackageDescription

let package = Package(
    name: "BudgetBuddyContracts",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "BudgetBuddyContracts",
            targets: ["BudgetBuddyContracts"]
        )
    ],
    targets: [
        .target(
            name: "BudgetBuddyContracts",
            path: "Sources/BudgetBuddyContracts"
        )
    ],
    swiftLanguageModes: [.v6]
)
