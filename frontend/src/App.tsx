import React, { useState } from 'react';
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import './App.css';

function App() {
    const [selectedFaction, setSelectedFaction] = useState("Kin");
    const [currentView, setCurrentView] = useState<'TechTree' | 'CityPlanner'>('TechTree');

    return (
        <div className="App">
            <TopContainer
                selectedFaction={selectedFaction}
                setSelectedFaction={setSelectedFaction}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

            <MainContainer
                currentView={currentView}
                selectedFaction={selectedFaction}
            />
        </div>
    );
}

export default App;
