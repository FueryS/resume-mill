/**
 * src/components/Templates/resume/Modern_Page.jsx
 * 
 * Purpose:
 * Renders the "Modern" resume template layout.
 * Features a modern, left-aligned sans-serif layout with primary color accents.
 * Implements strict modular section checks: empty sections are hidden.
 */

import React from 'react';
import styles from './ResumeTemplates.module.css';

export default function Modern_Page({ data }) {
  const { personal, experience, projects, education, skills } = data;

  // Helpers to check if sections are populated
  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);

  return (
    <div className={`${styles.resumePage} ${styles.modern}`}>
      
      {/* BRANDING HEADER */}
      <div className={styles.headerBlock}>
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
          <h3 className={styles.secTitle}>Projects</h3>
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
                    {edu.grade && <span>Grade: {edu.grade}</span>}
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

    </div>
  );
}
