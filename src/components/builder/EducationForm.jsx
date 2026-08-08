/**
 * EducationForm.jsx
 *
 * Purpose:
 * Renders the form inputs for Step 4 of the resume builder:
 * Multiple academic qualification entries with sub-grouping support, card group dropdowns, drag targets, and Grade Types.
 * Auto-collapses all entry cards and sub-category groups whenever total entry count reaches 5 or multiples of 5 (>= 5).
 * Supports placing ungrouped items either at the start (above groups) or at the end (below groups).
 * Supports dragging and reordering sub-category groups.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, GripVertical, GraduationCap } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import eduStyles from './EducationForm.module.css';
import SectionHeaderWithGroup from './SectionHeaderWithGroup';
import GroupDeleteModal from './GroupDeleteModal';
import GroupHeader from './GroupHeader';

const GRADE_TYPES = [
  { value: 'degree', label: 'Degree' },
  { value: 'board',  label: 'Board'  },
  { value: 'custom', label: 'Custom' },
];

const BOARD_FORMATS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'marks',      label: 'Marks'      },
];

function resolveGradeLabel(gradeType, boardGradeFormat, customGradeLabel) {
  if (gradeType === 'degree') return 'CGPA';
  if (gradeType === 'board') {
    return boardGradeFormat === 'marks' ? 'Marks Obtained' : 'Percentage';
  }
  return customGradeLabel.trim() || 'Grade';
}

function resolveGradePlaceholder(gradeType, boardGradeFormat) {
  if (gradeType === 'degree') return 'e.g. 9.2';
  if (gradeType === 'board') {
    return boardGradeFormat === 'marks' ? 'e.g. 456 / 500' : 'e.g. 88.4%';
  }
  return 'Enter value';
}

export default function EducationForm({
  education,
  sectionGroups,
  ungroupedPosition,
  setUngroupedPosition,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  moveArrayItem,
  reorderArrayItem,
  addGroup,
  renameGroup,
  unGroupSection,
  deleteGroupAndItems,
  handleCardGroupChange,
  reorderGroup,
  collapsedStates = {},
  onToggleCollapsed
}) {
  const eduList = education || [];
  const totalCount = eduList.length;
  const isAutoCollapsed = totalCount >= 5;
  const currentUngroupedPos = ungroupedPosition?.education || 'start';

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [draggedGroupName, setDraggedGroupName] = useState(null);

  const isHandleGrabbed = useRef(false);
  const isGroupHandleGrabbed = useRef(false);

  // Group Delete Modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    groupName: '',
    itemCount: 0
  });

  const toggleCollapse = (id) => {
    if (onToggleCollapsed) {
      onToggleCollapsed(id, isAutoCollapsed);
    }
  };

  const toggleGroupCollapse = (groupName) => {
    setCollapsedGroups((prev) => {
      const current = prev[groupName] !== undefined ? prev[groupName] : isAutoCollapsed;
      return { ...prev, [groupName]: !current };
    });
  };

  const openDeleteModal = (groupName) => {
    const count = eduList.filter(item => item.group === groupName).length;
    setDeleteModalState({ isOpen: true, groupName, itemCount: count });
  };

  const handleGroupDragOver = (e, targetGroup) => {
    e.preventDefault();
    if (draggedGroupName && draggedGroupName !== targetGroup) {
      const currentGroups = sectionGroups?.education || [];
      const fromIdx = currentGroups.indexOf(draggedGroupName);
      const toIdx = currentGroups.indexOf(targetGroup);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorderGroup('education', fromIdx, toIdx);
      }
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleGroupDrop = (e, targetGroup) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedGroupName) {
      setDraggedGroupName(null);
      isGroupHandleGrabbed.current = false;
      return;
    }
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      handleCardGroupChange('education', cardId, targetGroup);
    }
    setDraggedCardId(null);
    isHandleGrabbed.current = false;
  };

  const handleGroupContainerDragStart = (e, groupName) => {
    if (!isGroupHandleGrabbed.current) return;
    setDraggedGroupName(groupName);
    e.dataTransfer.setData('text/group', groupName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupContainerDragEnd = () => {
    setDraggedGroupName(null);
    isGroupHandleGrabbed.current = false;
  };

  const handleCardDragStart = (e, cardId) => {
    if (!isHandleGrabbed.current) {
      e.preventDefault();
      return;
    }
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    isHandleGrabbed.current = false;
  };

  const ungroupedItems = eduList.filter(item => !item.group || item.group === 'none');

  const renderUngroupedContainer = () => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleGroupDrop(e, 'none')}
      className={eduStyles.ungroupedContainer}
    >
      <div className={eduStyles.ungroupedHeaderRow}>
        <span className={eduStyles.ungroupedTitle}>
          Ungrouped Items ({ungroupedItems.length})
        </span>
        <div className={eduStyles.positionToggleGroup}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Position:</span>
          <button
            type="button"
            onClick={() => setUngroupedPosition && setUngroupedPosition('education', 'start')}
            className={`${eduStyles.positionToggleBtn} ${currentUngroupedPos === 'start' ? eduStyles.positionToggleBtnActive : ''}`}
            title="Place ungrouped items at start (above groups)"
          >
            At Start ↑
          </button>
          <button
            type="button"
            onClick={() => setUngroupedPosition && setUngroupedPosition('education', 'end')}
            className={`${eduStyles.positionToggleBtn} ${currentUngroupedPos === 'end' ? eduStyles.positionToggleBtnActive : ''}`}
            title="Place ungrouped items at end (below groups)"
          >
            At End ↓
          </button>
        </div>
      </div>

      {ungroupedItems.map((edu, idx) => (
        <RenderEduCard
          key={edu.id || idx}
          edu={edu}
          idx={idx}
          eduList={eduList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          collapsed={
            collapsedStates[edu.id] !== undefined
              ? collapsedStates[edu.id]
              : isAutoCollapsed
          }
          toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(edu.id, isAutoCollapsed) : toggleCollapse(edu.id)}
          isHandleGrabbed={isHandleGrabbed}
          draggedCardId={draggedCardId}
          reorderArrayItem={reorderArrayItem}
          handleCardDragStart={handleCardDragStart}
          handleCardDragEnd={handleCardDragEnd}
        />
      ))}
    </div>
  );

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      <SectionHeaderWithGroup
        icon={GraduationCap}
        title="Education History"
        onAddGroup={() => {
          const currentGroups = sectionGroups?.education || [];
          addGroup('education', `Group ${currentGroups.length + 1}`);
        }}
      />

      {/* Render Ungrouped at Start if selected */}
      {currentUngroupedPos === 'start' && renderUngroupedContainer()}

      {/* Sub-Group Containers for Education */}
      {(sectionGroups?.education || []).map((groupName) => {
        const groupItems = eduList.filter(item => item.group === groupName);
        const isCollapsible = groupItems.length > 2 || isAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[`edu-group-${groupName}`] !== undefined
            ? collapsedStates[`edu-group-${groupName}`]
            : (collapsedGroups[groupName] !== undefined ? collapsedGroups[groupName] : isAutoCollapsed)
        );
        const isGroupDragging = draggedGroupName === groupName;

        return (
          <div
            key={groupName}
            draggable={true}
            onDragStart={(e) => handleGroupContainerDragStart(e, groupName)}
            onDragOver={(e) => handleGroupDragOver(e, groupName)}
            onDrop={(e) => handleGroupDrop(e, groupName)}
            onDragEnd={handleGroupContainerDragEnd}
            style={{
              border: '2px dashed var(--primary, #4f46e5)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: isGroupDragging ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.03)',
              opacity: isGroupDragging ? 0.6 : 1,
              transition: 'background-color 0.2s ease, opacity 0.2s ease',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <GroupHeader
              groupName={groupName}
              itemCount={groupItems.length}
              onRename={(newName) => renameGroup('education', groupName, newName)}
              onDelete={() => openDeleteModal(groupName)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => { if (onToggleCollapsed) onToggleCollapsed(`edu-group-${groupName}`, isAutoCollapsed); toggleGroupCollapse(groupName); }}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((edu, idx) => (
              <RenderEduCard
                key={edu.id || idx}
                edu={edu}
                idx={idx}
                eduList={eduList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                collapsed={
                  collapsedStates[edu.id] !== undefined
                    ? collapsedStates[edu.id]
                    : isAutoCollapsed
                }
                toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(edu.id, isAutoCollapsed) : toggleCollapse(edu.id)}
                isHandleGrabbed={isHandleGrabbed}
                draggedCardId={draggedCardId}
                reorderArrayItem={reorderArrayItem}
                handleCardDragStart={handleCardDragStart}
                handleCardDragEnd={handleCardDragEnd}
              />
            ))}
          </div>
        );
      })}

      {/* Render Ungrouped at End if selected */}
      {currentUngroupedPos === 'end' && renderUngroupedContainer()}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('education')}
      >
        <Plus size={16} />
        <span>Add Education</span>
      </button>

      <GroupDeleteModal
        isOpen={deleteModalState.isOpen}
        groupName={deleteModalState.groupName}
        itemCount={deleteModalState.itemCount}
        onClose={() => setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 })}
        onUnGroup={() => {
          unGroupSection('education', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
        onDeleteAll={() => {
          deleteGroupAndItems('education', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
      />
    </div>
  );
}

function RenderEduCard({
  edu,
  idx,
  eduList,
  sectionGroups,
  handleArrayChange,
  removeArrayItem,
  handleCardGroupChange,
  collapsed,
  toggleCollapse,
  isHandleGrabbed,
  draggedCardId,
  reorderArrayItem,
  handleCardDragStart,
  handleCardDragEnd
}) {
  const isDragging = draggedCardId === edu.id;
  const gradeType       = edu.gradeType       || 'degree';
  const boardGradeFormat = edu.boardGradeFormat || 'percentage';
  const customGradeLabel = edu.customGradeLabel || '';

  const gradeLabel       = resolveGradeLabel(gradeType, boardGradeFormat, customGradeLabel);
  const gradePlaceholder = resolveGradePlaceholder(gradeType, boardGradeFormat);

  return (
    <div 
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, edu.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedCardId || draggedCardId === edu.id) return;
        const fromIdx = eduList.findIndex(item => item.id === draggedCardId);
        const toIdx = eduList.findIndex(item => item.id === edu.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('education', fromIdx, toIdx);
        }
      }}
      onDragEnd={handleCardDragEnd}
    >
      <div className={styles.itemCardHeader}>
        <div 
          className={styles.cardHeaderTitle}
          onClick={toggleCollapse}
          title={collapsed ? "Expand Details" : "Collapse Details"}
        >
          <div className={`${styles.collapseIcon} ${collapsed ? styles.collapseIconRotated : ''}`}>
            <ChevronDown size={16} />
          </div>
          <h5>
            {collapsed 
              ? `Institution #${idx + 1} - ${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}`
              : `Institution #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={edu.group || 'none'}
              onChange={(e) => handleCardGroupChange('education', edu.id, e.target.value)}
              style={{
                color: (edu.group === 'none' || !edu.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.education || []).map((g) => (
                <option key={g} value={g} style={{ color: 'var(--text-main)' }}>{g}</option>
              ))}
            </select>
          </div>

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

      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup}>
            <label>Institution Name</label>
            <input
              type="text"
              value={edu.institution || ''}
              onChange={(e) => handleArrayChange('education', edu.id, 'institution', e.target.value)}
              maxLength={65}
              placeholder="Indian Institute of Technology"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Degree / Qualification</label>
            <input
              type="text"
              value={edu.degree || ''}
              onChange={(e) => handleArrayChange('education', edu.id, 'degree', e.target.value)}
              maxLength={75}
              placeholder="Bachelor of Technology in Computer Science"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              value={edu.location || ''}
              onChange={(e) => handleArrayChange('education', edu.id, 'location', e.target.value)}
              maxLength={45}
              placeholder="Mumbai, India"
            />
          </div>
          <div className={styles.formRow} style={{ flex: 1, gap: '10px' }}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="text"
                value={edu.startDate || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'startDate', e.target.value)}
                maxLength={25}
                placeholder="2021"
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date (or Expected)</label>
              <input
                type="text"
                value={edu.endDate || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'endDate', e.target.value)}
                maxLength={25}
                placeholder="2025"
              />
            </div>
          </div>
        </div>

        <div className={eduStyles.gradeTypeSection}>
          <label className={eduStyles.gradeTypeSectionLabel}>Credential Type</label>

          <div className={eduStyles.segmentedControl} role="group" aria-label="Credential type">
            {GRADE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`${eduStyles.segmentBtn} ${gradeType === type.value ? eduStyles.segmentBtnActive : ''}`}
                onClick={() => handleArrayChange('education', edu.id, 'gradeType', type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>

          {gradeType === 'board' && (
            <div className={eduStyles.radioGroup}>
              {BOARD_FORMATS.map((fmt) => (
                <label key={fmt.value} className={eduStyles.radioLabel}>
                  <input
                    type="radio"
                    name={`boardFormat-${edu.id}`}
                    value={fmt.value}
                    checked={boardGradeFormat === fmt.value}
                    onChange={() => handleArrayChange('education', edu.id, 'boardGradeFormat', fmt.value)}
                    className={eduStyles.radioInput}
                  />
                  <span>{fmt.label}</span>
                </label>
              ))}
            </div>
          )}

          {gradeType === 'custom' && (
            <div className={eduStyles.customLabelGroup}>
              <label htmlFor={`customLabel-${edu.id}`}>Label Name</label>
              <input
                id={`customLabel-${edu.id}`}
                type="text"
                value={customGradeLabel}
                onChange={(e) => handleArrayChange('education', edu.id, 'customGradeLabel', e.target.value)}
                maxLength={30}
                placeholder="e.g. Class Rank / Score"
                className={eduStyles.customLabelInput}
              />
            </div>
          )}

          <div className={eduStyles.gradeInputRow}>
            <div className={`${styles.formGroup} ${eduStyles.gradeInputGroup}`}>
              <label htmlFor={`gradeVal-${edu.id}`}>{gradeLabel}</label>
              <input
                id={`gradeVal-${edu.id}`}
                type="text"
                value={edu.grade || ''}
                onChange={(e) => handleArrayChange('education', edu.id, 'grade', e.target.value)}
                maxLength={25}
                placeholder={gradePlaceholder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
