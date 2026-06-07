# Frontend Production-Build Smoke Checklist

Use this after route-sensitive, visual, orchestration, or lazy-loading changes. It is intentionally manual/Codex-browser first; do not add a browser automation dependency unless these regressions keep recurring.

## Setup

From `frontend/`:

```bash
npm run build
npm start -- --host 127.0.0.1 --port 5174
```

Use the configured API target for the environment being checked.

## Required Routes

- `/tech`
- `/units`
- `/units?minor=1`
- `/codex`
- `/quests`
- `/quests/FactionQuest_KinOfSheredyn_Chapter02_Step01?mode=strategy`
- `/quests/FactionQuest_KinOfSheredyn_Chapter02_Step01/Branch_Pious/step-2?mode=strategy`
- `/summary`
- `/info`

## Checks

- The route renders without a white page.
- Direct first-load Quest URLs return the React shell rather than `404` or a generated/static fallback page.
- Navigation between `/quests`, `/tech`, and `/summary` responds promptly.
- No chunk-load or route-render error appears in the console.
- Primary page content is visible and not hidden behind loading text.
- SPA shell routes return a revalidating HTML cache header such as `Cache-Control: no-cache`.
- Missing generated SEO routes still return `404`; they should not fall back to the SPA.
- Recent visual changes have no obvious text overlap, clipped labels, missing icons, or unreadable token colors.
- If the change is visual, capture a screenshot and mention it in the PR or implementation summary.

## Admin Smoke When Relevant

- `/admin/import?admin=1` reads the existing trusted-device token.
- `/api/admin/import/check-token` returns `401` without a token and `204` with the valid token.

Do not rely on hidden routes or obscurity for security; this smoke only checks deployment behavior.
