/**
 * ExportPanel.jsx
 * 
 * Purpose:
 * Renders the options for Step 5 of the resume builder:
 * Navigating to change resume and portfolio templates.
 * Displaying the fullscreen layout preview.
 * Controlling the optional branding watermark.
 * Triggering document compilation and export actions.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileDown, Eye, HelpCircle, Upload } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ExportPanel({
  activeTemplate,
  setActiveTemplate,
  handleDownloadPDF,
  handleDownloadPortfolio,
  handleClearDraft,
  onShowPreview,
  supportWithWatermark,
  setSupportWithWatermark,
  showFullUrls,
  setShowFullUrls,
  onExportData,
  onImportData
}) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleRedirectResume = () => {
    router.push('/templates/resume');
  };

  const handleRedirectPortfolio = () => {
    router.push('/templates/portfolio');
  };

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 800); // 0.8 seconds delay
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    setShowTooltip(prev => !prev);
  };

  const handleTriggerImport = () => {
    if (confirm('Importing this backup will overwrite your current draft. Do you want to proceed?')) {
      fileInputRef.current?.click();
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportData(parsed);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
        
        {/* Support Us Watermark Checkbox */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '16px 0 10px 0',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            width: '100%',
            userSelect: 'none'
          }} 
          onClick={() => setSupportWithWatermark(!supportWithWatermark)}
        >
          <input 
            type="checkbox" 
            checked={supportWithWatermark} 
            onChange={(e) => setSupportWithWatermark(e.target.checked)}
            onClick={(e) => e.stopPropagation()} // Prevent double trigger with parent div onClick
            style={{ 
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: 'var(--primary)'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            Support us with a tiny watermark (Bottom Right)
          </span>
        </div>

        {/* Display Full URLs Checkbox */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '10px 0 16px 0',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            width: '100%',
            userSelect: 'none'
          }} 
          onClick={() => setShowFullUrls(!showFullUrls)}
        >
          <input 
            type="checkbox" 
            checked={showFullUrls} 
            onChange={(e) => setShowFullUrls(e.target.checked)}
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: 'var(--primary)'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            Display full URL texts (recommended for print)
          </span>
        </div>

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

      {/* 3. Backup & Restore Data */}
      <div className={styles.exportsActionBox} style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h4 style={{ margin: 0 }}>Backup &amp; Restore</h4>
          
          {/* Question mark icon, very faded */}
          <div 
            style={{ 
              position: 'relative', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.35,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
          >
            <HelpCircle size={16} />
            
            {/* Tooltip floating bubble */}
            {showTooltip && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  padding: '10px 12px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 50,
                  pointerEvents: 'none',
                  textAlign: 'center',
                  fontWeight: 'normal',
                }}
              >
                Export your resume data to a local .json file to back up your progress, or import an existing backup file to restore your draft instantly.
                {/* Tooltip arrow */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #1f2937',
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
          Save your written progress to your hard drive so you can resume editing later on any device.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          {/* Export JSON button */}
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={onExportData}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              padding: '10px 8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Upload size={14} />
            <span>Export Data</span>
          </button>

          {/* Import JSON button */}
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={handleTriggerImport}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              padding: '10px 8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Download size={14} />
            <span>Import Data</span>
          </button>
        </div>

        {/* Hidden File input for Import */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImportFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>

    </div>
  );
}
