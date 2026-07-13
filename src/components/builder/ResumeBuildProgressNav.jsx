/**
 * ResumeBuildProgressNav.jsx
 * 
 * Purpose:
 * Renders the multi-step navigation controls at the top of the builder panel.
 * Displays interactive icons indicating progress through the form steps.
 * Provides a text label identifying the active step's sequence.
 */

'use client';

import React from 'react';
import styles from '@/app/builder/page.module.css';

export default function ResumeBuildProgressNav({ steps, activeStep, setActiveStep }) {
  return (
    <div className={styles.formHeader}>
      {/* Visual step progress line with interactive nodes */}
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
      
      {/* Descriptive step labels indicating index */}
      <div className={styles.stepLabel}>
        <span>Step {activeStep + 1} of {steps.length}:</span> {steps[activeStep].name}
      </div>
    </div>
  );
}
