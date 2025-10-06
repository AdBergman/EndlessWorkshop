import React, { useState, useEffect, ReactNode } from "react";
import GameDataContext from "./GameDataContext";
import { District, Improvement, Tech } from "@/types/dataTypes";
import { apiClient } from "@/api/apiClient";
// Fallback imports
import districtsJson from "../data/districts.json";
import improvementsJson from "../data/improvements.json";
import techsJson from "../data/techs.json";

interface Props { children: ReactNode }

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [districts, setDistricts] = useState<Map<string, District>>(new Map());
    const [improvements, setImprovements] = useState<Map<string, Improvement>>(new Map());
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const data = await apiClient.getDistricts();
                setDistricts(new Map(data.map(d => [d.name, d])));
            } catch (err) {
                console.error("Failed to fetch districts from API, falling back to local JSON", err);
                setDistricts(new Map((districtsJson as District[]).map(d => [d.name, d])));
            }
        };

        fetchDistricts();

        // Improvements and techs can also be fetched from the API if endpoints exist
        // For now, they remain static as per the original implementation.
        setImprovements(new Map((improvementsJson as Improvement[]).map(i => [i.name, i])));
        setTechs(new Map((techsJson as Tech[]).map(t => [t.name, t])));
    }, []);

    return (
        <GameDataContext.Provider value={{ districts, improvements, techs }}>
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;
