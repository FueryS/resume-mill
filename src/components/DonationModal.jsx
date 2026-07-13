/**
 * DonationModal.js
 * 
 * Purpose:
 * Renders an interactive donation popup widget for UPI transfers.
 * Displays a dynamically generated UPI QR code that desktop users can scan.
 * Hides the QR code on mobile screens to save space and avoid scanning the same screen.
 * Implements hardware back-button interception (via history popstate), Escape key listeners, and body scroll lock.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, QrCode } from 'lucide-react';
import styles from './DonationModal.module.css';

export default function DonationModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  // Retrieve localized payment credentials from environment variables
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'example@upi';
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Zeeshan';

  // Format the standard UPI deep link (Intent URL)
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  
  // Generate QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard Escape listener & Body Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Hardware Back Button Interception (App-like UX)
  useEffect(() => {
    if (!isOpen) return;

    // Push a temporary history state so back gesture triggers popstate instead of exiting
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up the back state if closed programmatically
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.donationOverlay} onClick={onClose}>
      <div className={styles.donationCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button at top right */}
        <button className={styles.donationClose} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Header section explaining the donation context */}
        <div className={styles.donationHeader}>
          <span className={`${styles.heartBadge} animate-bounce-slow`}>❤️</span>
          <h3>Help Me Grow</h3>
          <p>This is a passion project built entirely for free. If it helped you save time or get job-ready, consider supporting the journey!</p>
        </div>

        {/* Content body split into QR Code (left) and UPI App Details (right) */}
        <div className={styles.donationContent}>
          
          {/* LEFT COLUMN: Desktop QR Code scan block (Hidden on mobile) */}
          <div className={`${styles.donationSection} ${styles.qrSection}`}>
            <div className={styles.sectionTitle}>
              <QrCode size={18} />
              <span>Scan QR Code to Pay</span>
            </div>
            <div className={styles.qrFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeUrl} 
                alt={`Scan to pay ${upiName}`}
                className={styles.qrImage}
                width={200}
                height={200}
              />
            </div>
            <p className={styles.qrDesc}>Scan using Google Pay, PhonePe, Paytm, or BHIM</p>
          </div>

          {/* Central OR divider (Hidden on mobile) */}
          <div className={styles.donationDivider}>
            <span>OR</span>
          </div>

          {/* RIGHT COLUMN: Mobile deep links & copy text inputs */}
          <div className={`${styles.donationSection} ${styles.paySection}`}>
            <div className={styles.sectionTitle}>
              <Smartphone size={18} />
              <span>Pay via UPI App</span>
            </div>

            {/* Interactive Clipboard Copy Area */}
            <div className={styles.upiBox}>
              <div className={styles.upiDetails}>
                <span className={styles.upiLabel}>UPI ID</span>
                <span className={styles.upiValue}>{upiId}</span>
              </div>
              <button className={styles.btnCopy} onClick={handleCopy} title="Copy UPI ID">
                {copied ? <Check size={18} className={styles.successIcon} /> : <Copy size={18} />}
              </button>
            </div>
            <p className={styles.upiName}>Account Name: <strong>{upiName}</strong></p>

            {/* Direct Mobile app launcher button */}
            <div className={styles.mobileActions}>
              <a href={upiUrl} className={styles.btnMobilePay}>
                Pay Directly on Mobile
              </a>
              <p className={styles.mobileHint}>Only works if you are browsing on your phone with UPI apps installed.</p>
            </div>
          </div>

        </div>

        {/* Footer info disclaimer */}
        <div className={styles.donationFooter}>
          <p>100% of donations go directly to keeping the servers running. Thank you!</p>
        </div>
      </div>
    </div>
  );
}
