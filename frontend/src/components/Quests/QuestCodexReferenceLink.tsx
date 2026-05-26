import type { MouseEvent, ReactNode } from "react";

import {
    codexEntryHref,
    resolveQuestCodexReference,
    type QuestCodexReferenceSource,
} from "@/features/quests/questCodexReference";
import { getCodexEntryLabel } from "@/lib/codex/codexPresentation";
import { useCodexStore } from "@/stores/codexStore";

export function QuestCodexReferenceLink({
    source,
    children,
}: {
    source: QuestCodexReferenceSource;
    children: ReactNode;
}) {
    const entriesByKey = useCodexStore((state) => state.entriesByKey);
    const entriesByKindKey = useCodexStore((state) => state.entriesByKindKey);
    const entry = resolveQuestCodexReference(source, { entriesByKey, entriesByKindKey });

    if (!entry) return <>{children}</>;

    const label = getCodexEntryLabel(entry);

    const stopContainingAction = (event: MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    };

    return (
        <a
            className="questExplorer-codexMetaLink"
            href={codexEntryHref(entry)}
            title={`Open ${label} in Codex`}
            onClick={stopContainingAction}
            onMouseDown={stopContainingAction}
        >
            {children}
        </a>
    );
}
