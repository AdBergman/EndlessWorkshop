import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, type SavedTechBuild } from "@/api/apiClient";

type ShareBuildHydratorProps = {
    sharedBuildLoaded: boolean;
    onSharedBuildLoaded: () => void;
    onProcessingChange: (isProcessing: boolean) => void;
    applySavedTechBuild: (saved: SavedTechBuild) => void;
};

export default function ShareBuildHydrator({
    sharedBuildLoaded,
    onSharedBuildLoaded,
    onProcessingChange,
    applySavedTechBuild,
}: ShareBuildHydratorProps) {
    const navigate = useNavigate();
    const hydratingShareUuidRef = useRef<string | null>(null);

    useEffect(() => {
        if (sharedBuildLoaded) return;

        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");
        if (!shareUuid) {
            onProcessingChange(false);
            return;
        }
        if (hydratingShareUuidRef.current === shareUuid) return;

        hydratingShareUuidRef.current = shareUuid;

        const loadSharedBuild = async () => {
            try {
                const saved = await apiClient.getSavedBuild(shareUuid);

                applySavedTechBuild(saved);
                onSharedBuildLoaded();

                params.delete("share");
                const newSearch = params.toString() ? `?${params.toString()}` : "";
                navigate(`/tech${newSearch}`, { replace: true });
            } catch (err) {
                console.error("Failed to load shared build:", err);
            } finally {
                onProcessingChange(false);
            }
        };

        void loadSharedBuild();
    }, [applySavedTechBuild, navigate, onProcessingChange, onSharedBuildLoaded, sharedBuildLoaded]);

    return null;
}
