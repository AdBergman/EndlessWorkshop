# Endless Workshop Visual Cohesion Action Items

Status: active visual review backlog
Owner: frontend / UX

Implementation posture: unify the site shell, dark surfaces, borders, and accent behavior first. Do not force every page into the Quest Archive language. Tech and Units keep their black, high-complexity canvases; Quests remains the premium north star; Codex, Summary, Mods, and Info move toward a shared charcoal workbench surface.

## EW-UX-01: Add Shared Dark-Surface CSS Tokens

**Problem:** Pages define their own black, panel, border, text, and accent values, which makes the site feel assembled from separate products.

**Action:** Add shared variables for `--ew-bg-page`, `--ew-bg-panel`, `--ew-bg-panel-raised`, `--ew-bg-input`, `--ew-border-soft`, `--ew-border-strong`, `--ew-text`, `--ew-text-soft`, `--ew-text-muted`, `--ew-accent`, `--ew-accent-soft`, `--ew-accent-border`, and `--ew-focus`.

**Implementation details:** Keep tokens in `frontend/src/App.css`. Map page-specific tokens to the shared set where pages already have local CSS variables. Prefer local overrides for genuinely page-specific language.

**Acceptance:** Nav, panel, input, tab, chip, table, and card surfaces share a recognizable charcoal family across `/codex`, `/quests`, `/summary`, `/mods`, and `/info`.

## EW-UX-02: Add Optional Hue/Skin Support

**Problem:** Future style variations would currently require duplicate CSS or page-specific hardcoding.

**Action:** Add a route-level hue hook such as `data-ew-hue="orange|gold|teal|neutral"` and make it change accent variables only.

**Implementation details:** Set the attribute in `AppLayout`. Keep the first pass static: Quests uses gold, Units uses teal, Codex uses neutral, and the default remains orange. Do not add a UI switch yet.

**Acceptance:** Changing the hue attribute changes active nav, focus, and accent states without altering page structure or route behavior.

## EW-UX-03: Fix Header Density And Wrapping

**Problem:** The global header wraps awkwardly around 1280px because logo, main nav, and faction selector compete for the same row.

**Action:** Tighten desktop header spacing and add a more deliberate compact breakpoint.

**Implementation details:** Reduce logo size, nav gaps, button padding, and faction button padding below the wide-desktop breakpoint. Only move to stacked rows at smaller tablet widths.

**Acceptance:** At 1280x720, the header remains a single intentional row. At mobile widths, it stacks cleanly without overlapping or clipping.

## EW-UX-04: Retune Quest Background To Charcoal

**Problem:** Quests is strong structurally, but its blue/green-black base is slightly off from the desired premium charcoal direction.

**Action:** Preserve the Quest Archive layout, typography, gold linework, and teal semantic accents while shifting surfaces toward charcoal and near-black.

**Implementation details:** Update `--quest-bg`, `--quest-panel`, `--quest-panel-strong`, reader surfaces, and border colors in `QuestExplorer.css`. Desaturate gold borders slightly. Reserve teal for counts, speakers, and useful metadata.

**Acceptance:** Quests still feels premium and editorial, but reads charcoal rather than teal-green.

## EW-UX-05: Make Codex A Premium Workbench

**Problem:** Codex is useful but visually sits between a utility list and a premium encyclopedia.

**Action:** Use the shared charcoal shell, strengthen left/detail separation, quiet the filter chips, and improve selected/active states.

**Implementation details:** Map Codex variables to the shared tokens. Reduce the smoky orange/red page wash. Make selected rows and filter states clearer through border and surface changes, not broad saturated fills.

**Acceptance:** Codex feels like a dense premium workbench, not a flat wall of all-results content.

## EW-UX-06: Bring Summary Onto Shared Panels

**Problem:** Summary still carries older dashboard styling and mixed yellow/orange/purple UI accents.

**Action:** Restyle report panels, tabs, buttons, controls, cards, tooltips, and nested city/empire components with the shared panel and accent tokens.

**Implementation details:** Preserve report data behavior. Avoid backend DTO/API changes. Replace hardcoded UI-purple controls with route accent variables unless color is semantic empire data.

**Acceptance:** Summary keeps its dashboard utility while matching the site shell and panel system.

## EW-UX-07: Calm Units Visual Intensity

**Problem:** Units benefits from a black canvas, but saturated green/orange glow and fixed control positioning make it feel less premium.

**Action:** Keep the card/carousel concept and black artifact canvas, but reduce glow intensity, normalize toggle placement, and improve dimmed/side-card readability.

**Implementation details:** Use layout alignment instead of fixed `margin-right` values for the minor-faction toggle. Reduce card border thickness, hover scale, and shadow glow. Map toggle and arrow colors to the teal route accent.

**Acceptance:** Unit cards still feel collectible and factional, but the page reads calmer and more intentional.

## EW-UX-08: Normalize Tech Lower Table And Toolbars

**Problem:** The tech tree canvas works, but the lower table and toolbar still use older spreadsheet styling.

**Action:** Leave the tech-tree image/canvas untouched. Restyle the lower toolbar, buttons, table headers, borders, and row states with shared tokens.

**Implementation details:** Update `SpreadSheetView.css` and `SpreadsheetToolbar.css`. Keep table behavior, sorting/export actions, and existing tests unchanged.

**Acceptance:** The tree remains visually complex and black, while the supporting table feels like part of the same site.

## EW-UX-09: Polish Mods And Info Into The Same Family

**Problem:** Mods is close to the desired editorial direction, while Info still feels legacy because of decorative glow lines and older resource buttons.

**Action:** Give Mods shared background, link, and button language. Make Info quieter with static section rules, shared resource links, and calmer text rhythm.

**Implementation details:** Preserve Mods thumbnails and editorial rows. Remove Info pulsing line animation. Use shared text, border, panel, and accent variables.

**Acceptance:** Mods and Info feel related to the rest of the site without losing their simpler editorial purpose.

## EW-UX-10: Add Visual QA Checklist

**Problem:** Visual regressions are easy because each route has different density, scroll behavior, and canvas complexity.

**Action:** Verify the main routes across desktop, compact desktop, and mobile before merging.

**Implementation details:** Check `/tech`, `/units`, `/codex`, `/quests`, `/summary`, `/mods`, and `/info` at 1710x1280, 1280x720, and a mobile viewport. Confirm header behavior, route accents, panel consistency, scroll behavior, and text fit. Run frontend verification from `frontend/`: `npm test -- --run`, `npx tsc --noEmit --project tsconfig.json`, and `npm run build`.

**Acceptance:** Header does not wrap awkwardly at 1280px, Quests reads charcoal, shared surfaces are consistent, Tech/Units preserve black canvases, and existing route/deep-link behavior remains unchanged.
