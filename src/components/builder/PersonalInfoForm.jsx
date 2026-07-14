/**
 * PersonalInfoForm.jsx
 * 
 * Purpose:
 * Renders the form inputs for Step 1 of the resume builder:
 * Name, Target Title, Contact Info, Social Handles, Professional Summary,
 * and Profile Picture (with a drag-and-zoom cropping modal).
 */

'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, RefreshCw, Camera, Trash2, Upload } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import personalStyles from './PersonalInfoForm.module.css';
import ImageCropperModal from './ImageCropperModal';

export default function PersonalInfoForm({ 
  personal, 
  handlePersonalChange, 
  handleAIQuery, 
  optimizingField 
}) {
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Read file as DataURL and open crop modal
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB) for performance
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Clear input so same file can be re-selected if needed
    e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      handlePersonalChange({
        target: { name: 'pfp', value: '' }
      });
    }
  };

  const handleCropComplete = (croppedBase64) => {
    handlePersonalChange({
      target: { name: 'pfp', value: croppedBase64 }
    });
  };

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* ── PROFILE PICTURE SECTION ───────────────────────────────────── */}
      <div className={personalStyles.pfpContainer}>
        <div 
          className={`${personalStyles.avatarWrapper} ${personal.pfp ? personalStyles.avatarWrapperHasImage : ''}`}
        >
          {personal.pfp ? (
            <img 
              src={personal.pfp} 
              alt="Profile avatar" 
              className={personalStyles.avatarImage} 
            />
          ) : (
            <div className={personalStyles.avatarPlaceholder}>
              <Camera size={28} />
            </div>
          )}
        </div>

        <div className={personalStyles.pfpActions}>
          <span className={personalStyles.pfpLabel}>Profile Picture</span>
          <p className={personalStyles.pfpDescription}>
            Add a professional headshot. JPEG/PNG format.
          </p>

          <div className={personalStyles.btnGroup}>
            <button 
              type="button" 
              className={personalStyles.uploadBtn}
              onClick={triggerFileUpload}
            >
              <Upload size={14} />
              <span>{personal.pfp ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {personal.pfp && (
              <button 
                type="button" 
                className={personalStyles.removeBtn}
                onClick={handleRemovePhoto}
                title="Remove photo"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            )}
          </div>

          <input 
            type="file"
            ref={fileInputRef}
            className={personalStyles.hiddenInput}
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Name and Target Role Subtitle */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName"
            name="fullName" 
            value={personal.fullName || ''}
            onChange={handlePersonalChange}
            placeholder="John Doe"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="role">Target Role</label>
          <input 
            type="text" 
            id="role"
            name="role" 
            value={personal.role || ''}
            onChange={handlePersonalChange}
            placeholder="Frontend Engineer / Product Manager"
          />
        </div>
      </div>

      {/* Email and Phone Contact details */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={personal.email || ''}
            onChange={handlePersonalChange}
            placeholder="john.doe@example.com"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="text" 
            id="phone"
            name="phone" 
            value={personal.phone || ''}
            onChange={handlePersonalChange}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      {/* GitHub and LinkedIn Social links */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="github">GitHub Profile URL</label>
          <input 
            type="url" 
            id="github"
            name="github" 
            value={personal.github || ''}
            onChange={handlePersonalChange}
            placeholder="https://github.com/username"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="linkedin">LinkedIn Profile URL</label>
          <input 
            type="url" 
            id="linkedin"
            name="linkedin" 
            value={personal.linkedin || ''}
            onChange={handlePersonalChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      {/* Location and Portfolio links */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="location">Location (City, State/Country)</label>
          <input 
            type="text" 
            id="location"
            name="location" 
            value={personal.location || ''}
            onChange={handlePersonalChange}
            placeholder="San Francisco, CA"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="portfolio">Portfolio / Personal Website</label>
          <input 
            type="url" 
            id="portfolio"
            name="portfolio" 
            value={personal.portfolio || ''}
            onChange={handlePersonalChange}
            placeholder="https://myportfolio.com"
          />
        </div>
      </div>

      {/* Professional Summary and AI Optimisation Trigger */}
      <div className={styles.formGroup}>
        <div className={styles.labelWithAi}>
          <label htmlFor="summary">Professional Summary</label>
          <button 
            type="button"
            className={styles.btnAiOptimize}
            onClick={() => handleAIQuery('personal', null, 'summary', personal.summary)}
            disabled={optimizingField === 'personal-personal-summary' || !personal.summary?.trim()}
          >
            {optimizingField === 'personal-personal-summary' ? (
              <RefreshCw size={12} className={styles.spinIcon} />
            ) : (
              <Sparkles size={12} />
            )}
            <span>{optimizingField === 'personal-personal-summary' ? 'Refining...' : 'ATS Optimize (Gemini)'}</span>
          </button>
        </div>
        <textarea 
          id="summary"
          name="summary" 
          rows="4"
          value={personal.summary || ''}
          onChange={handlePersonalChange}
          placeholder="Summarize your professional experience, technical expertise, and career objectives."
        />
      </div>

      {/* Crop Modal Overlay */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />

    </div>
  );
}
