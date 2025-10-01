import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
    selectedFaction: string;
    setSelectedFaction: (f: string) => void;
    currentView: string;
    setCurrentView: (v: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFaction, setSelectedFaction] = useState('Kin');
    const [currentView, setCurrentView] = useState('TechTree');

    return (
        <AppContext.Provider value={{ selectedFaction, setSelectedFaction, currentView, setCurrentView }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
};
