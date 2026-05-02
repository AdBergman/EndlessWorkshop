import { InstallGuide } from "@/data/modsCatalog";

interface InstallGuideSectionProps {
    guide: InstallGuide;
    sectionId: string;
}

export default function InstallGuideSection({ guide, sectionId }: InstallGuideSectionProps) {
    return (
        <section id={sectionId} className="mods-installation-section" aria-labelledby="mods-installation-title">
            <div className="mods-section-heading">
                <span className="mods-eyebrow">Installation</span>
                <h2 id="mods-installation-title">Quick setup</h2>
                <p>
                    Install BepInEx once, then drop any supported mod zip into the game folder. The pack is designed
                    to be a short setup rather than an involved modding workflow.
                </p>
            </div>

            <div className="mods-install-layout">
                <ol className="mods-install-steps">
                    {guide.steps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>

                <div className="mods-install-notes">
                    <p>{guide.notes[0]}</p>
                    <p>{guide.notes[1]}</p>
                    <a href={guide.requirementUrl} target="_blank" rel="noreferrer" className="mods-inline-link">
                        BepInEx releases
                    </a>
                </div>
            </div>
        </section>
    );
}
