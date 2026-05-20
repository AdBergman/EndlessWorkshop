import type { ReactNode } from "react";
import type {
    Requirement,
    Reward,
} from "@/features/quests/questExplorerContract";
import type {
    QuestExplorerResolvedLink,
} from "@/features/quests/questExplorerPrototypeViewModel";
import { groupDisplayItems } from "@/features/quests/questExplorerPrototypeViewModel";

export function LineStack({
    lines,
    emptyLabel,
}: {
    lines: readonly string[];
    emptyLabel: string;
}) {
    if (lines.length === 0) {
        return <p className="questPrototype-muted">{emptyLabel}</p>;
    }

    return (
        <div className="questPrototype-lineStack">
            {lines.map((line, index) => (
                <p key={`${line}:${index}`}>{line}</p>
            ))}
        </div>
    );
}

export function MetaPill({ children }: { children: ReactNode }) {
    return <span className="questPrototype-pill">{children}</span>;
}

export function RequirementList({
    requirements,
    emptyLabel = "No requirements recorded.",
}: {
    requirements: readonly Requirement[];
    emptyLabel?: string;
}) {
    if (requirements.length === 0) {
        return <p className="questPrototype-muted">{emptyLabel}</p>;
    }

    return (
        <div className="questPrototype-rewardGroups">
            {groupDisplayItems(requirements).map((group) => (
                <section className="questPrototype-rewardGroup" key={`${group.order}:${group.label ?? "ungrouped"}`}>
                    {group.label ? <h5>{group.label}</h5> : null}
                    <ul>
                        {group.items.map((requirement) => (
                            <li key={requirement.requirementKey}>
                                <span>{requirement.displayText}</span>
                                {requirement.referenceDisplayName || requirement.targetLabel ? (
                                    <small>{requirement.referenceDisplayName ?? requirement.targetLabel}</small>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

export function RewardList({
    rewards,
    emptyLabel = "No rewards recorded.",
}: {
    rewards: readonly Reward[];
    emptyLabel?: string;
}) {
    if (rewards.length === 0) {
        return <p className="questPrototype-muted">{emptyLabel}</p>;
    }

    return (
        <div className="questPrototype-rewardGroups">
            {groupDisplayItems(rewards).map((group) => (
                <section className="questPrototype-rewardGroup" key={`${group.order}:${group.label ?? "ungrouped"}`}>
                    {group.label ? <h5>{group.label}</h5> : null}
                    <ul>
                        {group.items.map((item) => (
                            <li key={item.rewardKey}>
                                <span>{item.displayText}</span>
                                {item.formulaText || item.assetDisplayName || item.codexEntryKey ? (
                                    <small>{[item.formulaText, item.assetDisplayName, item.codexEntryKey ? "Codex linked" : null].filter(Boolean).join(" / ")}</small>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

export function LinkButton({
    link,
    onSelectQuest,
}: {
    link: QuestExplorerResolvedLink;
    onSelectQuest: (entryKey: string) => void;
}) {
    return (
        <button
            type="button"
            className={`questPrototype-linkButton${link.isMissing ? " is-missing" : ""}`}
            onClick={() => onSelectQuest(link.entryKey)}
        >
            <span>{link.label}</span>
            {link.contextLabel ? <small>{link.contextLabel}</small> : null}
        </button>
    );
}

export function LinkGroup({
    label,
    links,
    onSelectQuest,
}: {
    label: string;
    links: readonly QuestExplorerResolvedLink[];
    onSelectQuest: (entryKey: string) => void;
}) {
    if (links.length === 0) return null;

    return (
        <section className="questPrototype-linkGroup" aria-label={label}>
            <h4>{label}</h4>
            <div>
                {links.map((link, index) => (
                    <LinkButton
                        key={`${link.relationLabel}:${link.entryKey}:${index}`}
                        link={link}
                        onSelectQuest={onSelectQuest}
                    />
                ))}
            </div>
        </section>
    );
}

export function ProgressionLinks({
    previousLinks,
    nextLinks,
    failureLinks,
    convergenceLinks,
    onSelectQuest,
}: {
    previousLinks: readonly QuestExplorerResolvedLink[];
    nextLinks: readonly QuestExplorerResolvedLink[];
    failureLinks: readonly QuestExplorerResolvedLink[];
    convergenceLinks: readonly QuestExplorerResolvedLink[];
    onSelectQuest: (entryKey: string) => void;
}) {
    const hasLinks =
        previousLinks.length > 0 ||
        nextLinks.length > 0 ||
        failureLinks.length > 0 ||
        convergenceLinks.length > 0;

    if (!hasLinks) {
        return <p className="questPrototype-muted">No adjacent progression links are recorded.</p>;
    }

    return (
        <div className="questPrototype-progressionLinks">
            <LinkGroup label="Previous" links={previousLinks} onSelectQuest={onSelectQuest} />
            <LinkGroup label="Continues" links={nextLinks} onSelectQuest={onSelectQuest} />
            <LinkGroup label="Failure" links={failureLinks} onSelectQuest={onSelectQuest} />
            <LinkGroup label="Converges" links={convergenceLinks} onSelectQuest={onSelectQuest} />
        </div>
    );
}
