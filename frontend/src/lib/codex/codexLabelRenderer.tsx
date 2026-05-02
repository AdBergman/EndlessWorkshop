import React from "react";
import { renderTokenizedText } from "@/lib/descriptionLine/descriptionLineRenderer";

export function renderCodexLabel(label: string): React.ReactNode {
    return renderTokenizedText(label, {
        decorativeIcons: true,
    });
}
