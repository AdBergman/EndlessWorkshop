import React, { createContext, useState, useContext, ReactNode } from 'react';

// The context now manages the names of selected techs as a string array.
interface AppContextType {
    selectedFaction: string;
    setSelectedFaction: (f: string) => void;
    selectedTechs: string[];
    setSelectedTechs: React.Dispatch<React.SetStateAction<string[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFaction, setSelectedFaction] = useState('Kin');
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]); // State is now a string array

    return (
        <AppContext.Provider value={{ selectedFaction, setSelectedFaction, selectedTechs, setSelectedTechs }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
};
