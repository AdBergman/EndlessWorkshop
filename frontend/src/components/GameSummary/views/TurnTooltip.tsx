import React from "react";
import { formatNumber } from "./empireStats.helpers";
import "../GameSummary.css";

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

export default function TurnTooltip({
                                        active,
                                        payload,
                                        label,
                                        legendLabelByIndex,
                                    }: TurnTooltipProps) {
    if (!active) return null;

    const rows = Array.isArray(payload) ? payload : [];
    if (rows.length === 0) return null;

    return (
        <div className="gs-tooltip">
            <div className="gs-tooltip__title">Turn {label}</div>

            <div className="gs-tooltip__rows">
                {rows.map((p) => {
                    const key = String(p.dataKey ?? "");
                    const idx = key.startsWith("e") ? Number(key.slice(1)) : NaN;

                    const name =
                        Number.isFinite(idx)
                            ? legendLabelByIndex.get(idx) ?? key
                            : p.name ?? key;

                    return (
                        <div key={key} className="gs-tooltip__row">
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