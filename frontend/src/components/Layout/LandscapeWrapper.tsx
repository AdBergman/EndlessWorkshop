import React, { useEffect, useState } from "react";
import "./LandscapeWrapper.css";

interface Props {
    children: React.ReactNode;
}

// Design reference width
const DESIGN_WIDTH = 1920;

const LandscapeWrapper: React.FC<Props> = ({ children }) => {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isRotatableDevice, setIsRotatableDevice] = useState(false);
    const [scale, setScale] = useState(1);

    const updateLayout = () => {
        const isRotatable = /Mobi|Android|iPad|Tablet/i.test(navigator.userAgent);
        setIsRotatableDevice(isRotatable);

        // Portrait detection
        const portrait = isRotatable
            ? window.screen.orientation?.type
                ? window.screen.orientation.type.startsWith("portrait")
                : window.innerHeight > window.innerWidth
            : false;
        setIsPortrait(portrait);

        // Scale by width only
        const widthScale = window.innerWidth / DESIGN_WIDTH;
        setScale(widthScale);
    };

    useEffect(() => {
        updateLayout();
        window.addEventListener("resize", updateLayout);
        window.addEventListener("orientationchange", updateLayout);

        return () => {
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("orientationchange", updateLayout);
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
                <div
                    className="landscape-content"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        width: DESIGN_WIDTH,
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default LandscapeWrapper;
