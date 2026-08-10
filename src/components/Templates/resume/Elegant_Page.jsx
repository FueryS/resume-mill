/**
 * src/components/Templates/resume/Elegant_Page.jsx
 * 
 * Purpose:
 * Renders the "Elegant" resume template layout.
 * Features a classic dual-column layout with a left sidebar for personal details, contact info, skills, and languages.
 * Sub-category grouping uses Approach 1 (Python Indentation) + Approach 2 (Subtle Background Tint & Left Accent Border).
 * Respects custom user-defined sectionGroupOrder for sub-category group rendering.
 * Respects ungroupedPosition ('start' | 'end') to place ungrouped items above or below sub-category groups.
 * Supports standalone Achievements, card skills with optional rating toggle, and sub-category group headers.
 */

"use client";

import React from 'react';
import styles from './ResumeTemplates.module.css';
import { formatDisplayUrl, getSkillGroups, groupListBySubCategory } from './templateHelpers';

export default function Elegant_Page({ data, pageData, showWatermark = true, showFullUrls = false }) {
  const personal = data?.personal || {};
  const sectionGroups = data?.sectionGroups || {};
  const ungroupedPos = data?.ungroupedPosition || {};

  const expPos = ungroupedPos.experience || 'start';
  const projPos = ungroupedPos.projects || 'start';
  const eduPos = ungroupedPos.education || 'start';
  const skillsPos = ungroupedPos.skills || 'start';
  const certPos = ungroupedPos.certifications || 'start';
  const achPos = ungroupedPos.achievements || 'start';

  const activePageData = pageData || {
    showHeader: true,
    experience: data?.experience || [],
    projects: data?.projects || [],
    education: data?.education || [],
    skills: data?.skills || [],
    languages: data?.languages || [],
    certifications: data?.certifications || [],
    achievements: data?.achievements || [],
  };

  const { showHeader, experience, projects, education, skills, languages, certifications, achievements } = activePageData;
  const showSkillRating = Boolean(data?.showSkillRating);

  const hasExperience = experience && experience.some(e => e.company || e.role);
  const hasProjects = projects && projects.some(p => p.name || p.description);
  const hasEducation = education && education.some(edu => edu.institution || edu.degree);
  const hasLanguages = languages && languages.length > 0;
  const hasCertifications = certifications && certifications.length > 0;
  const hasAchievements = achievements && achievements.length > 0;

  const { ungrouped: ungroupedSkills, groups: skillGroups } = getSkillGroups(skills, sectionGroups.skills);
  const skillGroupKeys = Object.keys(skillGroups);
  const hasSkills = ungroupedSkills.length > 0 || skillGroupKeys.length > 0;

  const resolveGradeLabel = (edu) => {
    const type   = edu.gradeType        || 'degree';
    const format = edu.boardGradeFormat || 'percentage';
    const custom = (edu.customGradeLabel || '').trim();
    if (type === 'board')  return format === 'marks' ? 'Marks' : 'Percentage';
    if (type === 'custom') return custom || 'Grade';
    return 'CGPA';
  };

  const renderSkillItem = (skillObj, idx) => {
    const skillName = typeof skillObj === 'string' ? skillObj : (skillObj?.name || skillObj?.skill || '');
    const rawLevel = typeof skillObj === 'object' ? skillObj?.level : 5;
    const skillLevel = Math.max(1, Math.min(5, Number(rawLevel) || 5));
    if (!skillName || !skillName.trim()) return null;

    if (showSkillRating) {
      return (
        <div key={idx} className={styles.skillRatingRow} style={{ backgroundColor: '#ffffff', border: '1px solid #1f2937' }}>
          <span style={{ fontFamily: 'Georgia, serif', color: '#111827', fontWeight: '500' }}>{skillName}</span>
          <span className={styles.skillRatingStars} style={{ color: '#1f2937' }}>
            {"★".repeat(skillLevel)}{"☆".repeat(5 - skillLevel)}
          </span>
        </div>
      );
    }
    return (
      <span key={idx} className={styles.elegantSkillPill}>{skillName}</span>
    );
  };

  // Grouping partitions for sections (ordered by sectionGroups)
  const { ungrouped: ungroupedExp, groups: expGroups } = groupListBySubCategory(experience, sectionGroups.experience);
  const expGroupKeys = Object.keys(expGroups);

  const { ungrouped: ungroupedProj, groups: projGroups } = groupListBySubCategory(projects, sectionGroups.projects);
  const projGroupKeys = Object.keys(projGroups);

  const { ungrouped: ungroupedEdu, groups: eduGroups } = groupListBySubCategory(education, sectionGroups.education);
  const eduGroupKeys = Object.keys(eduGroups);

  const { ungrouped: ungroupedCert, groups: certGroups } = groupListBySubCategory(certifications, sectionGroups.certifications);
  const certGroupKeys = Object.keys(certGroups);

  const { ungrouped: ungroupedAch, groups: achGroups } = groupListBySubCategory(achievements, sectionGroups.achievements);
  const achGroupKeys = Object.keys(achGroups);

  const renderUngroupedExp = () => (
    ungroupedExp.map((exp, idx) => (
      (exp.company || exp.role) && (
        <article key={exp.id || idx} className={styles.itemBlock}>
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
        </article>
      )
    ))
  );

  const renderUngroupedProj = () => (
    ungroupedProj.map((proj, idx) => (
      (proj.name || proj.description) && (
        <article key={proj.id || idx} className={styles.itemBlock}>
          <div className={styles.itemHeader}>
            <span className={styles.itemRole}>{proj.name || 'Project Name'}</span>
            <div className={styles.projectLinks}>
              {proj.liveUrl && (
                <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  {showFullUrls ? `Live: ${formatDisplayUrl(proj.liveUrl)}` : 'Live Demo'}
                </a>
              )}
              {proj.githubFront && (
                <a href={proj.githubFront} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  {showFullUrls 
                    ? `${proj.githubBack ? 'Front' : 'Code'}: ${formatDisplayUrl(proj.githubFront)}` 
                    : proj.githubBack ? 'Front Repo' : 'Code'}
                </a>
              )}
              {proj.githubBack && (
                <a href={proj.githubBack} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                  {showFullUrls 
                    ? `${proj.githubFront ? 'Back' : 'Code'}: ${formatDisplayUrl(proj.githubBack)}` 
                    : proj.githubFront ? 'Back Repo' : 'Code'}
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
        </article>
      )
    ))
  );

  const renderUngroupedEdu = () => (
    ungroupedEdu.map((edu, idx) => (
      (edu.institution || edu.degree) && (
        <article key={edu.id || idx} className={styles.itemBlock}>
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
        </article>
      )
    ))
  );

  const renderUngroupedSkills = () => (
    ungroupedSkills.length > 0 && (
      <div className={showSkillRating ? styles.skillsGrid : styles.skillsPillContainer}>
        {ungroupedSkills.map((skill, idx) => renderSkillItem(skill, idx))}
      </div>
    )
  );

  const renderUngroupedCert = () => (
    ungroupedCert.map((cert, idx) => (
      (cert.name || cert.organization) && (
        <article key={cert.id || idx} className={styles.certBlock}>
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
                {showFullUrls ? formatDisplayUrl(cert.url) : 'View Credential'}
              </a>
            </div>
          )}
        </article>
      )
    ))
  );

  const renderUngroupedAch = () => (
    ungroupedAch.map((ach, idx) => (
      (ach.title || ach.description) && (
        <article key={ach.id || idx} className={styles.itemBlock}>
          <div className={styles.itemHeader}>
            <div>
              {ach.title && <span className={styles.itemRole}>{ach.title}</span>}
              {ach.title && ach.organization && <span> | </span>}
              {ach.organization && <span className={styles.itemCompany}>{ach.organization}</span>}
            </div>
            {ach.date && <span className={styles.itemDates}>{ach.date}</span>}
          </div>
          {ach.description && (
            <p className={styles.itemDesc}>{ach.description}</p>
          )}
        </article>
      )
    ))
  );

  return (
    <div className={`${styles.resumePage} ${styles.elegant}`}>
      {/* BRANDING HEADER */}
      {showHeader && (
        <header className={styles.headerBlock}>
          {personal.pfp && (
            <div className={styles.elegantPfpWrapper}>
              <img src={personal.pfp} alt="Profile" className={styles.elegantPfpImage} />
            </div>
          )}
          <h1 className={styles.name}>{personal.fullName || 'YOUR NAME'}</h1>
          <p className={styles.role}>{personal.role || 'TARGET ROLE'}</p>
          
          <div className={styles.contactBar}>
            {personal.email && <span className={styles.contactItem}>{personal.email}</span>}
            {personal.phone && <span className={styles.contactItem}>{personal.phone}</span>}
            {personal.location && <span className={styles.contactItem}>{personal.location}</span>}
            {personal.github && (
              <span className={styles.contactItem}>
                <a href={personal.github} target="_blank" rel="noopener noreferrer">
                  {showFullUrls ? formatDisplayUrl(personal.github) : 'GitHub'}
                </a>
              </span>
            )}
            {personal.linkedin && (
              <span className={styles.contactItem}>
                <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">
                  {showFullUrls ? formatDisplayUrl(personal.linkedin) : 'LinkedIn'}
                </a>
              </span>
            )}
            {personal.portfolio && (
              <span className={styles.contactItem}>
                <a href={personal.portfolio} target="_blank" rel="noopener noreferrer">
                  {showFullUrls ? formatDisplayUrl(personal.portfolio) : 'Portfolio'}
                </a>
              </span>
            )}
          </div>
        </header>
      )}

      {/* PROFESSIONAL SUMMARY */}
      {showHeader && personal.summary && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Professional Summary</h3>
          <div className={styles.secDivider}></div>
          <p className={styles.summaryText}>{personal.summary}</p>
        </section>
      )}

      {/* EXPERIENCE SECTION */}
      {hasExperience && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Work Experience</h3>
          <div className={styles.secDivider}></div>
          
          {expPos === 'start' && renderUngroupedExp()}

          {/* Sub-Grouped Experience */}
          {expGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                {expGroups[gName].map((exp, idx) => (
                  (exp.company || exp.role) && (
                    <article key={exp.id || idx} className={styles.itemBlock}>
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
                    </article>
                  )
                ))}
              </div>
            </div>
          ))}

          {expPos === 'end' && renderUngroupedExp()}
        </section>
      )}

      {/* PROJECTS SECTION */}
      {hasProjects && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Projects</h3>
          <div className={styles.secDivider}></div>
          
          {projPos === 'start' && renderUngroupedProj()}

          {/* Sub-Grouped Projects */}
          {projGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                {projGroups[gName].map((proj, idx) => (
                  (proj.name || proj.description) && (
                    <article key={proj.id || idx} className={styles.itemBlock}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemRole}>{proj.name || 'Project Name'}</span>
                        <div className={styles.projectLinks}>
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                              {showFullUrls ? `Live: ${formatDisplayUrl(proj.liveUrl)}` : 'Live Demo'}
                            </a>
                          )}
                          {proj.githubFront && (
                            <a href={proj.githubFront} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                              {showFullUrls 
                                ? `${proj.githubBack ? 'Front' : 'Code'}: ${formatDisplayUrl(proj.githubFront)}` 
                                : proj.githubBack ? 'Front Repo' : 'Code'}
                            </a>
                          )}
                          {proj.githubBack && (
                            <a href={proj.githubBack} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                              {showFullUrls 
                                ? `${proj.githubFront ? 'Back' : 'Code'}: ${formatDisplayUrl(proj.githubBack)}` 
                                : proj.githubFront ? 'Back Repo' : 'Code'}
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
                    </article>
                  )
                ))}
              </div>
            </div>
          ))}

          {projPos === 'end' && renderUngroupedProj()}
        </section>
      )}

      {/* EDUCATION SECTION */}
      {hasEducation && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Education</h3>
          <div className={styles.secDivider}></div>
          
          {eduPos === 'start' && renderUngroupedEdu()}

          {/* Sub-Grouped Education */}
          {eduGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                {eduGroups[gName].map((edu, idx) => (
                  (edu.institution || edu.degree) && (
                    <article key={edu.id || idx} className={styles.itemBlock}>
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
                    </article>
                  )
                ))}
              </div>
            </div>
          ))}

          {eduPos === 'end' && renderUngroupedEdu()}
        </section>
      )}

      {/* SKILLS SECTION */}
      {hasSkills && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Skills &amp; Technologies</h3>
          <div className={styles.secDivider}></div>

          {skillsPos === 'start' && renderUngroupedSkills()}

          {/* Render Sub-Grouped Skills */}
          {skillGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                <div className={showSkillRating ? styles.skillsGrid : styles.skillsPillContainer}>
                  {skillGroups[gName].map((skill, idx) => renderSkillItem(skill, idx))}
                </div>
              </div>
            </div>
          ))}

          {skillsPos === 'end' && renderUngroupedSkills()}
        </section>
      )}

      {/* LANGUAGES SECTION */}
      {hasLanguages && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Languages</h3>
          <div className={styles.secDivider}></div>
          <div className={styles.languagesGrid}>
            {languages.map((lang, idx) => (
              <div key={lang.id || idx} className={styles.langRow}>
                <span className={styles.langName}>{lang.name}</span>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${(lang.level || 5) * 20}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS SECTION */}
      {hasCertifications && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Certifications &amp; Licenses</h3>
          <div className={styles.secDivider}></div>
          
          {certPos === 'start' && renderUngroupedCert()}

          {/* Sub-Grouped Certifications */}
          {certGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                {certGroups[gName].map((cert, idx) => (
                  (cert.name || cert.organization) && (
                    <article key={cert.id || idx} className={styles.certBlock}>
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
                            {showFullUrls ? formatDisplayUrl(cert.url) : 'View Credential'}
                          </a>
                        </div>
                      )}
                    </article>
                  )
                ))}
              </div>
            </div>
          ))}

          {certPos === 'end' && renderUngroupedCert()}
        </section>
      )}

      {/* STANDALONE ACHIEVEMENTS & AWARDS SECTION */}
      {hasAchievements && (
        <section className={styles.sectionBlock}>
          <h3 className={styles.secTitle}>Achievements &amp; Awards</h3>
          <div className={styles.secDivider}></div>
          
          {achPos === 'start' && renderUngroupedAch()}

          {/* Sub-Grouped Achievements */}
          {achGroupKeys.map((gName) => (
            <div key={gName} className={styles.groupContainer}>
              <div className={styles.subCategoryTitle}>{gName}</div>
              <div className={styles.groupedItemsWrapper}>
                {achGroups[gName].map((ach, idx) => (
                  (ach.title || ach.description) && (
                    <article key={ach.id || idx} className={styles.itemBlock}>
                      <div className={styles.itemHeader}>
                        <div>
                          {ach.title && <span className={styles.itemRole}>{ach.title}</span>}
                          {ach.title && ach.organization && <span> | </span>}
                          {ach.organization && <span className={styles.itemCompany}>{ach.organization}</span>}
                        </div>
                        {ach.date && <span className={styles.itemDates}>{ach.date}</span>}
                      </div>
                      {ach.description && (
                        <p className={styles.itemDesc}>{ach.description}</p>
                      )}
                    </article>
                  )
                ))}
              </div>
            </div>
          ))}

          {achPos === 'end' && renderUngroupedAch()}
        </section>
      )}

      {/* Branding Watermark */}
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
            Resume<span style={{ color: '#111827' }}>Mill</span>
          </span>
        </footer>
      )}
    </div>
  );
}
