# Dependency And CI Maintenance

Status: active solo-maintainer guidance.

EWShop is a public hobby project. The goal is to stay current without turning
dependency updates into enterprise ceremony or blindly trusting package
registries.

## Project Policy

- Codex implementation work uses a dedicated `codex/*` task branch and a PR into
  `main` for review; after merge/closeout, the task branch should be deleted.
- Before implementation edits, Codex should either confirm it is continuing the
  same coherent task/PR branch or checkout `main`, refresh it from the remote
  when network access is available, and create a fresh `codex/*` task branch
  from that refreshed `main`.
- Task size, perceived risk level, solo-maintainer status, and lack of detected
  concurrent agents are not reasons for Codex to work directly on `main`.
- Direct `main` work remains acceptable for the human maintainer when
  explicitly appropriate.
- This is a lightweight hobby-project workflow, not GitFlow: short-lived task
  branches, PR review, then branch cleanup.
- Long interactive Codex sessions may keep one task branch/PR for continuous
  related work; separate tasks or new sessions should start fresh from refreshed
  `main` unless the user explicitly says they continue an existing branch/PR.
- Use branch/PR workflows for dependency updates, migrations,
  deploy/runtime changes, and large refactors.
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

## Codex GitHub Auth

EWShop Codex sessions can see three distinct GitHub execution paths:

- Git fetch/push uses the repository remote. The canonical EWShop remote is SSH,
  `git@github.com:AdBergman/EndlessWorkshop.git`, backed by the host SSH
  agent/keychain.
- Local `gh` uses the host GitHub CLI account/keyring. For EWShop handoff, run
  it with `GH_TOKEN` and `GITHUB_TOKEN` unset so stale or under-scoped
  environment tokens cannot override the keyring account.
- The GitHub connector uses a separate Codex GitHub App installation. Connector
  reads are useful for PR/repo inspection, but connector `403 Resource not
  accessible by integration` errors are app-permission failures and do not prove
  the host `gh` account or SSH Git path is unavailable.

Canonical push/PR handoff path:

```bash
env -u GH_TOKEN -u GITHUB_TOKEN git push origin HEAD
env -u GH_TOKEN -u GITHUB_TOKEN gh pr create --repo AdBergman/EndlessWorkshop --base main --head <branch>
```

Do not report PR creation blocked after a sandbox network failure or GitHub
connector 403 until the canonical host-authenticated `git`/`gh` path has also
failed. Use `scripts/github-auth-diagnostic.sh` for non-secret diagnostics; it
reports token presence only, never credential values.

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

## Runtime Version Policy

- Backend Java is JDK 26.
- Keep the root Maven `<java.version>`, GitHub Actions Java setup, Docker
  build/runtime images, README, and backend architecture guidance aligned to
  JDK 26.
- Treat changes to the backend JDK, Spring Boot major/minor line, Maven build
  plugins, Docker base images, or deploy smoke as runtime-affecting changes.
- For runtime-affecting changes, run the strongest reasonable Maven gate and a
  Docker build before merging. If local tooling cannot supply the target JDK,
  say so explicitly and rely on CI only as a conscious choice.

## AI Guidance

When an AI agent handles dependency or CI changes:

- Keep changes grouped by ecosystem or by one migration goal.
- Do not add paid tooling, strict SHA pinning, SBOM generation, or broad scanners
  unless explicitly requested.
- Do not turn branch/PR-based Codex implementation into heavyweight process
  bureaucracy for small local changes.
- Document any manual maintainer action in this file.
- Link back to this file instead of duplicating these rules in `AGENTS.md`.
