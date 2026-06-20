# Quest Explorer Documentation Status

Status: current entry point

Canonical Quest Explorer semantics now live in:

1. `../quest_explorer_canonical_semantics_v1.md`

Historical Quest Explorer design notes, handoff notes, contract baselines,
audits, feasibility notes, and design bundle artifacts live in
`../archive/quest-explorer/`.

Archived docs that may help reconstruct earlier decisions:

- `../archive/quest-explorer/quest_explorer_documentation_audit_v1.md`
- `../archive/quest-explorer/quest-explorer-ux-design-template.md`
- `../archive/quest-explorer/quest-explorer-rich-import-architecture-review.md`
- `../archive/quest-explorer/quest_explorer_live_0_80_semantic_gap_audit_v1.md`
- `../archive/quest-explorer/quest_explorer_vs_quest_codex_comparison_v1.md`
- `../archive/quest-explorer/quest_explorer_codex_tooltips_feasibility_v1.md`

Implementation note:

Current frontend code still contains legacy names such as `questPathFlow`,
`choicePath`, and `RenderedPathStep`. Treat those as stable implementation
vocabulary, not semantic authority. New Quest work should use the canonical
terms from the semantic spec and avoid broad "step/choice/path" language unless
the narrower meaning is explicit.
