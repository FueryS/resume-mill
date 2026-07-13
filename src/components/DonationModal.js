'use client';

import { useState } from 'react';
import { X, Copy, Check, Smartphone, QrCode } from 'lucide-react';

export default function DonationModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'example@upi';
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Zeeshan';

  // Format the UPI deep link
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  
  // Generate the QR code URL using standard public QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="donation-overlay animate-fade-in" onClick={onClose}>
      <div className="donation-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="donation-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="donation-header">
          <span className="heart-badge animate-bounce-slow">❤️</span>
          <h3>Help Me Grow</h3>
          <p>This is a passion project built entirely for free. If it helped you save time or get job-ready, consider supporting the journey!</p>
        </div>

        <div className="donation-content">
          {/* Desktop QR Scan */}
          <div className="donation-section qr-section">
            <div className="section-title">
              <QrCode size={18} />
              <span>Scan QR Code to Pay</span>
            </div>
            <div className="qr-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeUrl} 
                alt={`Scan to pay ${upiName}`}
                className="qr-image"
                width={200}
                height={200}
              />
            </div>
            <p className="qr-desc">Scan using Google Pay, PhonePe, Paytm, or BHIM</p>
          </div>

          {/* Divider */}
          <div className="donation-divider">
            <span>OR</span>
          </div>

          {/* Copy UPI / Mobile Pay */}
          <div className="donation-section pay-section">
            <div className="section-title">
              <Smartphone size={18} />
              <span>Pay via UPI App</span>
            </div>

            {/* UPI Copy Box */}
            <div className="upi-box">
              <div className="upi-details">
                <span className="upi-label">UPI ID</span>
                <span className="upi-value">{upiId}</span>
              </div>
              <button className="btn-copy" onClick={handleCopy} title="Copy UPI ID">
                {copied ? <Check size={18} className="success-icon" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="upi-name">Account Name: <strong>{upiName}</strong></p>

            {/* Mobile Pay Buttons */}
            <div className="mobile-actions">
              <a href={upiUrl} className="btn-mobile-pay">
                Pay Directly on Mobile
              </a>
              <p className="mobile-hint">Only works if you are browsing on your phone with UPI apps installed.</p>
            </div>
          </div>
        </div>

        <div className="donation-footer">
          <p>100% of donations go directly to keeping the servers running. Thank you!</p>
        </div>
      </div>

      <style jsx>{`
        .donation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(6px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donation-card {
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 680px;
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          position: relative;
        }

        .donation-close {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          color: var(--text-muted);
          transition: color var(--transition-fast);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
        }

        .donation-close:hover {
          color: var(--text-main);
          background-color: var(--bg-tertiary);
        }

        .donation-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .heart-badge {
          font-size: 32px;
          display: inline-block;
          margin-bottom: var(--space-2);
        }

        .donation-header h3 {
          font-size: 24px;
          color: var(--text-main);
          margin-bottom: var(--space-2);
        }

        .donation-header p {
          font-size: 14.5px;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .donation-content {
          display: flex;
          gap: var(--space-8);
          align-items: stretch;
          margin-bottom: var(--space-6);
        }

        .donation-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 700;
          font-size: 15px;
          color: var(--text-main);
          margin-bottom: var(--space-4);
        }

        .qr-frame {
          background-color: #ffffff;
          padding: var(--space-3);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .qr-image {
          display: block;
        }

        .qr-desc {
          margin-top: var(--space-3);
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
        }

        .donation-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: var(--text-muted);
          position: relative;
        }

        .donation-divider::before,
        .donation-divider::after {
          content: '';
          position: absolute;
          width: 1px;
          height: 40%;
          background-color: var(--border-color);
        }

        .donation-divider::before { top: 0; }
        .donation-divider::after { bottom: 0; }

        .pay-section {
          justify-content: flex-start;
          align-items: flex-start;
          width: 100%;
        }

        .upi-box {
          display: flex;
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: var(--bg-tertiary);
          margin-bottom: var(--space-2);
        }

        .upi-details {
          flex: 1;
          padding: var(--space-3) var(--space-4);
          display: flex;
          flex-direction: column;
        }

        .upi-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 700;
        }

        .upi-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          word-break: break-all;
        }

        .btn-copy {
          background-color: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          padding: 0 var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .btn-copy:hover {
          color: var(--primary);
          background-color: var(--primary-light);
        }

        .success-icon {
          color: var(--success);
        }

        .upi-name {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: var(--space-4);
        }

        .mobile-actions {
          width: 100%;
          margin-top: auto;
        }

        .btn-mobile-pay {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: var(--primary);
          color: var(--text-inverse);
          padding: 12px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 14.5px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          transition: all var(--transition-bounce);
        }

        .btn-mobile-pay:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
        }

        .mobile-hint {
          margin-top: var(--space-2);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.3;
        }

        .donation-footer {
          border-top: 1px solid var(--border-color);
          padding-top: var(--space-4);
          text-align: center;
        }

        .donation-footer p {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .donation-content {
            flex-direction: column;
            gap: var(--space-6);
          }

          .donation-divider {
            height: 20px;
            width: 100%;
            margin: 0;
          }

          .donation-divider::before,
          .donation-divider::after {
            width: 40%;
            height: 1px;
          }

          .donation-divider::before { left: 0; top: 50%; }
          .donation-divider::after { right: 0; top: 50%; }

          .pay-section {
            align-items: center;
          }

          .upi-details {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
