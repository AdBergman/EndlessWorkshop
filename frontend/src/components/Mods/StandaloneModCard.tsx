import { ModEntry } from "@/data/modsCatalog";

interface StandaloneModCardProps {
    mod: ModEntry;
}

export default function StandaloneModCard({ mod }: StandaloneModCardProps) {
    return (
        <article className="mods-standalone-card">
            <div>
                <span className="mods-card-kicker">Standalone Tool</span>
                <h3>{mod.name}</h3>
                <p>{mod.description}</p>
                <p className="mods-standalone-detail">{mod.detail}</p>
            </div>

            {mod.releaseUrl ? (
                <a href={mod.releaseUrl} target="_blank" rel="noreferrer" className="mods-inline-link">
                    Open release
                </a>
            ) : null}
        </article>
    );
}
