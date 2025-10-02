import React from "react";
import "./InfoPage.css";

const InfoPage: React.FC = () => {
    return (
        <div className="info-content">
            <h1>Endless Workshop</h1>

            <p>
                Endless Workshop is a fan-made tool to help the community explore, learn, and share strategies.
                The roadmap includes an interactive tech tree with nested tooltips, and an upcoming city planner.
            </p>

            <p>
                This project is a work in progress and not all features are implemented yet.
            </p>

            <div className="orange-line thin-center" />

            <p className="italic">
                Endless Legend 2 is the copyrighted property of Amplitude Games. This project is independent and not affiliated with them.
            </p>

            <p className="top-margin">
                Please visit these links for official resources.
            </p>

            <div className="resource-links">
                <a href="https://discord.com/invite/amplitude" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://community.amplitude-studios.com/amplitude-studios/endless-legend-2/forums" target="_blank" rel="noopener noreferrer">Forums</a>
                <a href="https://wiki.hoodedhorse.com/ENDLESS_Legend_2/Main_Page" target="_blank" rel="noopener noreferrer">Wiki</a>
            </div>
        </div>
    );
};

export default InfoPage;
