#!/usr/bin/env bash
set -uo pipefail

repo="${1:-AdBergman/EndlessWorkshop}"
remote="${GIT_REMOTE:-origin}"

sanitize() {
  sed -E \
    -e 's/(Token: )[[:graph:]]+/\1<redacted>/' \
    -e 's/(oauth_token: ).*/\1<redacted>/' \
    -e 's/(GH_TOKEN=)[^[:space:]]+/\1<redacted>/' \
    -e 's/(GITHUB_TOKEN=)[^[:space:]]+/\1<redacted>/'
}

run() {
  local title="$1"
  shift
  printf '\n== %s ==\n' "$title"
  "$@" 2>&1 | sanitize
  local status=${PIPESTATUS[0]}
  printf '[exit %s]\n' "$status"
}

presence() {
  local name="$1"
  if [[ -n "${!name-}" ]]; then
    printf '%s=present\n' "$name"
  else
    printf '%s=absent\n' "$name"
  fi
}

remote_branch_exists() {
  local output
  local status

  output="$(git ls-remote --heads "$remote" "$branch" 2>&1)"
  status=$?
  if [[ $status -ne 0 ]]; then
    printf '%s\n' "$output"
    return "$status"
  fi

  if [[ -n "$output" ]]; then
    printf 'exists=yes branch=%s\n' "$branch"
    printf '%s\n' "$output"
  else
    printf 'exists=no branch=%s\n' "$branch"
  fi
}

branch="$(git branch --show-current 2>/dev/null || true)"
if [[ -z "$branch" ]]; then
  branch="HEAD"
fi

printf 'EWShop GitHub auth diagnostic\n'
printf 'repo=%s\n' "$repo"
printf 'remote=%s\n' "$remote"
printf 'cwd=%s\n' "$(pwd)"
printf 'CODEX_SANDBOX_NETWORK_DISABLED=%s\n' "${CODEX_SANDBOX_NETWORK_DISABLED:+present}"
if [[ -n "${CODEX_SANDBOX_NETWORK_DISABLED-}" ]]; then
  printf 'note=Codex sandbox marker is present; only treat network failures as host-auth failures after a host/elevated run\n'
fi
presence GH_TOKEN
presence GITHUB_TOKEN
presence GH_ENTERPRISE_TOKEN
presence GITHUB_ENTERPRISE_TOKEN

run "current branch and upstream" git status --porcelain=v2 --branch
run "configured remote" git remote -v
run "credential helper configuration" git config --show-origin --get-regexp '^credential\.'
run "effective ssh configuration for github.com" sh -c "ssh -G github.com 2>/dev/null | grep -E '^(user|hostname|identityfile|identitiesonly|identityagent|addkeystoagent|usekeychain) '"
run "ssh agent public fingerprints" ssh-add -l -E sha256
run "github ssh identity probe, success message commonly exits 1" ssh -T git@github.com
run "remote branch existence" remote_branch_exists
run "canonical gh auth status, env tokens unset" env -u GH_TOKEN -u GITHUB_TOKEN gh auth status --hostname github.com
run "canonical repo permission, env tokens unset" env -u GH_TOKEN -u GITHUB_TOKEN gh repo view "$repo" --json nameWithOwner,viewerPermission,isPrivate
run "safe push dry-run, env tokens unset" env -u GH_TOKEN -u GITHUB_TOKEN git push --dry-run "$remote" "HEAD:refs/heads/$branch"
