import React from "react";

interface TooltipSectionProps {
    title?: string;
    children: React.ReactNode;
}

const TooltipSection: React.FC<TooltipSectionProps> = ({ title, children }) => (
    <div style={{ marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {title && <strong>{title}</strong>}
        <div style={{ paddingLeft: "0.6rem" }}>{children}</div>
    </div>
);

export default TooltipSection;
