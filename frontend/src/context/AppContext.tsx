import React, { createContext, useState, useContext, ReactNode } from 'react';

// The context is now only responsible for shared application data, not navigation.
interface AppContextType {
    selectedFaction: string;
    setSelectedFaction: (f: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFaction, setSelectedFaction] = useState('Kin');

    return (
        <AppContext.Provider value={{ selectedFaction, setSelectedFaction }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
};
