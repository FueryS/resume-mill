/**
 * ExperienceForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 2 of the resume builder:
 * Inputting previous job positions with sub-group support, group dropdowns, drag-and-drop targets, and AI optimizations.
 * Auto-collapses all entry cards and sub-category groups whenever total entry count reaches 5 or multiples of 5 (>= 5).
 * Supports placing ungrouped items either at the start (above groups) or at the end (below groups).
 * Supports dragging and reordering sub-category groups.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Sparkles, RefreshCw, ChevronDown, GripVertical, Briefcase } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import SectionHeaderWithGroup from './SectionHeaderWithGroup';
import GroupDeleteModal from './GroupDeleteModal';
import GroupHeader from './GroupHeader';

export default function ExperienceForm({
  experience: expList,
  sectionGroups,
  ungroupedPosition,
  setUngroupedPosition,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  moveArrayItem,
  reorderArrayItem,
  handleAIQuery,
  optimizingField,
  addGroup,
  renameGroup,
  unGroupSection,
  deleteGroupAndItems,
  handleCardGroupChange,
  reorderGroup,
  collapsedStates = {},
  onToggleCollapsed
}) {
  const totalCount = expList.length;
  const isAutoCollapsed = totalCount >= 5;
  const currentUngroupedPos = ungroupedPosition?.experience || 'start';

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [draggedGroupName, setDraggedGroupName] = useState(null);

  const isHandleGrabbed = useRef(false);
  const isGroupHandleGrabbed = useRef(false);
  const prevCountRef = useRef(totalCount);

  // Auto-collapse trigger whenever count increases to a multiple of 5 (5, 10, 15...)
  useEffect(() => {
    if (totalCount > 0 && totalCount % 5 === 0 && totalCount !== prevCountRef.current) {
      if (onToggleCollapsed) {
        expList.forEach((item) => {
          if (item.id) onToggleCollapsed(item.id, false);
        });
      }

      const allCollapsedGroups = {};
      (sectionGroups?.experience || []).forEach((gName) => {
        allCollapsedGroups[gName] = true;
      });
      setCollapsedGroups(allCollapsedGroups);
    }
    prevCountRef.current = totalCount;
  }, [totalCount, sectionGroups?.experience, onToggleCollapsed]);

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
    const count = expList.filter(item => item.group === groupName).length;
    setDeleteModalState({ isOpen: true, groupName, itemCount: count });
  };

  const handleGroupDragOver = (e, targetGroup) => {
    e.preventDefault();
    if (draggedGroupName && draggedGroupName !== targetGroup) {
      const currentGroups = sectionGroups?.experience || [];
      const fromIdx = currentGroups.indexOf(draggedGroupName);
      const toIdx = currentGroups.indexOf(targetGroup);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorderGroup('experience', fromIdx, toIdx);
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
      handleCardGroupChange('experience', cardId, targetGroup);
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

  const ungroupedItems = expList.filter(item => !item.group || item.group === 'none');

  const renderUngroupedContainer = () => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleGroupDrop(e, 'none')}
      style={{
        border: '1.5px dashed var(--border-color, #cbd5e1)',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '16px',
        backgroundColor: 'var(--bg-secondary, #f8fafc)',
        minHeight: '40px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Ungrouped Items ({ungroupedItems.length})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-primary, #ffffff)', padding: '2px 6px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Position:</span>
          <button
            type="button"
            onClick={() => setUngroupedPosition && setUngroupedPosition('experience', 'start')}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentUngroupedPos === 'start' ? 'var(--primary, #4f46e5)' : 'transparent',
              color: currentUngroupedPos === 'start' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
            title="Place ungrouped items at start (above groups)"
          >
            At Start ↑
          </button>
          <button
            type="button"
            onClick={() => setUngroupedPosition && setUngroupedPosition('experience', 'end')}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentUngroupedPos === 'end' ? 'var(--primary, #4f46e5)' : 'transparent',
              color: currentUngroupedPos === 'end' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
            title="Place ungrouped items at end (below groups)"
          >
            At End ↓
          </button>
        </div>
      </div>

      {ungroupedItems.map((exp, idx) => (
        <RenderExpCard
          key={exp.id || idx}
          exp={exp}
          idx={idx}
          expList={expList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          handleAIQuery={handleAIQuery}
          optimizingField={optimizingField}
          collapsed={
            collapsedStates[exp.id] !== undefined
              ? collapsedStates[exp.id]
              : isAutoCollapsed
          }
          toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(exp.id, isAutoCollapsed) : toggleCollapse(exp.id)}
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
        icon={Briefcase}
        title="Work Experience"
        onAddGroup={() => {
          const currentGroups = sectionGroups?.experience || [];
          addGroup('experience', `Group ${currentGroups.length + 1}`);
        }}
      />

      {/* Render Ungrouped at Start if selected */}
      {currentUngroupedPos === 'start' && renderUngroupedContainer()}

      {/* Sub-Group Containers for Experience */}
      {(sectionGroups?.experience || []).map((groupName) => {
        const groupItems = expList.filter(item => item.group === groupName);
        const isCollapsible = groupItems.length > 2 || isAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[`exp-group-${groupName}`] !== undefined
            ? collapsedStates[`exp-group-${groupName}`]
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
              onRename={(newName) => renameGroup('experience', groupName, newName)}
              onDelete={() => openDeleteModal(groupName)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => { if (onToggleCollapsed) onToggleCollapsed(`exp-group-${groupName}`, isAutoCollapsed); toggleGroupCollapse(groupName); }}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((exp, idx) => (
              <RenderExpCard
                key={exp.id || idx}
                exp={exp}
                idx={idx}
                expList={expList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                handleAIQuery={handleAIQuery}
                optimizingField={optimizingField}
                collapsed={
                  collapsedStates[exp.id] !== undefined
                    ? collapsedStates[exp.id]
                    : isAutoCollapsed
                }
                toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(exp.id, isAutoCollapsed) : toggleCollapse(exp.id)}
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
        onClick={() => addArrayItem('experience')}
      >
        <Plus size={16} />
        <span>Add Experience</span>
      </button>

      <GroupDeleteModal
        isOpen={deleteModalState.isOpen}
        groupName={deleteModalState.groupName}
        itemCount={deleteModalState.itemCount}
        onClose={() => setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 })}
        onUnGroup={() => {
          unGroupSection('experience', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
        onDeleteAll={() => {
          deleteGroupAndItems('experience', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
      />
    </div>
  );
}

function RenderExpCard({
  exp,
  idx,
  expList,
  sectionGroups,
  handleArrayChange,
  removeArrayItem,
  handleCardGroupChange,
  handleAIQuery,
  optimizingField,
  collapsed,
  toggleCollapse,
  isHandleGrabbed,
  draggedCardId,
  reorderArrayItem,
  handleCardDragStart,
  handleCardDragEnd
}) {
  const isDragging = draggedCardId === exp.id;

  return (
    <div 
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, exp.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedCardId || draggedCardId === exp.id) return;
        const fromIdx = expList.findIndex(item => item.id === draggedCardId);
        const toIdx = expList.findIndex(item => item.id === exp.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('experience', fromIdx, toIdx);
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
              ? `Position #${idx + 1} - ${exp.role || 'Role'} at ${exp.company || 'Company'}`
              : `Position #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={exp.group || 'none'}
              onChange={(e) => handleCardGroupChange('experience', exp.id, e.target.value)}
              style={{
                color: (exp.group === 'none' || !exp.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.experience || []).map((g) => (
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
            onClick={() => removeArrayItem('experience', exp.id)}
            title="Remove Position"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup}>
            <label>Company / Organization</label>
            <input 
              type="text"
              value={exp.company || ''}
              onChange={(e) => handleArrayChange('experience', exp.id, 'company', e.target.value)}
              maxLength={60}
              placeholder="Google"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Job Title / Role</label>
            <input 
              type="text"
              value={exp.role || ''}
              onChange={(e) => handleArrayChange('experience', exp.id, 'role', e.target.value)}
              maxLength={60}
              placeholder="Software Engineering Intern"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Location</label>
            <input 
              type="text"
              value={exp.location || ''}
              onChange={(e) => handleArrayChange('experience', exp.id, 'location', e.target.value)}
              maxLength={45}
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
                maxLength={25}
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
                maxLength={25}
                placeholder={exp.current ? 'Present' : 'August 2024'}
              />
            </div>
          </div>
        </div>

        <div className={styles.formCheckbox}>
          <input 
            type="checkbox"
            id={`current-${exp.id}`}
            checked={exp.current || false}
            onChange={(e) => handleArrayChange('experience', exp.id, 'current', e.target.checked)}
          />
          <label htmlFor={`current-${exp.id}`}>I currently work here</label>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelWithAi}>
            <label>Job Description &amp; Achievements</label>
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
            maxLength={350}
            placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
          />
        </div>
      </div>
    </div>
  );
}
