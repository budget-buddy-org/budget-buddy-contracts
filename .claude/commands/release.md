Run the full release workflow for budget-buddy-contracts.

Steps:
1. Run `npm run lint` — must pass with no errors before proceeding
2. Run `npm run validate` — must pass before proceeding
3. Run `npm run generate:swift` and commit any changes in `Sources/BudgetBuddyContracts/` with message `chore: regenerate Swift sources for vX.Y.Z`
4. Determine the bump type (patch/minor/major) based on what changed in `specs/openapi.yaml` since the last tag:
   - MAJOR — removed endpoint, changed required field, renamed operationId
   - MINOR — new endpoint, new optional field
   - PATCH — generator config tweak, doc/comment update
   If `$ARGUMENTS` is provided (e.g. `patch`, `minor`, `major`), use that instead.
5. Compute the new version by incrementing `package.json`'s current version accordingly
6. Update `version` in `package.json` and `info.version` in `specs/openapi.yaml` to the new version — they must match
7. Add a new entry to the top of `CHANGELOG.md` under the new version with today's date and a summary of changes
8. Commit all changes: `git add package.json specs/openapi.yaml CHANGELOG.md Sources/` with message `chore: release vX.Y.Z`
9. Show the user the planned git tag command and ask for confirmation before tagging:
   `git tag vX.Y.Z && git push --follow-tags`
   Explain that pushing the tag triggers CI to generate TypeScript + Java and publish both to GitHub Packages.
