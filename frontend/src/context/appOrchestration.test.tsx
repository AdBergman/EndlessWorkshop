import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import GameDataContext from "./GameDataContext";
import { useSavedTechBuildCommands, useShareProcessingGate } from "./appOrchestration";
import { Faction, type FactionInfo } from "@/types/dataTypes";

describe("appOrchestration facade", () => {
    it("defaults the share-processing gate to false outside the provider", () => {
        const { result } = renderHook(() => useShareProcessingGate());

        expect(result.current).toBe(false);
    });

    it("projects saved-build commands and share-processing state from GameDataContext", async () => {
        const createSavedTechBuild = vi.fn().mockResolvedValue({
            uuid: "saved-build-id",
            name: "My Build",
            selectedFaction: "KIN",
            techIds: ["Tech_Workshop"],
            createdAt: "2026-05-13T00:00:00Z",
        });
        const getSavedBuild = vi.fn().mockResolvedValue({
            uuid: "saved-build-id",
            name: "My Build",
            selectedFaction: "KIN",
            techIds: ["Tech_Workshop"],
            createdAt: "2026-05-13T00:00:00Z",
        });
        const faction: FactionInfo = {
            isMajor: true,
            enumFaction: Faction.KIN,
            uiLabel: "kin",
            minorName: null,
        };
        const wrapper = ({ children }: { children: ReactNode }) => (
            <GameDataContext.Provider
                value={{
                    createSavedTechBuild,
                    getSavedBuild,
                    isProcessingSharedBuild: true,
                }}
            >
                {children}
            </GameDataContext.Provider>
        );

        const { result } = renderHook(
            () => ({
                isProcessingSharedBuild: useShareProcessingGate(),
                commands: useSavedTechBuildCommands(),
            }),
            { wrapper }
        );

        expect(result.current.isProcessingSharedBuild).toBe(true);

        await act(async () => {
            await result.current.commands.createSavedTechBuild?.("My Build", faction, ["Tech_Workshop"]);
            await result.current.commands.getSavedBuild?.("saved-build-id");
        });

        expect(createSavedTechBuild).toHaveBeenCalledWith("My Build", faction, ["Tech_Workshop"]);
        expect(getSavedBuild).toHaveBeenCalledWith("saved-build-id");
    });
});
