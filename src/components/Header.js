'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Lock, HelpCircle, FileText } from 'lucide-react';
import DonationModal from './DonationModal';

export default function Header() {
  const pathname = usePathname();
  const [showNotice, setShowNotice] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowNotice(true);
  };

  const handleDonateTrigger = () => {
    setShowNotice(false);
    setShowDonation(true);
  };

  return (
    <>
      <header className="site-header">
        <div className="container header-container">
          {/* Logo - Resume Mill */}
          <Link href="/" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpg" 
              alt="Resume Mill Logo" 
              className="logo-img" 
            />
            <span className="logo-text">
              Resume<span>Mill</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="nav-menu">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            <Link href="/builder" className={`nav-link ${pathname === '/builder' ? 'active' : ''}`}>
              Builder
            </Link>
            <button onClick={() => setShowDonation(true)} className="nav-link nav-donate-link">
              Donate ☕
            </button>
          </nav>

          {/* Actions (Login) */}
          <div className="header-actions">
            <button onClick={handleLoginClick} className="btn-login-disabled" title="Login is deactivated">
              <Lock size={13} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Humorous Backend Funding Modal */}
      {showNotice && (
        <div className="notice-overlay animate-fade-in" onClick={() => setShowNotice(false)}>
          <div className="notice-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="notice-header">
              <Landmark size={40} className="notice-icon animate-bounce-slow" />
              <h3>Funding Deficit Alert!</h3>
            </div>
            <div className="notice-body">
              <p>
                The **Login feature** is not yet implemented due to a lack of funding to maintain a secure backend database.
              </p>
              <p className="humor-sub">
                Keeping user accounts secure requires databases, tokens, auth services, and servers that cost real money. Right now, this is a 100% free passion project hosted entirely serverless!
              </p>
              <div className="funding-box">
                <p>Help me grow this site and secure backend infrastructure by supporting the project.</p>
              </div>
            </div>
            <div className="notice-footer">
              <button onClick={() => setShowNotice(false)} className="btn-notice-cancel">
                Close
              </button>
              <button onClick={handleDonateTrigger} className="btn-notice-donate">
                Help me Grow: Donate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      <style jsx>{`
        .site-header {
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 70px;
          display: flex;
          align-items: center;
          transition: all var(--transition-normal);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        /* Logo styling inspired by clean design */
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-weight: 800;
          font-size: 20px;
          color: var(--text-main);
        }

        .logo-text span {
          color: var(--accent);
        }

        .logo-img {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
          object-fit: cover;
        }

        /* Navigation link items */
        .nav-menu {
          display: flex;
          gap: var(--space-6);
          align-items: center;
        }

        .nav-link {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-muted);
          position: relative;
          padding: var(--space-2) 0;
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--text-main);
        }

        .nav-link.active {
          color: var(--primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary);
          border-radius: var(--radius-full);
        }

        .nav-donate-link {
          color: var(--accent);
        }

        .nav-donate-link:hover {
          color: var(--accent-hover);
        }

        /* Actions (Grayed-out/Disabled Login button) */
        .header-actions {
          display: flex;
          align-items: center;
        }

        .btn-login-disabled {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background-color: #F3F4F6;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 14px;
          transition: all var(--transition-fast);
          opacity: 0.75;
        }

        .btn-login-disabled:hover {
          opacity: 1;
          background-color: #E5E7EB;
          border-color: var(--border-hover);
          color: var(--text-main);
        }

        /* Notice Modal overlay */
        .notice-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 10002;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notice-card {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 460px;
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .notice-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          text-align: center;
        }

        .notice-icon {
          color: var(--accent);
        }

        .notice-header h3 {
          font-size: 22px;
          color: var(--text-main);
        }

        .notice-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          text-align: center;
        }

        .notice-body p {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-main);
        }

        .humor-sub {
          font-size: 13.5px !important;
          color: var(--text-muted) !important;
        }

        .funding-box {
          background-color: var(--bg-tertiary);
          border: 1px dashed var(--border-hover);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-top: var(--space-2);
        }

        .funding-box p {
          font-size: 13px !important;
          font-weight: 500;
          color: var(--text-main);
          line-height: 1.4;
        }

        .notice-footer {
          margin-top: var(--space-6);
          display: flex;
          gap: var(--space-3);
        }

        .btn-notice-cancel {
          flex: 1;
          background-color: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 14.5px;
          transition: all var(--transition-fast);
        }

        .btn-notice-cancel:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-main);
        }

        .btn-notice-donate {
          flex: 2;
          background-color: var(--accent);
          color: var(--text-inverse);
          padding: 12px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 14.5px;
          box-shadow: var(--shadow-accent);
          transition: all var(--transition-bounce);
        }

        .btn-notice-donate:hover {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .nav-menu {
            gap: var(--space-4);
          }

          .nav-link {
            font-size: 14px;
          }

          .btn-login-disabled span {
            display: none;
          }

          .btn-login-disabled {
            padding: 8px;
          }
        }
      `}</style>
    </>
  );
}
