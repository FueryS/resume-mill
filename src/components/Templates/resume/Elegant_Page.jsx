/**
 * src/components/Templates/resume/Elegant_Page.jsx
 * 
 * Purpose:
 * Renders the "Elegant" resume template layout.
 * Features a centered, classic serif layout using Georgia fonts and refined line dividers.
 * Implements strict modular section checks: empty sections are hidden.
 */

import React from 'react';
import styles from './ResumeTemplates.module.css';

const PLACEHOLDER_PFP = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjZTJlOGYwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2NiZDVlMSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE4IiBmaWxsPSIjOTRhM2I4Ii8+PHBhdGggZD0iTTUwIDYyYy0yMCAwLTMyIDEwLTMyIDIwdjZoNjR2LTZjMC0xMC0xMi0yMC0zMi0yMHoiIGZpbGw9IiM5NGEzYjgiLz48L3N2Zz4=';

export default function Elegant_Page({ data, showWatermark = true }) {
  const { personal, experience, projects, education, skills } = data;

  // Helpers to check if sections are populated
  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);

  /**
   * Derives the display label for an education entry's grade field
   * based on the credential type selected in the form.
   */
  const resolveGradeLabel = (edu) => {
    const type   = edu.gradeType        || 'degree';
    const format = edu.boardGradeFormat || 'percentage';
    const custom = (edu.customGradeLabel || '').trim();
    if (type === 'board')  return format === 'marks' ? 'Marks' : 'Percentage';
    if (type === 'custom') return custom || 'Grade';
    return 'CGPA'; // default: 'degree'
  };

  return (
    <div className={`${styles.resumePage} ${styles.elegant}`}>
      
      {/* BRANDING HEADER */}
      <div className={styles.headerBlock}>
        {personal.pfp && (
          <div className={styles.elegantPfpWrapper}>
            <img src={personal.pfp} alt="Profile" className={styles.elegantPfpImage} />
          </div>
        )}
        <h1 className={styles.name}>{personal.fullName || 'YOUR NAME'}</h1>
        <p className={styles.role}>{personal.role || 'TARGET ROLE'}</p>
        
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

      {/* PROFESSIONAL SUMMARY */}
      {personal.summary && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Professional Summary</h3>
          <div className={styles.secDivider}></div>
          <p className={styles.summaryText}>{personal.summary}</p>
        </div>
      )}

      {/* EXPERIENCE SECTION */}
      {hasExperience && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Work Experience</h3>
          <div className={styles.secDivider}></div>
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

      {/* PROJECTS SECTION */}
      {hasProjects && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Key Projects</h3>
          <div className={styles.secDivider}></div>
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

      {/* EDUCATION SECTION */}
      {hasEducation && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Education</h3>
          <div className={styles.secDivider}></div>
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
                    {edu.grade && <span>{resolveGradeLabel(edu)}: {edu.grade}</span>}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* SKILLS SECTION */}
      {skills && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Skills & Technologies</h3>
          <div className={styles.secDivider}></div>
          <p className={styles.skillsText}>{skills}</p>
        </div>
      )}

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
