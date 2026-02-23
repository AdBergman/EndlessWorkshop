import React from "react";
import { motion } from "framer-motion";
import { Unit } from "@/types/dataTypes";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import "./UnitCarousel.css";

interface UnitCarouselProps {
    units: Unit[];
    selectedIndex: number;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const UnitCarousel: React.FC<UnitCarouselProps> = ({ units, selectedIndex, setSelectedIndex }) => {
    const total = units.length;
    const spacing = 260; // card(220)+gap(40)

    if (total === 0) {
        return <div className="unitCarouselContainer" />;
    }

    const safeIndex = ((selectedIndex % total) + total) % total;

    const handlePrev = () => setSelectedIndex((p) => (p - 1 + total) % total);
    const handleNext = () => setSelectedIndex((p) => (p + 1) % total);

    return (
        <div className="unitCarouselContainer">
            <div className="carouselStage">
                <button className="carouselArrow left" onClick={handlePrev} aria-label="Previous">
                    ❮
                </button>

                <motion.div className="carouselTrack">
                    {units.map((unit, index) => {
                        let rawOffset = index - safeIndex;
                        if (rawOffset < -Math.floor(total / 2)) rawOffset += total;
                        if (rawOffset > Math.floor(total / 2)) rawOffset -= total;

                        const isActive = rawOffset === 0;
                        const visible = Math.abs(rawOffset) <= 1;

                        return (
                            <motion.div
                                key={unit.unitKey}
                                className={`carouselItem ${isActive ? "active" : "dimmed"}`}
                                initial={false}
                                animate={{
                                    x: rawOffset * spacing,
                                    scale: isActive ? 1.05 : 0.85,
                                    opacity: visible ? (isActive ? 1 : 0.45) : 0,
                                    zIndex: visible ? (isActive ? 3 : 1) : 0,
                                }}
                                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    pointerEvents: visible ? "auto" : "none",
                                }}
                                onClick={() => !isActive && setSelectedIndex(index)}
                            >
                                <UnitCard unit={unit} showArtwork disableFlip={!isActive} />
                            </motion.div>
                        );
                    })}
                </motion.div>

                <button className="carouselArrow right" onClick={handleNext} aria-label="Next">
                    ❯
                </button>
            </div>
        </div>
    );
};