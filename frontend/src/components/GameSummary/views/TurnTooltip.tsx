import React from "react";
import { formatNumber } from "./empireStats.helpers";
import "../GameSummary.css";
import "../CityBreakdown.css";

export type LegendLabelByIndex = Map<number, string>;

type TooltipPayloadItem = {
    dataKey?: string | number;
    name?: string;
    value?: unknown;
    color?: string;
};

export type TurnTooltipProps = {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: number | string;
    legendLabelByIndex: LegendLabelByIndex;
};

function empireIdxFromDataKey(dataKey: string): number | null {
    // recharts uses dataKey like "e0", "e1", ...
    if (!dataKey.startsWith("e")) return null;
    const n = Number(dataKey.slice(1));
    return Number.isFinite(n) ? n : null;
}

function turnLabel(label: TurnTooltipProps["label"]): string {
    if (typeof label === "number" && Number.isFinite(label)) return `Turn ${label}`;
    if (typeof label === "string" && label.trim()) return `Turn ${label.trim()}`;
    return "Turn";
}

export default function TurnTooltip({
                                        active,
                                        payload,
                                        label,
                                        legendLabelByIndex,
                                    }: TurnTooltipProps) {
    if (!active) return null;

    const rows = Array.isArray(payload) ? payload : [];
    if (rows.length === 0) return null;

    // Stable UI: show higher values first, keep original order as tie-breaker.
    const sorted = rows
        .map((p, i) => ({ p, i }))
        .sort((a, b) => {
            const av = typeof a.p.value === "number" ? a.p.value : Number(a.p.value);
            const bv = typeof b.p.value === "number" ? b.p.value : Number(b.p.value);
            const an = Number.isFinite(av) ? av : -Infinity;
            const bn = Number.isFinite(bv) ? bv : -Infinity;
            return bn - an || a.i - b.i;
        })
        .map((x) => x.p);

    return (
        <div className="gs-tooltip" role="tooltip">
            <div className="gs-tooltip__title">{turnLabel(label)}</div>

            <div className="gs-tooltip__rows">
                {sorted.map((p, i) => {
                    const dataKey = String(p.dataKey ?? "");
                    const idx = empireIdxFromDataKey(dataKey);

                    const name =
                        idx !== null
                            ? legendLabelByIndex.get(idx) ?? `E${idx}`
                            : (p.name?.trim() ? p.name : dataKey || `Series ${i + 1}`);

                    // In rare cases, recharts can emit duplicate/empty dataKey; keep key stable.
                    const rowKey = dataKey ? `k:${dataKey}` : `i:${i}`;

                    return (
                        <div key={rowKey} className="gs-tooltip__row">
              <span
                  className="gs-tooltip__dot"
                  style={{ background: p.color || "#fff" }}
                  aria-hidden
              />
                            <span className="gs-tooltip__name">{name}</span>
                            <span className="gs-tooltip__value">{formatNumber(p.value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}