/**
 * page.jsx (Builder Page Parent)
 * 
 * Path: /builder
 * Purpose:
 * Core state hub and coordinator for the Resume Builder application.
 * Manages form state, active navigation step index, API loading logs, and modal overlays.
 * Houses draft persistence triggers (`useEffect` hooks matching LocalStorage).
 * 
 * Modular Composition:
 * Renders the parent layout grid importing highly focused sub-components:
 * 1. Progress indicator: ResumeBuildProgressNav
 * 2. Step forms: PersonalInfoForm, ExperienceForm, ProjectsForm, EducationForm
 * 3. Config/Exports panel: ExportPanel
 * 4. A4 live preview page: ResumePreview
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, FolderGit2, 
  Download, Heart, ChevronLeft, ChevronRight, Sparkles 
} from 'lucide-react';
import { generatePortfolioZip } from '@/utils/zipGenerator';
import DonationModal from '@/components/DonationModal';
import AiApprovalModal from '@/components/builder/AiApprovalModal';

// Sub-components import for cleaner architecture
import ResumeBuildProgressNav from '@/components/builder/ResumeBuildProgressNav';
import PersonalInfoForm from '@/components/builder/PersonalInfoForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import ProjectsForm from '@/components/builder/ProjectsForm';
import EducationForm from '@/components/builder/EducationForm';
import SkillsLanguagesCertificationsForm from '@/components/builder/SkillsLanguagesCertificationsForm';
import ExportPanel from '@/components/builder/ExportPanel';
import ResumePreview from '@/components/builder/ResumePreview';

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
    portfolio: '',
    location: '',
    summary: '',
    pfp: '',
  },
  experience: [
    { id: '1', company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' }
  ],
  projects: [
    { id: '1', name: '', description: '', technologies: '', githubFront: '', githubBack: '', liveUrl: '' }
  ],
  education: [
    {
      id: '1',
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      /** 'degree' | 'board' | 'custom' */
      gradeType: 'degree',
      /** grade value (CGPA, percentage, marks, or custom value) */
      grade: '',
      /** only used when gradeType === 'board': 'percentage' | 'marks' */
      boardGradeFormat: 'percentage',
      /** only used when gradeType === 'custom': user-defined label */
      customGradeLabel: '',
    }
  ],
  certifications: [],
  languages: [],
  skills: '',
};

export default function BuilderPage() {
  // Main form state capturing all user inputs
  const [formData, setFormData] = useState(initialFormState);
  
  // State to track current form step (0 to 4)
  const [activeStep, setActiveStep] = useState(0);
  
  // State tracking if local storage has successfully mounted
  const [isLoaded, setIsLoaded] = useState(false);

  // State to hold data for the AI review/approval modal
  const [aiReviewData, setAiReviewData] = useState(null);
  
  // State tracking which field is calling the Gemini API to display loading indicators
  const [optimizingField, setOptimizingField] = useState(null); // format: `${section}-${id}-${field}`
  
  // State tracking display of the UPI QR scan tipping modal
  const [showDonation, setShowDonation] = useState(false);
  
  // State representing the active resume design template ('modern' or 'elegant')
  const [activeTemplate, setActiveTemplate] = useState('modern');

  // State representing the fullscreen preview overlay modal visibility
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // State representing whether to support us with a watermark in A4 outputs
  const [supportWithWatermark, setSupportWithWatermark] = useState(true);

  // Step names and icons list
  const steps = [
    { name: 'Profile & Summary', icon: <User size={18} /> },
    { name: 'Experience', icon: <Briefcase size={18} /> },
    { name: 'Projects', icon: <FolderGit2 size={18} /> },
    { name: 'Education', icon: <GraduationCap size={18} /> },
    { name: 'Skills & Extras', icon: <Sparkles size={18} /> },
    { name: 'Preview & Export', icon: <Download size={18} /> }
  ];

  // Hook to fetch the real-time resume draft and active template choice on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('resume-mill-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Defensively merge default schemas to handle schema extensions on older drafts
        const merged = {
          ...initialFormState,
          ...parsed,
          personal: {
            ...initialFormState.personal,
            ...(parsed.personal || {})
          },
          experience: parsed.experience || initialFormState.experience,
          projects: (parsed.projects || []).map(p => ({
            ...initialFormState.projects[0],
            ...p
          })),
          education: parsed.education || initialFormState.education,
          languages: parsed.languages || [],
          certifications: parsed.certifications || [],
        };
        setFormData(merged);
      } catch (e) {
        console.error('Failed to parse saved draft', e);
      }
    }
    const savedTemplate = localStorage.getItem('resume-mill-active-template');
    if (savedTemplate) {
      setActiveTemplate(savedTemplate);
    }
    setIsLoaded(true);
  }, []);

  // Hook to automatically persist draft on form data updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resume-mill-draft', JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  // Hook to automatically persist active template choice updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resume-mill-active-template', activeTemplate);
    }
  }, [activeTemplate, isLoaded]);

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
    const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    if (section === 'experience') {
      newItem = { id: uniqueId, company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    } else if (section === 'projects') {
      newItem = { id: uniqueId, name: '', description: '', technologies: '', githubFront: '', githubBack: '', liveUrl: '' };
    } else if (section === 'education') {
      newItem = {
        id: uniqueId,
        institution: '',
        degree: '',
        location: '',
        startDate: '',
        endDate: '',
        gradeType: 'degree',
        grade: '',
        boardGradeFormat: 'percentage',
        customGradeLabel: '',
      };
    } else if (section === 'languages') {
      newItem = { id: uniqueId, name: '', level: 5 };
    } else if (section === 'certifications') {
      newItem = { id: uniqueId, name: '', organization: '', date: '', url: '' };
    }
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }));
  };

  // Handler to remove a card item from listing sections
  const removeArrayItem = (section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id)
    }));
  };

  // Handler to change the order of items inside listing sections
  const moveArrayItem = (section, id, direction) => {
    setFormData((prev) => {
      const items = [...(prev[section] || [])];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;

      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;

      return {
        ...prev,
        [section]: items
      };
    });
  };

  // Handler to drag-reorder items inside listing sections
  const reorderArrayItem = (section, startIndex, endIndex) => {
    setFormData((prev) => {
      const items = [...(prev[section] || [])];
      if (startIndex < 0 || startIndex >= items.length || endIndex < 0 || endIndex >= items.length) return prev;
      const [removed] = items.splice(startIndex, 1);
      items.splice(endIndex, 0, removed);
      return {
        ...prev,
        [section]: items
      };
    });
  };

  // Handler to modify skills summary text block
  const handleSkillsChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      skills: value
    }));
  };

  /**
   * handleAIQuery()
   * 
   * Purpose:
   * Triggers the Gemini API proxy route to rewrite user descriptions to be ATS-friendly.
   */
  const handleAIQuery = async (section, id, field, originalText) => {
    if (!originalText || !originalText.trim()) return;
    
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
        if (window.gtag) {
          window.gtag('event', 'gemini_api_call', {
            event_category: 'ai_tool',
            event_label: key
          });
        }

        setAiReviewData({
          section,
          id,
          field,
          originalText,
          optimizedText: result.optimizedText
        });
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

  // Exports the live preview as a pixel-perfect PDF using html2canvas + jsPDF
  const handleDownloadPDF = async () => {
    fetch('/api/stats', { method: 'POST' }).catch(() => {});
    if (window.gtag) {
      window.gtag('event', 'generate_resume_pdf', {
        event_category: 'download',
        event_label: activeTemplate
      });
    }

    // Target the hidden full-dimensions capturing container
    const sheet = document.getElementById('resume-pdf-capture-container');
    if (!sheet) {
      alert('Could not find resume capture container. Please try again.');
      return;
    }

    const unscaledHeight = sheet.scrollHeight || 1123;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // scale: 3 → captures at high-DPI for crisp text
      const canvas = await html2canvas(sheet, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: unscaledHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      // Pack into A4 PDF pages (210×297mm)
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // relative height in mm
      const pageHeightMm = 297;
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeightMm;

      while (heightLeft > 0.5) { // offset offset threshold
        position = -pageNum * pageHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeightMm;
        pageNum++;
      }

      const fileName = `${(formData.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);

      setTimeout(() => setShowDonation(true), 800);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Compiles and bundles user data into a ZIP portfolio website
  const handleDownloadPortfolio = async () => {
    if (window.gtag) {
      window.gtag('event', 'generate_portfolio_zip', {
        event_category: 'download',
        event_label: 'client_portfolio'
      });
    }

    try {
      const blob = await generatePortfolioZip(formData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(formData.personal.fullName || 'My').replace(/\s+/g, '_')}_Portfolio.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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
          
          {/* LEFT COLUMN PANEL: Multi-step interactive inputs */}
          <div className={styles.formPanel}>
            
            {/* Step navigation indicator block */}
            <ResumeBuildProgressNav 
              steps={steps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />

            {/* Dynamic Step form content matching state */}
            <div className={styles.formBody}>
              {activeStep === 0 && (
                <PersonalInfoForm 
                  personal={formData.personal}
                  handlePersonalChange={handlePersonalChange}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                />
              )}

              {activeStep === 1 && (
                <ExperienceForm 
                  experience={formData.experience}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                />
              )}

              {activeStep === 2 && (
                <ProjectsForm 
                  projects={formData.projects}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                />
              )}

              {activeStep === 3 && (
                <EducationForm 
                  education={formData.education}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                />
              )}

              {activeStep === 4 && (
                <SkillsLanguagesCertificationsForm 
                  skills={formData.skills}
                  languages={formData.languages}
                  certifications={formData.certifications}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  onSkillsChange={handleSkillsChange}
                />
              )}

              {activeStep === 5 && (
                <ExportPanel 
                  activeTemplate={activeTemplate}
                  setActiveTemplate={setActiveTemplate}
                  handleDownloadPDF={handleDownloadPDF}
                  handleDownloadPortfolio={handleDownloadPortfolio}
                  handleClearDraft={handleClearDraft}
                  onShowPreview={() => setShowFullscreenPreview(true)}
                  supportWithWatermark={supportWithWatermark}
                  setSupportWithWatermark={setSupportWithWatermark}
                />
              )}
            </div>

            {/* Form step navigation footer bar */}
            <div className={styles.formFooter}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
              
              {activeStep < 5 ? (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setShowDonation(true)} 
                  className="btn btn-accent"
                >
                  <Heart size={16} />
                  <span>Support Project</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN PANEL: Live updating printable A4 page */}
          <ResumePreview 
            formData={formData}
            activeTemplate={activeTemplate}
            showFullscreen={showFullscreenPreview}
            setShowFullscreen={setShowFullscreenPreview}
            supportWithWatermark={supportWithWatermark}
          />

        </div>
      </div>

      {/* Donation Scanner popup */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />

      {/* AI Approval review modal */}
      <AiApprovalModal
        isOpen={aiReviewData !== null}
        onClose={() => setAiReviewData(null)}
        originalText={aiReviewData?.originalText || ''}
        optimizedText={aiReviewData?.optimizedText || ''}
        onApprove={() => {
          if (!aiReviewData) return;
          const { section, id, field, optimizedText } = aiReviewData;
          if (section === 'personal') {
            setFormData((prev) => ({
              ...prev,
              personal: { ...prev.personal, [field]: optimizedText }
            }));
          } else {
            handleArrayChange(section, id, field, optimizedText);
          }
          setAiReviewData(null);
        }}
      />
    </>
  );
}
