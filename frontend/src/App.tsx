import React, { useEffect } from "react";
import {BrowserRouter as Router, Outlet, Route, Routes} from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import InfoPage from './components/InfoPage/InfoPage';
import GameDataProvider from './context/GameDataProvider';
import { initGA } from './analytics';
import './App.css';

const AppLayout: React.FC = () => (
    <GameDataProvider>
        <div className="app">
            <TopContainer />
            <Outlet /> {/* Will render MainContainer or InfoPage */}
        </div>
    </GameDataProvider>
);

function App() {
    useEffect(() => {
        initGA('G-70LKPBDJZV'); // your GA4 Measurement ID
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<MainContainer />} />
                    <Route path="info" element={<InfoPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
