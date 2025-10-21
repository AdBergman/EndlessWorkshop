import React, { useContext } from "react";
import { UnitCarousel } from "./UnitCarousel";
import GameDataContext from "@/context/GameDataContext";

export const UnitCarouselDemo: React.FC = () => {
    const gameData = useContext(GameDataContext);

    if (!gameData || gameData.units.size === 0) {
        return (
            <div
                style={{
                    color: "#ff8c40",
                    textAlign: "center",
                    fontFamily: "Audiowide, sans-serif",
                    paddingTop: "80px",
                }}
            >
                Loading KIN units...
            </div>
        );
    }

    const kinUnits = Array.from(gameData.units.values()).filter(
        (unit) => unit.faction?.toUpperCase() === "KIN"
    );

    if (kinUnits.length === 0) {
        return (
            <div
                style={{
                    color: "#888",
                    textAlign: "center",
                    fontFamily: "Audiowide, sans-serif",
                    paddingTop: "80px",
                }}
            >
                No KIN units found.
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                padding: "40px 0",
            }}
        >
            <h2
                style={{
                    color: "#ff8c40",
                    fontFamily: "Audiowide, sans-serif",
                    fontSize: "1.8rem",
                }}
            >
                KIN Unit Carousel
            </h2>

            <UnitCarousel units={kinUnits} />
        </div>
    );
};
