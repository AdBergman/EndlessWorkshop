import React from "react";

type Props = {
    onLoadedJsonText: (jsonText: string) => void;
};

export default function SummaryLoadView({ onLoadedJsonText }: Props) {
    const onFilePicked = async (file: File | null) => {
        if (!file) return;
        const text = await file.text();
        onLoadedJsonText(text);
    };

    const loadExample = async () => {
        try {
            const res = await fetch("/EL2_EndGame_20251207_194724.json");
            if (!res.ok) {
                alert(`Could not load example JSON (HTTP ${res.status}).`);
                return;
            }
            const text = await res.text();
            onLoadedJsonText(text);
        } catch (e) {
            console.error(e);
            alert("Failed to load example JSON. Check devtools console.");
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <h2>Game Summary</h2>
            <p style={{ opacity: 0.8 }}>
                Load an end-game export JSON to view your run.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                <button onClick={loadExample}>Load example</button>

                <label style={{ display: "inline-block" }}>
                    <input
                        type="file"
                        accept=".json,application/json"
                        style={{ display: "none" }}
                        onChange={(e) => onFilePicked(e.target.files?.[0] ?? null)}
                    />
                    <span
                        style={{
                            padding: "6px 10px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
            Upload JSON…
          </span>
                </label>
            </div>

            <p style={{ marginTop: 16, opacity: 0.7 }}>
                Later: Save to DB + reload. Auth comes later.
            </p>
        </div>
    );
}