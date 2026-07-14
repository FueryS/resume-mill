/**
 * ProjectsForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 3 of the resume builder:
 * Inputting details about personal projects, repo links, tech stacks, and details.
 * Integrates Gemini AI to write concise, metric-focused descriptions.
 * Supports drag-and-drop reordering with smooth native HTML5 dragover swaps.
 * Supports collapsing/expanding individual cards for mobile friendliness.
 */

'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, Sparkles, RefreshCw, ChevronDown, GripVertical } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ProjectsForm({
  projects,
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
    reorderArrayItem('projects', draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    isHandleGrabbed.current = false;
  };

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* Projects list */}
      {projects.map((proj, idx) => (
        <div 
          key={proj.id} 
          className={`${styles.itemCard} ${draggedIndex === idx ? styles.itemCardDragging : ''}`}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
        >
          
          {/* Card header with index and remove trigger */}
          <div className={styles.itemCardHeader}>
            <div 
              className={styles.cardHeaderTitle}
              onClick={() => toggleCollapse(proj.id)}
              title={collapsedState[proj.id] ? "Expand Details" : "Collapse Details"}
            >
              <div className={`${styles.collapseIcon} ${collapsedState[proj.id] ? styles.collapseIconRotated : ''}`}>
                <ChevronDown size={16} />
              </div>
              <h5>
                {collapsedState[proj.id] 
                  ? `Project #${idx + 1} - ${proj.name || 'Project Name'}`
                  : `Project #${idx + 1}`}
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
                onClick={() => removeArrayItem('projects', proj.id)}
                title="Remove Project"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Card Inputs body (hidden when collapsed) */}
          <div className={collapsedState[proj.id] ? styles.cardBodyCollapsed : ''}>
            {/* Project Name & Live Link */}
            <div className={styles.formRow} style={{ marginTop: '15px' }}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text"
                  value={proj.name || ''}
                  onChange={(e) => handleArrayChange('projects', proj.id, 'name', e.target.value)}
                  placeholder="E-Commerce Store"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Live Demo URL</label>
                <input 
                  type="url"
                  value={proj.liveUrl || ''}
                  onChange={(e) => handleArrayChange('projects', proj.id, 'liveUrl', e.target.value)}
                  placeholder="https://my-app.vercel.app"
                />
              </div>
            </div>

            {/* GitHub links */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Front-end Code Repository</label>
                <input 
                  type="url"
                  value={proj.githubFront || ''}
                  onChange={(e) => handleArrayChange('projects', proj.id, 'githubFront', e.target.value)}
                  placeholder="https://github.com/username/repo-frontend"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Back-end Code Repository</label>
                <input 
                  type="url"
                  value={proj.githubBack || ''}
                  onChange={(e) => handleArrayChange('projects', proj.id, 'githubBack', e.target.value)}
                  placeholder="https://github.com/username/repo-backend"
                />
              </div>
            </div>

            {/* Technologies used input */}
            <div className={styles.formGroup}>
              <label>Technologies Used (comma separated)</label>
              <input 
                type="text"
                value={proj.technologies || ''}
                onChange={(e) => handleArrayChange('projects', proj.id, 'technologies', e.target.value)}
                placeholder="Next.js, TailwindCSS, MongoDB, Stripe"
              />
            </div>

            {/* Project description and Gemini ATS Rewrite button */}
            <div className={styles.formGroup}>
              <div className={styles.labelWithAi}>
                <label>Project Description</label>
                <button 
                  type="button"
                  className={styles.btnAiOptimize}
                  onClick={() => handleAIQuery('projects', proj.id, 'description', proj.description)}
                  disabled={optimizingField === `projects-${proj.id}-description` || !proj.description?.trim()}
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
                value={proj.description || ''}
                onChange={(e) => handleArrayChange('projects', proj.id, 'description', e.target.value)}
                placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
              />
            </div>
          </div>
        </div>
      ))}

      {/* Button to add an additional project entry */}
      <button 
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`} 
        onClick={() => addArrayItem('projects')}
      >
        <Plus size={16} />
        <span>Add Project</span>
      </button>
      
    </div>
  );
}
