"use client";
import React, { useState } from "react";

export function LaunchBanner() {
    const [visible, setVisible] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("hideLaunchBanner") !== "true";
        }
        return true;
    });

    const handleClose = () => {
        setVisible(false);
        if (typeof window !== "undefined") {
            localStorage.setItem("hideLaunchBanner", "true");
        }
    };

    if (!visible) return null;

    return (
        <div className="w-full bg-yellow-400 text-yellow-900 text-center py-2 px-4 font-semibold text-sm shadow-md z-50 relative flex items-center justify-center">
            <span>Special Beta Pricing: Get 50% off Pro features during our final development phase!</span>
            <button
                aria-label="Close banner"
                onClick={handleClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-900 hover:text-yellow-700 text-lg font-bold px-2 focus:outline-none"
                style={{ lineHeight: 1 }}
            >
                ×
            </button>
        </div>
    );
}