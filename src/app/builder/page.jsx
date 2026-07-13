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
  Download, Heart, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { generatePortfolioZip } from '@/utils/zipGenerator';
import DonationModal from '@/components/DonationModal';

// Sub-components import for cleaner architecture
import ResumeBuildProgressNav from '@/components/builder/ResumeBuildProgressNav';
import PersonalInfoForm from '@/components/builder/PersonalInfoForm';
import ExperienceForm from '@/components/builder/ExperienceForm';
import ProjectsForm from '@/components/builder/ProjectsForm';
import EducationForm from '@/components/builder/EducationForm';
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
  
  // State to track current form step (0 to 4)
  const [activeStep, setActiveStep] = useState(0);
  
  // State tracking if local storage has successfully mounted
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State tracking which field is calling the Gemini API to display loading indicators
  const [optimizingField, setOptimizingField] = useState(null); // format: `${section}-${id}-${field}`
  
  // State tracking display of the UPI QR scan tipping modal
  const [showDonation, setShowDonation] = useState(false);
  
  // State representing the active resume design template ('modern' or 'elegant')
  const [activeTemplate, setActiveTemplate] = useState('modern');

  // Step names and icons list
  const steps = [
    { name: 'Profile & Summary', icon: <User size={18} /> },
    { name: 'Experience', icon: <Briefcase size={18} /> },
    { name: 'Projects', icon: <FolderGit2 size={18} /> },
    { name: 'Education & Skills', icon: <GraduationCap size={18} /> },
    { name: 'Preview & Export', icon: <Download size={18} /> }
  ];

  // Hook to fetch the real-time resume draft and active template choice on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('resume-mill-draft');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
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

  // Exports the live preview panel as a PDF document using window.print()
  const handleDownloadPDF = async () => {
    fetch('/api/stats', { method: 'POST' }).catch(() => {});
    if (window.gtag) {
      window.gtag('event', 'generate_resume_pdf', {
        event_category: 'download',
        event_label: activeTemplate
      });
    }
    window.print();
    setTimeout(() => {
      setShowDonation(true);
    }, 1500);
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
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                />
              )}

              {activeStep === 3 && (
                <EducationForm 
                  education={formData.education}
                  skills={formData.skills}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  onSkillsChange={handleSkillsChange}
                />
              )}

              {activeStep === 4 && (
                <ExportPanel 
                  activeTemplate={activeTemplate}
                  setActiveTemplate={setActiveTemplate}
                  handleDownloadPDF={handleDownloadPDF}
                  handleDownloadPortfolio={handleDownloadPortfolio}
                  handleClearDraft={handleClearDraft}
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
              
              {activeStep < 4 ? (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
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
          />

        </div>
      </div>

      {/* Donation Scanner popup */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
}
