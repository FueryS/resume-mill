/**
 * Header.jsx
 *
 * Purpose:
 * Renders the global navigation header (nav bar) at the top of all pages.
 * Displays the custom app brand logo and links.
 * Handles the deactivated/grayed-out "Login" button logic: clicking opens a humorous dialog
 * explaining the lack of database funding, which directly prompts visitors to support the project.
 * Implements mobile-responsive vertical dot squashing, dynamic link hiding on template routes,
 * and handles collapsible brand slide load animations.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, Lock, MoreVertical } from "lucide-react";
import DonationModal from "./DonationModal";
import styles from "./Header.module.css";

export default function Header() {
  // pathname hook to determine which navigation link is currently active
  const pathname = usePathname();

  // State to control display of the humorous "funding deficit" notice popup
  const [showNotice, setShowNotice] = useState(false);

  // State to control display of the real UPI payment donation modal
  const [showDonation, setShowDonation] = useState(false);

  // State to control mobile overflow dots menu popover
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close overflow menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  /**
   * handleLoginClick()
   *
   * Purpose:
   * Triggers when the user clicks the visually grayed-out Login button.
   * Prevents standard action and displays our humorous funding notice.
   */
  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowNotice(true);
  };

  /**
   * handleDonateTrigger()
   *
   * Purpose:
   * Triggers when the user clicks the "Help me Grow: Donate" button inside the notice modal.
   * Closes the notice modal and seamlessly opens the UPI payment modal.
   */
  const handleDonateTrigger = () => {
    setShowNotice(false); // Close funding notice
    setShowDonation(true); // Open payment scanner
  };

  const isTemplateRoute = pathname.startsWith("/templates");

  return (
    <>
      <header className={styles.siteHeader}>
        <div className={`container ${styles.headerContainer}`}>
          
          {/* BRAND LOGO: Styled next to name, links to landing page.
              Logo is configured with custom slide-and-collapse keyframes. */}
          <Link href="/" className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Resume Mill Logo"
              className={styles.logoImg}
            />
            <span className={styles.logoText}>
              Resume<span>Mill</span>
            </span>
          </Link>

          {/* NAVIGATION LINKS */}
          <nav className={styles.navMenu}>
            {isTemplateRoute ? (
              // TEMPLATE VISITED ACTIVE STATE: Hide all other links, show only Resume, Portfolio, and Donate
              <>
                <Link
                  href="/templates/resume"
                  className={`${styles.navLink} ${pathname === "/templates/resume" ? styles.active : ""}`}
                >
                  Resume
                </Link>
                <Link
                  href="/templates/portfolio"
                  className={`${styles.navLink} ${pathname === "/templates/portfolio" ? styles.active : ""}`}
                >
                  Portfolio
                </Link>
                <button
                  onClick={() => setShowDonation(true)}
                  className={`${styles.navLink} ${styles.navDonateLink}`}
                >
                  Donate <img src="/Coffee_image.webp" alt="Donation Icon" className={styles.coffeeIcon} />
                </button>
              </>
            ) : (
              // REGULAR PAGES STATE: Home, Templates, Builder inline, plus mobile overflow squashing
              <>
                {/* Visible inline on both Mobile and Desktop */}
                <Link
                  href="/"
                  className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}
                >
                  Home
                </Link>

                <Link
                  href="/templates/resume"
                  className={`${styles.navLink} ${pathname.startsWith("/templates") ? styles.active : ""}`}
                >
                  Templates
                </Link>

                <Link
                  href="/builder"
                  className={`${styles.navLink} ${pathname === "/builder" ? styles.active : ""}`}
                >
                  Builder
                </Link>

                {/* Desktop-only Links */}
                <div className={styles.desktopOnlyLinks}>
                  <button
                    onClick={() => setShowDonation(true)}
                    className={`${styles.navLink} ${styles.navDonateLink}`}
                  >
                    Donate <img src="/Coffee_image.webp" alt="Donation Icon" className={styles.coffeeIcon} />
                  </button>
                </div>

                {/* Mobile-only Overflow Controls: squashed into MoreVertical three-dot menu */}
                <div className={styles.mobileOnlyControls}>
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className={styles.btnMoreMenu}
                    aria-expanded={showMobileMenu}
                    aria-label="More navigation items"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {showMobileMenu && (
                    <div className={styles.mobileDropdown}>
                      <button
                        onClick={() => {
                          setShowDonation(true);
                          setShowMobileMenu(false);
                        }}
                        className={styles.dropdownItem}
                      >
                        Donate <img src="/Coffee_image.webp" alt="Donation Icon" className={styles.coffeeIcon} />
                      </button>
                      <button
                        onClick={(e) => {
                          handleLoginClick(e);
                          setShowMobileMenu(false);
                        }}
                        className={styles.dropdownItem}
                      >
                        <Lock size={13} style={{ marginRight: '6px' }} />
                        <span>Login</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* ACTIONS: Houses the grayed-out mockup Login button.
              Hidden when visiting any templates route. */}
          {!isTemplateRoute && (
            <div className={styles.headerActionsDesktop}>
              <button
                onClick={handleLoginClick}
                className={styles.btnLoginDisabled}
                title="Login is deactivated"
              >
                <Lock size={13} />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Humorous Backend Funding Modal Dialog */}
      {showNotice && (
        <div
          className={styles.noticeOverlay}
          onClick={() => setShowNotice(false)}
        >
          <div
            className={styles.noticeCard}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon and Dialog title */}
            <div className={styles.noticeHeader}>
              <Landmark
                size={40}
                className={`${styles.noticeIcon} animate-bounce-slow`}
              />
              <h3>Funding Deficit Alert!</h3>
            </div>

            {/* Content explaining that databases require real money */}
            <div className={styles.noticeBody}>
              <p>
                The **Login feature** is not yet implemented due to a lack of
                funding to maintain a secure backend database.
              </p>
              <p className={styles.humorSub}>
                Keeping user accounts secure requires databases, tokens, auth
                services, and servers that cost real money. Right now, this is a
                100% free passion project hosted entirely serverless!
              </p>
              <div className={styles.fundingBox}>
                <p>
                  Help me grow this site and secure backend infrastructure by
                  supporting the project.
                </p>
              </div>
            </div>

            {/* Action buttons (Close vs Donate transition) */}
            <div className={styles.noticeFooter}>
              <button
                onClick={() => setShowNotice(false)}
                className={styles.btnNoticeCancel}
              >
                Close
              </button>
              <button
                onClick={handleDonateTrigger}
                className={styles.btnNoticeDonate}
              >
                Help me Grow: Donate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal overlay */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
      />
    </>
  );
}
