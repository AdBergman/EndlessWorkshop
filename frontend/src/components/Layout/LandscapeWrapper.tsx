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

        if (isRotatable && window.screen.orientation?.type) {
            setIsPortrait(window.screen.orientation.type.startsWith("portrait"));
        } else if (isRotatable) {
            setIsPortrait(window.innerHeight > window.innerWidth);
        } else {
            setIsPortrait(false); // desktop never shows overlay
        }
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

    // Show overlay only if it’s a rotatable device in portrait
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
