'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Sparkles, Send, ArrowRight, Heart, Star, CheckCircle } from 'lucide-react';
import DonationModal from '@/components/DonationModal';

export default function LandingPage() {
  const [stats, setStats] = useState(1245);
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.resumesBuilt) {
          const start = Math.max(0, data.resumesBuilt - 150);
          const end = data.resumesBuilt;
          const duration = 1500; // ms
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quad formula
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
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in-up">
          <div className="container hero-grid-layout">
            <div className="hero-content">
              <div className="hero-badge animate-bounce-slow">
                <Sparkles size={14} className="badge-icon" />
                <span>Free ATS Resume & Portfolio Builder</span>
              </div>
              
              <h1 className="hero-title">
                Craft a Resume That <br />
                <span>Gets You Hired.</span>
              </h1>
              
              <p className="hero-subtitle">
                Optimize your professional experience with Gemini AI to bypass Applicant Tracking Systems. Export custom recruiter-approved PDF resumes and download a ready-to-deploy developer portfolio website as a ZIP.
              </p>

              <div className="hero-actions">
                <Link href="/builder" className="btn btn-accent hero-cta-btn">
                  <span>Build Your Resume</span>
                  <ArrowRight size={18} />
                </Link>
                <button onClick={() => setShowDonation(true)} className="btn btn-secondary hero-donate-btn">
                  <Heart size={16} className="heart-icon" />
                  <span>Support the Project</span>
                </button>
              </div>

              {/* Platform Stats Display */}
              <div className="hero-stats">
                <div className="stat-card">
                  <span className="stat-number">{stats.toLocaleString()}</span>
                  <span className="stat-label">Resumes Created</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Free & Secure</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">₹0</span>
                  <span className="stat-label">Server Costs Funded</span>
                </div>
              </div>
            </div>

            {/* Hero Image Illustration */}
            <div className="hero-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/hero.jpg" 
                alt="Resume Mill Web App" 
                className="hero-image" 
              />
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose Resume Mill?</h2>
              <p>Forget standard templates and costly AI generators. Build recruiter-approved documents in minutes.</p>
            </div>

            <div className="features-grid">
              <div className="card feature-card">
                <div className="feature-icon-wrapper primary-bg">
                  <Sparkles size={24} className="feature-icon" />
                </div>
                <h3>ATS Wording Optimization</h3>
                <p>
                  Powered by the free tier of Google Gemini AI. Select your target role and let our engine rewrite your experience bullet points with strong action verbs and industry keywords.
                </p>
              </div>

              <div className="card feature-card">
                <div className="feature-icon-wrapper accent-bg">
                  <FileText size={24} className="feature-icon" />
                </div>
                <h3>Recruiter-Approved Styles</h3>
                <p>
                  Generate beautiful, clean, single-page A4 PDF resumes. Designed with spacing and typographic weights tested to survive structural parsing and human review.
                </p>
              </div>

              <div className="card feature-card">
                <div className="feature-icon-wrapper success-bg">
                  <Download size={24} className="feature-icon" />
                </div>
                <h3>Developer Portfolio Export</h3>
                <p>
                  Enter your details once and download a clean, responsive HTML/CSS developer portfolio website bundled as a ZIP. Deploy it instantly to Vercel, Netlify, or GitHub Pages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="steps-section">
          <div className="container">
            <div className="section-header">
              <h2>Build Your Future in 3 Steps</h2>
              <p>No account required, no paywalls, no credit cards. Start creating instantly.</p>
            </div>

            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <h4>Input Details</h4>
                <p>Enter your contact, experience, skills, projects, and target role into our interactive form.</p>
              </div>
              <div className="step-arrow"><ArrowRight size={24} /></div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <h4>AI ATS Refinement</h4>
                <p>Run your inputs through Google Gemini AI. Improve vocabulary, structure, and action verbs.</p>
              </div>
              <div className="step-arrow"><ArrowRight size={24} /></div>

              <div className="step-item">
                <div className="step-number">3</div>
                <h4>Download Exports</h4>
                <p>Download your professional resume PDF and get a complete personal portfolio website ZIP.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="support-section">
          <div className="container">
            <div className="support-card animate-scale-in">
              <div className="support-badge">
                <Star size={14} className="star-icon" />
                <span>Passion Project</span>
              </div>
              <h3>100% Free & Open-Source</h3>
              <p>
                Resume Mill is a project created to help job seekers stand out without paying subscription fees. We save all your drafts directly in your browser's local storage—no tracking, no databases, no credentials.
              </p>
              <button onClick={() => setShowDonation(true)} className="btn btn-accent support-cta-btn">
                <span>Support the Server (Donate ₹)</span>
                <Heart size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Donation Modal */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      <style jsx>{`
        .landing-container {
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          width: 100%;
          font-family: var(--font-sans);
        }

        /* Hero Section Styling */
        .hero-section {
          padding: 80px 0;
          position: relative;
        }

        .hero-grid-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: var(--space-10);
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .hero-image-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 40px rgba(79, 70, 229, 0.12);
          border: 1px solid var(--border-color);
          transform: translateY(0px);
          transition: transform var(--transition-bounce), box-shadow var(--transition-normal);
        }

        .hero-image:hover {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px rgba(79, 70, 229, 0.18);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 13px;
          margin-bottom: var(--space-6);
          border: 1px solid rgba(79, 70, 229, 0.1);
        }

        .badge-icon {
          color: var(--accent);
        }

        .hero-title {
          font-size: 54px;
          line-height: 1.15;
          color: var(--text-main);
          margin-bottom: var(--space-4);
          font-weight: 800;
        }

        .hero-title span {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 17px;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: var(--space-8);
          max-width: 680px;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-12);
        }

        .hero-cta-btn {
          padding: 14px 28px;
          font-size: 16px;
        }

        .hero-donate-btn {
          padding: 14px 28px;
          font-size: 16px;
        }

        .heart-icon {
          color: #EF4444;
        }

        /* Hero Stats Grid */
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
          width: 100%;
          max-width: 700px;
          margin-top: var(--space-4);
        }

        .stat-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-6);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          margin-top: var(--space-1);
          letter-spacing: 0.05em;
        }

        /* Features Section */
        .features-section {
          padding: 80px 0;
          background-color: #FFFFFF;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .section-header h2 {
          font-size: 32px;
          color: var(--text-main);
          margin-bottom: var(--space-2);
        }

        .section-header p {
          font-size: 16px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .feature-card {
          text-align: left;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .feature-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .primary-bg { background-color: var(--primary-light); color: var(--primary); }
        .accent-bg { background-color: var(--accent-light); color: var(--accent); }
        .success-bg { background-color: rgba(16, 185, 129, 0.1); color: var(--success); }

        .feature-card h3 {
          font-size: 18px;
          color: var(--text-main);
          margin-bottom: var(--space-2);
        }

        .feature-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        /* Steps Section */
        .steps-section {
          padding: 80px 0;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 900px;
          margin: 0 auto;
          gap: var(--space-4);
        }

        .step-item {
          flex: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background-color: var(--primary);
          color: var(--text-inverse);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: var(--space-4);
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }

        .step-item h4 {
          font-size: 16px;
          color: var(--text-main);
          margin-bottom: var(--space-2);
        }

        .step-item p {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.5;
          max-width: 240px;
        }

        .step-arrow {
          color: var(--border-hover);
          margin-bottom: var(--space-10);
        }

        /* Support CTA Section */
        .support-section {
          padding: 40px 0 80px 0;
        }

        .support-card {
          background: linear-gradient(135deg, #FAF9F6, #FFF5F2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--space-10) var(--space-8);
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .support-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--accent-light);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 11px;
          margin-bottom: var(--space-4);
        }

        .support-card h3 {
          font-size: 26px;
          color: var(--text-main);
          margin-bottom: var(--space-3);
        }

        .support-card p {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 580px;
          margin-bottom: var(--space-6);
          line-height: 1.6;
        }

        .support-cta-btn {
          padding: 12px 24px;
          font-size: 15px;
        }

        /* Responsive styling */
        @media (max-width: 968px) {
          .hero-grid-layout {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-content {
            align-items: center;
            text-align: center;
          }

          .hero-image-wrapper {
            margin-top: var(--space-6);
            order: -1; /* Place illustration above text on small screens */
          }

          .hero-stats {
            grid-template-columns: 1fr;
            width: 100%;
            gap: var(--space-3);
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 38px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps-container {
            flex-direction: column;
            gap: var(--space-8);
          }

          .step-arrow {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
