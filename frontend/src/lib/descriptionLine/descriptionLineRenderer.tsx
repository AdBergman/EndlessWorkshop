import React from "react";
import { getEconomyMetricColor } from "./econColors";

const TOKEN_RE = /\[([^\]]+)\]/g;

type IconKey = "Food" | "Industry" | "Dust" | "Science" | "Influence" | "Stability";

const ICON_SRC: Record<IconKey, string> = {
    Food: "/graphics/icons/FoodIcon.webp",
    Industry: "/graphics/icons/IndustryIcon.webp",
    Dust: "/graphics/icons/DustIcon.webp",
    Science: "/graphics/icons/ScienceIcon.webp",
    Influence: "/graphics/icons/InfluenceIcon.webp",
    Stability: "/graphics/icons/StabilityIcon.webp",
};

const STABILITY_WORD_COLOR = "#e63969";

type TokenStyle = {
    icon: IconKey;
    wordColor: string;
};

const TOKEN_STYLE: Record<string, TokenStyle> = {
    FoodColored: { icon: "Food", wordColor: getEconomyMetricColor("Food") },
    IndustryColored: { icon: "Industry", wordColor: getEconomyMetricColor("Industry") },
    DustColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") },
    MoneyColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") },
    ScienceColored: { icon: "Science", wordColor: getEconomyMetricColor("Science") },
    CultureColored: { icon: "Influence", wordColor: getEconomyMetricColor("Influence") },
    PublicOrderColored: { icon: "Stability", wordColor: STABILITY_WORD_COLOR },
};

function Icon({ icon, title }: { icon: IconKey; title: string }) {
    return (
        <img
            src={ICON_SRC[icon]}
            alt={title}
            title={title}
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

export function stripDescriptionTokens(line: string): string {
    if (!line) return "";
    // Remove [Token] markers, keep the surrounding text.
    return line.replace(TOKEN_RE, "").replace(/\s+/g, " ").trim();
}

export function renderDescriptionLine(line: string): React.ReactNode {
    if (!line) return null;

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

    for (const match of line.matchAll(TOKEN_RE)) {
        const full = match[0];
        const token = (match[1] ?? "").trim();
        const matchIndex = match.index ?? 0;

        pushText(line.slice(lastIndex, matchIndex));

        const style = TOKEN_STYLE[token];
        if (style) {
            const count = seen.get(token) ?? 0;
            seen.set(token, count + 1);

            if (count === 0) {
                parts.push(<Icon key={reactKey++} icon={style.icon} title={token} />);
            } else {
                pendingWordColor = style.wordColor;
            }
        }

        lastIndex = matchIndex + full.length;
    }

    pushText(line.slice(lastIndex));

    return <>{parts}</>;
}