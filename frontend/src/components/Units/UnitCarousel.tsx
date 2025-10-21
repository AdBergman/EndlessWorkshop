import React, { useState } from "react";
import { motion } from "framer-motion";
import { Unit } from "@/types/dataTypes";
import { UnitCard } from "@/components/Units/UnitCard/UnitCard";
import "./UnitCarousel.css";

interface UnitCarouselProps {
    units: Unit[];
}

export const UnitCarousel: React.FC<UnitCarouselProps> = ({ units }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const total = units.length;
    const spacing = 260; // card(220) + gap(40)

    const handlePrev = () => setSelectedIndex((p) => (p - 1 + total) % total);
    const handleNext = () => setSelectedIndex((p) => (p + 1) % total);

    return (
        <div className="unitCarouselContainer">
            {/* Merged container: stage holds cards + arrows */}
            <div className="carouselStage">
                {/* Left Arrow (relative to stage edges) */}
                <button className="carouselArrow left" onClick={handlePrev} aria-label="Previous">
                    ❮
                </button>

                {/* Track (unchanged animation math) */}
                <motion.div className="carouselTrack">
                    {units.map((unit, index) => {
                        let rawOffset = index - selectedIndex;
                        if (rawOffset < -Math.floor(total / 2)) rawOffset += total;
                        if (rawOffset > Math.floor(total / 2)) rawOffset -= total;

                        const isActive = rawOffset === 0;
                        const visible = Math.abs(rawOffset) <= 1;

                        return (
                            <motion.div
                                key={unit.name}
                                className={`carouselItem ${isActive ? "active" : "dimmed"}`}
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
                                    transform: "translateX(-50%)", // anchor to stage center
                                    pointerEvents: visible ? "auto" : "none",
                                }}
                                onClick={() => !isActive && setSelectedIndex(index)}
                            >
                                <UnitCard unit={unit} showArtwork disableFlip={!isActive} />
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Right Arrow (relative to stage edges) */}
                <button className="carouselArrow right" onClick={handleNext} aria-label="Next">
                    ❯
                </button>
            </div>
        </div>
    );
};
