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

export default function Elegant_Page({ data, pageData, showWatermark = true }) {
  // Use pageData if partitioned, otherwise fallback to entire data
  const personal = data?.personal || {};
  const activePageData = pageData || {
    showHeader: true,
    experience: data?.experience || [],
    projects: data?.projects || [],
    education: data?.education || [],
    skills: data?.skills || '',
    languages: data?.languages || [],
    certifications: data?.certifications || [],
  };

  const { showHeader, experience, projects, education, skills, languages, certifications } = activePageData;

  // Helpers to check if sections are populated
  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);
  const hasLanguages = languages && languages.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  /**
   * Derives the display label for an education entry's grade field
   */
  const resolveGradeLabel = (edu) => {
    const type   = edu.gradeType        || 'degree';
    const format = edu.boardGradeFormat || 'percentage';
    const custom = (edu.customGradeLabel || '').trim();
    if (type === 'board')  return format === 'marks' ? 'Marks' : 'Percentage';
    if (type === 'custom') return custom || 'Grade';
    return 'CGPA';
  };

  // Helper to render circle dot rating
  const renderDots = (level) => {
    const score = level || 5;
    return (
      <span className={styles.ratingDots} style={{ letterSpacing: '2px', fontSize: '12px' }}>
        {'●'.repeat(score)}{'○'.repeat(5 - score)}
      </span>
    );
  };

  return (
    <div className={`${styles.resumePage} ${styles.elegant}`}>
      
      {/* BRANDING HEADER */}
      {showHeader && (
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
            {personal.location && (
              <span className={styles.contactItem}>{personal.location}</span>
            )}
            {personal.github && (
              <span className={styles.contactItem}>
                <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              </span>
            )}
            {personal.linkedin && (
              <span className={styles.contactItem}>
                <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </span>
            )}
            {personal.portfolio && (
              <span className={styles.contactItem}>
                <a href={personal.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>
              </span>
            )}
          </div>
        </div>
      )}

      {/* PROFESSIONAL SUMMARY */}
      {showHeader && personal.summary && (
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
                    {exp.role && <span className={styles.itemRole}>{exp.role}</span>}
                    {exp.role && exp.company && <span> | </span>}
                    {exp.company && <span className={styles.itemCompany}>{exp.company}</span>}
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
                  <div className={styles.projectLinks}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                        Live Demo
                      </a>
                    )}
                    {proj.githubFront && (
                      <a href={proj.githubFront} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                        Frontend Repo
                      </a>
                    )}
                    {proj.githubBack && (
                      <a href={proj.githubBack} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                        Backend Repo
                      </a>
                    )}
                  </div>
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
                    {edu.degree && <span className={styles.itemRole}>{edu.degree}</span>}
                    {edu.degree && edu.institution && <span>, </span>}
                    {edu.institution && <span className={styles.itemCompany}>{edu.institution}</span>}
                  </div>
                  <span className={styles.itemDates}>
                    {edu.startDate || 'Start'} – {edu.endDate || 'End'}
                  </span>
                </div>
                {(edu.location || edu.grade) && (
                  <div className={styles.itemSubHeader}>
                    {edu.location && <span>{edu.location}</span>}
                    {edu.location && edu.grade && <span> • </span>}
                    {edu.grade && <span>{resolveGradeLabel(edu)}: {edu.grade}</span>}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* SKILLS SECTION (Styled as pills with classic elegant coloring) */}
      {skills && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Skills &amp; Technologies</h3>
          <div className={styles.secDivider}></div>
          <div className={styles.skillsPillContainer}>
            {skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
              <span key={idx} className={`${styles.skillPill} ${styles.elegantSkillPill}`}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* LANGUAGES SECTION */}
      {hasLanguages && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Languages</h3>
          <div className={styles.secDivider}></div>
          <div className={styles.elegantLanguagesContainer}>
            {languages.map((lang, idx) => (
              <div key={lang.id || idx} className={styles.elegantLangRow}>
                <span className={styles.langName}>{lang.name}</span>
                {renderDots(lang.level)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CERTIFICATIONS SECTION */}
      {hasCertifications && (
        <div className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Certifications &amp; Licenses</h3>
          <div className={styles.secDivider}></div>
          {certifications.map((cert, idx) => (
            (cert.name || cert.organization) && (
              <div key={cert.id || idx} className={styles.certBlock}>
                <div className={styles.itemHeader}>
                  <div>
                    {cert.name && <span className={styles.certName}>{cert.name}</span>}
                    {cert.name && cert.organization && <span> | </span>}
                    {cert.organization && <span className={styles.certOrg}>{cert.organization}</span>}
                  </div>
                  {cert.date && <span className={styles.itemDates}>{cert.date}</span>}
                </div>
                {cert.url && (
                  <div className={styles.itemSubHeader}>
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.certLink}>
                      View Credential
                    </a>
                  </div>
                )}
              </div>
            )
          ))}
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
