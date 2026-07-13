/**
 * page.js
 * 
 * Path: /
 * Purpose:
 * Renders the main marketing landing page for Resume Mill.
 * Displays a friendly split-grid hero section with a visual product illustration.
 * Communicates with the stats backend endpoint to count and animate the total number of generated resumes.
 * Outlines the product's features, step-by-step guides, and features a donation CTA.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Sparkles, Heart, Star, ArrowRight } from 'lucide-react';
import DonationModal from '@/components/DonationModal';
import styles from './page.module.css';

export default function LandingPage() {
  // State to track the animated stats count (resumes built) shown in the hero section
  const [stats, setStats] = useState(1245);
  
  // State to control display of the main UPI QR Code donation modal
  const [showDonation, setShowDonation] = useState(false);

  // Hook to fetch the real-time resume export stats on mount and run a count-up animation
  useEffect(() => {
    // Fetch total count of resumes generated globally from the stats endpoint
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.resumesBuilt) {
          // Set a baseline to start the count-up animation from (up to 150 counts below target)
          const start = Math.max(0, data.resumesBuilt - 150);
          const end = data.resumesBuilt;
          const duration = 1500; // Animation duration in milliseconds
          const startTime = performance.now();

          // Animation callback loop
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out quad formula for smooth decelerating count speed
            const easeProgress = progress * (2 - progress);
            setStats(Math.floor(start + easeProgress * (end - start)));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      })
      .catch((err) => console.error('Failed to load stats', err));
  }, []);

  return (
    <>
      <div className={styles.landingContainer}>
        
        {/* HERO SECTION: Split-grid containing marketing copy (left) and hero illustration (right) */}
        <section className={`${styles.heroSection} animate-fade-in-up`}>
          <div className={`container ${styles.heroGridLayout}`}>
            
            {/* Left column: Text blocks, CTA actions, and platform metrics */}
            <div className={styles.heroContent}>
              
              {/* Product badge */}
              <div className={styles.heroBadge}>
                <Sparkles size={14} className={styles.badgeIcon} />
                <span>Free ATS Resume & Portfolio Builder</span>
              </div>
              
              {/* Catchy headline */}
              <h1 className={styles.heroTitle}>
                Craft a Resume That <br />
                <span>Gets You Hired.</span>
              </h1>
              
              {/* Short subtitle explaining features */}
              <p className={styles.heroSubtitle}>
                Optimize your professional experience with Gemini AI to bypass Applicant Tracking Systems. Export custom recruiter-approved PDF resumes and download a ready-to-deploy developer portfolio website as a ZIP.
              </p>

              {/* Action buttons linking to builder, templates, or triggering donations */}
              <div className={styles.heroActions}>
                <Link href="/builder" className={`btn btn-accent ${styles.heroCtaBtn}`}>
                  <span>Build Your Resume</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/templates/resume" className={`btn btn-secondary ${styles.heroCtaBtn}`}>
                  <span>Explore Templates</span>
                </Link>
                <button onClick={() => setShowDonation(true)} className={`btn btn-secondary ${styles.heroDonateBtn}`}>
                  <Heart size={16} className={styles.heartIcon} />
                  <span>Support the Project</span>
                </button>
              </div>

              {/* Animated platform stats counter cards */}
              <div className={styles.heroStats}>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>{stats.toLocaleString()}</span>
                  <span className={styles.statLabel}>Resumes Created</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>100%</span>
                  <span className={styles.statLabel}>Free & Secure</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>₹0</span>
                  <span className={styles.statLabel}>Server Costs Funded</span>
                </div>
              </div>
            </div>

            {/* Right column: The generated app hero illustration */}
            <div className={styles.heroImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/hero.jpg" 
                alt="Resume Mill Web App" 
                className={styles.heroImage} 
              />
            </div>

          </div>
        </section>

        {/* FEATURES GRID SECTION: Displays the 3 core values of Resume Mill */}
        <section className={styles.featuresSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Why Choose Resume Mill?</h2>
              <p>Forget standard templates and costly AI generators. Build recruiter-approved documents in minutes.</p>
            </div>

            <div className={styles.featuresGrid}>
              
              {/* Feature 1: Gemini ATS optimization */}
              <div className={`card ${styles.featureCard}`}>
                <div className={`${styles.featureIconWrapper} ${styles.primaryBg}`}>
                  <Sparkles size={24} className={styles.featureIcon} />
                </div>
                <h3>ATS Wording Optimization</h3>
                <p>
                  Powered by the free tier of Google Gemini AI. Select your target role and let our engine rewrite your experience bullet points with strong action verbs and industry keywords.
                </p>
              </div>

              {/* Feature 2: Recruiter-approved formatting */}
              <div className={`card ${styles.featureCard}`}>
                <div className={`${styles.featureIconWrapper} ${styles.accentBg}`}>
                  <FileText size={24} className={styles.featureIcon} />
                </div>
                <h3>Recruiter-Approved Styles</h3>
                <p>
                  Generate beautiful, clean, single-page A4 PDF resumes. Designed with spacing and typographic weights tested to survive structural parsing and human review.
                </p>
              </div>

              {/* Feature 3: Portable ZIP code package exports */}
              <div className={`card ${styles.featureCard}`}>
                <div className={`${styles.featureIconWrapper} ${styles.successBg}`}>
                  <Download size={24} className={styles.featureIcon} />
                </div>
                <h3>Developer Portfolio Export</h3>
                <p>
                  Enter your details once and download a clean, responsive HTML/CSS developer portfolio website bundled as a ZIP. Deploy it instantly to Vercel, Netlify, or GitHub Pages.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* PROCESS TIMELINE SECTION: Explains how users get started */}
        <section className={styles.stepsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Build Your Future in 3 Steps</h2>
              <p>No account required, no paywalls, no credit cards. Start creating instantly.</p>
            </div>

            <div className={styles.stepsContainer}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <h4>Input Details</h4>
                <p>Enter your contact, experience, skills, projects, and target role into our interactive form.</p>
              </div>
              <div className={styles.stepArrow}><ArrowRight size={24} /></div>
              
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <h4>AI ATS Refinement</h4>
                <p>Run your inputs through Google Gemini AI. Improve vocabulary, structure, and action verbs.</p>
              </div>
              <div className={styles.stepArrow}><ArrowRight size={24} /></div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <h4>Download Exports</h4>
                <p>Download your professional resume PDF and get a complete personal portfolio website ZIP.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PASSION PROJECT CALLOUT: Welcoming tipping appeal */}
        <section className={styles.supportSection}>
          <div className="container">
            <div className={styles.supportCard}>
              <div className={styles.supportBadge}>
                <Star size={14} className={styles.starIcon} />
                <span>Passion Project</span>
              </div>
              <h3>100% Free & Open-Source</h3>
              <p>
                Resume Mill is a project created to help job seekers stand out without paying subscription fees. We save all your drafts directly in your browser's local storage—no tracking, no databases, no credentials.
              </p>
              <button onClick={() => setShowDonation(true)} className={`btn btn-accent ${styles.supportCtaBtn}`}>
                <span>Support the Server (Donate ₹)</span>
                <Heart size={18} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Donation Modal scanner widget */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
}
