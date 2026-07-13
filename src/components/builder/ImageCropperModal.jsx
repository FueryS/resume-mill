/* eslint-disable react-hooks/set-state-in-effect */
/**
 * ImageCropperModal.jsx
 * 
 * Purpose:
 * Renders a responsive, interactive, and dependency-free modal 
 * that allows users to crop their profile picture using drag-and-zoom controls.
 * It outputs a base64 Data URL to be saved in the resume form state.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, Crop } from 'lucide-react';
import styles from './ImageCropperModal.module.css';

export default function ImageCropperModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete 
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Set mounted on client mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset states when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc || !mounted) return null;

  // Mouse / Touch drag handlers
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    
    // Boundary constraints calculation
    let newX = clientX - dragStart.current.x;
    let newY = clientY - dragStart.current.y;

    // Apply bounding box constraints so image cannot be dragged completely outside container
    if (imageRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;

      // Determine initial scale (cover fit)
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      const baseScale = Math.max(scaleX, scaleY);
      const currentScale = baseScale * zoom;

      const renderedWidth = imgWidth * currentScale;
      const renderedHeight = imgHeight * currentScale;

      // Max offset allows sliding but keeps image covering the crop area
      const maxOffsetX = Math.max(0, (renderedWidth - containerWidth) / 2);
      const maxOffsetY = Math.max(0, (renderedHeight - containerHeight) / 2);

      newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
      newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
    }

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Perform crop on canvas and return base64 string
  const handleSave = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    // Output crop size
    const cropSize = 300; 
    const canvas = document.createElement('canvas');
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Calculate crop parameters relative to original image size
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    const baseScale = Math.max(scaleX, scaleY);
    const currentScale = baseScale * zoom;

    // Center coordinates
    const centerX = imgWidth / 2;
    const centerY = imgHeight / 2;

    // The shift in container-space converted back to original image space
    const shiftX = -position.x / currentScale;
    const shiftY = -position.y / currentScale;

    // Size of the cropping square on the original image
    const sourceCropSize = containerWidth / currentScale;

    // Draw the image onto the 300x300 canvas
    ctx.drawImage(
      img,
      centerX - sourceCropSize / 2 + shiftX,
      centerY - sourceCropSize / 2 + shiftY,
      sourceCropSize,
      sourceCropSize,
      0,
      0,
      cropSize,
      cropSize
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedBase64);
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Only close if the user clicked directly on the overlay background
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div 
        className={styles.modalContent}
      >
        <div className={styles.modalHeader}>
          <h4>Crop Profile Picture</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div 
            className={styles.cropContainer} 
            ref={containerRef}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
          >
            {/* The circular masking overlay grid */}
            <div className={styles.cropOverlay} />
            <div className={styles.cropBox} />

            <img
              src={imageSrc}
              alt="Crop Source"
              className={styles.cropImage}
              ref={imageRef}
              draggable={false}
              style={{
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              }}
            />
          </div>

          {/* Controls: Zoom slider */}
          <div className={styles.controlRow}>
            <div className={styles.sliderGroup}>
              <ZoomIn size={16} className={styles.icon} />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>
          <p className={styles.tip}>Drag to reposition, slide zoom to fit.</p>
        </div>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            <Crop size={14} />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
