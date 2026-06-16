# Codex Content Quality Audit

Status: archived content audit snapshot
Created: 2026-06-12
Scope: user-facing Codex content only

Archived note: this is a point-in-time manual audit. Use
`docs/active/codex-content-quality-diagnostics.md` for current repeatable
diagnostics and
`docs/active/codex-db-exporter-definitive-handoff.md` for the current
DB exporter/editorial handoff.

## Scope

This audit reviews what a player actually sees or searches in Codex. It does
not review metadata support, architecture, importer behavior, SEO, graph links,
or exporter implementation quality.

Sources:

- `local-imports/codex/*_codex_export_0.80.json`
- current EWShop Codex presentation behavior
- `docs/current-action-priorities.md`

## Executive Verdict

The Codex now has enough structure to be useful, but the content still often
reads like database output. The largest quality problems are:

1. duplicated fact lines appearing again as prose;
2. raw mechanics labels such as `Value type`, `Operation`, `Reference key`, and
   `Target scope`;
3. internal names leaking into visible content;
4. numeric values without units, source, or player interpretation;
5. empty or nearly empty entries in important browsing categories;
6. useful gameplay sections, especially Effects, Unlocks, Granted abilities,
   Stats, Requirements, and Rewards, not always being editorially prioritized.

## Severity

- Critical: actively misleading, raw/internal, or broadly damages trust.
- High: common player-facing noise that hides useful gameplay value.
- Medium: confusing or low-value but recoverable with context.
- Low: polish issue, wording problem, or category-specific cleanup.

## Issue Register

| ID | Category | Severity | Example | Why it is bad | Owner |
| --- | --- | --- | --- | --- | --- |
| CQ-001 | All structured categories | High | Equipment repeats `Type: Accessory`, `Slot: Accessory`, `Tier: 0`, and `Value: 50.00` in `descriptionLines` after the fact grid. | Repeated facts make detail pages feel padded and machine-generated. | EWShop |
| CQ-002 | All structured categories | High | Abilities, councilors, equipment, tech, units, quests, and traits all have fact-prefixed description lines duplicated from exported facts. | The player reads the same information twice instead of getting explanation. | EWShop |
| CQ-003 | All categories | Medium | `Kind: Unit`, `Kind: Technology`, `Kind: District`, `Kind: Improvement`. | Kind is often just the selected category restated; it adds little scan value. | Both |
| CQ-004 | All categories | Medium | Numeric facts such as `Tier: 0`, `Era: 1`, `Cost: 1`, `Value: 50.00`. | Numbers need units or context. A player should not have to infer scale or use. | Both |
| CQ-005 | Abilities | High | `Target: EmptyTile,Allies,Enemies`; `Range: 5`; `Cost: 1 Battle Token`. | Raw target enums and cost labels are useful data but poor player prose. | Exporter |
| CQ-006 | Abilities | Medium | `Shape: AoE 1`; many entries have only mechanical lines and no explanation. | The player sees shape/range data without learning why the ability matters. | Both |
| CQ-007 | Abilities | Medium | Effects describe triggers but not tactical role, such as a heal or retaliation effect without a plain-language summary. | Wiki users need "what this is for" before reading formulas. | Exporter |
| CQ-008 | Actions | Critical | 145 Actions have no `descriptionLines`. | A visible category with no explanatory copy feels unfinished. | Exporter |
| CQ-009 | Actions | Critical | `Reference key: ActionTypeAbsorbCity` on action detail pages. | Internal identifiers are not player-facing content. | EWShop |
| CQ-010 | Actions | High | `Category` and `Kind` are identical for all 145 Actions. | Duplicate facts waste the most valuable scan area. | EWShop |
| CQ-011 | Actions | High | `Value type: Turns`, `Value type: Industry`, `Value type: Amount`. | "Value type" is implementation language and does not explain cost, duration, or yield. | Both |
| CQ-012 | Actions | Medium | `Uses the cut-forest game-speed factor and recess count; turn cost modifiers may apply.` | This is internal balancing language, not player guidance. | Exporter |
| CQ-013 | Diplomatic Treaties | Medium | `Bilateral: No`; `Duration: 5 turns`; `Category: Repeatable Declaration`. | Useful, but needs clearer player phrasing such as whether both empires receive effects. | EWShop |
| CQ-014 | Diplomatic Treaties | Medium | `Send a Compliment to cause a positive impact on the Public Opinion of both Empire.` | Grammar errors reduce trust in the encyclopedia. | Exporter |
| CQ-015 | Diplomatic Treaties | Low | Effects often duplicate the one-line description. | Duplicate sections should not appear unless they add structure. | Both |
| CQ-016 | Statuses | Critical | `Category: Status` and `Kind: Status` on status entries. | The page already communicates status; duplicate facts add no value. | EWShop |
| CQ-017 | Statuses | High | Names like `Hero Status Loss` and `Hero Status Necro Egg Carrier`. | Raw names feel like debug labels rather than public encyclopedia entries. | Exporter |
| CQ-018 | Statuses | Medium | Section title `Status mechanics`. | Accurate but dry; the player wants effect, source, duration, and stacking implications. | Both |
| CQ-019 | Modifiers | Critical | `Action Cost Modifer Close Rift Decree Discovery 07 00`. | Raw generated names and misspelling make Codex feel unshipped. | Exporter |
| CQ-020 | Modifiers | Critical | `Operation: Mult`, `Value: 0.50`, `Display value: -50%`, `Target scope: Constructibles: Constructible With Descriptor`. | This is database output, not readable gameplay content. | Both |
| CQ-021 | Modifiers | High | `Category: Cost Modifier` and `Kind: Cost Modifier` are repeated for all modifiers. | Modifier pages should explain what cost changes, not restate "modifier". | EWShop |
| CQ-022 | Populations | High | `Faction: Faction_Aspect`; threshold reward `Cost modifier`. | Raw keys and generic reward labels hide what a population unlock actually does. | Exporter |
| CQ-023 | Populations | Medium | `Base food cost: 60`. | Useful for experts, but unclear without whether it is growth cost, recruitment cost, or scaling baseline. | Both |
| CQ-024 | Equipment | High | `Value: 50.00`; `Tier: 0`; `Access pool: Marketplace`. | Equipment has rich content, but raw numbers and pool labels do not explain acquisition or comparison value. | Both |
| CQ-025 | Equipment | Medium | Granted abilities are valuable but easy to scan past after a long fact block. | Players compare gear by abilities and effects first, not by raw price. | EWShop |
| CQ-026 | Traits | High | 31 traits have only prefixed fact lines such as `Category`, `Cost`, `Unlocks technology`, or `Prohibits`. | Trait pages need the strategic consequence, not just classification. | Exporter |
| CQ-027 | Traits | Medium | `Category: Affinity - Aspects`, `Cost: 10`, `Required affinity: ...`. | The fields are useful but should be supported by why/when a player would choose it. | Both |
| CQ-028 | Traits | Medium | Unlocks and exclusions appear as ordinary sections. | Unlocks and exclusions are decision-critical and should be visually prioritized. | EWShop |
| CQ-029 | Councilors | Critical | `Notable_CollectibleEvent_015_TBD`; `Notable_CouncilorDispute_Event003_Reward`. | Raw placeholder names should not appear in player-facing Codex. | Exporter |
| CQ-030 | Councilors | High | `Councilor effect: Surveyor`; `Partner effect: Courier's Tongue`; `Role: Development`. | Effect names without effect descriptions do not help a player choose a councilor. | Exporter |
| CQ-031 | Councilors | Medium | Role and faction lines repeat in descriptions after facts. | Duplicate lines reduce readability in a category that should be comparison-friendly. | EWShop |
| CQ-032 | Factions | High | The same identity sentence appears across multiple factions. | Faction pages should have unique identity; repeated generic copy damages confidence. | Exporter |
| CQ-033 | Factions | High | Effects such as `*0 Food on %Tiles`; unlock copy with missing words/spaces. | Raw formulas and broken grammar are not encyclopedia quality. | Exporter |
| CQ-034 | Factions | Medium | Trait names are listed without explaining what the traits do. | A strategy gamer needs impact, not just labels. | Both |
| CQ-035 | Heroes | Critical | `+1000000 Leader Priority`; `+3 Leader Priority`. | Internal AI/order values should never be visible to players. | Both |
| CQ-036 | Heroes | High | `Class: UnitClass_Infantry_Hero` in descriptions. | Internal enum labels undermine the otherwise useful class fact. | EWShop |
| CQ-037 | Heroes | Medium | Stats are present but no role summary exists. | Players want to know whether a hero is tank, ranged support, governor, etc. | Exporter |
| CQ-038 | Units | Critical | `+10000 Leader Priority`; `+10001 Leader Priority`. | Internal ranking data is useless and distracting. | Both |
| CQ-039 | Units | High | `Class: UnitClass_Flying`; `Spawn type: Land`. | Raw class enums and spawn-type labels need player-friendly wording or hiding. | EWShop |
| CQ-040 | Units | Medium | Stats are readable but not summarized into battlefield role. | A wiki entry should help compare units quickly. | EWShop |
| CQ-041 | Districts | High | 82 districts have empty descriptions. | Browsing a build category should not produce blank dossiers. | Exporter |
| CQ-042 | Districts | High | `+0 Experience on new Units`; `Tier: 0`. | Zero-value effects and raw tiers feel like data residue. | Both |
| CQ-043 | Districts | Medium | Duplicate display names such as multiple `Camp` entries. | Users cannot tell variants apart without context. | Exporter |
| CQ-044 | Improvements | High | 23 improvements have empty descriptions. | Empty construction entries feel unfinished and hurt trust. | Exporter |
| CQ-045 | Improvements | Medium | Formula lines such as `*2 Food if adjacent to Foundation on Bridge`. | The effect is useful, but raw formula syntax should be translated. | Both |
| CQ-046 | Minor Factions | Medium | `Faction affinity` often repeats the minor faction name. | Repetition adds little unless it affects diplomacy, population, or unlock rules. | EWShop |
| CQ-047 | Minor Factions | Medium | Associated content is useful but not framed as what the player gains or encounters. | The section needs "unlocks/associated unit/population" semantics to guide decisions. | Both |
| CQ-048 | Quests | High | 502 duplicated fact lines; many `Category: Curiosity` lines. | Quest detail pages should prioritize objective, requirements, rewards, and choices. | EWShop |
| CQ-049 | Quests | Medium | `Chapter: 1` repeated across many entries. | Chapter is useful, but raw numeric chapter needs context and should not dominate. | Both |
| CQ-050 | Quests | Medium | Rewards/requirements are not always visually treated as the main decision content. | Strategy users care most about requirements, choices, rewards, and consequences. | EWShop |
| CQ-051 | Tech | High | Fact lines repeat in prose: `Faction`, `Era`, `Quadrant`. | Tech entries have good flavor, but duplicate classification interrupts it. | EWShop |
| CQ-052 | Tech | Medium | `Tier: 1` and `Era: 1` both appear with no distinction. | Similar numeric progression fields need clearer labels or one should be hidden. | Both |
| CQ-053 | Tech | Medium | Some techs have flavor quote plus facts but no immediate effect summary. | Players need payoff before lore when browsing a tech tree. | EWShop |

## Category Notes

- Strongest current categories: Equipment, Factions, Tech, Units, Quests. They
  contain meaningful gameplay data, but need noise suppression and better
  hierarchy.
- Most raw categories: Modifiers, Actions, Statuses, Councilors, Heroes.
- Most urgent duplicate-line cleanup: Equipment, Abilities, Councilors, Tech,
  Units, Quests, Traits.
- Most exporter-dependent improvements: Actions descriptions, modifier/status
  names, hero/unit internal priority lines, empty districts/improvements, and
  councilor effect descriptions.

## Top 20 EWShop Fixes

1. Suppress `descriptionLines` that exactly duplicate rendered facts.
2. Hide `Reference key` facts from normal detail pages.
3. Suppress duplicate `Category` plus `Kind` pairs when they are identical.
4. Hide `Kind` when it only restates the current category.
5. Hide or debug-gate `Leader Priority` lines in heroes and units.
6. Convert `UnitClass_*` values to public class labels wherever possible.
7. Format equipment `Value` as a price/resource value instead of raw decimal.
8. Reword or de-emphasize `Tier: 0` across equipment, units, and districts.
9. Make Granted abilities more prominent on Equipment detail pages.
10. Make Unlocks and Exclusions more prominent on Trait detail pages.
11. Make Stats more prominent on Heroes and Units.
12. Make Requirements and Rewards more prominent on Quests.
13. Demote generic `Category` facts below gameplay facts.
14. Hide modifier `Operation` and raw `Value` unless a friendly `Display value`
    exists.
15. Prefer `Display value` over raw modifier `Value`.
16. Relabel `Bilateral: No` to player language.
17. Hide empty or duplicate Effects sections when they only repeat the body.
18. Improve no-description states for Actions, Districts, and Improvements.
19. Add category-specific "What matters" ordering for detail facts.
20. Prevent raw-looking labels from dominating result-row summaries.

## Top 20 Exporter Fixes

1. Replace raw modifier display names with public names.
2. Fix `Cost Modifer` misspellings at source.
3. Do not export internal `Leader Priority` as public content.
4. Add player-facing descriptions for Actions.
5. Replace `Reference key` action facts with public action mechanics.
6. Translate `Value type` into cost, duration, yield, or requirement language.
7. Translate modifier `Operation` and `Value` into human-readable effect text.
8. Replace `Target scope: Constructibles: Constructible With Descriptor`.
9. Add source/acquisition context for Equipment access pools.
10. Add clear unit labels to Equipment value and tier.
11. Add effect descriptions for Councilor effect and Partner effect names.
12. Remove or resolve placeholder councilor names.
13. Add missing descriptions for empty District entries.
14. Add missing descriptions for empty Improvement entries.
15. Remove zero-value effects such as `+0 Experience` unless meaningful.
16. Provide unique faction identity text instead of repeated generic copy.
17. Fix broken faction unlock wording and spacing.
18. Replace raw population reward labels such as `Cost modifier`.
19. Add strategic summaries for Traits with only classification facts.
20. Add role summaries for Heroes and Units.

## Recommended Batch 1

Batch 1 should be EWShop-only and focused on hiding noise:

1. Suppress duplicate prefixed `descriptionLines` that already render as facts.
2. Hide `Reference key` from normal Action detail.
3. Suppress identical `Category`/`Kind` duplicates.
4. Hide `Leader Priority` lines from Heroes and Units.
5. Prefer friendly modifier `Display value` over raw `Operation` and `Value`
   when modifier pages are reached by search or links.

These changes are high-value because they remove the strongest "database dump"
signals without requiring exporter changes or new product surfaces.
