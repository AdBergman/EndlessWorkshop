import React from "react";
import TopContainer from './components/TopContainer/TopContainer';
import MainContainer from './components/MainContainer/MainContainer';
import { AppProvider } from "./context/AppContext"; // <-- use named import
import './App.css';

function App() {
    return (
        <AppProvider>
            <div className="app"> {/* styling still applies */}
                <TopContainer />
                <MainContainer />
            </div>
        </AppProvider>
    );
}

export default App;
