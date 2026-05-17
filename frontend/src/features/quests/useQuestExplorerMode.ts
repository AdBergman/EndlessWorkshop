import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
    normalizeQuestExplorerMode,
    type QuestExplorerMode,
} from "./questExplorerMode";

const MODE_QUERY_PARAM = "mode";

export function useQuestExplorerMode(): {
    mode: QuestExplorerMode;
    setMode: (mode: QuestExplorerMode) => void;
} {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = normalizeQuestExplorerMode(searchParams.get(MODE_QUERY_PARAM));

    const setMode = useCallback(
        (nextMode: QuestExplorerMode) => {
            setSearchParams(
                (currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    nextParams.set(MODE_QUERY_PARAM, nextMode);
                    return nextParams;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    return {
        mode,
        setMode,
    };
}
