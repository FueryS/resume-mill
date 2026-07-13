"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Github, Linkedin, ExternalLink } from "lucide-react";
import DonationModal from "./DonationModal";

export default function Footer() {
  const [showDonation, setShowDonation] = useState(false);

  const handleLinkedInClick = () => {
    // Send GA4 event if loaded
    if (window.gtag) {
      window.gtag("event", "click_linkedin", {
        event_category: "social",
        event_label: "footer_linkedin",
      });
    }
  };

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <span className="footer-logo">
              Resume<span>Mill</span>
            </span>
            <p className="footer-tagline">
              Recruiter-approved, ATS-optimized resumes and portfolio websites.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <Link href="/">Home</Link>
              <Link href="/builder">Resume Builder</Link>
              <button
                onClick={() => setShowDonation(true)}
                className="footer-btn-link"
              >
                Donate / Support
              </button>
            </div>

            <div className="link-group">
              <h4>Connect</h4>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkedInClick}
                className="social-link"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
                <ExternalLink size={10} className="inline-icon" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Github size={16} />
                <span>GitHub</span>
                <ExternalLink size={10} className="inline-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container bottom-container">
            <p className="copyright">
              &copy; {new Date().getFullYear()} Resume Mill. All rights
              reserved.
            </p>
            <p className="creator-credit">
              Made with{" "}
              <Heart size={12} className="heart-icon animate-bounce-slow" /> as
              a passion project.
            </p>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
      />

      <style jsx>{`
        .site-footer {
          background-color: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: var(--space-12) 0 var(--space-6) 0;
          margin-top: auto;
          font-family: var(--font-sans);
        }

        .footer-container {
          display: flex;
          justify-content: space-between;
          gap: var(--space-10);
          margin-bottom: var(--space-10);
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-logo {
          font-weight: 800;
          font-size: 22px;
          color: var(--text-main);
          display: block;
          margin-bottom: var(--space-3);
        }

        .footer-logo span {
          color: var(--accent);
        }

        .footer-tagline {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .footer-links {
          display: flex;
          gap: var(--space-12);
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .link-group h4 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-main);
          font-weight: 700;
          margin-bottom: var(--space-1);
        }

        .link-group a,
        .footer-btn-link {
          font-size: 14px;
          color: var(--text-muted);
          text-align: left;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .link-group a:hover,
        .footer-btn-link:hover {
          color: var(--primary);
        }

        .footer-btn-link {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .social-link {
          display: inline-flex;
          align-items: center;
        }

        .inline-icon {
          opacity: 0.5;
        }

        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: var(--space-6);
        }

        .bottom-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copyright,
        .creator-credit {
          font-size: 13px;
          color: var(--text-muted);
        }

        .creator-credit {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .heart-icon {
          color: #ef4444;
        }

        @media (max-width: 640px) {
          .footer-container {
            flex-direction: column;
            gap: var(--space-8);
          }

          .footer-links {
            gap: var(--space-10);
          }

          .bottom-container {
            flex-direction: column;
            gap: var(--space-3);
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
