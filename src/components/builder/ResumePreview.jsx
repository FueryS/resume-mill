/**
 * ResumePreview.jsx
 * 
 * Purpose:
 * Renders the live-updating printable A4 resume page preview in the builder.
 * Swaps template components based on the selected layout theme ('modern', 'elegant', or 'creative').
 * Reuses the same templates folder structure to ensure modularity.
 * Implements a width-first responsive layout container with safe centering to avoid scroll clipping.
 * Implements Google Maps-style pinch-to-zoom and two-finger panning touch gestures.
 * Features a fullscreen preview modal with device-fit scaling and history back button interceptor.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Eye, X } from 'lucide-react';
import Modern_Page from '@/components/Templates/resume/Modern_Page';
import Elegant_Page from '@/components/Templates/resume/Elegant_Page';
import Creative_Page from '@/components/Templates/resume/Creative_Page';
import styles from '@/app/builder/page.module.css';

export default function ResumePreview({ formData, activeTemplate }) {
  const [zoomPercent, setZoomPercent] = useState(85);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  
  const containerRef = useRef(null);
  const isFirstRender = useRef(true);
  const touchStartRef = useRef({ 
    x1: 0, y1: 0, 
    x2: 0, y2: 0, 
    distance: 0, 
    zoom: 85,
    scrollTop: 0, 
    scrollLeft: 0 
  });

  // Monitor resize to auto-fit A4 preview scale and track viewport width for fullscreen scale
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      
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

  // Intercept device back button to close the fullscreen preview (App-like UX)
  useEffect(() => {
    if (!showFullscreen) return;

    window.history.pushState({ previewFullscreen: true }, '');

    const handlePopState = () => {
      setShowFullscreen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.previewFullscreen) {
        window.history.back();
      }
    };
  }, [showFullscreen]);

  const handleFitToScreen = () => {
    if (containerRef.current) {
      const width = containerRef.current.getBoundingClientRect().width;
      const fitScale = Math.round(Math.max(30, Math.min(100, ((width - 48) / 794) * 100)));
      setZoomPercent(fitScale);
    }
  };

  // Touch handlers for Google Maps-style pinch-to-zoom and two-finger panning
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      
      if (containerRef.current) {
        touchStartRef.current = {
          x1: t1.clientX,
          y1: t1.clientY,
          x2: t2.clientX,
          y2: t2.clientY,
          distance: dist,
          zoom: zoomPercent,
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && containerRef.current) {
      // Prevent browser default pinch-zooming of the viewport page
      e.preventDefault();
      
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      
      // 1. Pinch to Zoom
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (touchStartRef.current.distance > 0) {
        const scaleFactor = dist / touchStartRef.current.distance;
        const newZoom = Math.max(30, Math.min(150, Math.round(touchStartRef.current.zoom * scaleFactor)));
        setZoomPercent(newZoom);
      }
      
      // 2. Pan/Scroll Panning
      const initialMidX = (touchStartRef.current.x1 + touchStartRef.current.x2) / 2;
      const initialMidY = (touchStartRef.current.y1 + touchStartRef.current.y2) / 2;
      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;
      
      const deltaX = currentMidX - initialMidX;
      const deltaY = currentMidY - initialMidY;
      
      containerRef.current.scrollLeft = touchStartRef.current.scrollLeft - deltaX;
      containerRef.current.scrollTop = touchStartRef.current.scrollTop - deltaY;
    }
  };

  // Calculate scaling factor for fullscreen modal to fit any mobile device screen
  const modalScale = Math.min(1, Math.max(0.3, (viewportWidth - 32) / 794));

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#e2e8f0',
          padding: '24px 20px 80px 20px', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          touchAction: 'pan-x pan-y',
          maxWidth: '100%'
        }}
      >
        {/* Outer responsive layout wrapper: behaves as a width-first container.
            Uses margin: 0 auto to center it when smaller, and scroll cleanly when larger. */}
        <div 
          className="printable-layout-wrapper"
          style={{
            width: `${794 * (zoomPercent / 100)}px`,
            height: `${1123 * (zoomPercent / 100)}px`,
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginLeft: 'auto',
            marginRight: 'auto'
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

      {/* Floating Controls Bar (Fit to Screen & Full Screen) */}
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
        {/* Fit to Screen Button */}
        <button
          onClick={handleFitToScreen}
          style={{ 
            color: '#ffffff', 
            fontSize: '12px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '4px 8px'
          }}
          title="Fit to Screen"
        >
          <Maximize2 size={14} />
          <span>Fit Screen</span>
        </button>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>

        {/* Full Screen Preview Button */}
        <button
          onClick={() => setShowFullscreen(true)}
          style={{ 
            color: '#ffffff', 
            fontSize: '12px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '4px 8px'
          }}
          title="Full Screen Preview"
        >
          <Eye size={14} />
          <span>Full Preview</span>
        </button>
      </div>

      {/* Fullscreen Overlay Modal (Responsive Scaling) */}
      {showFullscreen && (
        <div 
          className="fullscreen-modal-overlay" 
          onClick={() => setShowFullscreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 10002,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowY: 'auto',
            padding: '60px 16px 40px 16px'
          }}
        >
          {/* Floating Close Button */}
          <button 
            onClick={() => setShowFullscreen(false)} 
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 10003,
              transition: 'all 0.2s'
            }}
            title="Close Preview"
          >
            <X size={20} />
          </button>

          {/* Width-first Responsive Scaling Wrapper for Fullscreen Sheet */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: `${794 * modalScale}px`,
              height: `${1123 * modalScale}px`,
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              margin: 'auto 0',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <div 
              style={{ 
                transform: `scale(${modalScale})`, 
                transformOrigin: 'top left',
                width: '794px',
                height: '1123px',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: '#ffffff'
              }}
            >
              {activeTemplate === 'modern' && <Modern_Page data={formData} />}
              {activeTemplate === 'elegant' && <Elegant_Page data={formData} />}
              {activeTemplate === 'creative' && <Creative_Page data={formData} />}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
