/**
 * ProjectsForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 3 of the resume builder:
 * Inputting details about personal projects, repo links, tech stacks, and details.
 * Integrates Gemini AI to write concise, metric-focused descriptions.
 */

'use client';

import React from 'react';
import { Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ProjectsForm({
  projects,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  handleAIQuery,
  optimizingField
}) {
  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* Projects list */}
      {projects.map((proj, idx) => (
        <div key={proj.id} className={styles.itemCard}>
          
          {/* Card header with index and remove trigger */}
          <div className={styles.itemCardHeader}>
            <h5>Project #{idx + 1}</h5>
            <button 
              type="button"
              className={styles.btnRemove} 
              onClick={() => removeArrayItem('projects', proj.id)}
              title="Remove Project"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Project Name & Live Link */}
          <div className={styles.formRow}>
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
              placeholder="Briefly describe what you built, what tech stack was chosen, and key performance improvements."
            />
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
