'use client';

import { useEffect, useState } from 'react';
import { Cookie, Info, X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if consent has already been chosen
    const consent = localStorage.getItem('cookie-consent');
    if (consent === null) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowBanner(false);
    // Dispatch a custom event to notify GoogleAnalytics component
    window.dispatchEvent(new Event('cookie-consent-updated'));
    // Trigger a pageview event if GA is loaded
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="cookie-banner-container">
          <div className="cookie-banner-content">
            <div className="cookie-banner-icon-text">
              <Cookie className="cookie-icon animate-bounce-slow" size={24} />
              <p className="cookie-text">
                this website uses cookies to better your experience.
              </p>
            </div>
            <div className="cookie-banner-actions">
              <button onClick={handleAccept} className="btn-cookie-accept">
                Yes
              </button>
              <button onClick={() => setShowModal(true)} className="btn-cookie-more">
                <Info size={16} />
                Know more
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Know More" Detailed Privacy Modal */}
      {showModal && (
        <div className="cookie-modal-overlay animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="cookie-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="cookie-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <div className="cookie-modal-header">
              <Cookie size={32} className="modal-cookie-icon" />
              <h3>Your Privacy Matters</h3>
            </div>
            <div className="cookie-modal-body">
              <p>
                No information that can be used to identify you is saved. The data stored is only intended to see which features users are most interested in and which demographics the audience belongs to.
              </p>
              <p>
                Your privacy is fully maintained, and the creator gains no personal benefit from harvesting your data. This is simply a passion project made with care.
              </p>
              <div className="cookie-modal-highlight">
                <p>
                  <strong>Analytics Used:</strong> Industry-standard Google Analytics (GA4) to count visits and button clicks (e.g., PDF/ZIP downloads) to show on my resume.
                </p>
              </div>
            </div>
            <div className="cookie-modal-footer">
              <button onClick={() => { handleAccept(); setShowModal(false); }} className="btn-cookie-accept-modal">
                I Understand, Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cookie-banner-container {
          position: fixed;
          bottom: var(--space-6);
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          animation: fadeInUp var(--transition-slow) forwards;
        }

        .cookie-banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          gap: var(--space-4);
        }

        .cookie-banner-icon-text {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .cookie-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .cookie-text {
          font-size: 14px;
          color: var(--text-main);
          font-weight: 500;
        }

        .cookie-banner-actions {
          display: flex;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .btn-cookie-accept {
          background-color: var(--primary);
          color: var(--text-inverse);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 14px;
          transition: all var(--transition-fast);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
        }

        .btn-cookie-accept:hover {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
        }

        .btn-cookie-more {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          background-color: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-weight: 500;
          font-size: 13px;
          transition: all var(--transition-fast);
        }

        .btn-cookie-more:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-main);
          border-color: var(--border-hover);
        }

        /* Cookie Modal */
        .cookie-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cookie-modal {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 480px;
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          position: relative;
        }

        .cookie-modal-close {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          color: var(--text-muted);
          transition: color var(--transition-fast);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
        }

        .cookie-modal-close:hover {
          color: var(--text-main);
          background-color: var(--bg-tertiary);
        }

        .cookie-modal-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .modal-cookie-icon {
          color: var(--accent);
        }

        .cookie-modal-header h3 {
          font-size: 20px;
          color: var(--text-main);
        }

        .cookie-modal-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .cookie-modal-body p {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .cookie-modal-highlight {
          background-color: var(--bg-tertiary);
          border-left: 4px solid var(--primary);
          padding: var(--space-3) var(--space-4);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          margin-top: var(--space-2);
        }

        .cookie-modal-highlight p {
          font-size: 13.5px;
          color: var(--text-main);
          line-height: 1.5;
        }

        .cookie-modal-footer {
          margin-top: var(--space-6);
          display: flex;
          justify-content: flex-end;
        }

        .btn-cookie-accept-modal {
          width: 100%;
          background-color: var(--primary);
          color: var(--text-inverse);
          padding: 12px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 15px;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
        }

        .btn-cookie-accept-modal:hover {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.25);
        }

        /* Responsive styling */
        @media (max-width: 640px) {
          .cookie-banner-content {
            flex-direction: column;
            align-items: flex-start;
            padding: var(--space-4);
          }

          .cookie-banner-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: var(--space-1);
          }
        }
      `}</style>
    </>
  );
}
