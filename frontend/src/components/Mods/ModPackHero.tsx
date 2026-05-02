import { ModPackEntry } from "@/data/modsCatalog";

interface ModPackHeroProps {
    pack: ModPackEntry;
    installSectionId: string;
}

export default function ModPackHero({ pack, installSectionId }: ModPackHeroProps) {
    return (
        <section className="mods-hero">
            <div className="mods-hero-copy">
                <span className="mods-eyebrow">Featured Pack</span>
                <h2>{pack.name}</h2>
                <p className="mods-hero-description">{pack.description}</p>
                <p className="mods-hero-detail">{pack.detail}</p>

                <p className="mods-hero-meta" aria-label="Pack metadata">
                    <span>Open source</span>
                    <span>Single-player</span>
                    <span>BepInEx</span>
                </p>

                <div className="mods-hero-actions">
                    <a
                        href={pack.releaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mods-button mods-button--primary"
                    >
                        Download {pack.version}
                    </a>
                    <a href={`#${installSectionId}`} className="mods-button mods-button--secondary">
                        Installation
                    </a>
                </div>
            </div>

            <div className="mods-hero-includes" aria-label="Pack contents">
                <span className="mods-hero-includes-label">Included mods</span>
                <div className="mods-hero-includes-list">
                    {pack.includes.map((modName) => (
                        <div key={modName} className="mods-hero-include">
                            <strong>{modName}</strong>
                        </div>
                    ))}
                </div>
                <ul className="mods-pack-highlights" aria-label="Pack highlights">
                    {pack.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                    ))}
                </ul>
                <a href={pack.releaseUrl} target="_blank" rel="noreferrer" className="mods-quiet-link">
                    View GitHub release
                </a>
            </div>
        </section>
    );
}
