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

import { useState, useEffect, useRef } from 'react';
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
    { id: '1', company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', group: 'none' }
  ],
  projects: [
    { id: '1', name: '', description: '', technologies: '', githubFront: '', githubBack: '', liveUrl: '', group: 'none' }
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
      group: 'none',
    }
  ],
  skills: [
    { id: '1', name: '', level: 5, group: 'none' }
  ],
  showSkillRating: false,
  languages: [],
  certifications: [],
  achievements: [],
  sectionGroups: {
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: []
  },
  ungroupedPosition: {
    experience: 'start',
    projects: 'start',
    education: 'start',
    skills: 'start',
    certifications: 'start',
    achievements: 'start'
  }
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

  // State representing whether to show full URL strings in template rendering
  const [showFullUrls, setShowFullUrls] = useState(false);

  // State representing custom safe zone threshold percentage (clamped 60% - 100%)
  const [safeZonePercent, setSafeZonePercent] = useState(88);

  // State representing the active mobile layout view tab ('edit' or 'preview')
  const [mobileTab, setMobileTab] = useState('edit');

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
        const generateUniqueId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Backward compatibility: Auto-migrate comma-separated skills string to array of objects
        let parsedSkills = parsed.skills;
        if (typeof parsedSkills === 'string') {
          const rawList = parsedSkills.split(',').map(s => s.trim()).filter(Boolean);
          parsedSkills = rawList.map(skillName => ({
            id: generateUniqueId(),
            name: skillName,
            level: 5,
            group: 'none'
          }));
        }
        if (!Array.isArray(parsedSkills) || parsedSkills.length === 0) {
          parsedSkills = initialFormState.skills;
        }

        const merged = {
          ...initialFormState,
          ...parsed,
          personal: {
            ...initialFormState.personal,
            ...(parsed.personal || {})
          },
          experience: (parsed.experience || initialFormState.experience).map(e => ({
            id: e.id || generateUniqueId(),
            group: e.group || 'none',
            ...e
          })),
          projects: (parsed.projects || []).map(p => ({
            ...initialFormState.projects[0],
            id: p.id || generateUniqueId(),
            group: p.group || 'none',
            ...p
          })),
          education: (parsed.education || initialFormState.education).map(edu => ({
            id: edu.id || generateUniqueId(),
            group: edu.group || 'none',
            ...edu
          })),
          languages: (parsed.languages || []).map(l => ({
            id: l.id || generateUniqueId(),
            ...l
          })),
          certifications: (parsed.certifications || []).map(c => ({
            id: c.id || generateUniqueId(),
            group: c.group || 'none',
            ...c
          })),
          achievements: (parsed.achievements || []).map(a => ({
            id: a.id || generateUniqueId(),
            group: a.group || 'none',
            ...a
          })),
          skills: parsedSkills.map(s => (typeof s === 'string' ? { id: generateUniqueId(), name: s, level: 5, group: 'none' } : { id: s.id || generateUniqueId(), group: s.group || 'none', ...s })),
          sectionGroups: {
            ...initialFormState.sectionGroups,
            ...(parsed.sectionGroups || {})
          }
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
    const savedShowFullUrls = localStorage.getItem('resume-mill-show-full-urls');
    if (savedShowFullUrls !== null) {
      setShowFullUrls(savedShowFullUrls === 'true');
    }
    const savedSafeZone = localStorage.getItem('resume-mill-safe-zone');
    if (savedSafeZone) {
      const parsed = parseInt(savedSafeZone, 10);
      if (!isNaN(parsed)) {
        setSafeZonePercent(Math.max(60, Math.min(100, parsed)));
      }
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

  // Hook to automatically persist showFullUrls choice updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resume-mill-show-full-urls', showFullUrls);
    }
  }, [showFullUrls, isLoaded]);

  // Hook to automatically persist safeZonePercent choice updates
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('resume-mill-safe-zone', safeZonePercent);
    }
  }, [safeZonePercent, isLoaded]);

  // History stacks for Undo / Redo functionality
  const [pastHistory, setPastHistory] = useState([]);
  const [futureHistory, setFutureHistory] = useState([]);
  const isPerformingUndoRedo = useRef(false);
  const debounceTimerRef = useRef(null);

  // Push a snapshot onto pastHistory stack
  const pushSnapshot = (snapshot) => {
    if (isPerformingUndoRedo.current) return;
    setPastHistory((prev) => {
      const next = [...prev, snapshot];
      if (next.length > 40) next.shift(); // Limit history depth to 40 steps
      return next;
    });
    setFutureHistory([]);
  };

  // Instant snapshot checkpoint for structural events (add, delete, reorder, group, AI apply)
  const snapshotBeforeAction = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pushSnapshot(formData);
  };

  // Debounced snapshot checkpoint for continuous text typing
  const snapshotBeforeTyping = () => {
    if (isPerformingUndoRedo.current) return;
    if (!debounceTimerRef.current) {
      pushSnapshot(formData);
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
    }, 600);
  };

  // Undo Handler
  const handleUndo = () => {
    if (pastHistory.length === 0) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isPerformingUndoRedo.current = true;
    const previousState = pastHistory[pastHistory.length - 1];
    setPastHistory((prev) => prev.slice(0, -1));
    setFutureHistory((prev) => [formData, ...prev]);
    setFormData(previousState);
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 50);
  };

  // Redo Handler
  const handleRedo = () => {
    if (futureHistory.length === 0) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isPerformingUndoRedo.current = true;
    const nextState = futureHistory[0];
    setFutureHistory((prev) => prev.slice(1));
    setPastHistory((prev) => [...prev, formData]);
    setFormData(nextState);
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 50);
  };

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y / Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pastHistory, futureHistory, formData]);

  // Handler for simple top-level personal details changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    snapshotBeforeTyping();
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [name]: value }
    }));
  };

  // Handler to modify specific attributes inside arrays (Experience, Projects, Education)
  const handleArrayChange = (section, id, field, value) => {
    snapshotBeforeTyping();
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add a new sub-group to a section
  const addGroup = (section, groupName) => {
    if (!groupName || !groupName.trim()) return;
    const cleanName = groupName.trim();
    snapshotBeforeAction();
    setFormData((prev) => {
      const currentGroups = prev.sectionGroups?.[section] || [];
      if (currentGroups.includes(cleanName)) return prev;
      return {
        ...prev,
        sectionGroups: {
          ...prev.sectionGroups,
          [section]: [...currentGroups, cleanName]
        }
      };
    });
  };

  // Rename an existing sub-group
  const renameGroup = (section, oldName, newName) => {
    if (!newName || !newName.trim() || oldName === newName) return;
    const cleanNewName = newName.trim();
    snapshotBeforeAction();
    setFormData((prev) => {
      const currentGroups = prev.sectionGroups?.[section] || [];
      const updatedGroups = currentGroups.map(g => g === oldName ? cleanNewName : g);
      const updatedItems = (prev[section] || []).map(item => 
        item.group === oldName ? { ...item, group: cleanNewName } : item
      );
      return {
        ...prev,
        [section]: updatedItems,
        sectionGroups: {
          ...prev.sectionGroups,
          [section]: updatedGroups
        }
      };
    });
  };

  // UnGroup section: deletes group container, sets cards group to "none"
  const unGroupSection = (section, groupName) => {
    snapshotBeforeAction();
    setFormData((prev) => {
      const currentGroups = prev.sectionGroups?.[section] || [];
      const updatedGroups = currentGroups.filter(g => g !== groupName);
      const updatedItems = (prev[section] || []).map(item => 
        item.group === groupName ? { ...item, group: 'none' } : item
      );
      return {
        ...prev,
        [section]: updatedItems,
        sectionGroups: {
          ...prev.sectionGroups,
          [section]: updatedGroups
        }
      };
    });
  };

  // Delete Group & Items: deletes group container AND deletes all cards inside it
  const deleteGroupAndItems = (section, groupName) => {
    snapshotBeforeAction();
    setFormData((prev) => {
      const currentGroups = prev.sectionGroups?.[section] || [];
      const updatedGroups = currentGroups.filter(g => g !== groupName);
      const updatedItems = (prev[section] || []).filter(item => item.group !== groupName);
      return {
        ...prev,
        [section]: updatedItems,
        sectionGroups: {
          ...prev.sectionGroups,
          [section]: updatedGroups
        }
      };
    });
  };

  // Update a card's assigned group
  const handleCardGroupChange = (section, id, newGroup) => {
    snapshotBeforeAction();
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).map(item => 
        item.id === id ? { ...item, group: newGroup || 'none' } : item
      )
    }));
  };

  // Reorder sub-groups within a section
  const reorderGroup = (section, fromIndex, toIndex) => {
    snapshotBeforeAction();
    setFormData((prev) => {
      const currentGroups = [...(prev.sectionGroups?.[section] || [])];
      if (fromIndex < 0 || fromIndex >= currentGroups.length || toIndex < 0 || toIndex >= currentGroups.length) {
        return prev;
      }
      const [movedGroup] = currentGroups.splice(fromIndex, 1);
      currentGroups.splice(toIndex, 0, movedGroup);
      return {
        ...prev,
        sectionGroups: {
          ...prev.sectionGroups,
          [section]: currentGroups
        }
      };
    });
  };

  // Toggle ungrouped items position ('start' or 'end') for a section
  const setUngroupedPosition = (section, position) => {
    snapshotBeforeAction();
    setFormData((prev) => ({
      ...prev,
      ungroupedPosition: {
        ...(prev.ungroupedPosition || {}),
        [section]: position
      }
    }));
  };

  // Handler to add a new card item inside listing sections
  const addArrayItem = (section) => {
    let newItem = {};
    const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    if (section === 'experience') {
      newItem = { id: uniqueId, company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '', group: 'none' };
    } else if (section === 'projects') {
      newItem = { id: uniqueId, name: '', description: '', technologies: '', githubFront: '', githubBack: '', liveUrl: '', group: 'none' };
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
        group: 'none',
      };
    } else if (section === 'skills') {
      newItem = { id: uniqueId, name: '', level: 5, group: 'none' };
    } else if (section === 'languages') {
      newItem = { id: uniqueId, name: '', level: 5 };
    } else if (section === 'certifications') {
      newItem = { id: uniqueId, name: '', organization: '', date: '', url: '', group: 'none' };
    } else if (section === 'achievements') {
      newItem = { id: uniqueId, title: '', organization: '', date: '', description: '', url: '', group: 'none' };
    }
    snapshotBeforeAction();
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem]
    }));
  };

  // Handler to remove a card item from listing sections
  const removeArrayItem = (section, id) => {
    snapshotBeforeAction();
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id)
    }));
  };

  // Handler to change the order of items inside listing sections
  const moveArrayItem = (section, id, direction) => {
    snapshotBeforeAction();
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
    snapshotBeforeAction();
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

  // Exports the current formData to a JSON file backup
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `${(formData.personal.fullName || 'Resume').replace(/\s+/g, '_')}_backup.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
      alert('Failed to export backup data.');
    }
  };

  // Safely parses and imports JSON backup data into the builder state
  const handleImportData = (importedData) => {
    const generateUniqueId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
    try {
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Invalid data format');
      }

      // Defensive merging, making sure every item has proper keys and IDs
      const merged = {
        ...initialFormState,
        ...importedData,
        personal: {
          ...initialFormState.personal,
          ...(importedData.personal || {})
        },
        experience: (importedData.experience || []).map(e => ({
          id: e.id || generateUniqueId(),
          company: e.company || '',
          role: e.role || '',
          location: e.location || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
          current: e.current || false,
          description: e.description || '',
          group: e.group || 'none'
        })),
        projects: (importedData.projects || []).map(p => ({
          id: p.id || generateUniqueId(),
          name: p.name || '',
          description: p.description || '',
          technologies: p.technologies || '',
          githubFront: p.githubFront || '',
          githubBack: p.githubBack || '',
          liveUrl: p.liveUrl || '',
          group: p.group || 'none'
        })),
        education: (importedData.education || []).map(edu => ({
          id: edu.id || generateUniqueId(),
          institution: edu.institution || '',
          degree: edu.degree || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gradeType: edu.gradeType || 'degree',
          grade: edu.grade || '',
          boardGradeFormat: edu.boardGradeFormat || 'percentage',
          customGradeLabel: edu.customGradeLabel || '',
          group: edu.group || 'none'
        })),
        languages: (importedData.languages || []).map(l => ({
          id: l.id || generateUniqueId(),
          name: l.name || '',
          level: typeof l.level === 'number' ? l.level : 5
        })),
        certifications: (importedData.certifications || []).map(c => ({
          id: c.id || generateUniqueId(),
          name: c.name || '',
          organization: c.organization || '',
          date: c.date || '',
          url: c.url || '',
          group: c.group || 'none'
        })),
        achievements: (importedData.achievements || []).map(a => ({
          id: a.id || generateUniqueId(),
          title: a.title || a.name || '',
          organization: a.organization || '',
          date: a.date || '',
          description: a.description || '',
          url: a.url || '',
          group: a.group || 'none'
        })),
        skills: typeof importedData.skills === 'string'
          ? importedData.skills.split(',').map(s => s.trim()).filter(Boolean).map(skillName => ({
              id: generateUniqueId(),
              name: skillName,
              level: 5,
              group: 'none'
            }))
          : (importedData.skills || []).map(s => (typeof s === 'string' ? { id: generateUniqueId(), name: s, level: 5, group: 'none' } : { id: s.id || generateUniqueId(), name: s.name || '', level: typeof s.level === 'number' ? s.level : 5, group: s.group || 'none' })),
        sectionGroups: {
          ...initialFormState.sectionGroups,
          ...(importedData.sectionGroups || {})
        }
      };

      setFormData(merged);
      // Persist directly to localStorage
      localStorage.setItem('resume-mill-draft', JSON.stringify(merged));
      alert('Resume data successfully imported!');
    } catch (error) {
      console.error('Failed to parse imported JSON data', error);
      alert('Invalid file format. Please upload a valid ResumeMill backup file.');
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

      const pageElements = Array.from(sheet.children);
      if (!pageElements.length) {
        alert('No pages found to export.');
        return;
      }

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

      for (let p = 0; p < pageElements.length; p++) {
        const pageEl = pageElements[p];

        // Capture individual A4 page element at scale 2.5 (crisp ~240 DPI rendering)
        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          logging: false,
        });

        // Convert page to compressed JPEG (0.92 quality) to drastically cut PDF size (from ~70MB to <700KB)
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        if (p > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

        // Add interactive links for the current page
        pdf.setPage(p + 1);
        const pageRect = pageEl.getBoundingClientRect();
        const links = pageEl.querySelectorAll('a');

        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:'))) {
            const linkRect = link.getBoundingClientRect();
            const leftPx = linkRect.left - pageRect.left;
            const topPx = linkRect.top - pageRect.top;
            const widthPx = linkRect.width;
            const heightPx = linkRect.height;

            const scaleX = 210 / 794;
            const scaleY = 297 / 1123;

            pdf.link(
              leftPx * scaleX,
              topPx * scaleY,
              widthPx * scaleX,
              heightPx * scaleY,
              { url: href }
            );
          }
        });
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
        {/* Mobile segmented control tab bar */}
        <div className={`container ${styles.mobileTabToggleBar}`}>
          <button
            type="button"
            className={`${styles.mobileTabToggleBtn} ${mobileTab === 'edit' ? styles.mobileActive : ''}`}
            onClick={() => setMobileTab('edit')}
          >
            Edit Fields
          </button>
          <button
            type="button"
            className={`${styles.mobileTabToggleBtn} ${mobileTab === 'preview' ? styles.mobileActive : ''}`}
            onClick={() => setMobileTab('preview')}
          >
            A4 Preview
          </button>
        </div>

        <div className={`container ${styles.builderGrid}`}>
          
          {/* LEFT COLUMN PANEL: Multi-step interactive inputs */}
          <div className={`${styles.formPanel} ${mobileTab === 'preview' ? styles.hideMobile : ''}`}>
            
            {/* Step navigation indicator block */}
            <ResumeBuildProgressNav 
              steps={steps}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={pastHistory.length > 0}
              canRedo={futureHistory.length > 0}
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
                  sectionGroups={formData.sectionGroups}
                  ungroupedPosition={formData.ungroupedPosition}
                  setUngroupedPosition={setUngroupedPosition}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                  addGroup={addGroup}
                  renameGroup={renameGroup}
                  unGroupSection={unGroupSection}
                  deleteGroupAndItems={deleteGroupAndItems}
                  handleCardGroupChange={handleCardGroupChange}
                  reorderGroup={reorderGroup}
                />
              )}

              {activeStep === 2 && (
                <ProjectsForm 
                  projects={formData.projects}
                  sectionGroups={formData.sectionGroups}
                  ungroupedPosition={formData.ungroupedPosition}
                  setUngroupedPosition={setUngroupedPosition}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
                  addGroup={addGroup}
                  renameGroup={renameGroup}
                  unGroupSection={unGroupSection}
                  deleteGroupAndItems={deleteGroupAndItems}
                  handleCardGroupChange={handleCardGroupChange}
                  reorderGroup={reorderGroup}
                />
              )}

              {activeStep === 3 && (
                <EducationForm 
                  education={formData.education}
                  sectionGroups={formData.sectionGroups}
                  ungroupedPosition={formData.ungroupedPosition}
                  setUngroupedPosition={setUngroupedPosition}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  addGroup={addGroup}
                  renameGroup={renameGroup}
                  unGroupSection={unGroupSection}
                  deleteGroupAndItems={deleteGroupAndItems}
                  handleCardGroupChange={handleCardGroupChange}
                  reorderGroup={reorderGroup}
                />
              )}

              {activeStep === 4 && (
                <SkillsLanguagesCertificationsForm 
                  skills={formData.skills}
                  showSkillRating={formData.showSkillRating}
                  onToggleSkillRating={(val) => {
                    snapshotBeforeAction();
                    setFormData(prev => ({ ...prev, showSkillRating: val }));
                  }}
                  languages={formData.languages}
                  certifications={formData.certifications}
                  achievements={formData.achievements}
                  sectionGroups={formData.sectionGroups}
                  ungroupedPosition={formData.ungroupedPosition}
                  setUngroupedPosition={setUngroupedPosition}
                  handleArrayChange={handleArrayChange}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                  moveArrayItem={moveArrayItem}
                  reorderArrayItem={reorderArrayItem}
                  addGroup={addGroup}
                  renameGroup={renameGroup}
                  unGroupSection={unGroupSection}
                  deleteGroupAndItems={deleteGroupAndItems}
                  handleCardGroupChange={handleCardGroupChange}
                  reorderGroup={reorderGroup}
                  handleAIQuery={handleAIQuery}
                  optimizingField={optimizingField}
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
                  showFullUrls={showFullUrls}
                  setShowFullUrls={setShowFullUrls}
                  safeZonePercent={safeZonePercent}
                  setSafeZonePercent={setSafeZonePercent}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
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
            showFullUrls={showFullUrls}
            safeZonePercent={safeZonePercent}
            isVisible={mobileTab === 'preview'}
            className={mobileTab === 'edit' ? styles.hideMobile : ''}
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
          snapshotBeforeAction();
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
