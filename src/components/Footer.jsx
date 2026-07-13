/**
 * Footer.js
 * 
 * Purpose:
 * Renders the global page footer containing branding text, navigation shortcuts,
 * and outbound links to personal developer profiles (GitHub & LinkedIn).
 * Integrates Google Analytics trackers to capture clicks on social links.
 * Houses a shortcut button to open the UPI Donation scanner widget.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Github, Linkedin, ExternalLink } from 'lucide-react';
import DonationModal from './DonationModal';
import styles from './Footer.module.css';

export default function Footer() {
  // State to control display of the UPI donation modal
  const [showDonation, setShowDonation] = useState(false);

  /**
   * handleLinkedInClick()
   * 
   * Purpose:
   * Triggers when the user clicks the LinkedIn profile link in the footer.
   * Logs a custom event in Google Analytics 4 (GA4) to track outbound profile clicks.
   */
  const handleLinkedInClick = () => {
    // Check if GA4 client tracking object is initialized
    if (window.gtag) {
      window.gtag('event', 'click_linkedin', {
        event_category: 'social',
        event_label: 'footer_linkedin'
      });
    }
  };

  return (
    <>
      <footer className={styles.siteFooter}>
        <div className={`container ${styles.footerContainer}`}>
          
          {/* BRAND COLUMN: Logo and short mission tagline */}
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>
              Resume<span>Mill</span>
            </span>
            <p className={styles.footerTagline}>
              Recruiter-approved, ATS-optimized resumes and portfolio websites.
            </p>
          </div>

          {/* LINKS COLUMNS: Split into navigation links and social connection links */}
          <div className={styles.footerLinks}>
            
            {/* Product links group */}
            <div className={styles.linkGroup}>
              <h4>Product</h4>
              <Link href="/">Home</Link>
              <Link href="/builder">Resume Builder</Link>
              <button onClick={() => setShowDonation(true)} className={styles.footerBtnLink}>
                Donate / Support
              </button>
            </div>

            {/* Social connection links group */}
            <div className={styles.linkGroup}>
              <h4>Connect</h4>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={handleLinkedInClick}
                className={styles.socialLink}
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
                <ExternalLink size={10} className={styles.inlineIcon} />
              </a>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Github size={16} />
                <span>GitHub</span>
                <ExternalLink size={10} className={styles.inlineIcon} />
              </a>
            </div>

          </div>
        </div>

        {/* BOTTOM METADATA BAR: Copyright info and author credits */}
        <div className={styles.footerBottom}>
          <div className={`container ${styles.bottomContainer}`}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} Resume Mill. All rights reserved.
            </p>
            <p className={styles.creatorCredit}>
              Made with <Heart size={12} className={`${styles.heartIcon} animate-bounce-slow`} /> as a passion project.
            </p>
          </div>
        </div>
      </footer>

      {/* Donation Modal overlay widget */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
}
