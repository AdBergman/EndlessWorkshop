import React, { useState, useEffect, ReactNode } from "react";
import GameDataContext from "./GameDataContext";
import { District, Improvement, Tech } from "@/types/dataTypes";
import { apiClient } from "@/api/apiClient";

interface Props { children: ReactNode }

const GameDataProvider: React.FC<Props> = ({ children }) => {
    const [districts, setDistricts] = useState<Map<string, District>>(new Map());
    const [improvements, setImprovements] = useState<Map<string, Improvement>>(new Map());
    const [techs, setTechs] = useState<Map<string, Tech>>(new Map());

    useEffect(() => {
        const fetchData = async () => {
            // --- Fetch Districts ---
            try {
                const data = await apiClient.getDistricts();
                setDistricts(new Map(data.map(d => [d.name, d])));
            } catch (err) {
                console.error("Failed to fetch districts from API.", err);
            }

            // --- Fetch Improvements ---
            try {
                const data = await apiClient.getImprovements();
                setImprovements(new Map(data.map(i => [i.name, i])));
            } catch (err) {
                console.error("Failed to fetch improvements from API.", err);
            }

            // --- Fetch Techs ---
            try {
                const data = await apiClient.getTechs();
                setTechs(new Map(data.map(t => [t.name, t])));
            } catch (err) {
                console.error("Failed to fetch techs from API.", err);
            }
        };

        fetchData();
    }, []);

    return (
        <GameDataContext.Provider value={{ districts, improvements, techs }}>
            {children}
        </GameDataContext.Provider>
    );
};

export default GameDataProvider;
