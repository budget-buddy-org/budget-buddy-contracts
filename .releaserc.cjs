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
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "sed -i 's/^  version: .*/  version: \"${nextRelease.version}\"/' specs/openapi.yaml && pnpm run generate:swift",
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
    // Creates GitHub Release — triggers the Publish workflow
    "@semantic-release/github",
  ],
};
