/**
 * DonationModal.js
 * 
 * Purpose:
 * Renders an interactive donation popup widget for UPI transfers (popular in India).
 * Displays a dynamically generated UPI QR code that desktop users can scan with their phone.
 * Displays direct clickable intent links for mobile users to launch local payment apps (GPay, Paytm, etc.).
 * Includes a quick one-click clipboard copying mechanism for the developer's UPI ID.
 */

'use client';

import { useState } from 'react';
import { X, Copy, Check, Smartphone, QrCode } from 'lucide-react';
import styles from './DonationModal.module.css';

export default function DonationModal({ isOpen, onClose }) {
  // State to track if the UPI ID was recently copied to clipboard (shows checkmark feedback)
  const [copied, setCopied] = useState(false);

  // Retrieve localized payment credentials from environment variables
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'example@upi';
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Zeeshan';

  // 1. Format the standard UPI deep link (Intent URL)
  // Clicking this URL on a smartphone automatically opens any installed UPI-compliant app.
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  
  // 2. Generate the QR code image URL
  // Uses a free, public QR Code API to encode the UPI deep link so desktop users can scan it.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  /**
   * handleCopy()
   * 
   * Purpose:
   * Copies the developer's UPI ID to the user's system clipboard.
   * Updates state temporarily to show a green checkmark icon for 2 seconds.
   */
  const handleCopy = () => {
    // Copy the raw text to clipboard
    navigator.clipboard.writeText(upiId);
    
    // Toggle the copied success state
    setCopied(true);
    
    // Reset back to copy icon after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // If the parent component specifies that this modal is closed, render nothing
  if (!isOpen) return null;

  return (
    <div className={styles.donationOverlay} onClick={onClose}>
      <div className={styles.donationCard} onClick={(e) => e.stopPropagation()}>
        {/* Close Button at top right */}
        <button className={styles.donationClose} onClick={onClose}>
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
          
          {/* LEFT COLUMN: Desktop QR Code scan block */}
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

          {/* Central OR divider */}
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
