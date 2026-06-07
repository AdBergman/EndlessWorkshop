# Dependency And CI Maintenance

Status: active solo-maintainer guidance.

EWShop is a public hobby project. The goal is to stay current without turning
dependency updates into enterprise ceremony or blindly trusting package
registries.

## Project Policy

- Keep normal feature work main-first when that is the fastest safe flow.
- Use branches or PRs for dependency updates, migrations, deploy changes, and
  large refactors.
- Dependabot PRs are suggestions, not auto-approved changes.
- Do not auto-merge dependency PRs.
- Prefer patch and minor updates in small batches.
- Treat major updates, build plugins, Docker base images, and GitHub Actions as
  higher-risk changes.
- Wait a few days before merging non-security npm updates unless there is a
  strong reason to move immediately.
- Security updates can move faster, but still need tests and a quick diff review.

## Manual GitHub Setup

These settings are not fully represented by files in the repository:

- Enable Dependabot alerts.
- Enable Dependabot security updates.
- Keep deploy secrets available only to trusted main/deploy workflows.
- Do not grant broad repository write permissions to workflows unless a workflow
  explicitly needs them.

## Dependabot Review Checklist

For each dependency PR:

- Read the PR title and ecosystem: Maven, npm, GitHub Actions, or Docker.
- Check whether it is security, patch/minor, or major.
- For npm, skim `package-lock.json` for surprising new packages.
- For Maven, look for new plugins, repositories, or large transitive changes.
- For GitHub Actions, check whether permissions or action ownership changed.
- For Docker, check runtime/build image release notes when the base image changes.
- Run or rely on CI before merging.
- Do not merge if tests fail, if the diff adds unexplained build-time execution,
  or if the update is unrelated to the current risk being fixed.

## Expected Gates

Backend and frontend CI should pass before dependency changes are merged:

- `./mvnw -B test`
- `frontend npm test -- --run`
- `frontend npx tsc --noEmit --project tsconfig.json`
- `frontend npm run build`
- Docker build for runtime-affecting changes

Deploy still runs from `main`. Dependency PRs should be merged deliberately and
then allowed to pass the normal deploy gate.

## AI Guidance

When an AI agent handles dependency or CI changes:

- Keep changes grouped by ecosystem or by one migration goal.
- Do not add paid tooling, strict SHA pinning, SBOM generation, or broad scanners
  unless explicitly requested.
- Do not change the main-first workflow into mandatory PR-only development.
- Document any manual maintainer action in this file.
- Link back to this file instead of duplicating these rules in `AGENTS.md`.
