/**
 * ExportPanel.jsx
 * 
 * Purpose:
 * Renders the options for Step 5 of the resume builder:
 * Selecting a print template (Modern Minimalist vs Elegant Executive).
 * Triggering document compilation and export actions (PDF print layouts, ZIP portfolio exports, and clear draft triggers).
 */

'use client';

import React from 'react';
import { Download, FileDown, Eye } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ExportPanel({
  activeTemplate,
  setActiveTemplate,
  handleDownloadPDF,
  handleDownloadPortfolio,
  handleClearDraft
}) {
  return (
    <div className={`${styles.formSection} ${styles.finalStepPanel} animate-scale-in`}>
      
      {/* 1. Template selection boxes */}
      <div className={styles.templateSelectionBox}>
        <h4>Choose Resume Template</h4>
        <div className={styles.templateSelectors}>
          {/* Option A: Modern Minimalist */}
          <button 
            type="button"
            className={`${styles.templateBtn} ${activeTemplate === 'modern' ? styles.active : ''}`}
            onClick={() => setActiveTemplate('modern')}
          >
            <FileDown size={18} />
            <span>Modern Minimalist (Recommended)</span>
          </button>
          
          {/* Option B: Elegant Executive */}
          <button 
            type="button"
            className={`${styles.templateBtn} ${activeTemplate === 'elegant' ? styles.active : ''}`}
            onClick={() => setActiveTemplate('elegant')}
          >
            <Eye size={18} />
            <span>Elegant Executive</span>
          </button>
        </div>
      </div>

      {/* 2. File compiling and downloads trigger pane */}
      <div className={styles.exportsActionBox}>
        <h4>Generate Files</h4>
        <p>Both downloads run 100% in your browser. No personal data ever leaves your device.</p>
        
        <div className={styles.actionsVertical}>
          {/* Download A4 PDF button */}
          <button 
            type="button" 
            onClick={handleDownloadPDF} 
            className={`btn btn-accent ${styles.actionExportBtn}`}
          >
            <Download size={20} />
            <span>Download Resume PDF</span>
          </button>

          {/* Download Portfolio website ZIP button */}
          <button 
            type="button" 
            onClick={handleDownloadPortfolio} 
            className={`btn btn-primary ${styles.actionExportBtn}`}
          >
            <FileDown size={20} />
            <span>Download Portfolio ZIP</span>
          </button>

          {/* Clean drafts form button */}
          <button 
            type="button" 
            onClick={handleClearDraft} 
            className={styles.btnClearDraft}
          >
            Reset Draft Form
          </button>
        </div>
      </div>

    </div>
  );
}
