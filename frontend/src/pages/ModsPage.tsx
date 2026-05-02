import { useEffect, useMemo, useState } from "react";
import { featuredPack, includedMods, installGuide, standaloneMods } from "@/data/modsCatalog";
import type { ModScreenshot } from "@/data/modsCatalog";
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
    imageUrl?: string;
    imageAlt?: string;
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

function getPrimaryScreenshot(title: string, screenshots?: ModScreenshot[]) {
    const screenshot = screenshots?.find((entry) => typeof entry.src === "string" && entry.src.trim());

    if (!screenshot) {
        return null;
    }

    return {
        imageUrl: screenshot.src.trim(),
        imageAlt: screenshot.alt?.trim() || `${title} screenshot`,
        caption: screenshot.caption?.trim(),
    };
}

function buildPreview(
    title: string,
    badge: string,
    tone: RowTone,
    fallbackCaption: string,
    screenshots?: ModScreenshot[]
): RowPreview {
    const screenshot = getPrimaryScreenshot(title, screenshots);

    return {
        id: title,
        title,
        badge,
        tone,
        caption: screenshot?.caption || fallbackCaption,
        imageUrl: screenshot?.imageUrl,
        imageAlt: screenshot?.imageAlt,
    };
}

function ModCatalogRow({ item, onOpenPreview }: ModCatalogRowProps) {
    const hasPreviewImage = Boolean(item.preview.imageUrl);
    const isRowClickable = hasPreviewImage || Boolean(item.releaseUrl);

    const handleRowClick = () => {
        if (item.preview.imageUrl) {
            onOpenPreview(item.preview);
            return;
        }

        if (item.releaseUrl) {
            window.open(item.releaseUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <article
            className={`mods-row${isRowClickable ? " mods-row--interactive" : ""}`}
            onClick={isRowClickable ? handleRowClick : undefined}
        >
            {hasPreviewImage ? (
                <button
                    type="button"
                    className={`mods-row-thumb mods-row-thumb--${item.preview.tone} mods-row-thumb--clickable mods-row-thumb--with-image`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenPreview(item.preview);
                    }}
                    aria-label={`Enlarge ${item.title} screenshot`}
                >
                    <img
                        className="mods-row-thumb__image"
                        src={item.preview.imageUrl}
                        alt={item.preview.imageAlt || `${item.title} screenshot`}
                        loading="lazy"
                    />
                    <div className="mods-row-thumb__content">
                        <span className="mods-row-thumb__label">{item.preview.badge}</span>
                        <strong>{item.title}</strong>
                        <span className="mods-row-thumb__caption">{item.preview.caption}</span>
                    </div>
                </button>
            ) : (
                <div
                    className={`mods-row-thumb mods-row-thumb--${item.preview.tone} mods-row-thumb--static`}
                    onClick={(event) => event.stopPropagation()}
                    aria-hidden="true"
                >
                    <div className="mods-row-thumb__glyph">
                        <span className="mods-row-thumb__node" />
                    </div>
                    <div className="mods-row-thumb__content">
                        <span className="mods-row-thumb__label">{item.preview.badge}</span>
                        <strong>{item.title}</strong>
                        <span className="mods-row-thumb__caption">{item.preview.caption}</span>
                    </div>
                </div>
            )}

            <div className="mods-row-copy">
                <h3>{item.title}</h3>
                <p className="mods-row-description">{item.description}</p>
                {item.detail ? <p className="mods-row-detail">{item.detail}</p> : null}
                {item.releaseUrl && item.actionLabel ? (
                    <div className="mods-row-actions" onClick={(event) => event.stopPropagation()}>
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
    actionLabel?: string;
    actionUrl?: string;
    rows: CatalogRowItem[];
    ariaLabel: string;
    onOpenPreview: (preview: RowPreview) => void;
}

function ModsSection({ sectionId, title, description, actionLabel, actionUrl, rows, ariaLabel, onOpenPreview }: SectionProps) {
    return (
        <section id={sectionId} className="mods-section" aria-labelledby={`${ariaLabel}-title`}>
            <div className="mods-section-heading">
                <h2 id={`${ariaLabel}-title`}>{title}</h2>
                {description ? <p>{description}</p> : null}
                {actionLabel && actionUrl ? (
                    <div className="mods-section-action">
                        <a href={actionUrl} target="_blank" rel="noreferrer">
                            {actionLabel}
                        </a>
                    </div>
                ) : null}
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
                        preview: buildPreview(mod.name, "Map", "teal", "World generation adjustments", mod.screenshots),
                    };
                }

                if (mod.name === "BulkTrade") {
                    return {
                        id: mod.name,
                        title: mod.name,
                        description: "Adds bulk trading shortcuts: Shift + Click for 10x and Ctrl + Click for 50x.",
                        detail: mod.detail,
                        preview: buildPreview(mod.name, "Trade", "steel", "Bulk market shortcuts", mod.screenshots),
                    };
                }

                return {
                    id: mod.name,
                    title: mod.name,
                    description: "Helps AI factions stay competitive by stabilizing approval over time.",
                    detail: mod.detail,
                    preview: buildPreview(mod.name, "AI", "slate", "Approval stabilization", mod.screenshots),
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
                actionLabel: `Download ${mod.name}`,
                preview: buildPreview(
                    mod.name,
                    mod.name === "Quest Recovery" ? "Quest" : "Report",
                    mod.name === "Quest Recovery" ? "steel" : "teal",
                    mod.name === "Quest Recovery" ? "Recovery utility" : "Summary export tool",
                    mod.screenshots
                ),
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
                preview: buildPreview("1. Install BepInEx", "Step 1", "slate", "Runtime requirement"),
            },
            {
                id: "install-mods",
                title: "2. Install Mods",
                description:
                    "Extract the mod or modpack zip into the same folder as ENDLESS Legend 2.exe so files land under BepInEx/plugins.",
                detail: installGuide.notes[0],
                preview: buildPreview("2. Install Mods", "Step 2", "steel", "Plugin placement"),
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
                    actionLabel={`Download Essentials Pack ${featuredPack.version}`}
                    actionUrl={featuredPack.releaseUrl}
                    rows={essentialsRows}
                    ariaLabel="Included mods"
                    onOpenPreview={setActivePreview}
                />

                <ModsSection
                    title="Support Tools"
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

            {activePreview?.imageUrl ? (
                <div
                    className="mods-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activePreview.title} screenshot`}
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
                        <figure className="mods-lightbox-figure">
                            <img
                                className="mods-lightbox-image"
                                src={activePreview.imageUrl}
                                alt={activePreview.imageAlt || `${activePreview.title} screenshot`}
                            />
                            {activePreview.caption ? <figcaption>{activePreview.caption}</figcaption> : null}
                        </figure>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
