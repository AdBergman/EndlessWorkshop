import React from "react";
import {BrowserRouter as Router, Outlet, Route, Routes} from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import InfoPage from './components/InfoPage/InfoPage';
import GameDataProvider from './context/GameDataProvider';
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
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    {/* Wrap MainContainer with GameDataProvider */}
                    <Route
                        index
                        element={

                                <MainContainer />

                        }
                    />
                    <Route path="info" element={<InfoPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
