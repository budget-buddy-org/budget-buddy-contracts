module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "semantic-release-openapi",
      {
        apiSpecFiles: ["specs/openapi.yaml"],
      },
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd: "pnpm run generate:swift",
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
