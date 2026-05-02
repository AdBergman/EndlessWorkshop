import { useEffect, useMemo, useState } from "react";
import { featuredPack, includedMods, installGuide, standaloneMods } from "@/data/modsCatalog";
import { InstallRequirements } from "@/components/Mods";
import "./ModsPage.css";

const INSTALL_SECTION_ID = "mods-installation";

type RowTone = "slate" | "steel" | "teal";

interface RowPreview {
    id: string;
    title: string;
    badge: string;
    tone: RowTone;
    caption: string;
}

interface CatalogRowItem {
    id: string;
    title: string;
    description: string;
    detail?: string;
    actionLabel?: string;
    releaseUrl?: string;
    preview: RowPreview;
}

interface ModCatalogRowProps {
    item: CatalogRowItem;
    onOpenPreview: (preview: RowPreview) => void;
}

function ModCatalogRow({ item, onOpenPreview }: ModCatalogRowProps) {
    return (
        <article className="mods-row">
            <button
                type="button"
                className={`mods-row-thumb mods-row-thumb--${item.preview.tone}`}
                onClick={() => onOpenPreview(item.preview)}
                aria-label={`Enlarge ${item.title} preview`}
            >
                <span className="mods-row-thumb__label">{item.preview.badge}</span>
                <strong>{item.title}</strong>
                <span className="mods-row-thumb__caption">{item.preview.caption}</span>
            </button>

            <div className="mods-row-copy">
                <h3>{item.title}</h3>
                <p className="mods-row-description">{item.description}</p>
                {item.detail ? <p className="mods-row-detail">{item.detail}</p> : null}
                {item.releaseUrl && item.actionLabel ? (
                    <div className="mods-row-actions">
                        <a href={item.releaseUrl} target="_blank" rel="noreferrer">
                            {item.actionLabel}
                        </a>
                    </div>
                ) : null}
            </div>
        </article>
    );
}

interface SectionProps {
    sectionId?: string;
    title: string;
    description?: string;
    rows: CatalogRowItem[];
    ariaLabel: string;
    onOpenPreview: (preview: RowPreview) => void;
}

function ModsSection({ sectionId, title, description, rows, ariaLabel, onOpenPreview }: SectionProps) {
    return (
        <section id={sectionId} className="mods-section" aria-labelledby={`${ariaLabel}-title`}>
            <div className="mods-section-heading">
                <h2 id={`${ariaLabel}-title`}>{title}</h2>
                {description ? <p>{description}</p> : null}
            </div>

            <div className="mods-rows" aria-label={ariaLabel}>
                {rows.map((item) => (
                    <ModCatalogRow key={item.id} item={item} onOpenPreview={onOpenPreview} />
                ))}
            </div>
        </section>
    );
}

export default function ModsPage() {
    const [activePreview, setActivePreview] = useState<RowPreview | null>(null);

    useEffect(() => {
        if (!activePreview) {
            return undefined;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActivePreview(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activePreview]);

    const essentialsRows = useMemo<CatalogRowItem[]>(
        () =>
            includedMods.map((mod) => {
                if (mod.name === "WorldGen") {
                    return {
                        id: mod.name,
                        title: mod.name,
                        description:
                            "More varied map generation, slightly larger worlds, and persistent water after the final monsoon.",
                        detail: mod.detail,
                        releaseUrl: featuredPack.releaseUrl,
                        actionLabel: `Download pack ${featuredPack.version}`,
                        preview: {
                            id: mod.name,
                            title: mod.name,
                            badge: "Map",
                            tone: "teal",
                            caption: "World generation adjustments",
                        },
                    };
                }

                if (mod.name === "BulkTrade") {
                    return {
                        id: mod.name,
                        title: mod.name,
                        description: "Adds bulk trading shortcuts: Shift + Click for 10x and Ctrl + Click for 50x.",
                        detail: mod.detail,
                        releaseUrl: featuredPack.releaseUrl,
                        actionLabel: `Download pack ${featuredPack.version}`,
                        preview: {
                            id: mod.name,
                            title: mod.name,
                            badge: "Trade",
                            tone: "steel",
                            caption: "Bulk market shortcuts",
                        },
                    };
                }

                return {
                    id: mod.name,
                    title: mod.name,
                    description: "Helps AI factions stay competitive by stabilizing approval over time.",
                    detail: mod.detail,
                    releaseUrl: featuredPack.releaseUrl,
                    actionLabel: `Download pack ${featuredPack.version}`,
                    preview: {
                        id: mod.name,
                        title: mod.name,
                        badge: "AI",
                        tone: "slate",
                        caption: "Approval stabilization",
                    },
                };
            }),
        []
    );

    const supportRows = useMemo<CatalogRowItem[]>(
        () =>
            standaloneMods.map((mod) => ({
                id: mod.name,
                title: mod.name,
                description:
                    mod.name === "Quest Recovery"
                        ? "Single-player recovery tool for stuck major faction quest steps."
                        : "Exports victory-screen reports for upload to the Game Summary page.",
                detail: mod.detail,
                releaseUrl: mod.releaseUrl,
                actionLabel: "Open release",
                preview: {
                    id: mod.name,
                    title: mod.name,
                    badge: mod.name === "Quest Recovery" ? "Quest" : "Report",
                    tone: mod.name === "Quest Recovery" ? "steel" : "teal",
                    caption: mod.name === "Quest Recovery" ? "Recovery utility" : "Summary export tool",
                },
            })),
        []
    );

    const installationRows = useMemo<CatalogRowItem[]>(
        () => [
            {
                id: "install-bepinex",
                title: "1. Install BepInEx",
                description:
                    "Download BepInEx 5.x Windows x64, extract it into the Endless Legend 2 folder, then launch the game once.",
                detail: installGuide.notes[1],
                releaseUrl: installGuide.requirementUrl,
                actionLabel: "BepInEx releases",
                preview: {
                    id: "install-bepinex",
                    title: "1. Install BepInEx",
                    badge: "Step 1",
                    tone: "slate",
                    caption: "Runtime requirement",
                },
            },
            {
                id: "install-mods",
                title: "2. Install Mods",
                description:
                    "Extract the mod or modpack zip into the same folder as ENDLESS Legend 2.exe so files land under BepInEx/plugins.",
                detail: installGuide.notes[0],
                preview: {
                    id: "install-mods",
                    title: "2. Install Mods",
                    badge: "Step 2",
                    tone: "steel",
                    caption: "Plugin placement",
                },
            },
        ],
        []
    );

    return (
        <main className="mods-page">
            <section className="mods-shell">
                <header className="mods-page-header">
                    <h1>Mods</h1>
                    <p>Small open-source Endless Legend 2 mods and tools.</p>
                </header>

                <InstallRequirements guide={installGuide} installSectionId={INSTALL_SECTION_ID} />

                <ModsSection
                    title="Essentials Mod Pack"
                    description="A small bundle of mods that smooth out rough edges without changing the game fundamentally."
                    rows={essentialsRows}
                    ariaLabel="Included mods"
                    onOpenPreview={setActivePreview}
                />

                <ModsSection
                    title="Support Tools / Misc"
                    rows={supportRows}
                    ariaLabel="Support tools"
                    onOpenPreview={setActivePreview}
                />

                <ModsSection
                    sectionId={INSTALL_SECTION_ID}
                    title="Installation"
                    rows={installationRows}
                    ariaLabel="Installation steps"
                    onOpenPreview={setActivePreview}
                />
            </section>

            {activePreview ? (
                <div
                    className="mods-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activePreview.title} preview`}
                    onClick={() => setActivePreview(null)}
                >
                    <div className="mods-lightbox-panel" onClick={(event) => event.stopPropagation()}>
                        <button
                            type="button"
                            className="mods-lightbox-close"
                            onClick={() => setActivePreview(null)}
                            aria-label="Close preview"
                        >
                            Close
                        </button>
                        <div className={`mods-lightbox-preview mods-lightbox-preview--${activePreview.tone}`}>
                            <span>{activePreview.badge}</span>
                            <strong>{activePreview.title}</strong>
                            <p>{activePreview.caption}</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
