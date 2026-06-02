# Frontend Follow-Up Prompt: Use Exported Description Token Icon Registry

## Context

We asked the DB/exporter team to generate:

```txt
frontend/public/svg/description-token-icons.json
```

Reason: frontend tooltip rendering needs bracket-token icons like `[Health]`, `[Damage]`, `[FoodColored]`, and `[MovementPoints]`, but importing the full `semantic-manifest.json` into the shared description renderer made the main bundle larger than necessary.

Current temporary implementation:

- `frontend/src/features/icons/semanticIconManifest.ts` imports `semantic-manifest.json`.
- `frontend/src/lib/descriptionLine/descriptionLineRenderer.tsx` uses `getIconByDescriptionToken`.
- This works, but it ships too much manifest data for normal tooltip rendering.

## Task Once The Exporter File Exists

Replace the renderer's dependency on the full semantic manifest with the new slim registry.

Recommended implementation:

1. Add a small module, for example:

```txt
frontend/src/features/icons/descriptionTokenIcons.ts
```

2. Import only:

```txt
frontend/public/svg/description-token-icons.json
```

3. Expose:

```ts
export type DescriptionTokenIcon = {
  path: string;
  color?: string;
  variants?: Record<string, { path: string; color?: string }>;
};

export function getDescriptionTokenIcon(
  token: string,
  context?: { line?: string; tokenIndex?: number }
): DescriptionTokenIcon | null;
```

4. Update `descriptionLineRenderer.tsx` to use `getDescriptionTokenIcon(token)` instead of `getIconByDescriptionToken(token)`.

For variant tokens, pass the full line and token index. `AttackRange` should use the nearest numeric value before the token in the same line:

- `+3 [AttackRange] Attack Range` -> variant `3`
- `+7 [AttackRange] Attack Range` -> variant `7`
- `[AttackRange] Attack Range` -> base fallback `path`

5. Keep existing renderer behavior:

- Bracket tokens never render as literal `[Token]` text.
- Known tokens render SVG icons from `/svg/...`.
- Existing economy token color overrides stay in frontend:
  - `FoodColored`
  - `IndustryColored`
  - `DustColored`
  - `MoneyColored`
  - `ScienceColored`
  - `CultureColored`
  - `PublicOrderColored`
- Repeated colored tokens color the next word, matching current behavior.
- Non-colored stat tokens such as `Health` and `Damage` render icons each time.
- `AttackRange` renders the numbered ranged icon variant when the line contains a nearby value.

6. Keep `iconManifest.ts` and `semanticIconManifest.ts` only if still useful for diagnostics or future non-renderer lookups. If no runtime code needs the full semantic manifest, remove the full-manifest import from production UI paths.

## Tests To Run

From `frontend/`:

```txt
npm test -- --run
npx tsc --noEmit --project tsconfig.json
npm run build
```

Check the build output. The main chunk should no longer grow because of `semantic-manifest.json`.

## Acceptance Criteria

- `/techs` and `/units` tooltip description lines still show SVG icons for resource and stat tokens.
- `[Health]`, `[Damage]`, `[Defense]`, `[MovementPoints]`, `[VisionRange]`, `[AttackRange]`, and `*Colored` tokens still pass tests.
- `+3 [AttackRange] Attack Range` renders `/svg/unit-abilities/UI_UnitAbility_Ranged_3.svg`.
- `+7 [AttackRange] Attack Range` renders `/svg/unit-abilities/UI_UnitAbility_Ranged_7.svg`.
- The shared renderer no longer imports `semantic-manifest.json`.
