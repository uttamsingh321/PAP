import React, { useEffect, useState } from "react";

/**
 * Reusable Full Screen toggle for the PAP application.
 *
 * - Uses the native browser Fullscreen API (requestFullscreen / exitFullscreen).
 * - React "Enter" / "Exit" is kept in sync via the `fullscreenchange` event,
 *   so pressing <ESC> on the keyboard updates the button immediately.
 * - Gracefully degrades (hidden) when the Fullscreen API is unavailable.
 */
function FullscreenButton() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    // Detect API support once on mount
    useEffect(() => {
        const supported =
            typeof document !== "undefined" &&
            (document.fullscreenEnabled ||
                document.webkitFullscreenEnabled ||
                document.mozFullScreenEnabled);
        setIsEnabled(Boolean(supported));
    }, []);

    // Keep state in sync with native fullscreen changes (covers <ESC>)
    useEffect(() => {
        const onFsChange = () => {
            const fs = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement
            );
            setIsFullscreen(fs);
        };
        document.addEventListener("fullscreenchange", onFsChange);
        document.addEventListener("webkitfullscreenchange", onFsChange);
        document.addEventListener("mozfullscreenchange", onFsChange);
        return () => {
            document.removeEventListener("fullscreenchange", onFsChange);
            document.removeEventListener("webkitfullscreenchange", onFsChange);
            document.removeEventListener("mozfullscreenchange", onFsChange);
        };
    }, []);

    // Gracefully hide when unsupported
    if (!isEnabled) return null;

    const toggle = async () => {
        try {
            if (isFullscreen) {
                await document.exitFullscreen();
            } else {
                const root = document.documentElement;
                if (root.requestFullscreen) {
                    await root.requestFullscreen();
                } else if (root.webkitRequestFullscreen) {
                    root.webkitRequestFullscreen();
                } else if (root.mozRequestFullScreen) {
                    root.mozRequestFullScreen();
                }
            }
        } catch (err) {
            console.warn("Fullscreen toggle failed:", err);
        }
    };

    return (
        <button
            type="button"
            className="fullscreen-btn"
            onClick={toggle}
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
        >
            <span className="fullscreen-icon" aria-hidden="true">
                ⛶
            </span>
            <span className="fullscreen-label">
                {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </span>
        </button>
    );
}

export default FullscreenButton;