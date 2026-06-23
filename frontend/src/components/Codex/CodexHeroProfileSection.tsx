import { renderCodexLabel } from "@/lib/codex/codexLabelRenderer";
import type {
    CodexHeroStartingSkill,
    CodexHeroLink,
    CodexHeroRichEnrichment,
} from "@/lib/codex/codexHeroRichEnrichment";
import { renderDescriptionLine } from "@/lib/descriptionLine/descriptionLineRenderer";
import type { CodexEntry } from "@/types/dataTypes";
import type { ReactNode } from "react";
import CodexInlineEntityLink from "./CodexInlineEntityLink";

type Props = {
    enrichment: CodexHeroRichEnrichment;
    onSelect: (entry: CodexEntry) => void;
};

export default function CodexHeroProfileSection({ enrichment, onSelect }: Props) {
    if (
        !enrichment.origin &&
        !enrichment.classLabel &&
        enrichment.skillPathTypes.length === 0 &&
        enrichment.startingSkills.length === 0
    ) {
        return null;
    }

    return (
        <section className="codex-detail__section codex-heroProfile" aria-labelledby="codex-hero-profile-heading">
            <div className="codex-sectionLabel" id="codex-hero-profile-heading">
                Hero profile
            </div>

            <div className="codex-heroProfile__groups">
                {enrichment.origin ? (
                    <HeroProfileGroup label="Origin">
                        <HeroProfileLink link={enrichment.origin} onSelect={onSelect} />
                    </HeroProfileGroup>
                ) : null}

                {enrichment.classLabel ? (
                    <HeroProfileGroup label="Class">
                        {renderCodexLabel(enrichment.classLabel)}
                    </HeroProfileGroup>
                ) : null}

                {enrichment.skillPathTypes.length > 0 ? (
                    <HeroProfileGroup label="Skill paths">
                        <span className="codex-heroProfile__inlineList">
                            {enrichment.skillPathTypes.map((label, index) => (
                                <span className="codex-heroProfile__inlineItem" key={label}>
                                    {index > 0 ? <span className="codex-heroProfile__separator">·</span> : null}
                                    <span>{label}</span>
                                </span>
                            ))}
                        </span>
                    </HeroProfileGroup>
                ) : null}

                {enrichment.startingSkills.length > 0 ? (
                    <HeroProfileGroup label="Starting skills">
                        <div className="codex-heroProfile__skillList">
                            {enrichment.startingSkills.map((skill) => (
                                <HeroStartingSkill key={skill.key} skill={skill} onSelect={onSelect} />
                            ))}
                        </div>
                    </HeroProfileGroup>
                ) : null}
            </div>
        </section>
    );
}

function HeroProfileGroup({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="codex-heroProfile__group">
            <div className="codex-heroProfile__label">{label}</div>
            <div className="codex-heroProfile__value">{children}</div>
        </div>
    );
}

function HeroProfileLink({
    link,
    onSelect,
}: {
    link: CodexHeroLink;
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <CodexInlineEntityLink entry={link.entry} onSelect={onSelect}>
            {renderCodexLabel(link.label)}
        </CodexInlineEntityLink>
    );
}

function HeroStartingSkill({
    skill,
    onSelect,
}: {
    skill: CodexHeroStartingSkill;
    onSelect: (entry: CodexEntry) => void;
}) {
    return (
        <article className="codex-heroProfile__skill">
            <div className="codex-heroProfile__skillHeader">
                <span className="codex-heroProfile__skillName">{renderCodexLabel(skill.label)}</span>
                {skill.mechanicKind ? (
                    <span className="codex-heroProfile__skillKind">{skill.mechanicKind}</span>
                ) : null}
            </div>

            {skill.summaryLines.length > 0 ? (
                <div className="codex-heroProfile__skillLines">
                    {skill.summaryLines.map((line, index) => (
                        <div className="codex-heroProfile__skillLine" key={`${skill.key}-line-${index}`}>
                            {renderDescriptionLine(line)}
                        </div>
                    ))}
                </div>
            ) : null}

            {skill.primaryAbility ? (
                <div className="codex-heroProfile__ability">
                    <span>Ability</span>
                    <HeroProfileLink link={skill.primaryAbility} onSelect={onSelect} />
                </div>
            ) : null}
        </article>
    );
}
