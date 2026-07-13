/**
 * src/components/Templates/resume/Creative_Page.jsx
 * 
 * Purpose:
 * Renders the "Creative" resume template layout.
 * Features a dual-column design: a dark sidebar for branding, contact, and skills,
 * alongside a clean white main body area for work history, projects, and academics.
 * Implements strict modular section checks: empty sections are hidden.
 */

import React from 'react';
import styles from './ResumeTemplates.module.css';

export default function Creative_Page({ data, showWatermark = true }) {
  const { personal, experience, projects, education, skills } = data;

  // Helpers to check if sections are populated
  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);

  return (
    <div className={`${styles.resumePage} ${styles.creative}`}>
      
      {/* LEFT COLUMN: Sidebar (Branding, Contact Details, Summary, Skills) */}
      <div className={styles.creativeLeftColumn}>
        <div className={styles.brandingSection}>
          <h1 className={styles.name}>{personal.fullName || 'YOUR NAME'}</h1>
          <p className={styles.role}>{personal.role || 'TARGET ROLE'}</p>
        </div>

        {/* CONTACT DETAILS */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Contact</h3>
          <div className={styles.contactBar}>
            {personal.email && (
              <span className={styles.contactItem}>{personal.email}</span>
            )}
            {personal.phone && (
              <span className={styles.contactItem}>{personal.phone}</span>
            )}
            {personal.github && (
              <span className={styles.contactItem}>{personal.github}</span>
            )}
            {personal.linkedin && (
              <span className={styles.contactItem}>{personal.linkedin}</span>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        {personal.summary && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Profile</h3>
            <p className={styles.summaryText}>{personal.summary}</p>
          </div>
        )}

        {/* SKILLS */}
        {skills && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Skills</h3>
            <p className={styles.skillsText}>{skills}</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Main content (Work Experience, Projects, Education) */}
      <div className={styles.creativeRightColumn}>
        
        {/* EXPERIENCE */}
        {hasExperience && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Experience</h3>
            {experience.map((exp, idx) => (
              (exp.company || exp.role) && (
                <div key={exp.id || idx} className={styles.itemBlock}>
                  <div className={styles.itemHeader}>
                    <div>
                      <span className={styles.itemRole}>{exp.role || 'Role'}</span>
                      <span> | </span>
                      <span className={styles.itemCompany}>{exp.company || 'Company'}</span>
                    </div>
                    <span className={styles.itemDates}>
                      {exp.startDate || 'Start'} – {exp.endDate || (exp.current ? 'Present' : 'End')}
                    </span>
                  </div>
                  {exp.location && (
                    <div className={styles.itemSubHeader}>
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.description && (
                    <p className={styles.itemDesc}>{exp.description}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {hasProjects && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Projects</h3>
            {projects.map((proj, idx) => (
              (proj.name || proj.description) && (
                <div key={proj.id || idx} className={styles.itemBlock}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemRole}>{proj.name || 'Project Name'}</span>
                    {proj.link && (
                      <span className={styles.itemDates}>{proj.link}</span>
                    )}
                  </div>
                  {proj.technologies && (
                    <div className={styles.itemSubHeader}>
                      <span>Tech: {proj.technologies}</span>
                    </div>
                  )}
                  {proj.description && (
                    <p className={styles.itemDesc}>{proj.description}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* EDUCATION */}
        {hasEducation && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Education</h3>
            {education.map((edu, idx) => (
              (edu.institution || edu.degree) && (
                <div key={edu.id || idx} className={styles.itemBlock}>
                  <div className={styles.itemHeader}>
                    <div>
                      <span className={styles.itemRole}>{edu.degree || 'Degree'}</span>
                      <span>, </span>
                      <span className={styles.itemCompany}>{edu.institution || 'Institution'}</span>
                    </div>
                    <span className={styles.itemDates}>
                      {edu.startDate || 'Start'} – {edu.endDate || 'End'}
                    </span>
                  </div>
                  {(edu.location || edu.grade) && (
                    <div className={styles.itemSubHeader}>
                      <span>{edu.location || ''}</span>
                      {edu.grade && <span>Grade: {edu.grade}</span>}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}

      </div>

      {/* Semi-transparent Branding Watermark */}
      {showWatermark && (
        <div 
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: 0.2,
            pointerEvents: 'none',
            userSelect: 'none',
            color: '#1e293b',
            zIndex: 10
          }}
        >
          <img 
            src="/logo.jpg" 
            alt="ResumeMill Logo" 
            style={{ width: '12px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} 
          />
          <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
            Resume<span style={{ color: '#4f46e5' }}>Mill</span>
          </span>
        </div>
      )}

    </div>
  );
}
