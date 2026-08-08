/**
 * ThemeEclipsePopup.jsx
 *
 * Purpose:
 * Renders a 0.5-second (500ms) full-screen transition overlay when a dark mode user
 * opens the app pages for the very first time.
 * Features a white-outlined sun SVG that gets covered by a sliding dark moon,
 * accompanied by an expanding radial shadow wave that covers the light background
 * before fading smoothly to reveal the dark-themed app page.
 */

"use client";

import React, { useEffect } from "react";
import styles from "./ThemeEclipsePopup.module.css";

export default function ThemeEclipsePopup({ onComplete }) {
  useEffect(() => {
    // Automatically unmount overlay after exactly 1.1s (1100ms)
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.popupOverlay} aria-hidden="true">
      {/* Radial expanding dark wave background */}
      <div className={styles.waveBackground} />

      {/* Sun & Moon Celestial Container */}
      <div className={styles.celestialWrapper}>
        {/* Outlined Sun SVG */}
        <svg
          className={styles.sunIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>

        {/* Sliding Moon Eclipse Mask */}
        <div className={styles.moonMask} />
      </div>
    </div>
  );
}
