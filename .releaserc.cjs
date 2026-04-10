module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "sed -i 's/^  version: .*/  version: \"${nextRelease.version}\"/' specs/openapi.yaml && pnpm run generate:swift",
      },
    ],
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
    "@semantic-release/github",
  ],
};
