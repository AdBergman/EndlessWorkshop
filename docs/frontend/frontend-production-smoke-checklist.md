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
- `/summary`

## Checks

- The route renders without a white page.
- Navigation between `/quests`, `/tech`, and `/summary` responds promptly.
- No chunk-load or route-render error appears in the console.
- Primary page content is visible and not hidden behind loading text.
- Recent visual changes have no obvious text overlap, clipped labels, missing icons, or unreadable token colors.
- If the change is visual, capture a screenshot and mention it in the PR or implementation summary.

## Admin Smoke When Relevant

- `/admin/import?admin=1` reads the existing trusted-device token.
- `/api/admin/import/check-token` returns `401` without a token and `204` with the valid token.

Do not rely on hidden routes or obscurity for security; this smoke only checks deployment behavior.
