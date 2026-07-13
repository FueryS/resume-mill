/**
 * CookieBanner.js
 * 
 * Purpose:
 * Displays a GDPR-compliant cookie consent banner at the bottom of the page.
 * Offers the user an option to accept tracking ("Yes") or learn more details ("Know more").
 * Tracks user preference locally in browser LocalStorage to persist choices across sessions.
 * Initializes Google Analytics script triggers only after explicit user consent is received.
 */

'use client';

import { useEffect, useState } from 'react';
import { Cookie, Info, X } from 'lucide-react';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  // State to control visibility of the cookie banner at the bottom of the page
  const [showBanner, setShowBanner] = useState(false);
  
  // State to control the visibility of the "Know more" privacy information modal
  const [showModal, setShowModal] = useState(false);

  // Hook to check for existing consent decisions in browser local storage on mount
  useEffect(() => {
    // Check if the user has already made a selection in a past session
    const consent = localStorage.getItem('cookie-consent');
    
    // If no preference is found, display the banner to prompt selection
    if (consent === null) {
      // Delay showing the banner slightly for smoother visual entry UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * handleAccept()
   * 
   * Purpose:
   * Handles user consent approval (clicking "Yes" or modal "I Understand, Accept Cookies").
   * Saves the granted preference in LocalStorage and dispatches an event to activate GA4.
   */
  const handleAccept = () => {
    // 1. Save consent status to LocalStorage so the user isn't prompted again
    localStorage.setItem('cookie-consent', 'true');
    
    // 2. Hide the banner container
    setShowBanner(false);
    
    // 3. Dispatch a custom window event to notify the GoogleAnalytics.js component to load GA scripts
    window.dispatchEvent(new Event('cookie-consent-updated'));
    
    // 4. If Google Analytics is loaded on the page, update its consent mode to granted
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  // If both banner and modal are hidden, we render nothing to save rendering cycles
  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className={styles.cookieBannerContainer}>
          <div className={styles.cookieBannerContent}>
            {/* Left side: Icon and descriptive copy */}
            <div className={styles.cookieBannerIconText}>
              <Cookie className={`${styles.cookieIcon} animate-bounce-slow`} size={24} />
              <p className={styles.cookieText}>
                this website uses cookies to better your experience.
              </p>
            </div>
            
            {/* Right side: Interactive action buttons */}
            <div className={styles.cookieBannerActions}>
              {/* Primary action: Accept cookies */}
              <button onClick={handleAccept} className={styles.btnCookieAccept}>
                Yes
              </button>
              
              {/* Secondary action: Open details modal */}
              <button onClick={() => setShowModal(true)} className={styles.btnCookieMore}>
                <Info size={16} />
                Know more
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Know More" Detailed Privacy Explanation Overlay Modal */}
      {showModal && (
        <div className={styles.cookieModalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.cookieModal} onClick={(e) => e.stopPropagation()}>
            {/* Close button at top right */}
            <button className={styles.cookieModalClose} onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            
            {/* Modal Title */}
            <div className={styles.cookieModalHeader}>
              <Cookie size={32} className={styles.modalCookieIcon} />
              <h3>Your Privacy Matters</h3>
            </div>
            
            {/* Modal Content explaining privacy and analytics usage */}
            <div className={styles.cookieModalBody}>
              <p>
                No information that can be used to identify you is saved. The data stored is only intended to see which features users are most interested in and which demographics the audience belongs to.
              </p>
              <p>
                Your privacy is fully maintained, and the creator gains no personal benefit from harvesting your data. This is simply a passion project made with care.
              </p>
              
              {/* Highlighted box detailing technical implementation */}
              <div className={styles.cookieModalHighlight}>
                <p>
                  <strong>Analytics Used:</strong> Industry-standard Google Analytics (GA4) to count visits and button clicks (e.g., PDF/ZIP downloads) to show on my resume.
                </p>
              </div>
            </div>
            
            {/* Consent action button at bottom */}
            <div className={styles.cookieModalFooter}>
              <button 
                onClick={() => { handleAccept(); setShowModal(false); }} 
                className={styles.btnCookieAcceptModal}
              >
                I Understand, Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
