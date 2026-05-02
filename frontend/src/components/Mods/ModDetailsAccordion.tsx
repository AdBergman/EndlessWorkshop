import { ModEntry } from "@/data/modsCatalog";
import ModFeatureRow from "./ModFeatureRow";

interface ModDetailsAccordionProps {
    mods: ModEntry[];
}

export default function ModDetailsAccordion({ mods }: ModDetailsAccordionProps) {
    return (
        <div className="mods-feature-list" role="list" aria-label="Included mods">
            {mods.map((mod) => (
                <div key={mod.name} role="listitem">
                    <ModFeatureRow mod={mod} />
                </div>
            ))}
        </div>
    );
}
