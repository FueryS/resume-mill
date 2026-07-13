/**
 * ExportPanel.jsx
 * 
 * Purpose:
 * Renders the options for Step 5 of the resume builder:
 * Navigating to change resume and portfolio templates.
 * Displaying the fullscreen layout preview.
 * Triggering document compilation and export actions (PDF downloads, ZIP portfolio exports, and clear drafts).
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileDown, Eye, Settings } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ExportPanel({
  activeTemplate,
  setActiveTemplate,
  handleDownloadPDF,
  handleDownloadPortfolio,
  handleClearDraft,
  onShowPreview
}) {
  const router = useRouter();

  const handleRedirectResume = () => {
    router.push('/templates/resume');
  };

  const handleRedirectPortfolio = () => {
    router.push('/templates/portfolio');
  };

  return (
    <div className={`${styles.formSection} ${styles.finalStepPanel} animate-scale-in`}>
      
      {/* 1. Template actions */}
      <div className={styles.templateSelectionBox}>
        <h4>Template Configuration</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          
          {/* Show Preview Button */}
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={onShowPreview}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '12px',
              fontWeight: '600'
            }}
          >
            <Eye size={18} />
            <span>Show Preview</span>
          </button>

          {/* Grid for changing templates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            
            {/* Change Resume Template */}
            <button 
              type="button"
              className={styles.templateBtn}
              onClick={handleRedirectResume}
              style={{ 
                padding: '12px 8px', 
                margin: 0, 
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              <span>Change Resume Template</span>
            </button>
            
            {/* Change Portfolio Template */}
            <button 
              type="button"
              className={styles.templateBtn}
              onClick={handleRedirectPortfolio}
              style={{ 
                padding: '12px 8px', 
                margin: 0, 
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '13px'
              }}
            >
              <span>Change Portfolio Template</span>
            </button>

          </div>
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
