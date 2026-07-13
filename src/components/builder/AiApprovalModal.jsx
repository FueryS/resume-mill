/* eslint-disable react-hooks/set-state-in-effect */
/**
 * AiApprovalModal.jsx
 * 
 * Purpose:
 * Renders an interactive React Portal modal that presents a side-by-side comparison 
 * of the user's original text vs the Gemini AI optimized text.
 * Requires user approval before applying changes to the resume state.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Check, Trash } from 'lucide-react';
import styles from './AiApprovalModal.module.css';

export default function AiApprovalModal({
  isOpen,
  onClose,
  originalText,
  optimizedText,
  onApprove
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        
        {/* Header section */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <Sparkles size={18} className={styles.sparkleIcon} />
            <h4>AI Optimization Review</h4>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close review modal">
            <X size={18} />
          </button>
        </div>

        {/* Comparison body */}
        <div className={styles.modalBody}>
          <p className={styles.introText}>
            Review the ATS-friendly optimized text suggested by Gemini AI. Accept changes to apply them to your draft.
          </p>

          <div className={styles.comparisonGrid}>
            {/* Original Card */}
            <div className={styles.textCard} data-type="original">
              <div className={styles.cardHeader}>
                <span className={styles.badge} data-type="original">Original</span>
              </div>
              <div className={styles.cardContent}>
                {originalText}
              </div>
            </div>

            {/* AI Optimized Card */}
            <div className={styles.textCard} data-type="optimized">
              <div className={styles.cardHeader}>
                <span className={styles.badge} data-type="optimized">Optimized Suggestion</span>
              </div>
              <div className={styles.cardContent}>
                {optimizedText}
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            <Trash size={14} />
            <span>Discard</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onApprove}
          >
            <Check size={14} />
            <span>Accept &amp; Apply</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
