import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import InfoPage from './components/InfoPage/InfoPage';
import { AppProvider } from "./context/AppContext";
import GameDataProvider from './context/GameDataProvider';
import './App.css';

const AppLayout: React.FC = () => (
    <AppProvider>
        <div className="app">
            <TopContainer />
            <Outlet /> {/* Will render MainContainer or InfoPage */}
        </div>
    </AppProvider>
);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    {/* Wrap MainContainer with GameDataProvider */}
                    <Route
                        index
                        element={
                            <GameDataProvider>
                                <MainContainer />
                            </GameDataProvider>
                        }
                    />
                    <Route path="info" element={<InfoPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
