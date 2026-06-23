# Import History And Data Freshness Design

Current as of 2026-06-23.

## Executive Recommendation

Implement a small import history system before the next broad import/product
cycle.

Recommended v1:

- Add `ImportRun` persistence for each manual or startup import session.
- Add `ImportFileResult` persistence for each imported, skipped, or failed
  file in that run.
- Expose a public-safe latest data freshness API for player-facing surfaces.
- Expose an admin history API for recent runs and per-file results.
- Show a compact data freshness block in Codex and a recent import history
  panel in Admin Import.

Do not build per-entry history, content diffs, patch changelogs, or event
sourcing. The useful question is "what snapshot is loaded?", not "what changed
between every entry?"

## Current State

Manual Admin Import:

- `frontend/src/components/AdminImport/AdminImportPage.tsx` reads file metadata
  while a file is selected: `game`, `gameVersion`, `exporterVersion`,
  `exportedAtUtc`, `exportKind`, and entry counts.
- `frontend/src/components/AdminImport/AdminImportSingleResult.tsx` displays
  transient import results after a manual import.
- `api/src/main/java/ewshop/api/controller/ImportAdminController.java` returns
  `ImportSummaryDto` for manual imports.
- Manual Admin Import currently exposes districts, improvements, units, tech,
  generic Codex, Quest Explorer, and a backend factions endpoint. Rich heroes
  and skills are currently startup-import supported but not exposed in the
  manual admin UI/controller.

Startup Local Import:

- `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java` imports
  files from `local-imports/exports/` and `local-imports/codex/`.
- Startup import supports rich exports for districts, improvements, units,
  factions, heroes, skills, tech, and Quest Explorer.
- Startup import supports generic Codex `entries[]` files and skips known
  diagnostics-only files.
- Startup import logs per-file `ImportSummaryDto` counts, but only returns an
  aggregate `LocalStartupImportSummary(imported, skipped, failed)`.

Existing metadata precedent:

- Quest Explorer persists one current metadata row in
  `quest_explorer_import_metadata`, but this is route-specific and not a
  general import history.

Current gap:

- After restart, users and developers cannot see which export snapshot populated
  the current database.
- Skipped unsupported/diagnostic files are visible only in logs.
- Public Codex cannot explain data freshness without inspecting local files or
  backend logs.

## Backend Schema Proposal

### `import_runs`

One row per import session.

Suggested fields:

- `id` - generated primary key.
- `run_key` - UUID or stable generated string for API references.
- `trigger` - `MANUAL_ADMIN`, `LOCAL_STARTUP`, later `CI` if needed.
- `status` - `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`.
- `started_at_utc`
- `completed_at_utc`
- `source_label` - safe label such as `Admin Import`, `local-imports`, or
  configured import root basename.
- `profile` - optional Spring profile/context, useful for local/dev diagnosis.
- `file_count`
- `imported_file_count`
- `skipped_file_count`
- `failed_file_count`
- Aggregate counts:
  - `received_count`
  - `inserted_count`
  - `updated_count`
  - `unchanged_count`
  - `deleted_count`
  - `failed_count`
- Snapshot summary fields copied from files where consistent:
  - `game`
  - `game_version`
  - `exporter_version`
  - `exported_at_utc`
- `notes` - short text for partial/failure summary.

Do not store raw JSON payloads in v1.

### `import_file_results`

One row per file considered by an import run.

Suggested fields:

- `id`
- `import_run_id`
- `folder` - `exports`, `codex`, `manual`, or equivalent.
- `filename` - basename only for public/admin display; avoid exposing absolute
  local paths through API.
- `source_path_hash` - optional hash of normalized full path for debugging
  without exposing local filesystem paths.
- `file_sha256` - recommended.
- `export_kind`
- `import_kind` - from `ImportSummaryDto.importKind`, when imported.
- `game`
- `game_version`
- `exporter_version`
- `exported_at_utc`
- `schema_version` - if present, useful for Quest Explorer and future rich
  exports.
- `status` - `IMPORTED`, `SKIPPED`, `FAILED`.
- `skip_reason` - examples: `unsupported-export-kind`, `diagnostics-only`,
  `missing-entries-array`, `multiple-quest-explorer-files`.
- `error_message` - short failure message, no stack trace.
- Counts copied from `ImportSummaryDto.counts`:
  - `received_count`
  - `inserted_count`
  - `updated_count`
  - `unchanged_count`
  - `deleted_count`
  - `failed_count`
- `duration_ms`
- `diagnostics_summary_json` - optional JSON for warning/error counts and
  details already present in import summaries.

### File Hashes

Store SHA-256 for imported, skipped, and failed files in v1 if implementation
cost stays small.

Why:

- Helps prove whether a database was populated from the final snapshot or an
  older local file.
- Helps support "same file re-imported" diagnosis.
- Does not require per-entry diffing.

Rules:

- Store file hashes server-side.
- Do not show hashes in normal Codex UI.
- Admin UI may show a shortened hash in advanced details.

## API Proposal

### Public-safe Freshness API

Add a small read-only endpoint, for example:

- `GET /api/data-freshness`

Response shape:

- `latestSuccessfulImportAtUtc`
- `game`
- `gameVersion`
- `exporterVersion`
- `exportedAtUtc`
- `sourceLabel`
- `importedKinds`
- `codexEntryCount`
- `notes` - optional caveat, e.g. "Some local/dev-only categories are hidden."

Public response must not expose:

- absolute local paths
- raw hashes
- stack traces
- unsupported diagnostic filenames unless intentionally productized

### Admin History API

Add admin-protected endpoints:

- `GET /api/admin/import/runs?limit=20`
- `GET /api/admin/import/runs/{runKey}`

List response should show run-level status and aggregate counts. Detail response
should include per-file results.

### Import Result Integration

Manual import endpoints can keep returning the current `ImportSummaryDto` in v1.
The history writer should run server-side after each import and not force a
large frontend contract change.

For multi-file manual Codex/import modules, create one `ImportRun` for the
button click and one `ImportFileResult` per selected file if practical. If the
current frontend still posts one file at a time, a near-term acceptable
implementation is one run per file with a follow-up to group multi-file UI
actions.

## Frontend Proposal

### Codex Data Freshness

Show a small, calm freshness block on Codex landing/category overview pages.

Suggested copy:

- `Game version: 0.82`
- `Exported: 2026-06-22`
- `Imported: 2026-06-23`
- `Exporter: 0.1.0`

Placement:

- Codex landing overview header or below the category index intro.
- Category overview pages may show the same compact block or inherit a shared
  Codex freshness footer.

Tone:

- Informational, not official-certification language.
- Avoid claiming the data is complete, official, or current to live patches.
- Useful hover/help text: "Shows the latest successful imported exporter
  snapshot known to this EWShop database."

Do not show freshness inside every row.

### Admin Import History

Add an Admin Import section:

- Last successful import:
  - imported timestamp
  - source
  - game version
  - exporter version
  - exported timestamp
- Broad summary:
  - `22 Codex files imported`
  - `2,505 entries unchanged`
  - `12 entries updated`
  - `5 unsupported exports skipped`
- Recent runs table:
  - status
  - trigger
  - started/completed time
  - imported/skipped/failed file counts
  - aggregate inserted/updated/unchanged/deleted/failed counts
- Run detail:
  - file results
  - export kind
  - status
  - skip reason/error
  - counts
  - optional short hash

Keep the existing transient import result panel. The new history panel answers
"what is currently loaded?" after refresh/restart.

## Codex Data Freshness Proposal

The Codex freshness block should be based on latest successful import history,
not on frontend bundle build time and not on local file inspection.

Selection rule:

- Prefer the latest successful/partial-success import run containing Codex
  files.
- If no Codex-specific run exists, fall back to latest successful import run.
- If multiple files in the same run disagree on `gameVersion` or
  `exporterVersion`, show `Mixed` and expose details only in Admin Import.

This keeps public UI honest without overloading players with implementation
diagnostics.

## Admin Import History Proposal

Admin history should be the canonical place for operational diagnosis:

- Which files were considered.
- Which files imported.
- Which files were skipped as unsupported or diagnostics-only.
- Which files failed.
- What broad counts changed.
- Whether a database was populated by startup import or manual upload.

Startup import should record skipped files, not just imported files. This is
important for confidence around diagnostics-only and unsupported local files.

## Migration And Testing Plan

Backend implementation:

1. Add migrations for `import_runs` and `import_file_results`.
2. Add domain model/repository for import history.
3. Add infrastructure entities/repositories/adapters.
4. Add a small service/helper that records:
   - run start/end
   - imported file summary
   - skipped file reason
   - failure reason
5. Wire manual admin import endpoints to record runs.
6. Wire `LocalStartupImportRunner` to record a single startup run.
7. Add public freshness facade/API.
8. Add admin history facade/API.

Tests:

- Migration/repository integration test for run plus file results.
- Import history service unit tests for aggregate status/counts.
- Local startup import test proving imported, skipped, and failed files are
  recorded.
- Import admin controller tests for latest/admin endpoints.
- Frontend API client tests for freshness/history DTOs.
- Codex page test for public freshness block.
- Admin Import page test for latest import summary/recent runs.

## Implementation Estimate

Small but cross-cutting: 2-4 focused slices.

Recommended slices:

1. Backend persistence and recording for startup import only.
2. Manual admin import recording plus admin history API.
3. Public latest freshness API plus Codex display.
4. Admin Import history panel.

The slices are intentionally ordered so the backend source of truth exists
before public UI depends on it.

## Risks And Traps

- Overbuilding into per-entry version history.
- Exposing local filesystem paths in public APIs.
- Treating import freshness as official game patch freshness.
- Confusing exporter timestamp with EWShop import timestamp.
- Grouping multiple manually uploaded files poorly because current UI posts
  some imports one file at a time.
- Recording only successful imports and losing skipped diagnostics evidence.
- Letting startup import failures prevent app startup unless that is already
  the intended behavior.
- Storing raw JSON payloads and accidentally creating a second import archive.

## V1 Scope

In scope:

- Import runs.
- Per-file import results.
- Latest data freshness summary.
- Startup import recording.
- Manual import recording.
- Admin recent runs/history.
- Codex freshness display.
- File hash storage.
- Broad aggregate counts.

Out of scope:

- Per-entry history.
- Content diff engine.
- Gameplay changelog generation.
- Hero-by-hero or tech-by-tech diffs.
- Audit/event-sourcing architecture.
- Replaying old imports from stored JSON.
- Public raw file hashes.
- Claiming official live patch currency.

## V2 Possibilities

Only consider after v1 proves useful:

- Compare two import runs by aggregate counts only.
- Admin-only file hash search.
- "Currently loaded snapshot" badge on more route-owned pages.
- Release build metadata next to data freshness.
- CI/import pipeline integration.
- Exporter handoff snapshot ID field if DB Exporter provides one explicitly.

## Recommended First Implementation Slice

Implement backend import history persistence and record startup imports.

Acceptance criteria:

- Startup import creates one `ImportRun`.
- Each imported, skipped, and failed local JSON file creates one
  `ImportFileResult`.
- Counts from existing `ImportSummaryDto` are preserved.
- Export metadata fields from file headers are preserved when present.
- Unsupported and diagnostics-only files record a skip reason.
- No frontend behavior changes yet.

This gives EWShop durable evidence for local data freshness before any product
surface depends on it.
