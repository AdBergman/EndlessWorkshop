import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import InfoPage from './components/InfoPage/InfoPage';
import { AppProvider } from "./context/AppContext";
import './App.css';

// Layout wrapper that keeps TopContainer always visible
const AppLayout: React.FC = () => (
    <AppProvider>
        <div className="app">
            <TopContainer />
            <Outlet /> {/* This will render either MainContainer or InfoPage */}
        </div>
    </AppProvider>
);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<MainContainer />} /> {/* default route */}
                    <Route path="info" element={<InfoPage />} />  {/* /info route */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
