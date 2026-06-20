import { Fragment, type ReactNode } from "react";
import {
    formatCodexMajorFactionText,
} from "@/lib/codex/codexPresentation";
import {
    findAbilityInlineLinkMatch,
    type CodexAbilityInlineLinkCandidate,
} from "@/lib/codex/codexAbilityInlineLinks";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    as?: "p" | "span";
    className: string;
    inlineLinkCandidates?: CodexAbilityInlineLinkCandidate[];
    line: string;
    lineKey: string;
    onSelectInlineEntry?: (entry: CodexEntry) => void;
};

function renderLineWithInlineLinks(
    line: string,
    candidates: CodexAbilityInlineLinkCandidate[],
    onSelectInlineEntry: ((entry: CodexEntry) => void) | undefined,
    keyPrefix: string
): ReactNode {
    if (!onSelectInlineEntry || candidates.length === 0) {
        return renderDescriptionLine(formatCodexMajorFactionText(line));
    }

    const nodes: ReactNode[] = [];
    let remaining = line;
    let offset = 0;
    let linkIndex = 0;

    while (remaining.length > 0) {
        const match = findAbilityInlineLinkMatch(remaining, candidates);
        if (!match) {
            nodes.push(
                <Fragment key={`${keyPrefix}-text-${offset}`}>
                    {renderDescriptionLine(formatCodexMajorFactionText(remaining))}
                </Fragment>
            );
            break;
        }

        const before = remaining.slice(0, match.index);
        const linkedText = remaining.slice(match.index, match.index + match.label.length);
        if (before) {
            nodes.push(
                <Fragment key={`${keyPrefix}-text-${offset}`}>
                    {renderDescriptionLine(formatCodexMajorFactionText(before))}
                </Fragment>
            );
        }

        nodes.push(
            <CodexInlineEntityLink
                key={`${keyPrefix}-inline-${offset + match.index}-${linkIndex}`}
                entry={match.candidate.entry}
                onSelect={onSelectInlineEntry}
            >
                {renderDescriptionLine(formatCodexMajorFactionText(linkedText))}
            </CodexInlineEntityLink>
        );

        const nextIndex = match.index + match.label.length;
        remaining = remaining.slice(nextIndex);
        offset += nextIndex;
        linkIndex += 1;
    }

    return nodes;
}

export default function CodexAbilityEffectLine({
    as = "p",
    className,
    inlineLinkCandidates = [],
    line,
    lineKey,
    onSelectInlineEntry,
}: Props) {
    const content = renderLineWithInlineLinks(line, inlineLinkCandidates, onSelectInlineEntry, lineKey);

    return as === "span" ? (
        <span className={className}>{content}</span>
    ) : (
        <p className={className}>{content}</p>
    );
}
