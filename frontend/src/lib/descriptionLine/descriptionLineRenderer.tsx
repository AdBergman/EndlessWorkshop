import React from "react";
import { getDescriptionTokenIcon } from "@/features/icons/descriptionTokenIcons";
import { getEconomyMetricColor } from "./econColors";

export const TOKEN_RE = /\[([^\]]+)\]/g;

const STABILITY_WORD_COLOR = "#e63969";

export type TokenStyle = {
    iconPath: string;
    wordColor?: string;
};

const TOKEN_WORD_COLOR_OVERRIDES: Record<string, string> = {
    FoodColored: getEconomyMetricColor("Food"),
    IndustryColored: getEconomyMetricColor("Industry"),
    DustColored: getEconomyMetricColor("Dust"),
    MoneyColored: getEconomyMetricColor("Dust"),
    ScienceColored: getEconomyMetricColor("Science"),
    CultureColored: getEconomyMetricColor("Influence"),
    PublicOrderColored: STABILITY_WORD_COLOR,
};

export type KnownTokenMetadata = {
    token: string;
    iconPath: string;
    wordColor?: string;
    hasIcon: true;
    hasWordColor: boolean;
};

export type TokenMatch = {
    token: string;
    raw: string;
    index: number;
};

export type DescriptionTextNode = {
    type: "text";
    value: string;
    index: number;
};

export type DescriptionTokenNode = {
    type: "token";
    token: string;
    raw: string;
    index: number;
    style?: TokenStyle;
};

export type DescriptionNode = DescriptionTextNode | DescriptionTokenNode;

export type DescriptionLineAst = {
    source: string;
    nodes: DescriptionNode[];
};

type RenderTokenizedTextOptions = {
    decorativeIcons?: boolean;
};

function Icon({
    iconPath,
    title,
    decorative = false,
}: {
    iconPath: string;
    title: string;
    decorative?: boolean;
}) {
    return (
        <img
            src={iconPath}
            alt={decorative ? "" : title}
            title={decorative ? undefined : title}
            aria-hidden={decorative ? true : undefined}
            style={{
                width: 15,
                height: 15,
                verticalAlign: "-2.5px",
                marginRight: 4,
                display: "inline-block",
            }}
        />
    );
}

function getTokenWordColor(token: string, manifestColor: string | undefined): string | undefined {
    const override = TOKEN_WORD_COLOR_OVERRIDES[token];
    if (override) return override;

    return token.endsWith("Colored") ? manifestColor : undefined;
}

function splitWordish(text: string): { leadingSpace: string; word: string; rest: string } {
    const match = text.match(/^(\s*)(\S+)([\s\S]*)$/);
    if (!match) return { leadingSpace: "", word: "", rest: "" };
    return { leadingSpace: match[1] ?? "", word: match[2] ?? "", rest: match[3] ?? "" };
}

export function parseDescriptionLine(line: string): DescriptionLineAst {
    if (!line) return { source: line, nodes: [] };

    const nodes: DescriptionNode[] = [];
    let lastIndex = 0;

    for (const match of line.matchAll(TOKEN_RE)) {
        const raw = match[0];
        const token = (match[1] ?? "").trim();
        const matchIndex = match.index ?? 0;

        if (matchIndex > lastIndex) {
            nodes.push({
                type: "text",
                value: line.slice(lastIndex, matchIndex),
                index: lastIndex,
            });
        }

        nodes.push({
            type: "token",
            token,
            raw,
            index: matchIndex,
            style: getTokenStyle(token, { line, tokenIndex: matchIndex }),
        });

        lastIndex = matchIndex + raw.length;
    }

    if (lastIndex < line.length) {
        nodes.push({
            type: "text",
            value: line.slice(lastIndex),
            index: lastIndex,
        });
    }

    return { source: line, nodes };
}

export function getDescriptionTokens(ast: DescriptionLineAst): TokenMatch[] {
    return ast.nodes
        .filter((node): node is DescriptionTokenNode => node.type === "token" && node.token.length > 0)
        .map((node) => ({
            token: node.token,
            raw: node.raw,
            index: node.index,
        }));
}

export function stripDescriptionAst(ast: DescriptionLineAst): string {
    return ast.nodes
        .filter((node): node is DescriptionTextNode => node.type === "text")
        .map((node) => node.value)
        .join("")
        .replace(/\s+/g, " ")
        .trim();
}

export function extractBracketTokenMatches(value: string): TokenMatch[] {
    return getDescriptionTokens(parseDescriptionLine(value));
}

export function extractBracketTokens(value: string): string[] {
    return extractBracketTokenMatches(value).map((match) => match.token);
}

export function getTokenStyle(
    token: string,
    context?: { line?: string; tokenIndex?: number }
): TokenStyle | undefined {
    const icon = getDescriptionTokenIcon(token, context);
    if (!icon) return undefined;

    return {
        iconPath: icon.path,
        wordColor: getTokenWordColor(token, icon.color),
    };
}

export function getKnownTokenMetadata(): KnownTokenMetadata[] {
    const tokenCandidates = [
        ...Object.keys(TOKEN_WORD_COLOR_OVERRIDES),
        "Health",
        "HealthPoints",
        "Damage",
        "Defense",
        "MovementPoints",
        "VisionRange",
        "Focus",
        "Shield",
        "Population",
        "Cadavers",
        "Curiosity",
        "HealthRegen",
        "Experience",
    ];

    return Array.from(new Set(tokenCandidates))
        .map((token) => [token, getTokenStyle(token)] as const)
        .filter((entry): entry is readonly [string, TokenStyle] => !!entry[1])
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([token, style]) => ({
            token,
            iconPath: style.iconPath,
            wordColor: style.wordColor,
            hasIcon: true,
            hasWordColor: !!style.wordColor,
        }));
}

export function stripDescriptionTokens(line: string): string {
    return stripDescriptionAst(parseDescriptionLine(line));
}

export function renderDescriptionAst(
    ast: DescriptionLineAst,
    options: RenderTokenizedTextOptions = {}
): React.ReactNode {
    if (!ast.source) return null;

    const parts: React.ReactNode[] = [];
    let reactKey = 0;

    const seen = new Map<string, number>();
    let pendingWordColor: string | null = null;

    const pushText = (text: string) => {
        if (!text) return;

        if (pendingWordColor) {
            const { leadingSpace, word, rest } = splitWordish(text);

            if (leadingSpace) parts.push(<span key={reactKey++}>{leadingSpace}</span>);
            if (word) parts.push(<span key={reactKey++} style={{ color: pendingWordColor }}>{word}</span>);
            if (rest) parts.push(<span key={reactKey++}>{rest}</span>);

            pendingWordColor = null;
            return;
        }

        parts.push(<span key={reactKey++}>{text}</span>);
    };

    for (const node of ast.nodes) {
        if (node.type === "text") {
            pushText(node.value);
            continue;
        }

        const style = node.style;
        if (style) {
            const count = seen.get(node.token) ?? 0;
            seen.set(node.token, count + 1);

            if (count === 0 || !style.wordColor) {
                parts.push(
                    <Icon
                        key={reactKey++}
                        iconPath={style.iconPath}
                        title={node.token}
                        decorative={options.decorativeIcons ?? false}
                    />
                );
            } else {
                pendingWordColor = style.wordColor;
            }
        }
    }

    return <>{parts}</>;
}

export function renderTokenizedText(
    text: string,
    options: RenderTokenizedTextOptions = {}
): React.ReactNode {
    return renderDescriptionAst(parseDescriptionLine(text), options);
}

export function renderDescriptionLine(line: string): React.ReactNode {
    return renderTokenizedText(line);
}
