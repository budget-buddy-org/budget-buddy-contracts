# Contributing

## Release process

Releases are fully automated from `main` using semantic-release.

- A push to `main` triggers `release.yml`, which computes the next semantic version, creates the Git tag, and creates the GitHub Release.
- The publish workflow (`publish.yml`) then publishes both package artifacts:
  - `@budget-buddy-org/budget-buddy-contracts` (npm)
  - `com.budget-buddy:budget-buddy-contracts` (Maven)

`CLAUDE.md` may contain additional assistant-oriented context, but this document is the source of truth for contributor release operations.

## Recovery: partial publish failure

The `publish.yml` workflow runs two independent jobs in parallel — `publish-typescript` and `publish-java`. If one job fails after a GitHub Release is already created, the release tag exists but one or both packages are unpublished.

### Symptoms

- A GitHub Release exists for version `vX.Y.Z`
- One of the following is missing from GitHub Packages:
  - `@budget-buddy-org/budget-buddy-contracts` (npm)
  - `com.budget-buddy:budget-buddy-contracts` (Maven)

### How to recover

The `publish.yml` workflow supports `workflow_dispatch` for exactly this scenario. Re-run it from the release tag to republish both packages.

For Maven, GitHub Packages accepts re-publishing the same artifact version, so this is idempotent.
For npm, a duplicate publish is rejected, but the job still succeeds because `pnpm publish` treats an already-existing version as non-fatal in this workflow (`--no-git-checks` is used).

**Steps:**

1. Go to **Actions → Publish** in the GitHub repository.
2. Click **Run workflow**.
3. In the **Tag or branch to publish from** field, enter the tag for the failed release (e.g. `v1.2.3`).
4. Click **Run workflow**.
5. Monitor both jobs. The already-published artifact may log a conflict warning — this is expected and harmless.

### If the release itself failed mid-way

If `release.yml` failed after creating the Git tag but before creating the GitHub Release (rare), semantic-release will refuse to re-run because the tag already exists. In that case:

1. Delete the Git tag locally and remotely:
   ```bash
   git tag -d vX.Y.Z
   git push origin :refs/tags/vX.Y.Z
   ```
2. Re-run `release.yml` manually via `workflow_dispatch` on `main`, or push an empty commit to `main` to retrigger it.

> **Note:** Deleting a tag is a destructive action. Confirm with the team before proceeding, especially if downstream consumers have already pinned to the tag.
