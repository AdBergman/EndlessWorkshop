export type DropResult<TJson> = {
    file: File;
    rawText: string;
    json: TJson;
};

export type ImportState =
    | { status: "idle" }
    | { status: "importing" }
    | { status: "success"; atUtc: string }
    | { status: "error"; message: string };

export type ModuleMetaKV = { label: string; value: string };

export type ImportModuleDefinition<TJson> = {
    id: string;
    title: string;
    description?: string;

    // Disabled rows are rendered but non-interactive (coming soon).
    enabled: boolean;

    // API endpoint to POST to (e.g. /api/admin/import/techs)
    endpoint?: string;

    // Parse meta for display. Should be safe and never throw.
    getMeta?: (json: TJson) => ModuleMetaKV[];

    // Minimal validation for UI gating (backend still authoritative).
    // Return string error to display, or null if OK.
    validate?: (json: TJson) => string | null;

    // Optional: customize the label of the import action button.
    importButtonLabel?: string;
};