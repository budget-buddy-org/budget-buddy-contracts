module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    // Writes CHANGELOG.md (prepare phase, before git commit)
    "@semantic-release/changelog",
    // Bumps package.json version (prepare phase)
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    // Updates openapi.yaml version + regenerates Swift sources (prepare phase)
    // Generates + publishes TypeScript and Java packages (publish phase)
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "sed -i 's/^  version: .*/  version: \"${nextRelease.version}\"/' specs/openapi.yaml && pnpm run generate:swift",
        publishCmd: [
          // TypeScript: generate, stamp version, publish to GitHub Packages (npm)
          "pnpm run generate:ts",
          "jq --arg v '${nextRelease.version}' '.version = $v' config/typescript-package.json > generated/typescript/package.json",
          "(cd generated/typescript && pnpm publish --no-git-checks)",
          // Java: generate, publish to GitHub Packages (Maven)
          "pnpm run generate:java",
          "mvn deploy --file generated/java/pom.xml -s config/maven-settings.xml -DaltDeploymentRepository=github::https://maven.pkg.github.com/budget-buddy-org/budget-buddy-contracts --no-transfer-progress -DskipTests",
        ].join(" && "),
      },
    ],
    // Commits all prepare-phase changes (CHANGELOG, package.json, spec, Swift sources)
    [
      "@semantic-release/git",
      {
        assets: [
          "package.json",
          "specs/openapi.yaml",
          "CHANGELOG.md",
          "Sources/BudgetBuddyContracts/",
        ],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    // Creates GitHub Release with notes
    "@semantic-release/github",
  ],
};
