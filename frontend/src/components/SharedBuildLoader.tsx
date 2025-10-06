import { useEffect } from "react";
import { useGameData } from "@/context/GameDataContext";

const SharedBuildLoader: React.FC = () => {
    const { setSelectedTechs } = useGameData();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareUuid = params.get("share");

        if (!shareUuid) return;

        const loadBuild = async () => {
            try {
                const res = await fetch(`/api/builds/${shareUuid}`);
                if (!res.ok) throw new Error("Build not found");

                const data = await res.json();
                // use techIds as names
                setSelectedTechs(data.techIds);
            } catch (err) {
                console.error("Failed to load shared build", err);
            }
        };

        loadBuild();
    }, [setSelectedTechs]);

    return null; // no UI
};

export default SharedBuildLoader;
