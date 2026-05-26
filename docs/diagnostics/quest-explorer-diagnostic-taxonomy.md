# Quest Explorer Diagnostic Taxonomy

Status: active diagnostics note

Quest Explorer diagnostics use `docs/quest_explorer_canonical_semantics_v1.md`
as their semantic reference.

Current diagnostic output should prefer canonical terms:

- setup/artifact rows
- deterministic continuations
- grouped deterministic continuation groups
- explicit decision options and true-choice groups
- topology forks without `true_choice`
- convergence states
- terminal states
- failure states/links
- unresolved continuations
- internal/chapter variants
- alias-owned stages
- lore ownership gaps
- objective ownership gaps

Per-faction summaries should report the same taxonomy for configured major
faction keys, plus semantic chapter counts when a progression DTO is available.
When progression is missing, diagnostics should say that semantic chapter counts
are unavailable instead of inferring chapters from titles or keys.

Historical terms such as "choice path", "branch choice", "hidden branch",
"Path Revealed", and "Next Choices" may still appear in legacy docs, raw DTO
field names, or stable implementation identifiers, but they should not be
introduced as new diagnostic categories or user-facing debug labels.
