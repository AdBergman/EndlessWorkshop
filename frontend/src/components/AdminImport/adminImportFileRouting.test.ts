import { describe, expect, it } from "vitest";

import type { DropManyResult, ImportModuleDefinition } from "./adminImportTypes";
import {
    createBulkExportSelectedFiles,
    createCodexSelectedFiles,
    getAdminImportBadge,
} from "./adminImportFileRouting";

function jsonFile(name: string): File {
    return new File(["{}"], name, { type: "application/json" });
}

function dropMany(loaded: Array<{ fileName: string; rawText?: string; json: any }>): DropManyResult<any> {
    return {
        loaded: loaded.map((entry) => ({
            file: jsonFile(entry.fileName),
            rawText: entry.rawText ?? JSON.stringify(entry.json),
            json: entry.json,
        })),
        errors: [],
    };
}

const rawExportModules: Array<ImportModuleDefinition<any>> = [
    {
        id: "units",
        title: "Units",
        enabled: true,
        endpoint: "/api/admin/import/units",
        validate: (json) => Array.isArray(json.units) ? null : "Missing units.",
    },
    {
        id: "techs",
        title: "Techs",
        enabled: true,
        endpoint: "/api/admin/import/techs",
        validate: (json) => Array.isArray(json.techs) ? null : "Missing techs.",
    },
    {
        id: "factions",
        title: "Factions rich export",
        enabled: true,
        endpoint: "/api/admin/import/factions",
        validate: (json) => Array.isArray(json.factions) ? null : "Missing factions.",
    },
    {
        id: "heroes",
        title: "Heroes rich export",
        enabled: true,
        endpoint: "/api/admin/import/heroes",
        validate: (json) => Array.isArray(json.units) ? null : "Missing hero units.",
    },
    {
        id: "skills",
        title: "Skills rich export",
        enabled: true,
        endpoint: "/api/admin/import/skills",
        validate: (json) => Array.isArray(json.skills) ? null : "Missing skills.",
    },
];

describe("admin import file routing helpers", () => {
    it("routes supported raw exports, quest explorer files, and unsupported files", () => {
        const files = createBulkExportSelectedFiles(
            dropMany([
                { fileName: "units.json", json: { exportKind: "units", units: [] } },
                { fileName: "factions.json", json: { exportKind: "factions", factions: [] } },
                { fileName: "heroes.json", json: { exportKind: "heroes", units: [] } },
                { fileName: "skills.json", json: { exportKind: "skills", skills: [] } },
                { fileName: "quests.json", json: { exportKind: "quest_explorer", entries: [{ entryKey: "Quest_A" }] } },
                { fileName: "battle-skills.json", json: { exportKind: "battleSkills", battleSkills: [] } },
            ]),
            rawExportModules
        );

        expect(files).toEqual([
            expect.objectContaining({
                fileName: "units.json",
                exportKind: "units",
                moduleId: "units",
                endpoint: "/api/admin/import/units",
                status: "ready",
            }),
            expect.objectContaining({
                fileName: "factions.json",
                exportKind: "factions",
                moduleId: "factions",
                endpoint: "/api/admin/import/factions",
                status: "ready",
            }),
            expect.objectContaining({
                fileName: "heroes.json",
                exportKind: "heroes",
                moduleId: "heroes",
                endpoint: "/api/admin/import/heroes",
                status: "ready",
            }),
            expect.objectContaining({
                fileName: "skills.json",
                exportKind: "skills",
                moduleId: "skills",
                endpoint: "/api/admin/import/skills",
                status: "ready",
            }),
            expect.objectContaining({
                fileName: "quests.json",
                exportKind: "quest_explorer",
                moduleId: "quests",
                endpoint: "/api/admin/import/quests/explorer",
                status: "ready",
            }),
            expect.objectContaining({
                fileName: "battle-skills.json",
                exportKind: "battleskills",
                status: "skipped",
                error: "Unsupported raw export kind \"battleskills\".",
            }),
        ]);
    });

    it("marks multiple quest explorer files as a validation issue", () => {
        const files = createBulkExportSelectedFiles(
            dropMany([
                { fileName: "quests-a.json", json: { exportKind: "quest_explorer", entries: [] } },
                { fileName: "quests-b.json", json: { exportKind: "quest_explorer", entries: [] } },
            ]),
            rawExportModules
        );

        expect(files).toHaveLength(2);
        expect(files.every((file) => file.status === "validation_error")).toBe(true);
        expect(files[0].error).toBe("Quest import requires exactly one quest_explorer file; found 2 file(s).");
    });

    it("normalizes codex kinds and rejects duplicate selected codex exports", () => {
        const module: ImportModuleDefinition<any> = {
            id: "codex",
            title: "Codex",
            enabled: true,
            endpoint: "/api/admin/import/codex",
            validate: (json) => Array.isArray(json.entries) && json.exportKind ? null : "Invalid Codex file.",
        };

        const files = createCodexSelectedFiles(
            dropMany([
                { fileName: "units-a.json", json: { exportKind: "Units", entries: [{}] } },
                { fileName: "units-b.json", json: { exportKind: " units ", entries: [{}] } },
            ]),
            module
        );

        expect(files).toHaveLength(2);
        expect(files.map((file) => file.exportKind)).toEqual(["units", "units"]);
        expect(files.every((file) => file.status === "validation_error")).toBe(true);
        expect(files[0].error).toBe("Duplicate exportKind \"units\" selected. Each Codex file must be unique per exportKind.");
    });

    it("derives import badges without reading component state", () => {
        expect(getAdminImportBadge({
            isBulkExportsModule: false,
            isCodexModule: false,
            isEnabled: true,
            isImporting: false,
            bulkExportFiles: [],
            codexFiles: [],
            importStatus: "idle",
            hasDrop: true,
            hasValidationError: false,
        })).toEqual({
            text: "Ready",
            cls: "admin-import-badge admin-import-badge--ready",
        });

        expect(getAdminImportBadge({
            isBulkExportsModule: true,
            isCodexModule: false,
            isEnabled: true,
            isImporting: false,
            bulkExportFiles: [{ fileName: "bad.json", status: "validation_error", error: "Bad file." }],
            codexFiles: [],
            importStatus: "idle",
            hasDrop: false,
            hasValidationError: false,
        })).toEqual({
            text: "Needs review",
            cls: "admin-import-badge admin-import-badge--err",
        });
    });
});
