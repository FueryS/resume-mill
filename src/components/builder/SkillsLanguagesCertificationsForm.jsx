/**
 * SkillsLanguagesCertificationsForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 4 of the resume builder:
 * - Technical Skills (comma separated textarea)
 * - Languages Spoken (Name and proficiency level rating 1-5)
 * - Certifications & Licenses (Name, Issuer, Date, Credential URL)
 */

'use client';

import React from 'react';
import { Plus, Trash2, Globe, Award, Sparkles } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function SkillsLanguagesCertificationsForm({
  skills,
  languages,
  certifications,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  onSkillsChange,
}) {
  const langList = languages || [];
  const certList = certifications || [];

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* ── SECTION A: Technical Skills ───────────────────────────────── */}
      <h4 className={styles.subsectionTitle}>Technical Skills</h4>
      <div className={styles.formGroup}>
        <label htmlFor="skills">Skills (comma separated)</label>
        <textarea
          id="skills"
          rows="3"
          value={skills || ''}
          onChange={(e) => onSkillsChange(e.target.value)}
          placeholder="React, Next.js, JavaScript, Node.js, Git, HTML, CSS, SQL, Python"
        />
        <p className={styles.tip}>Separate each skill with a comma to render them as individual pill tags.</p>
      </div>

      <hr className={styles.divider} style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* ── SECTION B: Languages ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <Globe size={18} className="text-primary" />
        <h4 className={styles.subsectionTitle} style={{ margin: 0 }}>Languages</h4>
      </div>

      {langList.map((lang, idx) => (
        <div key={lang.id} className={styles.itemCard}>
          <div className={styles.itemCardHeader}>
            <h5>Language #{idx + 1}</h5>
            <button
              type="button"
              className={styles.btnRemove}
              onClick={() => removeArrayItem('languages', lang.id)}
              title="Remove Language"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Language Name</label>
              <input
                type="text"
                value={lang.name || ''}
                onChange={(e) => handleArrayChange('languages', lang.id, 'name', e.target.value)}
                placeholder="English, Spanish, German"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Proficiency Level</label>
              <select
                value={lang.level || 5}
                onChange={(e) => handleArrayChange('languages', lang.id, 'level', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Elementary</option>
                <option value={3}>3 - Conversational</option>
                <option value={4}>4 - Professional Working</option>
                <option value={5}>5 - Native / Bilingual</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('languages')}
        style={{ marginBottom: '10px' }}
      >
        <Plus size={16} />
        <span>Add Language</span>
      </button>

      <hr className={styles.divider} style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* ── SECTION C: Certifications ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <Award size={18} className="text-primary" />
        <h4 className={styles.subsectionTitle} style={{ margin: 0 }}>Certifications &amp; Licenses</h4>
      </div>

      {certList.map((cert, idx) => (
        <div key={cert.id} className={styles.itemCard}>
          <div className={styles.itemCardHeader}>
            <h5>Certification #{idx + 1}</h5>
            <button
              type="button"
              className={styles.btnRemove}
              onClick={() => removeArrayItem('certifications', cert.id)}
              title="Remove Certification"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Certification Name</label>
              <input
                type="text"
                value={cert.name || ''}
                onChange={(e) => handleArrayChange('certifications', cert.id, 'name', e.target.value)}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Issuing Authority / Organization</label>
              <input
                type="text"
                value={cert.organization || ''}
                onChange={(e) => handleArrayChange('certifications', cert.id, 'organization', e.target.value)}
                placeholder="Amazon Web Services (AWS)"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Date Issued</label>
              <input
                type="text"
                value={cert.date || ''}
                onChange={(e) => handleArrayChange('certifications', cert.id, 'date', e.target.value)}
                placeholder="October 2024"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Credential URL / Link</label>
              <input
                type="url"
                value={cert.url || ''}
                onChange={(e) => handleArrayChange('certifications', cert.id, 'url', e.target.value)}
                placeholder="https://credly.com/credentials/..."
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('certifications')}
      >
        <Plus size={16} />
        <span>Add Certification</span>
      </button>

    </div>
  );
}
