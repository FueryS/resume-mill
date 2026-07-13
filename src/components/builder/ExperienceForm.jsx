/**
 * ExperienceForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 2 of the resume builder:
 * Inputting multiple previous job titles, company names, locations, dates, and job descriptions.
 * Integrates Google Gemini AI to rewrite job descriptions using action verbs and metrics.
 */

'use client';

import React from 'react';
import { Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ExperienceForm({
  experience,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  handleAIQuery,
  optimizingField
}) {
  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* Experience history entries */}
      {experience.map((exp, idx) => (
        <div key={exp.id} className={styles.itemCard}>
          
          {/* Card Header showing company index and remove trigger */}
          <div className={styles.itemCardHeader}>
            <h5>Position #{idx + 1}</h5>
            <button 
              type="button"
              className={styles.btnRemove} 
              onClick={() => removeArrayItem('experience', exp.id)}
              title="Remove Position"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          {/* Company and Role Input */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Company / Organization</label>
              <input 
                type="text"
                value={exp.company || ''}
                onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)}
                placeholder="Google"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Job Title / Role</label>
              <input 
                type="text"
                value={exp.role || ''}
                onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)}
                placeholder="Software Engineering Intern"
              />
            </div>
          </div>

          {/* Location and Timelines */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input 
                type="text"
                value={exp.location || ''}
                onChange={(e) => handleArrayChange('experience', exp.id, 'location', e.target.value)}
                placeholder="Bangalore, India"
              />
            </div>
            
            <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input 
                  type="text"
                  value={exp.startDate || ''}
                  onChange={(e) => handleArrayChange('experience', exp.id, 'startDate', e.target.value)}
                  placeholder="June 2024"
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date</label>
                <input 
                  type="text"
                  value={exp.endDate || ''}
                  disabled={exp.current}
                  onChange={(e) => handleArrayChange('experience', exp.id, 'endDate', e.target.value)}
                  placeholder={exp.current ? 'Present' : 'August 2024'}
                />
              </div>
            </div>
          </div>

          {/* Current Job checkbox */}
          <div className={styles.formCheckbox}>
            <input 
              type="checkbox"
              id={`current-${exp.id}`}
              checked={exp.current || false}
              onChange={(e) => handleArrayChange('experience', exp.id, 'current', e.target.checked)}
            />
            <label htmlFor={`current-${exp.id}`}>I currently work here</label>
          </div>

          {/* Job Description and Gemini ATS Rewrite button */}
          <div className={styles.formGroup}>
            <div className={styles.labelWithAi}>
              <label>Job Description & Achievements</label>
              <button 
                type="button"
                className={styles.btnAiOptimize}
                onClick={() => handleAIQuery('experience', exp.id, 'description', exp.description)}
                disabled={optimizingField === `experience-${exp.id}-description` || !exp.description?.trim()}
              >
                {optimizingField === `experience-${exp.id}-description` ? (
                  <RefreshCw size={12} className={styles.spinIcon} />
                ) : (
                  <Sparkles size={12} />
                )}
                <span>{optimizingField === `experience-${exp.id}-description` ? 'Refining...' : 'ATS Optimize (Gemini)'}</span>
              </button>
            </div>
            <textarea 
              rows="4"
              value={exp.description || ''}
              onChange={(e) => handleArrayChange('experience', exp.id, 'description', e.target.value)}
              placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
            />
          </div>
        </div>
      ))}

      {/* Button to add an additional work entry */}
      <button 
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`} 
        onClick={() => addArrayItem('experience')}
      >
        <Plus size={16} />
        <span>Add Experience</span>
      </button>
      
    </div>
  );
}
