import React from "react";
import ReactDOM from "react-dom";
import BaseTooltip from "@/components/Tooltips/BaseTooltip";

type PixelCoords = { x: number; y: number; mode: "pixel" };

export type UnitCardMetadataTooltipKind = "class" | "tier";

export type HoveredUnitCardMetadata = {
    kind: UnitCardMetadataTooltipKind;
    title: string;
    body?: string;
    coords: PixelCoords;
};

type UnitCardMetadataTooltipProps = {
    hoveredMetadata: HoveredUnitCardMetadata;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
};

const tooltipStyleByKind: Record<UnitCardMetadataTooltipKind, React.CSSProperties> = {
    class: {
        padding: "6px 9px",
        borderRadius: "5px",
        fontSize: "0.8rem",
        lineHeight: 1.28,
        maxWidth: "min(220px, calc(100vw - 24px))",
        boxShadow: "0 8px 18px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.42)",
    },
    tier: {
        padding: "5px 8px",
        borderRadius: "5px",
        fontSize: "0.78rem",
        lineHeight: 1.2,
        maxWidth: "min(120px, calc(100vw - 24px))",
        boxShadow: "0 7px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
    },
};

const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    whiteSpace: "nowrap",
};

const bodyStyle: React.CSSProperties = {
    marginTop: "2px",
    color: "rgba(242, 242, 242, 0.92)",
};

const UnitCardMetadataTooltip: React.FC<UnitCardMetadataTooltipProps> = ({
                                                                            hoveredMetadata,
                                                                            onMouseEnter,
                                                                            onMouseLeave,
                                                                        }) => ReactDOM.createPortal(
    <BaseTooltip
        coords={hoveredMetadata.coords}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        tooltipStyle={tooltipStyleByKind[hoveredMetadata.kind]}
    >
        <div>
            <div style={titleStyle}>{hoveredMetadata.title}</div>
            {hoveredMetadata.body ? (
                <div style={bodyStyle}>{hoveredMetadata.body}</div>
            ) : null}
        </div>
    </BaseTooltip>,
    document.body
);

export default UnitCardMetadataTooltip;
