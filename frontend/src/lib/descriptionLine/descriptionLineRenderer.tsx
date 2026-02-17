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

// You said “bright pink” for PublicOrder
const STABILITY_WORD_COLOR = "#e63969";

type TokenStyle = {
    icon: IconKey;
    // color used when token is repeated (2nd/3rd...) and we color the next word
    wordColor: string;
};

// Map bracket tokens -> (icon for first occurrence) + (color for subsequent occurrences)
const TOKEN_STYLE: Record<string, TokenStyle> = {
    FoodColored: { icon: "Food", wordColor: getEconomyMetricColor("Food") },
    IndustryColored: { icon: "Industry", wordColor: getEconomyMetricColor("Industry") },
    DustColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") },
    MoneyColored: { icon: "Dust", wordColor: getEconomyMetricColor("Dust") }, // alias
    ScienceColored: { icon: "Science", wordColor: getEconomyMetricColor("Science") },
    CultureColored: { icon: "Influence", wordColor: getEconomyMetricColor("Influence") }, // Influence
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
    // Color only the next "word" token, preserving whitespace/punctuation reasonably
    const m = text.match(/^(\s*)(\S+)([\s\S]*)$/);
    if (!m) return { leadingSpace: "", word: "", rest: "" };
    return { leadingSpace: m[1] ?? "", word: m[2] ?? "", rest: m[3] ?? "" };
}

/**
 * Renders a single description line into React nodes.
 *
 * Rule:
 * - First time a known token appears in the line => render icon.
 * - Second/third/... time the *same token* appears in the line => do NOT render icon,
 *   instead color only the next word using token’s configured color.
 * - Unknown tokens => removed (no pillbox, no text).
 */
export function renderDescriptionLine(line: string): React.ReactNode {
    if (!line) return null;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // token -> count in this line
    const seen = new Map<string, number>();

    // when set, the next emitted text chunk will have its first word colored
    let pendingWordColor: string | null = null;

    const pushText = (text: string) => {
        if (!text) return;

        if (pendingWordColor) {
            const { leadingSpace, word, rest } = splitWordish(text);

            if (leadingSpace) parts.push(<span key={key++}>{leadingSpace}</span>);
            if (word) parts.push(<span key={key++} style={{ color: pendingWordColor }}>{word}</span>);
            if (rest) parts.push(<span key={key++}>{rest}</span>);

            pendingWordColor = null;
            return;
        }

        parts.push(<span key={key++}>{text}</span>);
    };

    for (const match of line.matchAll(TOKEN_RE)) {
        const full = match[0];
        const token = (match[1] ?? "").trim();
        const idx = match.index ?? 0;

        // text before token
        const before = line.slice(lastIndex, idx);
        pushText(before);

        // token handling
        const style = TOKEN_STYLE[token];
        if (style) {
            const count = seen.get(token) ?? 0;
            seen.set(token, count + 1);

            if (count === 0) {
                // first occurrence => icon
                parts.push(<Icon key={key++} icon={style.icon} title={token} />);
            } else {
                // repeated occurrence => color next word
                pendingWordColor = style.wordColor;
            }
        }
        // else unknown token => ignore entirely

        lastIndex = idx + full.length;
    }

    // remaining tail
    const tail = line.slice(lastIndex);
    pushText(tail);

    return <>{parts}</>;
}