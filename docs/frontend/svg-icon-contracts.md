# EL2 SVG Icon Handoff for EWShop

## Current EWShop Status - 2026-06-10

This compact handoff is still the right frontend guidance, with one important
status update: EWShop now consumes the narrow registries directly.

- `description-token-icons.json` is used by
  `frontend/src/features/icons/descriptionTokenIcons.ts`.
- `ability-icons.json` is used by
  `frontend/src/features/icons/abilityIconResolver.ts`.
- Unit card stat icons are sourced from `description-token-icons.json` through
  `frontend/src/features/icons/unitStatIcons.ts`.
- `semantic-manifest.json` and `manifest.json` remain diagnostic/fallback
  surfaces, not primary runtime dependencies for unit cards, tooltips, or
  ability icons.

Use the narrow frontend-safe runtime registries first:

- `frontend/public/svg/description-token-icons.json` for bracket description tokens.
- `frontend/public/svg/ability-icons.json` for ability icon lookup by public `UnitAbility_*` key.
- `frontend/public/svg/semantic-manifest.json` only for broader semantic section/property lookups and diagnostics-oriented context.
- `frontend/public/svg/manifest.json` as raw fallback only.

Do not hardcode SVG filenames, GUIDs, Unity mapper names, or arbitrary fallback substitutions. Frontend runtime code should not infer ability icon paths from raw keys when `ability-icons.json` does not contain a safe entry.

Description token registry notes:

- Keys are bracket tokens without brackets, matched case-insensitively by the frontend.
- `AttackRange` supports variants `1` through `7`; the base fallback is range `3`.
- `DoubleArrow` is formatting/control text and is not a gameplay icon token.

Ability icon registry notes:

- Keys are public `UnitAbility_*` keys.
- Paths are browser public `/svg/...` paths.
- Missing entries should render gracefully without guessed fallbacks.

Semantic manifest sections:

- `stats`
- `resources`
- `statuses`
- `armyActions`
- `diplomacyStates`
- `diplomacyActions`
- `diplomacyTreaties`

Recommended helper API:

```ts
getDescriptionTokenIcon(token)
getAbilityIconPath(unitAbilityKey)
getSemanticIcon(section, key)
getIconPath(section, key)
getStatIconByGameplayProperty(propertyName)
getRawIcon(rawKey) // fallback only
```

Diagnostics are intentionally outside the frontend runtime contract:

- `diagnostics/svg/ability-icon-diagnostics.json`
- `diagnostics/svg/description-formatting-token-diagnostics.json`
- `diagnostics/svg/svg-renderability.json`
- `export_inventory_report_<version>.json`
