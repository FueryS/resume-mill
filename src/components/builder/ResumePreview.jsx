/**
 * ResumePreview.jsx
 * 
 * Purpose:
 * Renders the live-updating printable A4 resume page preview.
 * Swaps CSS classes based on the selected layout theme ('modern' or 'elegant').
 * Displays formatted summaries, work experience logs, personal projects, education rows, and technical skills list.
 */

'use client';

import React from 'react';
import styles from '@/app/builder/page.module.css';

export default function ResumePreview({ formData, activeTemplate }) {
  // Extract state properties for cleaner JSX rendering
  const { personal, experience, projects, education, skills } = formData;

  return (
    <div className={styles.previewPanel}>
      {/* Visual Live updates indicators */}
      <div className={styles.previewHeader}>
        <span className={styles.liveBadge}>Live A4 Print Preview</span>
        <span className={styles.previewHint}>This matches exactly what saves as PDF (A4 size).</span>
      </div>
      
      {/* Live rendered paper section */}
      <div 
        id="resume-printable-area" 
        className={`${styles.resumeA4Page} ${
          activeTemplate === 'modern' ? styles.templateModern : styles.templateElegant
        }`}
      >
        
        {/* SECTION 1: Personal Branding Header (Name, Title, Links) */}
        <div className={styles.resumeHeaderBlock}>
          <h1 className={styles.resumeName}>{personal.fullName || 'YOUR NAME'}</h1>
          <p className={styles.resumeRoleSubtitle}>{personal.role || 'TARGET ROLE / TITLE'}</p>
          
          <div className={styles.resumeContactBar}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.github && <span>GitHub</span>}
            {personal.linkedin && <span>LinkedIn</span>}
          </div>
        </div>

        {/* SECTION 2: Professional Summary */}
        {personal.summary && (
          <div className={styles.resumeSectionBlock}>
            <h3 className={styles.resumeSecTitle}>Professional Summary</h3>
            <div className={styles.resumeSecDivider}></div>
            <p className={styles.resumeSummaryText}>{personal.summary}</p>
          </div>
        )}

        {/* SECTION 3: Professional Work History */}
        {experience.some(e => e.company || e.role) && (
          <div className={styles.resumeSectionBlock}>
            <h3 className={styles.resumeSecTitle}>Work Experience</h3>
            <div className={styles.resumeSecDivider}></div>
            {experience.map((exp, idx) => (
              (exp.company || exp.role) && (
                <div key={idx} className={styles.resumeItemBlock}>
                  <div className={styles.resumeItemHeader}>
                    <div>
                      <strong>{exp.role || 'Job Role'}</strong> | <span>{exp.company || 'Company'}</span>
                    </div>
                    <span className={styles.resumeItemDates}>
                      {exp.startDate || 'Start'} - {exp.endDate || (exp.current ? 'Present' : 'End')}
                    </span>
                  </div>
                  {exp.location && <div className={styles.resumeItemLocation}>{exp.location}</div>}
                  {exp.description && <p className={styles.resumeItemDesc}>{exp.description}</p>}
                </div>
              )
            ))}
          </div>
        )}

        {/* SECTION 4: Personal/Open-Source Projects */}
        {projects.some(p => p.name || p.description) && (
          <div className={styles.resumeSectionBlock}>
            <h3 className={styles.resumeSecTitle}>Key Projects</h3>
            <div className={styles.resumeSecDivider}></div>
            {projects.map((proj, idx) => (
              (proj.name || proj.description) && (
                <div key={idx} className={styles.resumeItemBlock}>
                  <div className={styles.resumeItemHeader}>
                    <strong>{proj.name || 'Project Name'}</strong>
                    {proj.link && <span className={styles.resumeItemDates}>Demo Link</span>}
                  </div>
                  {proj.technologies && <div className={styles.resumeItemTech}>Technologies: {proj.technologies}</div>}
                  {proj.description && <p className={styles.resumeItemDesc}>{proj.description}</p>}
                </div>
              )
            ))}
          </div>
        )}

        {/* SECTION 5: Academic History */}
        {education.some(e => e.institution || e.degree) && (
          <div className={styles.resumeSectionBlock}>
            <h3 className={styles.resumeSecTitle}>Education</h3>
            <div className={styles.resumeSecDivider}></div>
            {education.map((edu, idx) => (
              (edu.institution || edu.degree) && (
                <div key={idx} className={styles.resumeItemBlock}>
                  <div className={styles.resumeItemHeader}>
                    <div>
                      <strong>{edu.degree || 'Degree'}</strong>, <span>{edu.institution || 'Institution'}</span>
                    </div>
                    <span className={styles.resumeItemDates}>
                      {edu.startDate || 'Start'} - {edu.endDate || 'End'}
                    </span>
                  </div>
                  <div className={styles.resumeItemLocation}>
                    {edu.location && <span>{edu.location}</span>}
                    {edu.grade && <span> &bull; Grade: {edu.grade}</span>}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* SECTION 6: Key Skills list */}
        {skills && (
          <div className={styles.resumeSectionBlock}>
            <h3 className={styles.resumeSecTitle}>Skills & Technologies</h3>
            <div className={styles.resumeSecDivider}></div>
            <p className={styles.resumeSkillsText}>{skills}</p>
          </div>
        )}

      </div>
    </div>
  );
}
