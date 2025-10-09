import React, { useEffect, useState } from "react";
import "./LandscapeWrapper.css";

interface Props {
    children: React.ReactNode;
}

const LandscapeWrapper: React.FC<Props> = ({ children }) => {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isRotatableDevice, setIsRotatableDevice] = useState(false);

    const checkOrientation = () => {
        const isRotatable = /Mobi|Android|iPad|Tablet/i.test(navigator.userAgent);
        setIsRotatableDevice(isRotatable);

        const portrait = isRotatable
            ? window.screen.orientation?.type
                ? window.screen.orientation.type.startsWith("portrait")
                : window.innerHeight > window.innerWidth
            : false;

        setIsPortrait(portrait);
    };

    useEffect(() => {
        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);
        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);

    const showOverlay = isRotatableDevice && isPortrait;

    return (
        <div className="landscape-wrapper">
            {showOverlay ? (
                <div className="rotate-overlay">
                    <p>Please rotate your device to landscape</p>
                </div>
            ) : (
                <div className="landscape-content">{children}</div>
            )}
        </div>
    );
};

export default LandscapeWrapper;
