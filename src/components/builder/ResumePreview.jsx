/**
 * ResumePreview.jsx
 * 
 * Purpose:
 * Renders the live-updating printable A4 resume page preview in the builder.
 * Swaps template components based on the selected layout theme ('modern', 'elegant', or 'creative').
 * Reuses the same templates folder structure to ensure modularity.
 * Implements a width-first responsive layout container for perfect mobile support.
 * Implements a custom viewport zoom bar to pinch/zoom the A4 document without resizing the web app.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Modern_Page from '@/components/Templates/resume/Modern_Page';
import Elegant_Page from '@/components/Templates/resume/Elegant_Page';
import Creative_Page from '@/components/Templates/resume/Creative_Page';
import styles from '@/app/builder/page.module.css';

export default function ResumePreview({ formData, activeTemplate }) {
  const [zoomPercent, setZoomPercent] = useState(85);
  const containerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Resize listener to calculate auto-fit scale
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        // Keep 48px padding for neat layout borders
        const fitScale = Math.round(Math.max(30, Math.min(100, ((width - 48) / 794) * 100)));
        
        // Auto-apply fit zoom factor on mount
        if (isFirstRender.current) {
          setZoomPercent(fitScale);
          isFirstRender.current = false;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomOut = () => {
    setZoomPercent(prev => Math.max(30, prev - 5));
  };

  const handleZoomIn = () => {
    setZoomPercent(prev => Math.min(150, prev + 5));
  };

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const width = containerRef.current.getBoundingClientRect().width;
      const fitScale = Math.round(Math.max(30, Math.min(100, ((width - 48) / 794) * 100)));
      setZoomPercent(fitScale);
    }
  };

  return (
    <div className={styles.previewPanel} style={{ position: 'relative' }}>
      
      {/* Live status banner */}
      <div className={styles.previewHeader}>
        <span className={styles.liveBadge}>Live A4 Print Preview</span>
        <span className={styles.previewHint}>Matches exactly what saves as PDF (A4 size).</span>
      </div>
      
      {/* Printable Area wrapper container */}
      <div 
        ref={containerRef}
        id="resume-printable-area" 
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#e2e8f0',
          padding: '24px 20px 80px 20px', // Extra bottom padding to clear the floating controls
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        {/* Outer responsive layout wrapper: behaves as a width-first container.
            In media print, this outer container resets to 100% width/height. */}
        <div 
          className="printable-layout-wrapper"
          style={{
            width: `${794 * (zoomPercent / 100)}px`,
            height: `${1123 * (zoomPercent / 100)}px`,
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Inner A4 Page: Scaled via transform-origin: top left */}
          <div 
            className="printable-sheet"
            style={{ 
              transform: `scale(${zoomPercent / 100})`, 
              transformOrigin: 'top left',
              width: '794px',
              height: '1123px',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            {activeTemplate === 'modern' && <Modern_Page data={formData} />}
            {activeTemplate === 'elegant' && <Elegant_Page data={formData} />}
            {activeTemplate === 'creative' && <Creative_Page data={formData} />}
          </div>
        </div>
      </div>

      {/* Floating Zoom Controls Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          color: '#ffffff',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          style={{ 
            color: '#ffffff', 
            opacity: zoomPercent <= 30 ? 0.5 : 1, 
            display: 'flex', 
            alignItems: 'center',
            cursor: zoomPercent <= 30 ? 'not-allowed' : 'pointer'
          }}
          disabled={zoomPercent <= 30}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        
        {/* Percentage Label */}
        <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '42px', textAlign: 'center' }}>
          {zoomPercent}%
        </span>
        
        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          style={{ 
            color: '#ffffff', 
            opacity: zoomPercent >= 150 ? 0.5 : 1, 
            display: 'flex', 
            alignItems: 'center',
            cursor: zoomPercent >= 150 ? 'not-allowed' : 'pointer'
          }}
          disabled={zoomPercent >= 150}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>

        {/* Fit to Screen Button */}
        <button
          onClick={handleFitToScreen}
          style={{ 
            color: '#ffffff', 
            fontSize: '11px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
          title="Fit to Screen"
        >
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
      </div>

    </div>
  );
}
