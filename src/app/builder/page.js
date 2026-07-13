/**
 * page.js (Builder Page)
 * 
 * Path: /builder
 * Purpose:
 * Renders the main Resume Builder application interface.
 * Implements a split-pane layout on desktop:
 * - Left Pane: An interactive, multi-step form to input user profile details, experience, projects, education, and skills.
 * - Right Pane: A live, print-styled A4 resume preview box that updates instantly as the user types.
 * 
 * Core Functionalities:
 * 1. Auto-save drafts: Syncs form data locally to browser LocalStorage to prevent loss on refreshes.
 * 2. ATS optimization: secure serverless endpoint queries to Google Gemini AI to rewrite summaries, projects, and work experience bullet points.
 * 3. Client-side Exports:
 *    - PDF Generation: Opens native system print layout formatted for A4 page dimensions.
 *    - Portfolio Generation: Compiles custom HTML/CSS/JS files into a ZIP folder dynamically in the browser using JSZip.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, FolderGit2, 
  Sparkles, Download, FileDown, Plus, Trash2, Heart, 
  ChevronLeft, ChevronRight, Eye, RefreshCw 
} from 'lucide-react';
import { generatePortfolioZip } from '@/utils/zipGenerator';
import DonationModal from '@/components/DonationModal';
import styles from './page.module.css';

// Initial state template representing empty resume structure
const initialFormState = {
  personal: {
    fullName: '',
    role: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    summary: '',
  },
  experience: [
    { id: '1', company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' }
  ],
  projects: [
    { id: '1', name: '', description: '', technologies: '', link: '' }
  ],
  education: [
    { id: '1', institution: '', degree: '', location: '', startDate: '', endDate: '', grade: '' }
  ],
  skills: '',
};

export default function BuilderPage() {
  // Main form state capturing all user inputs
  const [formData, setFormData] = useState(initialFormState);
  
  // State to track current form step (0: Profile, 1: Experience, 2: Projects, 3: Education/Skills, 4: Export)
  const [activeStep, setActiveStep] = useState(0);
  
  // State tracking if local storage has successfully mounted
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State tracking which field is currently calling the Gemini API to display loading indicators
  const [optimizingField, setOptimizingField] = useState(null); // format: `${section}-${id}-${field}`
  
  // State tracking display of the UPI QR scan tipping modal
  const [showDonation, setShowDonation] = useState(false);
  
  // State representing the active resume design template ('modern' or 'elegant')
  const [activeTemplate, setActiveTemplate] = useState('modern');

  // Step headers list
  const steps = [
    { name: 'Profile & Summary', icon: <User size={18} /> },
    { name: 'Experience', icon: <Briefcase size={18} /> },
    { name: 'Projects', icon: <FolderGit2 size={18} /> },
    { name: 'Education & Skills', icon: <GraduationCap size={18} /> },
    { name: 'Preview & Export', icon: <Download size={18} /> }
  ];

  // 1. DRAFT RESTORATION: Load drafts from browser local storage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('resume-mill-draft');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error('Failed to parse saved draft', e);
      }
    }
    // Set load status to true to begin auto-saving future input changes
    setIsLoaded(true);
  }, []);

  // 2. DRAFT PERSISTENCE: Auto-save form data to local storage on keystrokes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resume-mill-draft', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  // Handler for simple top-level personal details changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value }
    }));
  };

  // Handler to modify specific attributes inside arrays (Experience, Projects, Education)
  const handleArrayChange = (section, id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handler to add a new card item inside listing sections
  const addArrayItem = (section) => {
    let newItem = {};
    if (section === 'experience') {
      newItem = { id: Date.now().toString(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    } else if (section === 'projects') {
      newItem = { id: Date.now().toString(), name: '', description: '', technologies: '', link: '' };
    } else if (section === 'education') {
      newItem = { id: Date.now().toString(), institution: '', degree: '', location: '', startDate: '', endDate: '', grade: '' };
    }
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  // Handler to remove a card item from listing sections
  const removeArrayItem = (section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id)
    }));
  };

  /**
   * handleAIQuery()
   * 
   * Purpose:
   * Triggers the Gemini API proxy route to rewrite user descriptions to be ATS-friendly.
   * Sends the current text, section title, and target role to /api/optimize.
   */
  const handleAIQuery = async (section, id, field, originalText) => {
    if (!originalText || !originalText.trim()) return;
    
    // Unique identifier key for loader toggles
    const key = `${section}-${id || 'personal'}-${field}`;
    setOptimizingField(key);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          section,
          role: formData.personal.role
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.optimizedText) {
        // Track API trigger event in GA if active
        if (window.gtag) {
          window.gtag('event', 'gemini_api_call', {
            event_category: 'ai_tool',
            event_label: key
          });
        }

        // Apply rewritten content to the corresponding state target
        if (section === 'personal') {
          setFormData((prev) => ({
            ...prev,
            personal: { ...prev.personal, [field]: result.optimizedText }
          }));
        } else {
          handleArrayChange(section, id, field, result.optimizedText);
        }
      } else {
        alert(result.error || 'Failed to optimize. Please check your network connection.');
      }
    } catch (error) {
      console.error(error);
      alert('Error communicating with backend optimize API.');
    } finally {
      setOptimizingField(null);
    }
  };

  // Resets the draft state completely
  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your current resume draft? All input details will be lost.')) {
      setFormData(initialFormState);
      localStorage.removeItem('resume-mill-draft');
    }
  };

  /**
   * handleDownloadPDF()
   * 
   * Purpose:
   * Exports the live A4 preview panel as a PDF document.
   * Uses native system print scaling to guarantee sharp vector text, preserving ATS parse accuracy.
   */
  const handleDownloadPDF = async () => {
    // Increment the global resumes built counter in Vercel KV database
    fetch('/api/stats', { method: 'POST' }).catch(() => {});

    // Log PDF generation event in Google Analytics
    if (window.gtag) {
      window.gtag('event', 'generate_resume_pdf', {
        event_category: 'download',
        event_label: activeTemplate
      });
    }

    // Trigger browser Print UI directly (CSS handles hiding editing panels)
    window.print();
    
    // Display the tipping scanner widget modal shortly after print window triggers
    setTimeout(() => {
      setShowDonation(true);
    }, 1500);
  };

  /**
   * handleDownloadPortfolio()
   * 
   * Purpose:
   * Compiles and bundles the user's resume data into a customizable HTML portfolio website.
   * Generates ZIP file entirely client-side using JSZip and triggers local file download.
   */
  const handleDownloadPortfolio = async () => {
    // Log portfolio export in Google Analytics
    if (window.gtag) {
      window.gtag('event', 'generate_portfolio_zip', {
        event_category: 'download',
        event_label: 'client_portfolio'
      });
    }

    try {
      // Trigger JSZip compilation logic
      const blob = await generatePortfolioZip(formData);
      
      // Dynamic local browser file download trigger
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(formData.personal.fullName || 'My').replace(/\s+/g, '_')}_Portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Trigger tipping popup modal shortly after
      setTimeout(() => {
        setShowDonation(true);
      }, 1500);
    } catch (e) {
      console.error(e);
      alert('Failed to generate ZIP. Please check your data.');
    }
  };

  return (
    <>
      <div className={styles.builderPage}>
        <div className={`container ${styles.builderGrid}`}>
          
          {/* LEFT COLUMN: The interactive multi-step input form */}
          <div className={styles.formPanel}>
            
            {/* Form Step indicators */}
            <div className={styles.formHeader}>
              <div className={styles.formStepIndicators}>
                {steps.map((step, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`${styles.stepIndicator} ${activeStep === idx ? styles.active : ''}`}
                    title={step.name}
                  >
                    {step.icon}
                  </button>
                ))}
              </div>
              <div className={styles.stepLabel}>
                <span>Step {activeStep + 1} of 5:</span> {steps[activeStep].name}
              </div>
            </div>

            {/* Form Fields Body */}
            <div className={styles.formBody}>
              
              {/* STEP 1: Profile & Professional Summary */}
              {activeStep === 0 && (
                <div className={`${styles.formSection} animate-scale-in`}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.personal.fullName}
                        onChange={handlePersonalChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Target Role</label>
                      <input 
                        type="text" 
                        name="role" 
                        value={formData.personal.role}
                        onChange={handlePersonalChange}
                        placeholder="Frontend Engineer / Product Manager"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.personal.email}
                        onChange={handlePersonalChange}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={formData.personal.phone}
                        onChange={handlePersonalChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>GitHub URL</label>
                      <input 
                        type="url" 
                        name="github" 
                        value={formData.personal.github}
                        onChange={handlePersonalChange}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>LinkedIn URL</label>
                      <input 
                        type="url" 
                        name="linkedin" 
                        value={formData.personal.linkedin}
                        onChange={handlePersonalChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.labelWithAi}>
                      <label>Professional Summary</label>
                      <button 
                        className={styles.btnAiOptimize}
                        onClick={() => handleAIQuery('personal', null, 'summary', formData.personal.summary)}
                        disabled={optimizingField === 'personal-personal-summary'}
                      >
                        {optimizingField === 'personal-personal-summary' ? (
                          <RefreshCw size={12} className={styles.spinIcon} />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        <span>{optimizingField === 'personal-personal-summary' ? 'Refining...' : 'ATS Optimize (Gemini)'}</span>
                      </button>
                    </div>
                    <textarea 
                      name="summary" 
                      rows="4"
                      value={formData.personal.summary}
                      onChange={handlePersonalChange}
                      placeholder="Summarize your professional experience, technical expertise, and career objectives."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Work Experience */}
              {activeStep === 1 && (
                <div className={`${styles.formSection} animate-scale-in`}>
                  {formData.experience.map((exp, idx) => (
                    <div key={exp.id} className={styles.itemCard}>
                      <div className={styles.itemCardHeader}>
                        <h5>Position #{idx + 1}</h5>
                        <button className={styles.btnRemove} onClick={() => removeArrayItem('experience', exp.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Company / Organization</label>
                          <input 
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)}
                            placeholder="Google"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Job Title / Role</label>
                          <input 
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)}
                            placeholder="Software Engineering Intern"
                          />
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Location</label>
                          <input 
                            type="text"
                            value={exp.location}
                            onChange={(e) => handleArrayChange('experience', exp.id, 'location', e.target.value)}
                            placeholder="Bangalore, India"
                          />
                        </div>
                        <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
                          <div className={styles.formGroup}>
                            <label>Start Date</label>
                            <input 
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => handleArrayChange('experience', exp.id, 'startDate', e.target.value)}
                              placeholder="June 2024"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>End Date</label>
                            <input 
                              type="text"
                              value={exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => handleArrayChange('experience', exp.id, 'endDate', e.target.value)}
                              placeholder={exp.current ? 'Present' : 'August 2024'}
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formCheckbox}>
                        <input 
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => handleArrayChange('experience', exp.id, 'current', e.target.checked)}
                        />
                        <label htmlFor={`current-${exp.id}`}>I currently work here</label>
                      </div>

                      <div className={styles.formGroup}>
                        <div className={styles.labelWithAi}>
                          <label>Job Description / Responsibilities</label>
                          <button 
                            className={styles.btnAiOptimize}
                            onClick={() => handleAIQuery('experience', exp.id, 'description', exp.description)}
                            disabled={optimizingField === `experience-${exp.id}-description`}
                          >
                            {optimizingField === `experience-${exp.id}-description` ? (
                              <RefreshCw size={12} className={styles.spinIcon} />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>{optimizingField === `experience-${exp.id}-description` ? 'Refining...' : 'ATS Optimize (Gemini)'}</span>
                          </button>
                        </div>
                        <textarea 
                          rows="4"
                          value={exp.description}
                          onChange={(e) => handleArrayChange('experience', exp.id, 'description', e.target.value)}
                          placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
                        />
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-secondary ${styles.btnAdd}" onClick={() => addArrayItem('experience')}>
                    <Plus size={16} />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}

              {/* STEP 3: Key Projects */}
              {activeStep === 2 && (
                <div className={`${styles.formSection} animate-scale-in`}>
                  {formData.projects.map((proj, idx) => (
                    <div key={proj.id} className={styles.itemCard}>
                      <div className={styles.itemCardHeader}>
                        <h5>Project #{idx + 1}</h5>
                        <button className={styles.btnRemove} onClick={() => removeArrayItem('projects', proj.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Project Name</label>
                          <input 
                            type="text"
                            value={proj.name}
                            onChange={(e) => handleArrayChange('projects', proj.id, 'name', e.target.value)}
                            placeholder="E-Commerce Store"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Project Link / Repository</label>
                          <input 
                            type="url"
                            value={proj.link}
                            onChange={(e) => handleArrayChange('projects', proj.id, 'link', e.target.value)}
                            placeholder="https://github.com/my-project"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Technologies Used (comma separated)</label>
                        <input 
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => handleArrayChange('projects', proj.id, 'technologies', e.target.value)}
                          placeholder="Next.js, TailwindCSS, MongoDB, Stripe"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <div className={styles.labelWithAi}>
                          <label>Project Description</label>
                          <button 
                            className={styles.btnAiOptimize}
                            onClick={() => handleAIQuery('projects', proj.id, 'description', proj.description)}
                            disabled={optimizingField === `projects-${proj.id}-description`}
                          >
                            {optimizingField === `projects-${proj.id}-description` ? (
                              <RefreshCw size={12} className={styles.spinIcon} />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>{optimizingField === `projects-${proj.id}-description` ? 'Refining...' : 'ATS Optimize (Gemini)'}</span>
                          </button>
                        </div>
                        <textarea 
                          rows="3"
                          value={proj.description}
                          onChange={(e) => handleArrayChange('projects', proj.id, 'description', e.target.value)}
                          placeholder="Briefly describe what you built, what tech stack was chosen, and key performance improvements."
                        />
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-secondary ${styles.btnAdd}" onClick={() => addArrayItem('projects')}>
                    <Plus size={16} />
                    <span>Add Project</span>
                  </button>
                </div>
              )}

              {/* STEP 4: Education History & Tech Skills */}
              {activeStep === 3 && (
                <div className={`${styles.formSection} animate-scale-in`}>
                  <h4 className={styles.subsectionTitle}>Education</h4>
                  {formData.education.map((edu, idx) => (
                    <div key={edu.id} className={styles.itemCard}>
                      <div className={styles.itemCardHeader}>
                        <h5>Institution #{idx + 1}</h5>
                        <button className={styles.btnRemove} onClick={() => removeArrayItem('education', edu.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Institution Name</label>
                          <input 
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleArrayChange('education', edu.id, 'institution', e.target.value)}
                            placeholder="Indian Institute of Technology"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Degree / Qualification</label>
                          <input 
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor of Technology in Computer Science"
                          />
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Location</label>
                          <input 
                            type="text"
                            value={edu.location}
                            onChange={(e) => handleArrayChange('education', edu.id, 'location', e.target.value)}
                            placeholder="Mumbai, India"
                          />
                        </div>
                        <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
                          <div className={styles.formGroup}>
                            <label>Start Date</label>
                            <input 
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => handleArrayChange('education', edu.id, 'startDate', e.target.value)}
                              placeholder="2021"
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>End Date (or Expected)</label>
                            <input 
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => handleArrayChange('education', edu.id, 'endDate', e.target.value)}
                              placeholder="2025"
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Grade / CGPA / Percentage</label>
                        <input 
                          type="text"
                          value={edu.grade}
                          onChange={(e) => handleArrayChange('education', edu.id, 'grade', e.target.value)}
                          placeholder="9.2 CGPA / 88%"
                        />
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-secondary ${styles.btnAdd}" onClick={() => addArrayItem('education')}>
                    <Plus size={16} />
                    <span>Add Education</span>
                  </button>

                  <h4 className={styles.subsectionTitle} style={{ marginTop: '30px' }}>Skills & Frameworks</h4>
                  <div className={styles.formGroup}>
                    <label>Skills list (comma separated)</label>
                    <textarea 
                      rows="4"
                      value={formData.skills}
                      onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
                      placeholder="React, Next.js, JavaScript, Node.js, Git, HTML, CSS, SQL, Python"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Layout Previews & Document Exporters */}
              {activeStep === 4 && (
                <div className={`${styles.formSection} ${styles.finalStepPanel} animate-scale-in`}>
                  
                  {/* Template selections */}
                  <div className={styles.templateSelectionBox}>
                    <h4>Choose Resume Template</h4>
                    <div className={styles.templateSelectors}>
                      <button 
                        className={`${styles.templateBtn} ${activeTemplate === 'modern' ? styles.active : ''}`}
                        onClick={() => setActiveTemplate('modern')}
                      >
                        <FileDown size={18} />
                        <span>Modern Minimalist (Recommended)</span>
                      </button>
                      
                      <button 
                        className={`${styles.templateBtn} ${activeTemplate === 'elegant' ? styles.active : ''}`}
                        onClick={() => setActiveTemplate('elegant')}
                      >
                        <Eye size={18} />
                        <span>Elegant Executive</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF/ZIP Export triggers */}
                  <div className={styles.exportsActionBox}>
                    <h4>Generate Files</h4>
                    <p>Both downloads run 100% in your browser. No personal data ever leaves your device.</p>
                    
                    <div className={styles.actionsVertical}>
                      {/* PDF Export trigger */}
                      <button onClick={handleDownloadPDF} className={`btn btn-accent ${styles.actionExportBtn}`}>
                        <Download size={20} />
                        <span>Download Resume PDF</span>
                      </button>

                      {/* ZIP Export trigger */}
                      <button onClick={handleDownloadPortfolio} className={`btn btn-primary ${styles.actionExportBtn}`}>
                        <FileDown size={20} />
                        <span>Download Portfolio ZIP</span>
                      </button>

                      {/* Reset form trigger */}
                      <button onClick={handleClearDraft} className={styles.btnClearDraft}>
                        Reset Draft Form
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Form navigation footer bar */}
            <div className={styles.formFooter}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
              
              {activeStep < 4 ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={() => setShowDonation(true)} className="btn btn-accent">
                  <Heart size={16} />
                  <span>Support Project</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: The live vector-sharp print preview panel */}
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <span className={styles.liveBadge}>Live A4 Print Preview</span>
              <span className={styles.previewHint}>This matches exactly what saves as PDF (A4 size).</span>
            </div>
            
            {/* The printable A4 paper view box */}
            <div 
              id="resume-printable-area" 
              className={`${styles.resumeA4Page} ${
                activeTemplate === 'modern' ? styles.templateModern : styles.templateElegant
              }`}
            >
              
              {/* Header profile names & details */}
              <div className={styles.resumeHeaderBlock}>
                <h1 className={styles.resumeName}>{formData.personal.fullName || 'YOUR NAME'}</h1>
                <p className={styles.resumeRoleSubtitle}>{formData.personal.role || 'TARGET ROLE / TITLE'}</p>
                
                <div className={styles.resumeContactBar}>
                  {formData.personal.email && <span>{formData.personal.email}</span>}
                  {formData.personal.phone && <span>{formData.personal.phone}</span>}
                  {formData.personal.github && <span>GitHub</span>}
                  {formData.personal.linkedin && <span>LinkedIn</span>}
                </div>
              </div>

              {/* Professional Summary */}
              {formData.personal.summary && (
                <div className={styles.resumeSectionBlock}>
                  <h3 className={styles.resumeSecTitle}>Professional Summary</h3>
                  <div className={styles.resumeSecDivider}></div>
                  <p className={styles.resumeSummaryText}>{formData.personal.summary}</p>
                </div>
              )}

              {/* Work Experience timelines */}
              {formData.experience.some(e => e.company || e.role) && (
                <div className={styles.resumeSectionBlock}>
                  <h3 className={styles.resumeSecTitle}>Work Experience</h3>
                  <div className={styles.resumeSecDivider}></div>
                  {formData.experience.map((exp, idx) => (
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

              {/* Projects lists */}
              {formData.projects.some(p => p.name || p.description) && (
                <div className={styles.resumeSectionBlock}>
                  <h3 className={styles.resumeSecTitle}>Key Projects</h3>
                  <div className={styles.resumeSecDivider}></div>
                  {formData.projects.map((proj, idx) => (
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

              {/* Education history */}
              {formData.education.some(e => e.institution || e.degree) && (
                <div className={styles.resumeSectionBlock}>
                  <h3 className={styles.resumeSecTitle}>Education</h3>
                  <div className={styles.resumeSecDivider}></div>
                  {formData.education.map((edu, idx) => (
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

              {/* Skills summary block */}
              {formData.skills && (
                <div className={styles.resumeSectionBlock}>
                  <h3 className={styles.resumeSecTitle}>Skills & Technologies</h3>
                  <div className={styles.resumeSecDivider}></div>
                  <p className={styles.resumeSkillsText}>{formData.skills}</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Tipping scanner modal popup */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
}
