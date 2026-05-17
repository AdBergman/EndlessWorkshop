import { useCodexStore } from "@/stores/codexStore";
import { useDistrictStore } from "@/stores/districtStore";
import { useImprovementStore } from "@/stores/improvementStore";
import { useQuestStore } from "@/stores/questStore";
import { useTechStore } from "@/stores/techStore";
import { useUnitStore } from "@/stores/unitStore";

export type AdminImportModuleId = "districts" | "improvements" | "units" | "techs" | "codex" | "quests";

export type AdminImportRefreshResult =
    | { ok: true }
    | { ok: false; message: string };

const formatRefreshError = (reason: unknown) =>
    (reason as Error)?.message ?? String(reason);

export async function refreshStoresAfterAdminImport(
    moduleId: string
): Promise<AdminImportRefreshResult> {
    try {
        switch (moduleId as AdminImportModuleId) {
            case "districts":
                await useDistrictStore.getState().refreshDistricts();
                break;
            case "improvements":
                await useImprovementStore.getState().refreshImprovements();
                break;
            case "units":
                await useUnitStore.getState().refreshUnits();
                break;
            case "techs":
                await useTechStore.getState().refreshTechs();
                break;
            case "codex":
                await useCodexStore.getState().loadEntries({ force: true });
                break;
            case "quests":
                await useQuestStore.getState().refreshQuestExplorer();
                break;
            default:
                break;
        }

        return { ok: true };
    } catch (err) {
        return {
            ok: false,
            message: formatRefreshError(err),
        };
    }
}
