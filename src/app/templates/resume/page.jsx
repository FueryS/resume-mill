/**
 * src/app/templates/resume/page.jsx
 * 
 * Purpose:
 * Renders the Resume Templates exploration page.
 * Implements a Canva-like actual live preview scaling thumbnails.
 * Tapping a template opens a full-sized preview modal.
 * Connects directly to user draft data stored in localStorage under 'resume-mill-draft'.
 * Implements toggles: "Use My Info" and "Use Placeholders" which persist across sessions.
 * Highlight selected template with a green border and a custom checkmark SVG icon.
 * "Use this" inside the modal selects the template and routes the user to the builder page.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Info, X } from 'lucide-react';

import Modern_Page from '@/components/Templates/resume/Modern_Page';
import Elegant_Page from '@/components/Templates/resume/Elegant_Page';
import Creative_Page from '@/components/Templates/resume/Creative_Page';
import Timeline_Page from '@/components/Templates/resume/Timeline_Page';
import { mockResumeData } from '@/components/Templates/mockData';
import styles from './exploration.module.css';

// Definition of templates in our gallery
const TEMPLATE_GALLERY = [
  { id: 'modern', name: 'Minimalist Modern', component: Modern_Page, desc: 'Clean, professional sans-serif layout.' },
  { id: 'elegant', name: 'Executive Elegant', component: Elegant_Page, desc: 'Classic centered serif styling.' },
  { id: 'creative', name: 'Sidebar Creative', component: Creative_Page, desc: 'Dual-column layout with dark sidebar.' },
  { id: 'timeline', name: 'Bold Timeline', component: Timeline_Page, desc: 'High-contrast bright red & off-white layout with structural timelines.' }
];

// SVG checkmark badge representing template selection
const SelectedCheckIcon = () => (
  <svg 
    className={styles.selectedBadge} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#10B981" />
    <path 
      d="M7 12L10 15L17 8" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

/**
 * ThumbnailPreview Component
 * Performs the actual live scaled A4 drawing inside the thumbnail.
 */
function ThumbnailPreview({ template, data, onClick, isSelected, showFullUrls = false }) {
  const [scale, setScale] = useState(0.3);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        setScale(width / 794);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const TemplateComponent = template.component;

  return (
    <div 
      ref={containerRef} 
      className={`${styles.cardContainer} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {isSelected && <SelectedCheckIcon />}
      <div 
        className={styles.previewScaleWrapper}
        style={{ transform: `scale(${scale})` }}
      >
        <TemplateComponent data={data} showFullUrls={showFullUrls} />
      </div>
    </div>
  );
}

/**
 * ModalPreview Component
 * Scales A4 template inside the full-screen modal viewport.
 */
function ModalPreview({ template, data, showFullUrls = false }) {
  const [scale, setScale] = useState(0.7);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        // Cap scaling at a reasonable size to fit screen nicely
        setScale(Math.min(0.85, width / 794));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const TemplateComponent = template.component;

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div 
        className={styles.modalPaperContainer}
        style={{ 
          transform: `scale(${scale})`, 
          width: '794px', 
          height: '1123px',
          transformOrigin: 'top center',
          marginBottom: `${1123 * (scale - 1)}px` // Prevents scroll overflow caused by scaled space
        }}
      >
        <TemplateComponent data={data} showFullUrls={showFullUrls} />
      </div>
    </div>
  );
}

export default function ResumeTemplatesExplorationPage() {
  const router = useRouter();

  // Load preferences and state
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [useMyInfo, setUseMyInfo] = useState(false);
  const [usePlaceholders, setUsePlaceholders] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Stored user draft information
  const [userDraft, setUserDraft] = useState(null);

  // Tracks template selected for fullscreen modal display
  const [activeModalTemplate, setActiveModalTemplate] = useState(null);

  // Sync state with LocalStorage on mount
  useEffect(() => {
    // 1. Get draft
    const savedDraft = localStorage.getItem('resume-mill-draft');
    if (savedDraft) {
      setUserDraft(JSON.parse(savedDraft));
    }

    // 2. Get preferences
    const savedActiveTemplate = localStorage.getItem('resume-mill-active-template');
    if (savedActiveTemplate) {
      setSelectedTemplate(savedActiveTemplate);
    }

    const savedUseMyInfo = localStorage.getItem('resume-mill-templates-use-my-info');
    if (savedUseMyInfo !== null) {
      setUseMyInfo(savedUseMyInfo === 'true');
    }

    const savedUsePlaceholders = localStorage.getItem('resume-mill-templates-use-placeholders');
    if (savedUsePlaceholders !== null) {
      setUsePlaceholders(savedUsePlaceholders === 'true');
    }

    const savedShowFullUrls = localStorage.getItem('resume-mill-show-full-urls');
    if (savedShowFullUrls !== null) {
      setShowFullUrls(savedShowFullUrls === 'true');
    }

    setIsLoaded(true);
  }, []);

  // Save selected template selection
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('resume-mill-active-template', templateId);
  };

  // Save "Use My Info" toggle
  const handleToggleUseMyInfo = (val) => {
    setUseMyInfo(val);
    localStorage.setItem('resume-mill-templates-use-my-info', val ? 'true' : 'false');
  };

  // Save "Use Placeholders" toggle
  const handleToggleUsePlaceholders = (val) => {
    setUsePlaceholders(val);
    localStorage.setItem('resume-mill-templates-use-placeholders', val ? 'true' : 'false');
  };

  // Save "Show Full URLs" toggle
  const handleToggleShowFullUrls = (val) => {
    setShowFullUrls(val);
    localStorage.setItem('resume-mill-show-full-urls', val ? 'true' : 'false');
  };

  // Taps "Use this" inside the fullscreen modal -> redirects to builder
  const handleModalUseThis = (templateId) => {
    handleSelectTemplate(templateId);
    router.push('/builder');
  };

  /**
   * getEffectiveResumeData()
   * Merges user info with default mock data based on preferences.
   * Ensures that empty fields get filled when "usePlaceholders" is enabled.
   */
  const getEffectiveResumeData = () => {
    if (!useMyInfo) {
      return mockResumeData;
    }
    
    // User has selected 'use my info' but draft is empty
    const user = userDraft || {
      personal: { fullName: '', role: '', email: '', phone: '', github: '', linkedin: '', summary: '' },
      experience: [],
      projects: [],
      education: [],
      skills: ''
    };

    if (!usePlaceholders) {
      return user;
    }

    // Merge empty fields with mockData placeholders
    const merged = { ...user };
    
    // 1. Personal Info
    merged.personal = { ...mockResumeData.personal, ...user.personal };
    for (let key in mockResumeData.personal) {
      if (!user.personal?.[key]) {
        merged.personal[key] = mockResumeData.personal[key];
      }
    }

    // 2. Experience
    const userHasExp = user.experience && user.experience.some(e => e.company || e.role);
    if (!userHasExp) {
      merged.experience = mockResumeData.experience;
    } else {
      merged.experience = user.experience.map((exp, idx) => {
        const mockExp = mockResumeData.experience[idx] || mockResumeData.experience[0];
        const mergedExp = { ...exp };
        for (let key in mockExp) {
          if (!exp[key] && key !== 'current') {
            mergedExp[key] = mockExp[key];
          }
        }
        return mergedExp;
      });
    }

    // 3. Projects
    const userHasProj = user.projects && user.projects.some(p => p.name || p.description);
    if (!userHasProj) {
      merged.projects = mockResumeData.projects;
    } else {
      merged.projects = user.projects.map((proj, idx) => {
        const mockProj = mockResumeData.projects[idx] || mockResumeData.projects[0];
        const mergedProj = { ...proj };
        for (let key in mockProj) {
          if (!proj[key]) {
            mergedProj[key] = mockProj[key];
          }
        }
        return mergedProj;
      });
    }

    // 4. Education
    const userHasEdu = user.education && user.education.some(edu => edu.institution || edu.degree);
    if (!userHasEdu) {
      merged.education = mockResumeData.education;
    } else {
      merged.education = user.education.map((edu, idx) => {
        const mockEdu = mockResumeData.education[idx] || mockResumeData.education[0];
        const mergedEdu = { ...edu };
        for (let key in mockEdu) {
          if (!edu[key]) {
            mergedEdu[key] = mockEdu[key];
          }
        }
        return mergedEdu;
      });
    }

    // 5. Skills
    if (!user.skills) {
      merged.skills = mockResumeData.skills;
    }

    return merged;
  };

  if (!isLoaded) {
    return (
      <div className={styles.explorationWrapper}>
        <div className="container">
          <p>Loading resume templates...</p>
        </div>
      </div>
    );
  }

  const currentPreviewData = getEffectiveResumeData();

  return (
    <div className={styles.explorationWrapper}>
      <div className="container">
        
        {/* Header information */}
        <header className={styles.pageHeader}>
          <div className="badge">Resume Templates</div>
          <h1 className="heroTitle" style={{ fontSize: '38px', marginTop: '8px' }}>
            Choose a Design to <span>Get Started</span>
          </h1>
          <p className="heroSubtitle" style={{ marginBottom: '16px' }}>
            All templates are professionally spaced, ATS-friendly, and customizable. Scroll or tap a preview below to review in detail.
          </p>

          {/* Section dynamic warning notice */}
          <div className={styles.warningBanner}>
            <Info size={18} className={styles.warningIcon} />
            <span className={styles.warningText}>
              The resume is dynamically designed so any section left empty will not be displayed on the final output.
            </span>
          </div>
        </header>

        {/* Templates grid list */}
        <div className={styles.templateGrid}>
          {TEMPLATE_GALLERY.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <div key={template.id} className={styles.templateItem}>
                
                {/* Scaled Thumbnail Page */}
                <ThumbnailPreview 
                  template={template} 
                  data={currentPreviewData}
                  isSelected={isSelected}
                  showFullUrls={showFullUrls}
                  onClick={() => setActiveModalTemplate(template)}
                />

                {/* Card Selection Button */}
                <button
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`btn ${isSelected ? `btn-accent ${styles.btnGridUseThis} ${styles.selectedActive}` : `btn-secondary ${styles.btnGridUseThis}`}`}
                >
                  {isSelected ? '✓ Selected' : 'Use this'}
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* FULL VIEW MODAL */}
      {activeModalTemplate && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setActiveModalTemplate(null)}
        >
          <div 
            className={styles.modalWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Scrollable Paper Preview */}
            <div className={styles.modalPreviewArea}>
              <ModalPreview 
                template={activeModalTemplate} 
                data={currentPreviewData} 
                showFullUrls={showFullUrls}
              />
            </div>

            {/* Right: Preferences Sidebar */}
            <div className={styles.modalSidebar}>
              <div>
                <div className={styles.sidebarHeader}>
                  <div>
                    <h2>{activeModalTemplate.name}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {activeModalTemplate.desc}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveModalTemplate(null)}
                    className={styles.btnCloseModal}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Preference Toggles container */}
                <div className={styles.preferenceTitle}>Preview Settings</div>
                <div className={styles.preferencesBox}>
                  
                  {/* Toggle 1: Use my Info */}
                  <div className={styles.toggleRow} onClick={() => handleToggleUseMyInfo(!useMyInfo)}>
                    <div className={styles.toggleLabel}>
                      <span className={styles.toggleLabelTitle}>Use My Info</span>
                      <span className={styles.toggleLabelDesc}>Load your saved drafts</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={useMyInfo}
                        onChange={(e) => handleToggleUseMyInfo(e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {/* Toggle 2: Use Placeholders */}
                  <div className={styles.toggleRow} onClick={() => handleToggleUsePlaceholders(!usePlaceholders)}>
                    <div className={styles.toggleLabel}>
                      <span className={styles.toggleLabelTitle}>Fill Placeholders</span>
                      <span className={styles.toggleLabelDesc}>Simulate missing details</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={usePlaceholders}
                        onChange={(e) => handleToggleUsePlaceholders(e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {/* Toggle 3: Show Full URLs */}
                  <div className={styles.toggleRow} onClick={() => handleToggleShowFullUrls(!showFullUrls)}>
                    <div className={styles.toggleLabel}>
                      <span className={styles.toggleLabelTitle}>Show Full URLs</span>
                      <span className={styles.toggleLabelDesc}>Display complete URLs on page</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={showFullUrls}
                        onChange={(e) => handleToggleShowFullUrls(e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                </div>

                {/* Dynamic Warning Message repeating rule in sidebar */}
                <div className={styles.warningBanner} style={{ marginTop: '24px', padding: '12px' }}>
                  <Info size={16} className={styles.warningIcon} style={{ color: 'var(--accent)' }} />
                  <span className={styles.warningText} style={{ fontSize: '12px', fontWeight: '500' }}>
                    Sections left empty will be hidden in the final PDF export.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.sidebarActions}>
                <button
                  onClick={() => handleModalUseThis(activeModalTemplate.id)}
                  className={`btn ${styles.btnModalUseThis}`}
                >
                  Use this & Edit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
