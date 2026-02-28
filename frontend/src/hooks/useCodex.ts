import { useGameData } from "@/context/GameDataContext";

export function useCodex() {
    const { codexByKindKey } = useGameData();

    const getEntry = (exportKind: string, entryKey: string) =>
        codexByKindKey.get(exportKind)?.get(entryKey);

    return { getEntry };
}