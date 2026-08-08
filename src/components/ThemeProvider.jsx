/**
 * ThemeProvider.jsx
 *
 * Purpose:
 * Central client-side theme manager for ResumeMill.
 * Automatically detects user OS theme preference via window.matchMedia('(prefers-color-scheme: dark)').
 * Enforces route-based theme rules:
 *   - Landing Page ('/'): Permanently Light Theme.
 *       * If OS is Light: Standard bright light theme ('light').
 *       * If OS is Dark: Reduced-intensity off-white light theme ('dimmed-light').
 *   - App Pages ('/builder', '/templates', etc.): Preferred Theme.
 *       * If OS is Dark: Professional Graphite & Slate Dark Theme ('dark').
 *       * If OS is Light: Standard bright light theme ('light').
 * Triggers a 0.5-second (500ms) Sun & Moon eclipse transition popup ONE TIME ONLY
 * on first dark mode transition.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import ThemeEclipsePopup from "./ThemeEclipsePopup";

export default function ThemeProvider({ children }) {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Helper to determine the target theme mode based on route and system preference
  const computeThemeMode = useCallback((isDark, route) => {
    const isLandingPage = route === "/";
    if (isLandingPage) {
      // Landing page is permanently light theme, but reduced intensity if OS is dark
      return isDark ? "dimmed-light" : "light";
    }
    // App pages switch to preferred system theme
    return isDark ? "dark" : "light";
  }, []);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const initialDark = mediaQuery.matches;
    setIsSystemDark(initialDark);

    // Initial theme calculation
    const initialMode = computeThemeMode(initialDark, pathname);
    document.documentElement.setAttribute("data-theme", initialMode);

    // Check one-time 0.5s popup trigger for dark mode users visiting app pages
    if (initialDark && pathname !== "/") {
      try {
        const popupShown = localStorage.getItem("resume-mill-dark-popup-shown");
        if (popupShown !== "true") {
          setShowPopup(true);
          localStorage.setItem("resume-mill-dark-popup-shown", "true");
        }
      } catch (err) {
        console.error("Storage access error:", err);
      }
    }

    // Listen for live system theme changes
    const handleChange = (e) => {
      const darkState = e.matches;
      setIsSystemDark(darkState);
      const targetMode = computeThemeMode(darkState, pathname);
      document.documentElement.setAttribute("data-theme", targetMode);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Update theme when route changes
  useEffect(() => {
    if (!mounted) return;

    const targetMode = computeThemeMode(isSystemDark, pathname);
    document.documentElement.setAttribute("data-theme", targetMode);

    // If navigating to app page with dark mode for the first time
    if (isSystemDark && pathname !== "/") {
      try {
        const popupShown = localStorage.getItem("resume-mill-dark-popup-shown");
        if (popupShown !== "true") {
          setShowPopup(true);
          localStorage.setItem("resume-mill-dark-popup-shown", "true");
        }
      } catch (err) {
        console.error("Storage access error:", err);
      }
    }
  }, [pathname, isSystemDark, mounted, computeThemeMode]);

  const handlePopupComplete = useCallback(() => {
    setShowPopup(false);
  }, []);

  return (
    <>
      {showPopup && <ThemeEclipsePopup onComplete={handlePopupComplete} />}
      {children}
    </>
  );
}
