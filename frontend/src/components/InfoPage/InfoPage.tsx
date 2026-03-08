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
                Endless Workshop is a fan-made tool built to help the community explore, learn,
                and share strategies for <strong>Endless Legend 2</strong>.
            </p>

            <p>
                The project currently includes an interactive technology tree with nested
                tooltips, unit exploration tools, and save-file analysis with empire summaries,
                technology order inspection, and late-game state overview.
            </p>

            <p>
                Planned additions include a hero viewer, a searchable encyclopedia covering
                technologies, units, districts, improvements and gameplay systems, and a
                small modding section intended to help players understand and experiment
                with the game’s underlying systems.
            </p>

            <p>
                Endless Workshop aims to stay closely aligned with the game and will be
                refreshed as new updates change the underlying systems.
            </p>

            <p>
                This project is a work in progress and new tools will continue to appear
                as development progresses.
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
                Please visit these links for official resources.
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
                I’m usually on the official Discord as <strong>CalmBreakfast</strong>.
            </p>
        </div>
    );
};

export default InfoPage;