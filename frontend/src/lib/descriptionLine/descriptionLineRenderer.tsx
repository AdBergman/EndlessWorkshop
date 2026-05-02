import React from "react";
import { getEconomyMetricColor } from "./econColors";

export const TOKEN_RE = /\[([^\]]+)\]/g;

export type IconKey = "Food" | "Industry" | "Dust" | "Science" | "Influence" | "Stability";

export const ICON_SRC: Record<IconKey, string> = {
    Food: "/graphics/icons/FoodIcon.webp",
    Industry: "/graphics/icons/IndustryIcon.webp",
    Dust: "/graphics/icons/DustIcon.webp",
    Science: "/graphics/icons/ScienceIcon.webp",
    Influence: "/graphics/icons/InfluenceIcon.webp",
    Stability: "/graphics/icons/StabilityIcon.webp",
};

const STABILITY_WORD_COLOR = "#e63969";

export type TokenStyle = {
    icon: IconKey;
    wordColor: string;
};

export const TOKEN_STYLE: Record<string, TokenStyle> = {
    FoodColored: { icon: "Food", wordColor: getEconomyMetricColor("Food") },
    IndustryColored: { icon: "Industry", wordColor: getEconomyMetricColor("Industry") },
    DustColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") },
    MoneyColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") },
    ScienceColored: { icon: "Science", wordColor: getEconomyMetricColor("Science") },
    CultureColored: { icon: "Influence", wordColor: getEconomyMetricColor("Influence") },
    PublicOrderColored: { icon: "Stability", wordColor: STABILITY_WORD_COLOR },
};

export type KnownTokenMetadata = {
    token: string;
    icon: IconKey;
    wordColor: string;
    hasIcon: true;
    hasWordColor: true;
};

export type TokenMatch = {
    token: string;
    raw: string;
    index: number;
};

type RenderTokenizedTextOptions = {
    decorativeIcons?: boolean;
};

function Icon({
    icon,
    title,
    decorative = false,
}: {
    icon: IconKey;
    title: string;
    decorative?: boolean;
}) {
    return (
        <img
            src={ICON_SRC[icon]}
            alt={decorative ? "" : title}
            title={decorative ? undefined : title}
            aria-hidden={decorative ? true : undefined}
            style={{
                width: 14,
                height: 14,
                verticalAlign: "-2px",
                marginRight: 4,
                display: "inline-block",
            }}
        />
    );
}

function splitWordish(text: string): { leadingSpace: string; word: string; rest: string } {
    const match = text.match(/^(\s*)(\S+)([\s\S]*)$/);
    if (!match) return { leadingSpace: "", word: "", rest: "" };
    return { leadingSpace: match[1] ?? "", word: match[2] ?? "", rest: match[3] ?? "" };
}

export function extractBracketTokenMatches(value: string): TokenMatch[] {
    if (!value) return [];

    return Array.from(value.matchAll(TOKEN_RE))
        .map((match) => {
            const token = (match[1] ?? "").trim();
            if (!token) return null;

            return {
                token,
                raw: match[0],
                index: match.index ?? 0,
            };
        })
        .filter((match): match is TokenMatch => match !== null);
}

export function extractBracketTokens(value: string): string[] {
    return extractBracketTokenMatches(value).map((match) => match.token);
}

export function getTokenStyle(token: string): TokenStyle | undefined {
    return TOKEN_STYLE[token];
}

export function getKnownTokenMetadata(): KnownTokenMetadata[] {
    return Object.entries(TOKEN_STYLE)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([token, style]) => ({
            token,
            icon: style.icon,
            wordColor: style.wordColor,
            hasIcon: true,
            hasWordColor: true,
        }));
}

export function stripDescriptionTokens(line: string): string {
    if (!line) return "";
    // Remove [Token] markers, keep the surrounding text.
    return line.replace(TOKEN_RE, "").replace(/\s+/g, " ").trim();
}

export function renderTokenizedText(
    text: string,
    options: RenderTokenizedTextOptions = {}
): React.ReactNode {
    if (!text) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
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

    for (const match of text.matchAll(TOKEN_RE)) {
        const full = match[0];
        const token = (match[1] ?? "").trim();
        const matchIndex = match.index ?? 0;

        pushText(text.slice(lastIndex, matchIndex));

        const style = TOKEN_STYLE[token];
        if (style) {
            const count = seen.get(token) ?? 0;
            seen.set(token, count + 1);

            if (count === 0) {
                parts.push(
                    <Icon
                        key={reactKey++}
                        icon={style.icon}
                        title={token}
                        decorative={options.decorativeIcons ?? false}
                    />
                );
            } else {
                pendingWordColor = style.wordColor;
            }
        }

        lastIndex = matchIndex + full.length;
    }

    pushText(text.slice(lastIndex));

    return <>{parts}</>;
}

export function renderDescriptionLine(line: string): React.ReactNode {
    return renderTokenizedText(line);
}
