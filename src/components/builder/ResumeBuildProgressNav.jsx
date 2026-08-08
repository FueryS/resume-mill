/**
 * ResumeBuildProgressNav.jsx
 * 
 * Purpose:
 * Renders the multi-step navigation controls at the top of the builder panel.
 * Displays interactive icons indicating progress through the form steps.
 * Includes interactive Undo (Ctrl+Z) and Redo (Ctrl+Y) buttons.
 * Provides a text label identifying the active step's sequence.
 */

'use client';

import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function ResumeBuildProgressNav({
  steps,
  activeStep,
  setActiveStep,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) {
  return (
    <div className={styles.formHeader}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px', flexWrap: 'wrap' }}>
        {/* Visual step progress line with interactive nodes */}
        <div className={styles.formStepIndicators}>
          {steps.map((step, idx) => (
            <button 
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`${styles.stepIndicator} ${activeStep === idx ? styles.active : ''}`}
              title={step.name}
            >
              {step.icon}
            </button>
          ))}
        </div>

        {/* Undo / Redo controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-primary, #ffffff)',
              color: canUndo ? 'var(--primary, #4f46e5)' : '#9ca3af',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              opacity: canUndo ? 1 : 0.4,
              transition: 'all 0.2s ease'
            }}
            title={canUndo ? "Undo change (Ctrl+Z)" : "Nothing to undo"}
          >
            <RotateCcw size={14} />
            <span style={{ fontSize: '11.5px' }}>Undo</span>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-primary, #ffffff)',
              color: canRedo ? 'var(--primary, #4f46e5)' : '#9ca3af',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              opacity: canRedo ? 1 : 0.4,
              transition: 'all 0.2s ease'
            }}
            title={canRedo ? "Redo change (Ctrl+Y)" : "Nothing to redo"}
          >
            <RotateCw size={14} />
            <span style={{ fontSize: '11.5px' }}>Redo</span>
          </button>
        </div>
      </div>

      {/* Descriptive step labels indicating index */}
      <div className={styles.stepLabel} style={{ marginTop: '10px' }}>
        <span>Step {activeStep + 1} of {steps.length}:</span> {steps[activeStep].name}
      </div>
    </div>
  );
}
