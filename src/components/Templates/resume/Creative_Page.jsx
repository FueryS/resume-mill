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

export default function Creative_Page({ data, pageData, showWatermark = true }) {
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

  // Helper to render star rating
  const renderStars = (level) => {
    const score = level || 5;
    return (
      <span className={styles.ratingStars} style={{ letterSpacing: '1px', color: '#fbbf24', fontSize: '13px' }}>
        {'★'.repeat(score)}{'☆'.repeat(5 - score)}
      </span>
    );
  };

  return (
    <div className={`${styles.resumePage} ${styles.creative}`}>
      
      {/* LEFT COLUMN: Sidebar (Branding, Contact Details, Summary, Skills) */}
      <div className={styles.creativeLeftColumn}>
        {showHeader && personal.pfp && (
          <div className={styles.creativePfpWrapper}>
            <img src={personal.pfp} alt="Profile" className={styles.creativePfpImage} />
          </div>
        )}
        
        {showHeader && (
          <div className={styles.brandingSection}>
            <h1 className={styles.name}>{personal.fullName || 'YOUR NAME'}</h1>
            <p className={styles.role}>{personal.role || 'TARGET ROLE'}</p>
          </div>
        )}

        {/* CONTACT DETAILS */}
        {showHeader && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Contact</h3>
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
                  <a href={personal.github} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>GitHub</a>
                </span>
              )}
              {personal.linkedin && (
                <span className={styles.contactItem}>
                  <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>LinkedIn</a>
                </span>
              )}
              {personal.portfolio && (
                <span className={styles.contactItem}>
                  <a href={personal.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>Portfolio</a>
                </span>
              )}
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {showHeader && personal.summary && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Profile</h3>
            <p className={styles.summaryText}>{personal.summary}</p>
          </div>
        )}

        {/* SKILLS (Rendered as side bar pills) */}
        {skills && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Skills</h3>
            <div className={styles.creativeSkillsContainer}>
              {skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
                <span key={idx} className={styles.creativeSkillPill}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* LANGUAGES */}
        {hasLanguages && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Languages</h3>
            <div className={styles.creativeLanguagesContainer}>
              {languages.map((lang, idx) => (
                <div key={lang.id || idx} className={styles.creativeLangRow}>
                  <span className={styles.langName} style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: '500' }}>{lang.name}</span>
                  {renderStars(lang.level)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Main content (Work Experience, Projects, Education, Certifications) */}
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

        {/* PROJECTS */}
        {hasProjects && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Projects</h3>
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
                          Front Repo
                        </a>
                      )}
                      {proj.githubBack && (
                        <a href={proj.githubBack} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                          Back Repo
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

        {/* EDUCATION */}
        {hasEducation && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Education</h3>
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

        {/* CERTIFICATIONS */}
        {hasCertifications && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.secTitle}>Certifications</h3>
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
