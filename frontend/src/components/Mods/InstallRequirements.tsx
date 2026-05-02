import { InstallGuide } from "@/data/modsCatalog";

interface InstallRequirementsProps {
    guide: InstallGuide;
    installSectionId: string;
}

export default function InstallRequirements({ guide, installSectionId }: InstallRequirementsProps) {
    return (
        <section className="mods-requirement-strip" aria-label="Mod installation requirement">
            <div className="mods-requirement-copy">
                <p>
                    <strong>{guide.requirementLabel}:</strong> {guide.requirementValue}
                </p>
            </div>

            <div className="mods-requirement-actions">
                <a href={guide.requirementUrl} target="_blank" rel="noreferrer">
                    Get BepInEx
                </a>
                <a href={`#${installSectionId}`}>View install steps</a>
            </div>
        </section>
    );
}
