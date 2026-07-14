/**
 * src/components/Templates/resume/Timeline_Page.jsx
 * 
 * Purpose:
 * Renders the "Timeline Red" (Bold Timeline) resume template layout.
 * Features an off-white background (#fafaf9), dark charcoal typography, and bright red accent styling.
 * Utilizes a centralized icons folder for header contact info and section headings.
 * Displays education entries in a clean vertical timeline.
 * Implements bright red underlines on skills.
 * Follows semantic HTML layout guidelines to facilitate future SEO audits.
 */

'use client';

import React from 'react';
import styles from './ResumeTemplates.module.css';
import {
  EmailIcon,
  PhoneIcon,
  LocationIcon,
  GithubIcon,
  LinkedinIcon,
  PortfolioIcon,
  EducationIcon,
  ExperienceIcon,
  ProjectIcon,
  CertificationIcon,
  LanguageIcon,
  SkillsIcon
} from './icons';

const formatDisplayUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '');
};

export default function Timeline_Page({ data, pageData, showWatermark = true, showFullUrls = false }) {
  // Fallback to data if pageData is undefined
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

  // Helpers to verify populated section contents
  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);
  const hasLanguages = languages && languages.length > 0;
  const hasCertifications = certifications && certifications.length > 0;

  /**
   * Derives display labels for an education entry's grades
   */
  const resolveGradeLabel = (edu) => {
    const type = edu.gradeType || 'degree';
    const format = edu.boardGradeFormat || 'percentage';
    const custom = (edu.customGradeLabel || '').trim();
    if (type === 'board') return format === 'marks' ? 'Marks' : 'Percentage';
    if (type === 'custom') return custom || 'Grade';
    return 'CGPA';
  };

  return (
    <div className={`${styles.resumePage} ${styles.timeline}`} id="timeline-template-root">
      
      {/* BRANDING HEADER */}
      {showHeader && (
        <header className={styles.timelineHeaderBlock}>
          {personal.pfp && (
            <div className={styles.timelinePfpWrapper}>
              <img src={personal.pfp} alt={personal.fullName || "Profile"} className={styles.timelinePfpImage} />
            </div>
          )}
          <div className={styles.timelineHeaderInfo}>
            <h1 className={styles.timelineName}>{personal.fullName || 'YOUR NAME'}</h1>
            <p className={styles.timelineRole}>{personal.role || 'TARGET ROLE'}</p>
            
            {/* Semantic Contact Bar using Centralized Icons */}
            <div className={styles.timelineContactBar} aria-label="Contact Information">
              {personal.email && (
                <span className={styles.timelineContactItem}>
                  <EmailIcon size={12} className={styles.timelineContactIcon} />
                  <span>{personal.email}</span>
                </span>
              )}
              {personal.phone && (
                <span className={styles.timelineContactItem}>
                  <PhoneIcon size={12} className={styles.timelineContactIcon} />
                  <span>{personal.phone}</span>
                </span>
              )}
              {personal.location && (
                <span className={styles.timelineContactItem}>
                  <LocationIcon size={12} className={styles.timelineContactIcon} />
                  <span>{personal.location}</span>
                </span>
              )}
              {personal.github && (
                <span className={styles.timelineContactItem}>
                  <GithubIcon size={12} className={styles.timelineContactIcon} />
                  <a href={personal.github} target="_blank" rel="noopener noreferrer">
                    {showFullUrls ? formatDisplayUrl(personal.github) : 'GitHub'}
                  </a>
                </span>
              )}
              {personal.linkedin && (
                <span className={styles.timelineContactItem}>
                  <LinkedinIcon size={12} className={styles.timelineContactIcon} />
                  <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">
                    {showFullUrls ? formatDisplayUrl(personal.linkedin) : 'LinkedIn'}
                  </a>
                </span>
              )}
              {personal.portfolio && (
                <span className={styles.timelineContactItem}>
                  <PortfolioIcon size={12} className={styles.timelineContactIcon} />
                  <a href={personal.portfolio} target="_blank" rel="noopener noreferrer">
                    {showFullUrls ? formatDisplayUrl(personal.portfolio) : 'Portfolio'}
                  </a>
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      {/* PROFESSIONAL SUMMARY */}
      {showHeader && personal.summary && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <SkillsIcon size={14} className={styles.timelineSecIcon} />
            <span>Professional Summary</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <p className={styles.timelineSummaryText}>{personal.summary}</p>
        </section>
      )}

      {/* EXPERIENCE SECTION */}
      {hasExperience && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <ExperienceIcon size={14} className={styles.timelineSecIcon} />
            <span>Work Experience</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <div className={styles.timelineEntriesContainer}>
            {experience.map((exp, idx) => (
              (exp.company || exp.role) && (
                <article key={exp.id || idx} className={styles.timelineItemBlock}>
                  <div className={styles.timelineItemHeader}>
                    <div>
                      {exp.role && <span className={styles.timelineItemRole}>{exp.role}</span>}
                      {exp.role && exp.company && <span className={styles.timelineSeparator}> | </span>}
                      {exp.company && <span className={styles.timelineItemCompany}>{exp.company}</span>}
                    </div>
                    <span className={styles.timelineItemDates}>
                      {exp.startDate || 'Start'} – {exp.endDate || (exp.current ? 'Present' : 'End')}
                    </span>
                  </div>
                  {exp.location && (
                    <div className={styles.timelineItemSubHeader}>
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.description && (
                    <p className={styles.timelineItemDesc}>{exp.description}</p>
                  )}
                </article>
              )
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {hasProjects && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <ProjectIcon size={14} className={styles.timelineSecIcon} />
            <span>Projects</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <div className={styles.timelineEntriesContainer}>
            {projects.map((proj, idx) => (
              (proj.name || proj.description) && (
                <article key={proj.id || idx} className={styles.timelineItemBlock}>
                  <div className={styles.timelineItemHeader}>
                    <span className={styles.timelineItemRole}>{proj.name || 'Project Name'}</span>
                    <div className={styles.timelineProjectLinks}>
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.timelineProjectLink}>
                          {showFullUrls ? `Live: ${formatDisplayUrl(proj.liveUrl)}` : 'Live Demo'}
                        </a>
                      )}
                      {proj.githubFront && (
                        <a href={proj.githubFront} target="_blank" rel="noopener noreferrer" className={styles.timelineProjectLink}>
                          {showFullUrls 
                            ? `${proj.githubBack ? 'Front' : 'Repo'}: ${formatDisplayUrl(proj.githubFront)}` 
                            : proj.githubBack ? 'Front Repo' : 'Repo'}
                        </a>
                      )}
                      {proj.githubBack && (
                        <a href={proj.githubBack} target="_blank" rel="noopener noreferrer" className={styles.timelineProjectLink}>
                          {showFullUrls 
                            ? `${proj.githubFront ? 'Back' : 'Repo'}: ${formatDisplayUrl(proj.githubBack)}` 
                            : proj.githubFront ? 'Back Repo' : 'Repo'}
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.technologies && (
                    <div className={styles.timelineItemSubHeader}>
                      <span>Tech: {proj.technologies}</span>
                    </div>
                  )}
                  {proj.description && (
                    <p className={styles.timelineItemDesc}>{proj.description}</p>
                  )}
                </article>
              )
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION SECTION (Timeline Layout) */}
      {hasEducation && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <EducationIcon size={14} className={styles.timelineSecIcon} />
            <span>Education</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          
          <div className={styles.educationTimelineContainer}>
            {/* Line runs behind bullets */}
            <div className={styles.educationTimelineLine}></div>
            
            {education.map((edu, idx) => (
              (edu.institution || edu.degree) && (
                <article key={edu.id || idx} className={styles.educationTimelineItem}>
                  <div className={styles.educationTimelineDot}></div>
                  <div className={styles.timelineItemHeader}>
                    <div>
                      {edu.degree && <span className={styles.timelineItemRole}>{edu.degree}</span>}
                      {edu.degree && edu.institution && <span className={styles.timelineSeparator}>, </span>}
                      {edu.institution && <span className={styles.timelineItemCompany}>{edu.institution}</span>}
                    </div>
                    <span className={styles.timelineItemDates}>
                      {edu.startDate || 'Start'} – {edu.endDate || 'End'}
                    </span>
                  </div>
                  {(edu.location || edu.grade) && (
                    <div className={styles.timelineItemSubHeader}>
                      {edu.location && <span>{edu.location}</span>}
                      {edu.location && edu.grade && <span> • </span>}
                      {edu.grade && <span>{resolveGradeLabel(edu)}: {edu.grade}</span>}
                    </div>
                  )}
                </article>
              )
            ))}
          </div>
        </section>
      )}

      {/* SKILLS SECTION (Pills with solid bright red bottom border/underline) */}
      {skills && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <SkillsIcon size={14} className={styles.timelineSecIcon} />
            <span>Skills &amp; Technologies</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <div className={styles.timelineSkillsContainer}>
            {skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill, idx) => (
              <span key={idx} className={styles.timelineSkillUnderlined}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* LANGUAGES SECTION */}
      {hasLanguages && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <LanguageIcon size={14} className={styles.timelineSecIcon} />
            <span>Languages</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <div className={styles.timelineLanguagesGrid}>
            {languages.map((lang, idx) => (
              <div key={lang.id || idx} className={styles.timelineLangRow}>
                <span className={styles.timelineLangName}>{lang.name}</span>
                <div className={styles.timelineProgressBarBg}>
                  <div className={styles.timelineProgressBarFill} style={{ width: `${(lang.level || 5) * 20}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS SECTION */}
      {hasCertifications && (
        <section className={styles.timelineSectionBlock}>
          <h2 className={styles.timelineSecTitle}>
            <CertificationIcon size={14} className={styles.timelineSecIcon} />
            <span>Certifications &amp; Licenses</span>
          </h2>
          <div className={styles.timelineSecDivider}></div>
          <div className={styles.timelineEntriesContainer}>
            {certifications.map((cert, idx) => (
              (cert.name || cert.organization) && (
                <article key={cert.id || idx} className={styles.timelineCertBlock}>
                  <div className={styles.timelineItemHeader}>
                    <div>
                      {cert.name && <span className={styles.timelineCertName}>{cert.name}</span>}
                      {cert.name && cert.organization && <span className={styles.timelineSeparator}> | </span>}
                      {cert.organization && <span className={styles.timelineCertOrg}>{cert.organization}</span>}
                    </div>
                    {cert.date && <span className={styles.timelineItemDates}>{cert.date}</span>}
                  </div>
                  {cert.url && (
                    <div className={styles.timelineItemSubHeader}>
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.timelineCertLink}>
                        {showFullUrls ? formatDisplayUrl(cert.url) : 'View Credential'}
                      </a>
                    </div>
                  )}
                </article>
              )
            ))}
          </div>
        </section>
      )}

      {/* Semi-transparent Branding Watermark */}
      {showWatermark && (
        <footer 
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
            color: '#1c1917',
            zIndex: 10
          }}
        >
          <img 
            src="/logo.jpg" 
            alt="ResumeMill Logo" 
            style={{ width: '12px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} 
          />
          <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
            Resume<span style={{ color: '#dc2626' }}>Mill</span>
          </span>
        </footer>
      )}

    </div>
  );
}
