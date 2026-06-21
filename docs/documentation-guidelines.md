# Documentation Guidelines

Keep project documentation small, current, and placed by purpose.

## Active Docs

- Active docs should describe the current contract, workflow, or decision.
- New active docs must be added to `docs/active/README.md`; prompts should
  specify the task type and required docs instead of asking agents to read every
  active doc.
- Prefer short status summaries with links or paths to richer archived context.
- Keep implementation history out of active docs unless it changes current
  behavior.
- When a handoff is completed, replace long request text with a short status:
  what landed, where it is consumed, what remains open, and where the archive
  lives.

## Update Discipline

- Update active docs when a task creates, changes, or supersedes durable project
  knowledge.
- Do not update docs for routine implementation work, tiny CSS changes, or
  behavior-preserving fixes unless an active doc becomes inaccurate.
- Update `docs/active/README.md` when adding, archiving, replacing, or
  superseding an active doc.
- Update `docs/current-action-priorities.md` when current priorities or the
  accepted next direction changes.
- Update category evolution and execution docs when reopening, changing, or
  closing a category evolution task.

## Archive Docs

- Move obsolete handoffs, superseded proposals, and completed investigation
  bundles to `docs/archive/`.
- Preserve rich evidence in the archive when it may help later debugging or
  exporter/backend/frontend coordination.
- Name archived files by topic and date when possible.

## Open Work

- Keep richer detail only for unresolved decisions or actionable follow-ups.
- Separate completed work from remaining work so stale requests do not look
  like active backlog.
- Prefer concrete paths, contract names, and validation status over broad
  narrative.
