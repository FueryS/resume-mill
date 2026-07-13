/**
 * PersonalInfoForm.jsx
 * 
 * Purpose:
 * Renders the form inputs for Step 1 of the resume builder:
 * Name, Target Title, Contact Info, Social Handles, and Professional Summary.
 * Houses the Gemini AI integration to optimize the professional summary.
 */

'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function PersonalInfoForm({ 
  personal, 
  handlePersonalChange, 
  handleAIQuery, 
  optimizingField 
}) {
  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
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

    </div>
  );
}
