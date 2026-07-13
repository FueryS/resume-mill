/**
 * EducationForm.jsx
 * 
 * Purpose:
 * Renders the form inputs for Step 4 of the resume builder:
 * Multiple academic qualification entries (Degree, Institution, Dates, GPA).
 * Also renders a simple comma-separated textarea to capture technical skills.
 */

'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function EducationForm({
  education,
  skills,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  onSkillsChange
}) {
  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* SECTION A: Academic Qualifications */}
      <h4 className={styles.subsectionTitle}>Education History</h4>
      
      {education.map((edu, idx) => (
        <div key={edu.id} className={styles.itemCard}>
          
          {/* Card header with index and remove button */}
          <div className={styles.itemCardHeader}>
            <h5>Institution #{idx + 1}</h5>
            <button 
              type="button"
              className={styles.btnRemove} 
              onClick={() => removeArrayItem('education', edu.id)}
              title="Remove Education"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Institution and Degree title */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Institution Name</label>
              <input 
                type="text"
                value={edu.institution || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'institution', e.target.value)}
                placeholder="Indian Institute of Technology"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Degree / Qualification</label>
              <input 
                type="text"
                value={edu.degree || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)}
                placeholder="Bachelor of Technology in Computer Science"
              />
            </div>
          </div>

          {/* Location and Dates */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input 
                type="text"
                value={edu.location || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'location', e.target.value)}
                placeholder="Mumbai, India"
              />
            </div>
            
            <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input 
                  type="text"
                  value={edu.startDate || ''}
                  onChange={(e) => handleArrayChange('education', edu.id, 'startDate', e.target.value)}
                  placeholder="2021"
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date (or Expected)</label>
                <input 
                  type="text"
                  value={edu.endDate || ''}
                  onChange={(e) => handleArrayChange('education', edu.id, 'endDate', e.target.value)}
                  placeholder="2025"
                />
              </div>
            </div>
          </div>

          {/* Academic Grade */}
          <div className={styles.formGroup}>
            <label>Grade / CGPA / Percentage</label>
            <input 
              type="text"
              value={edu.grade || ''}
              onChange={(e) => handleArrayChange('education', edu.id, 'grade', e.target.value)}
              placeholder="9.2 CGPA / 88%"
            />
          </div>
        </div>
      ))}

      {/* Button to add an additional education card */}
      <button 
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`} 
        onClick={() => addArrayItem('education')}
      >
        <Plus size={16} />
        <span>Add Education</span>
      </button>

      {/* SECTION B: Skills list input */}
      <h4 className={styles.subsectionTitle} style={{ marginTop: '30px' }}>Skills & Frameworks</h4>
      
      <div className={styles.formGroup}>
        <label htmlFor="skills">Skills (comma separated)</label>
        <textarea 
          id="skills"
          rows="4"
          value={skills || ''}
          onChange={(e) => onSkillsChange(e.target.value)}
          placeholder="React, Next.js, JavaScript, Node.js, Git, HTML, CSS, SQL, Python"
        />
      </div>

    </div>
  );
}
