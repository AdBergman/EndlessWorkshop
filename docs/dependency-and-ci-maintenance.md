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

## Batching And Integration

Group compatible updates by what can be reviewed, tested, and rolled back
together. Keep Maven, npm runtime, npm development tooling, Docker/runtime
alignment, and GitHub Actions in separate batches. React, React DOM, and their
types belong in one family even though their manifest dependency types differ.
Group npm patch/minor security fixes separately from routine version updates;
major migrations remain individual proposals unless an upstream compatibility
requirement makes a paired migration necessary.

Keep the existing weekly Maven/npm and monthly Actions/Docker schedules. Normal
npm releases wait three days for patches, seven for minors, and 21 for majors;
Maven majors wait 30 days. Security updates bypass Dependabot's version-update
cooldown, but still require the relevant gates. A manual update must also check
the resolved lockfile versions: a mature requested version can otherwise resolve
to a release published today. See the [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference).

### October 2026 Integration Queue

The replacement PRs preserve separate rollback boundaries. Integration and
production deployment remain maintainer-owned; merge deliberately in this order
and allow each runtime batch through the normal deploy gate.

| Order | Batch | Integration condition |
| --- | --- | --- |
| 1 | [#79](https://github.com/AdBergman/EndlessWorkshop/pull/79): Spring Boot/springdoc patches | Maven, Docker, and isolated production-profile smoke passed; check the deployed environment after integration. |
| 2 | [#80](https://github.com/AdBergman/EndlessWorkshop/pull/80): frontend security fixes | Full frontend gates passed and local audit is zero; default-branch alerts resolve after merge. |
| 3 | [#81](https://github.com/AdBergman/EndlessWorkshop/pull/81): Node 24.21 alignment; [#82](https://github.com/AdBergman/EndlessWorkshop/pull/82): setup-java v6 | Independent batches; Docker/CI checks passed. |
| 4 | [#83](https://github.com/AdBergman/EndlessWorkshop/pull/83): mature frontend tooling patch/minor updates | Merge #80 first; preserve reviewed Vite 8.3.0 and typescript-eslint 8.70.0 lock versions. |
| 5 | [#84](https://github.com/AdBergman/EndlessWorkshop/pull/84): React/types/router patch/minor updates | Merge #80 first; maintainer browser smoke for startup, routes/back-forward, shared builds, tooltips, and admin import. |
| 6 | [#85](https://github.com/AdBergman/EndlessWorkshop/pull/85): jest-dom 7 | Merge #80 first; Vitest matcher entry point and one asynchronous test assertion migrated. |
| 7 | [#86](https://github.com/AdBergman/EndlessWorkshop/pull/86): paired jsdom 30/Vitest 5 | Merge #81/#85 first; hold until 3 October 2026 after 13:31 Europe/Stockholm for the Vitest 5.0.3 patch cooldown. Recheck upstream regressions and CI. |

Frontend replacements share the #80 security baseline so each can be tested
without vulnerable tooling. After #80 merges their shared diffs shrink. If later
lockfiles conflict, regenerate only the approved package changes against the
reviewed integration baseline, preserve mature versions, and rerun tests,
typecheck, build, lint, and audit. Never replace the whole lockfile with an older
PR's copy and thereby undo a preceding batch. A passing individual PR is not a
substitute for checking the combined result.

Disposable combined snapshots of #80/#83/#84/#85, and of those batches plus #86,
passed all 913 frontend tests, typecheck, build, lint, and a zero-vulnerability
audit on Node 24.21.0. These are compatibility evidence, not a merge or a
production browser smoke. Recheck the actual integration result if its lockfile
differs. The grouping-policy change can land independently of the package queue.

Framer Motion 13 is explicitly deferred: the current application has no identified
feature, bug, or security requirement for this major migration. Close the current
proposal and revisit in November 2026, or earlier for a relevant fix/security
advisory. Do not permanently ignore the dependency or suppress security alerts.
The superseded bot proposals should stay closed; each has a replacement PR or
this explicit deferral. Keep automatic merging disabled.

## Manual GitHub Setup

These settings are not fully represented by files in the repository:

- Enable Dependabot alerts.
- Enable Dependabot security updates.
- Keep deploy secrets available only to trusted main/deploy workflows.
- Do not grant broad repository write permissions to workflows unless a workflow
  explicitly needs them.

Dependabot alerts and automatic security-update PRs were enabled on 1 October
2026. Keep both enabled. The 23 existing default-branch alerts are addressed by
#80's compatible lockfile updates; do not dismiss them manually while its merge
is outstanding.

## Live Faction Rollout: Manual Data Refresh

After deploying live-faction support, use the production Admin Import UI/API to
import current game exports. Import rich `factions` before `tech`, then refresh
`units`, `heroes`, `quest_explorer`, and affected Codex categories. Existing tech
availability is stored at import time, so changing faction traits requires
reimporting tech even if its export has not changed. Tech-first imports without
any major faction dataset retain legacy bootstrap behavior.

Verify `/api/factions`, `/api/units`, `/api/techs`, Codex faction browsing, and a
SandShaper/alternate direct link and saved build. Explicit prototypes and internal
rows should remain absent. The top navigation should still show five factions.
Current live export acquisition and production imports require maintainer access;
local startup fixtures must never populate production.

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
