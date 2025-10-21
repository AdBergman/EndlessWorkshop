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
    const spacing = 260; // distance between cards

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev - 1 + total) % total);
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev + 1) % total);
    };

    return (
        <div className="unitCarouselContainer">
            <button className="carouselArrow left" onClick={handlePrev}>
                ❮
            </button>

            <motion.div className="carouselTrack">
                {units.map((unit, index) => {
                    // Distance from active index (-N .. N)
                    let rawOffset = index - selectedIndex;
                    // Wrap around: e.g., when going from 0 → last
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
                                zIndex: visible ? (isActive ? 3 : 2) : 0,
                            }}
                            transition={{ type: "spring", stiffness: 120, damping: 18 }}
                            style={{
                                position: "absolute",
                                left: "50%",
                                transformOrigin: "center center",
                            }}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <UnitCard unit={unit} showArtwork={true} />
                        </motion.div>
                    );
                })}
            </motion.div>

            <button className="carouselArrow right" onClick={handleNext}>
                ❯
            </button>
        </div>
    );
};
