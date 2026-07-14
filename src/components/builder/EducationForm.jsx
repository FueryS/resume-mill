/**
 * EducationForm.jsx
 *
 * Purpose:
 * Renders the form inputs for Step 4 of the resume builder:
 * Multiple academic qualification entries (Degree, Institution, Dates, Grade).
 * Each entry has a grade-type selector:
 *   - 'degree'  → CGPA field
 *   - 'board'   → Percentage or Marks (user chooses via radio)
 *   - 'custom'  → User-defined label + value
 * Supports drag-and-drop reordering with smooth native HTML5 dragover swaps.
 * Supports collapsing/expanding individual cards for mobile friendliness.
 */

'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2, ChevronDown, GripVertical } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import eduStyles from './EducationForm.module.css';

// ─── Constants ───────────────────────────────────────────────────────────────

/** The three education credential types the user can select */
const GRADE_TYPES = [
  { value: 'degree', label: 'Degree' },
  { value: 'board',  label: 'Board'  },
  { value: 'custom', label: 'Custom' },
];

/** Board sub-formats */
const BOARD_FORMATS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'marks',      label: 'Marks'      },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the appropriate label for the grade input field
 * based on the selected grade type and board sub-format.
 */
function resolveGradeLabel(gradeType, boardGradeFormat, customGradeLabel) {
  if (gradeType === 'degree') return 'CGPA';
  if (gradeType === 'board') {
    return boardGradeFormat === 'marks' ? 'Marks Obtained' : 'Percentage';
  }
  return customGradeLabel.trim() || 'Grade';
}

/**
 * Returns the placeholder text for the grade input field.
 */
function resolveGradePlaceholder(gradeType, boardGradeFormat) {
  if (gradeType === 'degree') return 'e.g. 9.2';
  if (gradeType === 'board') {
    return boardGradeFormat === 'marks' ? 'e.g. 456 / 500' : 'e.g. 88.4%';
  }
  return 'Enter value';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EducationForm({
  education,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  moveArrayItem,
  reorderArrayItem,
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
    reorderArrayItem('education', draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    isHandleGrabbed.current = false;
  };

  return (
    <div className={`${styles.formSection} animate-scale-in`}>

      {/* ── SECTION A: Academic Qualifications ───────────────────────────── */}
      <h4 className={styles.subsectionTitle}>Education History</h4>

      {education.map((edu, idx) => {
        const gradeType       = edu.gradeType       || 'degree';
        const boardGradeFormat = edu.boardGradeFormat || 'percentage';
        const customGradeLabel = edu.customGradeLabel || '';

        const gradeLabel       = resolveGradeLabel(gradeType, boardGradeFormat, customGradeLabel);
        const gradePlaceholder = resolveGradePlaceholder(gradeType, boardGradeFormat);

        return (
          <div 
            key={edu.id} 
            className={`${styles.itemCard} ${draggedIndex === idx ? styles.itemCardDragging : ''}`}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
          >

            {/* Card header: index + remove */}
            <div className={styles.itemCardHeader}>
              <div 
                className={styles.cardHeaderTitle}
                onClick={() => toggleCollapse(edu.id)}
                title={collapsedState[edu.id] ? "Expand Details" : "Collapse Details"}
              >
                <div className={`${styles.collapseIcon} ${collapsedState[edu.id] ? styles.collapseIconRotated : ''}`}>
                  <ChevronDown size={16} />
                </div>
                <h5>
                  {collapsedState[edu.id] 
                    ? `Institution #${idx + 1} - ${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}`
                    : `Institution #${idx + 1}`}
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
                  onClick={() => removeArrayItem('education', edu.id)}
                  title="Remove Education"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Card Inputs body (hidden when collapsed) */}
            <div className={collapsedState[edu.id] ? styles.cardBodyCollapsed : ''}>
              {/* Institution and Degree title */}
              <div className={styles.formRow} style={{ marginTop: '15px' }}>
                <div className={styles.formGroup}>
                  <label>Institution Name</label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) =>
                      handleArrayChange('education', edu.id, 'institution', e.target.value)
                    }
                    placeholder="Indian Institute of Technology"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Degree / Qualification</label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) =>
                      handleArrayChange('education', edu.id, 'degree', e.target.value)
                    }
                    placeholder="Bachelor of Technology in Computer Science"
                  />
                </div>
              </div>

              {/* Location and Dates */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={edu.location || ''}
                    onChange={(e) =>
                      handleArrayChange('education', edu.id, 'location', e.target.value)
                    }
                    placeholder="Mumbai, India"
                  />
                </div>
                <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
                  <div className={styles.formGroup}>
                    <label>Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) =>
                        handleArrayChange('education', edu.id, 'startDate', e.target.value)
                      }
                      placeholder="2021"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Date (or Expected)</label>
                    <input
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) =>
                        handleArrayChange('education', edu.id, 'endDate', e.target.value)
                      }
                      placeholder="2025"
                    />
                  </div>
                </div>
              </div>

              {/* ── Grade Type Selector ──────────────────────────────────────── */}
              <div className={eduStyles.gradeTypeSection}>
                <label className={eduStyles.gradeTypeSectionLabel}>Credential Type</label>

                {/* Segmented control */}
                <div className={eduStyles.segmentedControl} role="group" aria-label="Credential type">
                  {GRADE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      role="radio"
                      aria-checked={gradeType === type.value}
                      className={`${eduStyles.segmentBtn} ${gradeType === type.value ? eduStyles.segmentBtnActive : ''}`}
                      onClick={() =>
                        handleArrayChange('education', edu.id, 'gradeType', type.value)
                      }
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Board sub-choice: Percentage vs Marks */}
                {gradeType === 'board' && (
                  <div className={eduStyles.boardFormatRow}>
                    {BOARD_FORMATS.map((fmt) => (
                      <label key={fmt.value} className={eduStyles.radioLabel}>
                        <input
                          type="radio"
                          name={`boardGradeFormat-${edu.id}`}
                          value={fmt.value}
                          checked={boardGradeFormat === fmt.value}
                          onChange={() =>
                            handleArrayChange('education', edu.id, 'boardGradeFormat', fmt.value)
                          }
                        />
                        <span>{fmt.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Custom: user-defined label row */}
                {gradeType === 'custom' && (
                  <div className={eduStyles.customLabelRow}>
                    <div className={styles.formGroup}>
                      <label>Field Label</label>
                      <input
                        type="text"
                        value={customGradeLabel}
                        onChange={(e) =>
                          handleArrayChange('education', edu.id, 'customGradeLabel', e.target.value)
                        }
                        placeholder='e.g. "Score", "GPA", "Honours"'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Grade value input — label and placeholder change based on type */}
              <div className={styles.formGroup}>
                <label>{gradeLabel}</label>
                <input
                  type="text"
                  value={edu.grade || ''}
                  onChange={(e) =>
                    handleArrayChange('education', edu.id, 'grade', e.target.value)
                  }
                  placeholder={gradePlaceholder}
                />
              </div>
            </div>

          </div>
        );
      })}

      {/* Button to add an additional education card */}
      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('education')}
      >
        <Plus size={16} />
        <span>Add Education</span>
      </button>

    </div>
  );
}
