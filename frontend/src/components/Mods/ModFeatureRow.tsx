import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { ModEntry } from "@/data/modsCatalog";

interface ModFeatureRowProps {
    mod: ModEntry;
}

export default function ModFeatureRow({ mod }: ModFeatureRowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const panelId = useId();

    return (
        <article className={`mods-feature-row${isOpen ? " is-open" : ""}`}>
            <button
                type="button"
                className="mods-feature-toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen((current) => !current)}
            >
                <div className="mods-feature-copy">
                    <span className="mods-feature-name">{mod.name}</span>
                    <span className="mods-feature-description">{mod.description}</span>
                </div>
                <span className="mods-feature-indicator">{isOpen ? "Close" : "Details"}</span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div
                        id={panelId}
                        className="mods-feature-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <div className="mods-feature-panel__inner">
                            <p>{mod.detail}</p>
                            {mod.releaseUrl ? (
                                <a href={mod.releaseUrl} target="_blank" rel="noreferrer">
                                    View release details
                                </a>
                            ) : null}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </article>
    );
}
