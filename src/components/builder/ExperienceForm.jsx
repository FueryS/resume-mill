/**
 * ExperienceForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 2 of the resume builder:
 * Inputting multiple previous job titles, company names, locations, dates, and job descriptions.
 * Integrates Google Gemini AI to rewrite job descriptions using action verbs and metrics.
 * Supports drag-and-drop reordering with smooth native HTML5 dragover swaps.
 * Supports collapsing/expanding individual cards for mobile friendliness.
 */

'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Sparkles, RefreshCw, ChevronDown, GripVertical } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ExperienceForm({
  experience,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  moveArrayItem,
  reorderArrayItem,
  handleAIQuery,
  optimizingField
}) {
  // State to track collapsed cards (id -> boolean)
  const [collapsedState, setCollapsedState] = useState({});
  // State to track drag indices
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Track if drag handle is grabbed
  const isHandleGrabbed = useRef(false);

  const toggleCollapse = (id) => {
    setCollapsedState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, index) => {
    if (!isHandleGrabbed.current) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Smoothly swap list elements in state on dragover
    reorderArrayItem('experience', draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    isHandleGrabbed.current = false;
  };

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* Experience history entries */}
      {experience.map((exp, idx) => (
        <div 
          key={exp.id} 
          className={`${styles.itemCard} ${draggedIndex === idx ? styles.itemCardDragging : ''}`}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
        >
          
          {/* Card Header showing company index and remove trigger */}
          <div className={styles.itemCardHeader}>
            <div 
              className={styles.cardHeaderTitle}
              onClick={() => toggleCollapse(exp.id)}
              title={collapsedState[exp.id] ? "Expand Details" : "Collapse Details"}
            >
              <div className={`${styles.collapseIcon} ${collapsedState[exp.id] ? styles.collapseIconRotated : ''}`}>
                <ChevronDown size={16} />
              </div>
              <h5>
                {collapsedState[exp.id] 
                  ? `Position #${idx + 1} - ${exp.role || 'Role'} at ${exp.company || 'Company'}`
                  : `Position #${idx + 1}`}
              </h5>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              {/* Drag Handle */}
              <div
                className={styles.dragHandle}
                onMouseDown={() => { isHandleGrabbed.current = true; }}
                onMouseUp={() => { isHandleGrabbed.current = false; }}
                onTouchStart={() => { isHandleGrabbed.current = true; }}
                onTouchEnd={() => { isHandleGrabbed.current = false; }}
                title="Drag to Reorder"
              >
                <GripVertical size={16} />
              </div>
              <button 
                type="button"
                className={styles.btnRemove} 
                onClick={() => removeArrayItem('experience', exp.id)}
                title="Remove Position"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          {/* Card Inputs body (hidden when collapsed) */}
          <div className={collapsedState[exp.id] ? styles.cardBodyCollapsed : ''}>
            {/* Company and Role Input */}
            <div className={styles.formRow} style={{ marginTop: '15px' }}>
              <div className={styles.formGroup}>
                <label>Company / Organization</label>
                <input 
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)}
                  placeholder="Google"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Job Title / Role</label>
                <input 
                  type="text"
                  value={exp.role || ''}
                  onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)}
                  placeholder="Software Engineering Intern"
                />
              </div>
            </div>

            {/* Location and Timelines */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input 
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => handleArrayChange('experience', exp.id, 'location', e.target.value)}
                  placeholder="Bangalore, India"
                />
              </div>
              
              <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input 
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => handleArrayChange('experience', exp.id, 'startDate', e.target.value)}
                    placeholder="June 2024"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input 
                    type="text"
                    value={exp.endDate || ''}
                    disabled={exp.current}
                    onChange={(e) => handleArrayChange('experience', exp.id, 'endDate', e.target.value)}
                    placeholder={exp.current ? 'Present' : 'August 2024'}
                  />
                </div>
              </div>
            </div>

            {/* Current Job checkbox */}
            <div className={styles.formCheckbox}>
              <input 
                type="checkbox"
                id={`current-${exp.id}`}
                checked={exp.current || false}
                onChange={(e) => handleArrayChange('experience', exp.id, 'current', e.target.checked)}
              />
              <label htmlFor={`current-${exp.id}`}>I currently work here</label>
            </div>

            {/* Job Description and Gemini ATS Rewrite button */}
            <div className={styles.formGroup}>
              <div className={styles.labelWithAi}>
                <label>Job Description & Achievements</label>
                <button 
                  type="button"
                  className={styles.btnAiOptimize}
                  onClick={() => handleAIQuery('experience', exp.id, 'description', exp.description)}
                  disabled={optimizingField === `experience-${exp.id}-description` || !exp.description?.trim()}
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
                value={exp.description || ''}
                onChange={(e) => handleArrayChange('experience', exp.id, 'description', e.target.value)}
                placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
              />
            </div>
          </div>
        </div>
      ))}

      {/* Button to add an additional work entry */}
      <button 
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`} 
        onClick={() => addArrayItem('experience')}
      >
        <Plus size={16} />
        <span>Add Experience</span>
      </button>
      
    </div>
  );
}
