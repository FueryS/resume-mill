/**
 * ProjectsForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 3 of the resume builder:
 * Inputting personal projects with sub-grouping, card group dropdowns, drag-and-drop targets, and Gemini AI optimizations.
 * Auto-collapses all entry cards and sub-category groups whenever total entry count reaches 5 or multiples of 5 (>= 5).
 * Supports placing ungrouped items either at the start (above groups) or at the end (below groups).
 * Supports dragging and reordering sub-category groups.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Sparkles, RefreshCw, ChevronDown, GripVertical, FolderGit2 } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import SectionHeaderWithGroup from './SectionHeaderWithGroup';
import GroupDeleteModal from './GroupDeleteModal';
import GroupHeader from './GroupHeader';

export default function ProjectsForm({
  projects,
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
  const projList = projects || [];
  const totalCount = projList.length;
  const isAutoCollapsed = totalCount >= 5;
  const currentUngroupedPos = ungroupedPosition?.projects || 'start';

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
    const count = projList.filter(item => item.group === groupName).length;
    setDeleteModalState({ isOpen: true, groupName, itemCount: count });
  };

  const handleGroupDragOver = (e, targetGroup) => {
    e.preventDefault();
    if (draggedGroupName && draggedGroupName !== targetGroup) {
      const currentGroups = sectionGroups?.projects || [];
      const fromIdx = currentGroups.indexOf(draggedGroupName);
      const toIdx = currentGroups.indexOf(targetGroup);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorderGroup('projects', fromIdx, toIdx);
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
      handleCardGroupChange('projects', cardId, targetGroup);
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

  const ungroupedItems = projList.filter(item => !item.group || item.group === 'none');

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
            onClick={() => setUngroupedPosition && setUngroupedPosition('projects', 'start')}
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
            onClick={() => setUngroupedPosition && setUngroupedPosition('projects', 'end')}
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

      {ungroupedItems.map((proj, idx) => (
        <RenderProjCard
          key={proj.id || idx}
          proj={proj}
          idx={idx}
          projList={projList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          handleAIQuery={handleAIQuery}
          optimizingField={optimizingField}
          collapsed={
            collapsedStates[proj.id] !== undefined
              ? collapsedStates[proj.id]
              : isAutoCollapsed
          }
          toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(proj.id, isAutoCollapsed) : toggleCollapse(proj.id)}
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
        icon={FolderGit2}
        title="Key Projects"
        onAddGroup={() => {
          const currentGroups = sectionGroups?.projects || [];
          addGroup('projects', `Group ${currentGroups.length + 1}`);
        }}
      />

      {/* Render Ungrouped at Start if selected */}
      {currentUngroupedPos === 'start' && renderUngroupedContainer()}

      {/* Sub-Group Containers for Projects */}
      {(sectionGroups?.projects || []).map((groupName) => {
        const groupItems = projList.filter(item => item.group === groupName);
        const isCollapsible = groupItems.length > 2 || isAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[`proj-group-${groupName}`] !== undefined
            ? collapsedStates[`proj-group-${groupName}`]
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
              onRename={(newName) => renameGroup('projects', groupName, newName)}
              onDelete={() => openDeleteModal(groupName)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => { if (onToggleCollapsed) onToggleCollapsed(`proj-group-${groupName}`, isAutoCollapsed); toggleGroupCollapse(groupName); }}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((proj, idx) => (
              <RenderProjCard
                key={proj.id || idx}
                proj={proj}
                idx={idx}
                projList={projList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                handleAIQuery={handleAIQuery}
                optimizingField={optimizingField}
                collapsed={
                  collapsedStates[proj.id] !== undefined
                    ? collapsedStates[proj.id]
                    : isAutoCollapsed
                }
                toggleCollapse={() => onToggleCollapsed ? onToggleCollapsed(proj.id, isAutoCollapsed) : toggleCollapse(proj.id)}
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
        onClick={() => addArrayItem('projects')}
      >
        <Plus size={16} />
        <span>Add Project</span>
      </button>

      <GroupDeleteModal
        isOpen={deleteModalState.isOpen}
        groupName={deleteModalState.groupName}
        itemCount={deleteModalState.itemCount}
        onClose={() => setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 })}
        onUnGroup={() => {
          unGroupSection('projects', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
        onDeleteAll={() => {
          deleteGroupAndItems('projects', deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, groupName: '', itemCount: 0 });
        }}
      />
    </div>
  );
}

function RenderProjCard({
  proj,
  idx,
  projList,
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
  const isDragging = draggedCardId === proj.id;

  return (
    <div 
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, proj.id)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedCardId || draggedCardId === proj.id) return;
        const fromIdx = projList.findIndex(item => item.id === draggedCardId);
        const toIdx = projList.findIndex(item => item.id === proj.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('projects', fromIdx, toIdx);
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
              ? `Project #${idx + 1} - ${proj.name || 'Project Name'}`
              : `Project #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={proj.group || 'none'}
              onChange={(e) => handleCardGroupChange('projects', proj.id, e.target.value)}
              style={{
                color: (proj.group === 'none' || !proj.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.projects || []).map((g) => (
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
            onClick={() => removeArrayItem('projects', proj.id)}
            title="Remove Project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input 
              type="text"
              value={proj.name || ''}
              onChange={(e) => handleArrayChange('projects', proj.id, 'name', e.target.value)}
              maxLength={50}
              placeholder="E-Commerce Store"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Live Demo URL</label>
            <input 
              type="url"
              value={proj.liveUrl || ''}
              onChange={(e) => handleArrayChange('projects', proj.id, 'liveUrl', e.target.value)}
              maxLength={70}
              placeholder="https://my-app.vercel.app"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Front-end Code Repository</label>
            <input 
              type="url"
              value={proj.githubFront || ''}
              onChange={(e) => handleArrayChange('projects', proj.id, 'githubFront', e.target.value)}
              maxLength={70}
              placeholder="https://github.com/username/repo-frontend"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Back-end Code Repository</label>
            <input 
              type="url"
              value={proj.githubBack || ''}
              onChange={(e) => handleArrayChange('projects', proj.id, 'githubBack', e.target.value)}
              maxLength={70}
              placeholder="https://github.com/username/repo-backend"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Technologies Used (comma separated)</label>
          <input 
            type="text"
            value={proj.technologies || ''}
            onChange={(e) => handleArrayChange('projects', proj.id, 'technologies', e.target.value)}
            maxLength={85}
            placeholder="Next.js, TailwindCSS, MongoDB, Stripe"
          />
        </div>

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
            maxLength={350}
            placeholder="Describe your achievements and tasks. E.g., Built an interactive React dashboard that reduced layout shift by 40%."
          />
        </div>
      </div>
    </div>
  );
}
