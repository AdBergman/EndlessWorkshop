import React from "react";
import "./InfoPage.css";

const InfoPage: React.FC = () => {
    return (
        <div className="info-content">
            <h1 className="seo-hidden">
                Endless Legend 2 Tools – Tech Tree Planner, Units Explorer, and Save Analysis
            </h1>

            <h1>Endless Workshop</h1>

            <p>
                Endless Workshop is an independent fan-made reference and planning tool for{" "}
                <strong>Endless Legend 2</strong>.
            </p>

            <p>
                It currently includes tools for technology planning, units, quests, codex data,
                mods, and end-game report analysis.
            </p>

            <div className="orange-line thin-center" />

            <div className="italic-group">
                <p className="italic">
                    Endless Legend 2 is the copyrighted property of Amplitude Games.
                </p>
                <p className="italic">
                    Endless Workshop is an independent fan project and is not affiliated
                    with Amplitude Games.
                </p>
            </div>

            <p className="top-margin">
                Official resources:
            </p>

            <div className="resource-links">
                <a href="https://discord.com/invite/amplitude" target="_blank" rel="noopener noreferrer">
                    Discord
                </a>
                <a
                    href="https://community.amplitude-studios.com/amplitude-studios/endless-legend-2/forums"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Forums
                </a>
                <a
                    href="https://wiki.hoodedhorse.com/ENDLESS_Legend_2/Main_Page"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Wiki
                </a>
            </div>

            <p className="contact-note">
                You can usually reach me on the official Discord as <strong>CalmBreakfast</strong>.
            </p>
        </div>
    );
};

export default InfoPage;
