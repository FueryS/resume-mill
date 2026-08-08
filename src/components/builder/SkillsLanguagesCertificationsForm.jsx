/**
 * SkillsLanguagesCertificationsForm.jsx
 * 
 * Purpose:
 * Renders the forms list for Step 4 of the resume builder:
 * - Technical Skills (Card-based with Add button, level slider 1-5, group dropdown)
 * - Languages Spoken (Name and proficiency level rating 1-5)
 * - Certifications & Licenses (Name, Issuer, Date, Credential URL, group dropdown)
 * - Achievements & Awards (Title, Issuer, Date, Description, Link, group dropdown)
 * 
 * Features:
 * - Auto-collapses all entry cards and sub-category groups whenever section entry count reaches 5 or multiples of 5 (>= 5).
 * - Supports placing ungrouped items either at the start (above groups) or at the end (below groups).
 * - Supports group collapsing when a group box contains >2 items.
 * - Supports dragging and reordering sub-category groups.
 * - Skill Rating toggle switch.
 * - Uses unique item IDs for drag state tracking to prevent duplicate drag styling on adjacent items.
 * - Standalone Achievements section.
 * - Sub-group container boxes with drag-and-drop assignment/switching/ungrouping.
 * - Card Group Selector dropdown with gray "none" option.
 * - GroupDeleteModal popup with UnGroup (Yellow), Delete (Red), and Cancel buttons.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Globe, Award, Sparkles, Trophy, ChevronDown, GripVertical } from 'lucide-react';
import styles from '@/app/builder/page.module.css';
import SectionHeaderWithGroup from './SectionHeaderWithGroup';
import GroupDeleteModal from './GroupDeleteModal';
import GroupHeader from './GroupHeader';

export default function SkillsLanguagesCertificationsForm({
  skills,
  showSkillRating = false,
  onToggleSkillRating,
  languages,
  certifications,
  achievements,
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
  handleAIQuery,
  optimizingField,
  collapsedStates = {},
  onToggleCollapsed
}) {
  const skillList = Array.isArray(skills) ? skills : [];
  const langList = languages || [];
  const certList = certifications || [];
  const achList = achievements || [];

  const isSkillsAutoCollapsed = skillList.length >= 5;
  const isCertsAutoCollapsed = certList.length >= 5;
  const isAchsAutoCollapsed = achList.length >= 5;
  const isLangsAutoCollapsed = langList.length >= 5;

  const skillsPos = ungroupedPosition?.skills || 'start';
  const certsPos = ungroupedPosition?.certifications || 'start';
  const achsPos = ungroupedPosition?.achievements || 'start';

  // Local collapsed states (id -> boolean)
  const [collapsedSkills, setCollapsedSkills] = useState({});
  const [collapsedLanguages, setCollapsedLanguages] = useState({});
  const [collapsedCertifications, setCollapsedCertifications] = useState({});
  const [collapsedAchievements, setCollapsedAchievements] = useState({});

  // Group box collapsed states (key -> boolean)
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Local drag item ID tracking (unique card IDs)
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [draggedLangId, setDraggedLangId] = useState(null);
  const [draggedCertId, setDraggedCertId] = useState(null);
  const [draggedAchId, setDraggedAchId] = useState(null);
  const [draggedGroupName, setDraggedGroupName] = useState(null);

  // Grab handle checks
  const isSkillHandleGrabbed = useRef(false);
  const isLangHandleGrabbed = useRef(false);
  const isCertHandleGrabbed = useRef(false);
  const isAchHandleGrabbed = useRef(false);
  const isGroupHandleGrabbed = useRef(false);



  // Group Delete Modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    section: '',
    groupName: '',
    itemCount: 0
  });

  const toggleSkillCollapse = (id) => {
    if (onToggleCollapsed) onToggleCollapsed(id, isSkillsAutoCollapsed);
    setCollapsedSkills(prev => {
      const current = collapsedStates[id] !== undefined ? collapsedStates[id] : (prev[id] !== undefined ? prev[id] : isSkillsAutoCollapsed);
      return { ...prev, [id]: !current };
    });
  };

  const toggleLangCollapse = (id) => {
    if (onToggleCollapsed) onToggleCollapsed(id, isLangsAutoCollapsed);
    setCollapsedLanguages(prev => {
      const current = collapsedStates[id] !== undefined ? collapsedStates[id] : (prev[id] !== undefined ? prev[id] : isLangsAutoCollapsed);
      return { ...prev, [id]: !current };
    });
  };

  const toggleCertCollapse = (id) => {
    if (onToggleCollapsed) onToggleCollapsed(id, isCertsAutoCollapsed);
    setCollapsedCertifications(prev => {
      const current = collapsedStates[id] !== undefined ? collapsedStates[id] : (prev[id] !== undefined ? prev[id] : isCertsAutoCollapsed);
      return { ...prev, [id]: !current };
    });
  };

  const toggleAchCollapse = (id) => {
    if (onToggleCollapsed) onToggleCollapsed(id, isAchsAutoCollapsed);
    setCollapsedAchievements(prev => {
      const current = collapsedStates[id] !== undefined ? collapsedStates[id] : (prev[id] !== undefined ? prev[id] : isAchsAutoCollapsed);
      return { ...prev, [id]: !current };
    });
  };

  const toggleGroupCollapse = (key, sectionAutoCollapsed) => {
    if (onToggleCollapsed) onToggleCollapsed(key, sectionAutoCollapsed);
    setCollapsedGroups(prev => {
      const current = collapsedStates[key] !== undefined ? collapsedStates[key] : (prev[key] !== undefined ? prev[key] : sectionAutoCollapsed);
      return { ...prev, [key]: !current };
    });
  };

  // Helper to open group delete modal
  const openDeleteModal = (section, groupName, items) => {
    const count = (items || []).filter(item => item.group === groupName).length;
    setDeleteModalState({
      isOpen: true,
      section,
      groupName,
      itemCount: count
    });
  };

  const handleGroupDragOver = (e, section, targetGroup) => {
    e.preventDefault();
    if (draggedGroupName && draggedGroupName !== targetGroup) {
      const currentGroups = sectionGroups?.[section] || [];
      const fromIdx = currentGroups.indexOf(draggedGroupName);
      const toIdx = currentGroups.indexOf(targetGroup);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorderGroup(section, fromIdx, toIdx);
      }
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleGroupDrop = (e, section, targetGroup) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedGroupName) {
      setDraggedGroupName(null);
      isGroupHandleGrabbed.current = false;
      return;
    }
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      handleCardGroupChange(section, cardId, targetGroup);
    }
    setDraggedSkillId(null);
    setDraggedLangId(null);
    setDraggedCertId(null);
    setDraggedAchId(null);
    isSkillHandleGrabbed.current = false;
    isLangHandleGrabbed.current = false;
    isCertHandleGrabbed.current = false;
    isAchHandleGrabbed.current = false;
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

  const handleCardDragStart = (e, cardId, setDraggedId, handleGrabbedRef) => {
    if (!handleGrabbedRef.current) {
      e.preventDefault();
      return;
    }
    setDraggedId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderPositionControl = (sectionKey, currentPos) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-primary, #ffffff)', padding: '2px 6px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Position:</span>
      <button
        type="button"
        onClick={() => setUngroupedPosition && setUngroupedPosition(sectionKey, 'start')}
        style={{
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: '600',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: currentPos === 'start' ? 'var(--primary, #4f46e5)' : 'transparent',
          color: currentPos === 'start' ? '#ffffff' : 'var(--text-muted)',
          transition: 'all 0.2s ease'
        }}
        title="Place ungrouped items at start (above groups)"
      >
        At Start ↑
      </button>
      <button
        type="button"
        onClick={() => setUngroupedPosition && setUngroupedPosition(sectionKey, 'end')}
        style={{
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: '600',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: currentPos === 'end' ? 'var(--primary, #4f46e5)' : 'transparent',
          color: currentPos === 'end' ? '#ffffff' : 'var(--text-muted)',
          transition: 'all 0.2s ease'
        }}
        title="Place ungrouped items at end (below groups)"
      >
        At End ↓
      </button>
    </div>
  );

  const ungroupedSkills = skillList.filter(item => !item.group || item.group === 'none');
  const ungroupedCerts = certList.filter(item => !item.group || item.group === 'none');
  const ungroupedAchs = achList.filter(item => !item.group || item.group === 'none');

  const renderUngroupedSkillsContainer = () => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleGroupDrop(e, 'skills', 'none')}
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
          Ungrouped Skills ({ungroupedSkills.length})
        </span>
        {renderPositionControl('skills', skillsPos)}
      </div>

      {ungroupedSkills.map((skill, idx) => (
        <RenderSkillCard
          key={skill.id || idx}
          skill={skill}
          idx={idx}
          skillList={skillList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          collapsed={
            collapsedStates[skill.id] !== undefined
              ? collapsedStates[skill.id]
              : (collapsedSkills[skill.id] !== undefined ? collapsedSkills[skill.id] : isSkillsAutoCollapsed)
          }
          toggleCollapse={() => toggleSkillCollapse(skill.id)}
          isHandleGrabbed={isSkillHandleGrabbed}
          draggedSkillId={draggedSkillId}
          setDraggedSkillId={setDraggedSkillId}
          reorderArrayItem={reorderArrayItem}
          handleCardDragStart={handleCardDragStart}
        />
      ))}
    </div>
  );

  const renderUngroupedCertsContainer = () => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleGroupDrop(e, 'certifications', 'none')}
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
          Ungrouped Certifications ({ungroupedCerts.length})
        </span>
        {renderPositionControl('certifications', certsPos)}
      </div>

      {ungroupedCerts.map((cert, idx) => (
        <RenderCertCard
          key={cert.id || idx}
          cert={cert}
          idx={idx}
          certList={certList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          collapsed={
            collapsedStates[cert.id] !== undefined
              ? collapsedStates[cert.id]
              : (collapsedCertifications[cert.id] !== undefined ? collapsedCertifications[cert.id] : isCertsAutoCollapsed)
          }
          toggleCollapse={() => toggleCertCollapse(cert.id)}
          isHandleGrabbed={isCertHandleGrabbed}
          draggedCertId={draggedCertId}
          setDraggedCertId={setDraggedCertId}
          reorderArrayItem={reorderArrayItem}
          handleCardDragStart={handleCardDragStart}
        />
      ))}
    </div>
  );

  const renderUngroupedAchsContainer = () => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleGroupDrop(e, 'achievements', 'none')}
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
          Ungrouped Achievements ({ungroupedAchs.length})
        </span>
        {renderPositionControl('achievements', achsPos)}
      </div>

      {ungroupedAchs.map((ach, idx) => (
        <RenderAchCard
          key={ach.id || idx}
          ach={ach}
          idx={idx}
          achList={achList}
          sectionGroups={sectionGroups}
          handleArrayChange={handleArrayChange}
          removeArrayItem={removeArrayItem}
          handleCardGroupChange={handleCardGroupChange}
          collapsed={
            collapsedStates[ach.id] !== undefined
              ? collapsedStates[ach.id]
              : (collapsedAchievements[ach.id] !== undefined ? collapsedAchievements[ach.id] : isAchsAutoCollapsed)
          }
          toggleCollapse={() => toggleAchCollapse(ach.id)}
          isHandleGrabbed={isAchHandleGrabbed}
          draggedAchId={draggedAchId}
          setDraggedAchId={setDraggedAchId}
          reorderArrayItem={reorderArrayItem}
          handleCardDragStart={handleCardDragStart}
        />
      ))}
    </div>
  );

  return (
    <div className={`${styles.formSection} animate-scale-in`}>
      
      {/* ── SECTION A: Technical Skills & Skill Rating Toggle ───────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <SectionHeaderWithGroup
          icon={Sparkles}
          title="Technical Skills"
          onAddGroup={() => {
            const currentGroups = sectionGroups?.skills || [];
            addGroup('skills', `Group ${currentGroups.length + 1}`);
          }}
        />

        {/* Skill Rating Toggle (disabled by default) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary, #f8fafc)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main, #334155)', userSelect: 'none' }}>Skill Rating</span>
          <button
            type="button"
            onClick={() => onToggleSkillRating && onToggleSkillRating(!showSkillRating)}
            style={{
              width: '36px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: showSkillRating ? 'var(--primary, #4f46e5)' : '#cbd5e1',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              padding: '2px',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Toggle skill rating visibility on resume templates (Disabled by default)"
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transform: showSkillRating ? 'translateX(16px)' : 'translateX(0px)',
                transition: 'transform 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </button>
        </div>
      </div>

      {/* Render Ungrouped Skills at Start if selected */}
      {skillsPos === 'start' && renderUngroupedSkillsContainer()}

      {/* Sub-Group Containers for Skills */}
      {(sectionGroups?.skills || []).map((groupName) => {
        const groupItems = skillList.filter(item => item.group === groupName);
        const groupKey = `skills-${groupName}`;
        const isCollapsible = groupItems.length > 2 || isSkillsAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[groupKey] !== undefined
            ? collapsedStates[groupKey]
            : (collapsedGroups[groupKey] !== undefined ? collapsedGroups[groupKey] : isSkillsAutoCollapsed)
        );
        const isGroupDragging = draggedGroupName === groupName;

        return (
          <div
            key={groupName}
            draggable={true}
            onDragStart={(e) => handleGroupContainerDragStart(e, groupName)}
            onDragOver={(e) => handleGroupDragOver(e, 'skills', groupName)}
            onDrop={(e) => handleGroupDrop(e, 'skills', groupName)}
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
              onRename={(newName) => renameGroup('skills', groupName, newName)}
              onDelete={() => openDeleteModal('skills', groupName, skillList)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleGroupCollapse(groupKey, isSkillsAutoCollapsed)}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((skill, idx) => (
              <RenderSkillCard
                key={skill.id || idx}
                skill={skill}
                idx={idx}
                skillList={skillList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                collapsed={
                  collapsedStates[skill.id] !== undefined
                    ? collapsedStates[skill.id]
                    : (collapsedSkills[skill.id] !== undefined ? collapsedSkills[skill.id] : isSkillsAutoCollapsed)
                }
                toggleCollapse={() => toggleSkillCollapse(skill.id)}
                isHandleGrabbed={isSkillHandleGrabbed}
                draggedSkillId={draggedSkillId}
                setDraggedSkillId={setDraggedSkillId}
                reorderArrayItem={reorderArrayItem}
                handleCardDragStart={handleCardDragStart}
              />
            ))}
          </div>
        );
      })}

      {/* Render Ungrouped Skills at End if selected */}
      {skillsPos === 'end' && renderUngroupedSkillsContainer()}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('skills')}
        style={{ marginBottom: '10px' }}
      >
        <Plus size={16} />
        <span>Add Skill</span>
      </button>

      <hr className={styles.divider} style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* ── SECTION B: Languages ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <Globe size={18} className="text-primary" />
        <h4 className={styles.subsectionTitle} style={{ margin: 0 }}>Languages</h4>
      </div>

      {langList.map((lang, idx) => {
        const isDragging = draggedLangId === lang.id;
        const isCollapsed = collapsedStates[lang.id] !== undefined
          ? collapsedStates[lang.id]
          : (collapsedLanguages[lang.id] !== undefined ? collapsedLanguages[lang.id] : isLangsAutoCollapsed);

        return (
          <div 
            key={lang.id || idx} 
            className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
            draggable={true}
            onDragStart={(e) => handleCardDragStart(e, lang.id, setDraggedLangId, isLangHandleGrabbed)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!draggedLangId || draggedLangId === lang.id) return;
              const fromIdx = langList.findIndex(item => item.id === draggedLangId);
              const toIdx = langList.findIndex(item => item.id === lang.id);
              if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
                reorderArrayItem('languages', fromIdx, toIdx);
              }
            }}
            onDragEnd={() => { setDraggedLangId(null); isLangHandleGrabbed.current = false; }}
          >
            <div className={styles.itemCardHeader}>
              <div
                className={styles.cardHeaderTitle}
                onClick={() => toggleLangCollapse(lang.id)}
                title={isCollapsed ? "Expand Details" : "Collapse Details"}
              >
                <div className={`${styles.collapseIcon} ${isCollapsed ? styles.collapseIconRotated : ''}`}>
                  <ChevronDown size={16} />
                </div>
                <h5>
                  {isCollapsed
                    ? `Language #${idx + 1} - ${lang.name || 'Language Name'}`
                    : `Language #${idx + 1}`}
                </h5>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                <div
                  className={styles.dragHandle}
                  onMouseDown={() => { isLangHandleGrabbed.current = true; }}
                  onMouseUp={() => { isLangHandleGrabbed.current = false; }}
                  onTouchStart={() => { isLangHandleGrabbed.current = true; }}
                  onTouchEnd={() => { isLangHandleGrabbed.current = false; }}
                  title="Drag to Reorder"
                >
                  <GripVertical size={16} />
                </div>
                <button
                  type="button"
                  className={styles.btnRemove}
                  onClick={() => removeArrayItem('languages', lang.id)}
                  title="Remove Language"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className={isCollapsed ? styles.cardBodyCollapsed : ''}>
              <div className={styles.formRow} style={{ marginTop: '15px' }}>
                <div className={styles.formGroup}>
                  <label>Language Name</label>
                  <input
                    type="text"
                    value={lang.name || ''}
                    onChange={(e) => handleArrayChange('languages', lang.id, 'name', e.target.value)}
                    placeholder="English, Spanish, German"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Proficiency Level</label>
                  <select
                    value={lang.level || 5}
                    onChange={(e) => handleArrayChange('languages', lang.id, 'level', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Elementary</option>
                    <option value={3}>3 - Conversational</option>
                    <option value={4}>4 - Professional Working</option>
                    <option value={5}>5 - Native / Bilingual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('languages')}
        style={{ marginBottom: '10px' }}
      >
        <Plus size={16} />
        <span>Add Language</span>
      </button>

      <hr className={styles.divider} style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* ── SECTION C: Certifications & Licenses ─────────────────────── */}
      <SectionHeaderWithGroup
        icon={Award}
        title="Certifications & Licenses"
        onAddGroup={() => {
          const currentGroups = sectionGroups?.certifications || [];
          addGroup('certifications', `Group ${currentGroups.length + 1}`);
        }}
      />

      {/* Render Ungrouped Certifications at Start if selected */}
      {certsPos === 'start' && renderUngroupedCertsContainer()}

      {/* Sub-Group Containers for Certifications */}
      {(sectionGroups?.certifications || []).map((groupName) => {
        const groupItems = certList.filter(item => item.group === groupName);
        const groupKey = `certifications-${groupName}`;
        const isCollapsible = groupItems.length > 2 || isCertsAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[groupKey] !== undefined
            ? collapsedStates[groupKey]
            : (collapsedGroups[groupKey] !== undefined ? collapsedGroups[groupKey] : isCertsAutoCollapsed)
        );
        const isGroupDragging = draggedGroupName === groupName;

        return (
          <div
            key={groupName}
            draggable={true}
            onDragStart={(e) => handleGroupContainerDragStart(e, groupName)}
            onDragOver={(e) => handleGroupDragOver(e, 'certifications', groupName)}
            onDrop={(e) => handleGroupDrop(e, 'certifications', groupName)}
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
              onRename={(newName) => renameGroup('certifications', groupName, newName)}
              onDelete={() => openDeleteModal('certifications', groupName, certList)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleGroupCollapse(groupKey, isCertsAutoCollapsed)}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((cert, idx) => (
              <RenderCertCard
                key={cert.id || idx}
                cert={cert}
                idx={idx}
                certList={certList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                collapsed={
                  collapsedCertifications[cert.id] !== undefined
                    ? collapsedCertifications[cert.id]
                    : isCertsAutoCollapsed
                }
                toggleCollapse={() => toggleCertCollapse(cert.id)}
                isHandleGrabbed={isCertHandleGrabbed}
                draggedCertId={draggedCertId}
                setDraggedCertId={setDraggedCertId}
                reorderArrayItem={reorderArrayItem}
                handleCardDragStart={handleCardDragStart}
              />
            ))}
          </div>
        );
      })}

      {/* Render Ungrouped Certifications at End if selected */}
      {certsPos === 'end' && renderUngroupedCertsContainer()}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('certifications')}
        style={{ marginBottom: '10px' }}
      >
        <Plus size={16} />
        <span>Add Certification</span>
      </button>

      <hr className={styles.divider} style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* ── SECTION D: Standalone Achievements & Awards ──────────────── */}
      <SectionHeaderWithGroup
        icon={Trophy}
        title="Achievements &amp; Awards"
        onAddGroup={() => {
          const currentGroups = sectionGroups?.achievements || [];
          addGroup('achievements', `Group ${currentGroups.length + 1}`);
        }}
      />

      {/* Render Ungrouped Achievements at Start if selected */}
      {achsPos === 'start' && renderUngroupedAchsContainer()}

      {/* Sub-Group Containers for Achievements */}
      {(sectionGroups?.achievements || []).map((groupName) => {
        const groupItems = achList.filter(item => item.group === groupName);
        const groupKey = `achievements-${groupName}`;
        const isCollapsible = groupItems.length > 2 || isAchsAutoCollapsed;
        const isCollapsed = isCollapsible && (
          collapsedStates[groupKey] !== undefined
            ? collapsedStates[groupKey]
            : (collapsedGroups[groupKey] !== undefined ? collapsedGroups[groupKey] : isAchsAutoCollapsed)
        );
        const isGroupDragging = draggedGroupName === groupName;

        return (
          <div
            key={groupName}
            draggable={true}
            onDragStart={(e) => handleGroupContainerDragStart(e, groupName)}
            onDragOver={(e) => handleGroupDragOver(e, 'achievements', groupName)}
            onDrop={(e) => handleGroupDrop(e, 'achievements', groupName)}
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
              onRename={(newName) => renameGroup('achievements', groupName, newName)}
              onDelete={() => openDeleteModal('achievements', groupName, achList)}
              isCollapsible={isCollapsible}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleGroupCollapse(groupKey, isAchsAutoCollapsed)}
              onGroupHandleGrab={(val) => { isGroupHandleGrabbed.current = val; }}
            />

            {!isCollapsed && groupItems.map((ach, idx) => (
              <RenderAchCard
                key={ach.id || idx}
                ach={ach}
                idx={idx}
                achList={achList}
                sectionGroups={sectionGroups}
                handleArrayChange={handleArrayChange}
                removeArrayItem={removeArrayItem}
                handleCardGroupChange={handleCardGroupChange}
                collapsed={
                  collapsedAchievements[ach.id] !== undefined
                    ? collapsedAchievements[ach.id]
                    : isAchsAutoCollapsed
                }
                toggleCollapse={() => toggleAchCollapse(ach.id)}
                isHandleGrabbed={isAchHandleGrabbed}
                draggedAchId={draggedAchId}
                setDraggedAchId={setDraggedAchId}
                reorderArrayItem={reorderArrayItem}
                handleCardDragStart={handleCardDragStart}
              />
            ))}
          </div>
        );
      })}

      {/* Render Ungrouped Achievements at End if selected */}
      {achsPos === 'end' && renderUngroupedAchsContainer()}

      <button
        type="button"
        className={`btn btn-secondary ${styles.btnAdd}`}
        onClick={() => addArrayItem('achievements')}
      >
        <Plus size={16} />
        <span>Add Achievement</span>
      </button>

      {/* 3-Choice Group Delete Modal */}
      <GroupDeleteModal
        isOpen={deleteModalState.isOpen}
        groupName={deleteModalState.groupName}
        itemCount={deleteModalState.itemCount}
        onClose={() => setDeleteModalState({ isOpen: false, section: '', groupName: '', itemCount: 0 })}
        onUnGroup={() => {
          unGroupSection(deleteModalState.section, deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, section: '', groupName: '', itemCount: 0 });
        }}
        onDeleteAll={() => {
          deleteGroupAndItems(deleteModalState.section, deleteModalState.groupName);
          setDeleteModalState({ isOpen: false, section: '', groupName: '', itemCount: 0 });
        }}
      />

    </div>
  );
}

/* Card Renderer Component for Skill Items */
function RenderSkillCard({
  skill,
  idx,
  skillList,
  sectionGroups,
  handleArrayChange,
  removeArrayItem,
  handleCardGroupChange,
  collapsed,
  toggleCollapse,
  isHandleGrabbed,
  draggedSkillId,
  setDraggedSkillId,
  reorderArrayItem,
  handleCardDragStart
}) {
  const isDragging = draggedSkillId === skill.id;

  return (
    <div
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, skill.id, setDraggedSkillId, isHandleGrabbed)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedSkillId || draggedSkillId === skill.id) return;
        const fromIdx = skillList.findIndex(item => item.id === draggedSkillId);
        const toIdx = skillList.findIndex(item => item.id === skill.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('skills', fromIdx, toIdx);
        }
      }}
      onDragEnd={() => { setDraggedSkillId(null); isHandleGrabbed.current = false; }}
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
            {collapsed ? `Skill #${idx + 1} - ${skill.name || 'Skill Name'}` : `Skill #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={skill.group || 'none'}
              onChange={(e) => handleCardGroupChange('skills', skill.id, e.target.value)}
              style={{
                color: (skill.group === 'none' || !skill.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.skills || []).map((g) => (
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
            onClick={() => removeArrayItem('skills', skill.id)}
            title="Remove Skill"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup} style={{ flex: 2 }}>
            <label>Skill Name</label>
            <input
              type="text"
              value={skill.name || ''}
              onChange={(e) => handleArrayChange('skills', skill.id, 'name', e.target.value)}
              maxLength={35}
              placeholder="React.js, Python, AWS, Docker"
            />
          </div>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label>Level: {skill.level || 5} / 5</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={skill.level || 5}
              onChange={(e) => handleArrayChange('skills', skill.id, 'level', parseInt(e.target.value))}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Card Renderer Component for Certifications */
function RenderCertCard({
  cert,
  idx,
  certList,
  sectionGroups,
  handleArrayChange,
  removeArrayItem,
  handleCardGroupChange,
  collapsed,
  toggleCollapse,
  isHandleGrabbed,
  draggedCertId,
  setDraggedCertId,
  reorderArrayItem,
  handleCardDragStart
}) {
  const isDragging = draggedCertId === cert.id;

  return (
    <div
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, cert.id, setDraggedCertId, isHandleGrabbed)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedCertId || draggedCertId === cert.id) return;
        const fromIdx = certList.findIndex(item => item.id === draggedCertId);
        const toIdx = certList.findIndex(item => item.id === cert.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('certifications', fromIdx, toIdx);
        }
      }}
      onDragEnd={() => { setDraggedCertId(null); isHandleGrabbed.current = false; }}
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
            {collapsed ? `Certification #${idx + 1} - ${cert.name || 'Cert Name'} at ${cert.organization || 'Issuer'}` : `Certification #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={cert.group || 'none'}
              onChange={(e) => handleCardGroupChange('certifications', cert.id, e.target.value)}
              style={{
                color: (cert.group === 'none' || !cert.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.certifications || []).map((g) => (
                <option key={g} value={g} style={{ color: 'var(--text-main)' }}>{g}</option>
              ))}
            </select>
          </div>

          <div
            className={styles.dragHandle}
            onMouseDown={() => { isCertHandleGrabbed.current = true; }}
            onMouseUp={() => { isCertHandleGrabbed.current = false; }}
            onTouchStart={() => { isCertHandleGrabbed.current = true; }}
            onTouchEnd={() => { isCertHandleGrabbed.current = false; }}
            title="Drag to Reorder"
          >
            <GripVertical size={16} />
          </div>
          <button
            type="button"
            className={styles.btnRemove}
            onClick={() => removeArrayItem('certifications', cert.id)}
            title="Remove Certification"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup}>
            <label>Certification Name</label>
            <input
              type="text"
              value={cert.name || ''}
              onChange={(e) => handleArrayChange('certifications', cert.id, 'name', e.target.value)}
              maxLength={75}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Issuing Authority / Organization</label>
            <input
              type="text"
              value={cert.organization || ''}
              onChange={(e) => handleArrayChange('certifications', cert.id, 'organization', e.target.value)}
              maxLength={65}
              placeholder="Amazon Web Services (AWS)"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Date Issued</label>
            <input
              type="text"
              value={cert.date || ''}
              onChange={(e) => handleArrayChange('certifications', cert.id, 'date', e.target.value)}
              maxLength={25}
              placeholder="October 2024"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Credential URL / Link</label>
            <input
              type="url"
              value={cert.url || ''}
              onChange={(e) => handleArrayChange('certifications', cert.id, 'url', e.target.value)}
              maxLength={70}
              placeholder="https://credly.com/credentials/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Card Renderer Component for Achievements */
function RenderAchCard({
  ach,
  idx,
  achList,
  sectionGroups,
  handleArrayChange,
  removeArrayItem,
  handleCardGroupChange,
  collapsed,
  toggleCollapse,
  isHandleGrabbed,
  draggedAchId,
  setDraggedAchId,
  reorderArrayItem,
  handleCardDragStart
}) {
  const isDragging = draggedAchId === ach.id;

  return (
    <div
      className={`${styles.itemCard} ${isDragging ? styles.itemCardDragging : ''}`}
      draggable={true}
      onDragStart={(e) => handleCardDragStart(e, ach.id, setDraggedAchId, isHandleGrabbed)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedAchId || draggedAchId === ach.id) return;
        const fromIdx = achList.findIndex(item => item.id === draggedAchId);
        const toIdx = achList.findIndex(item => item.id === ach.id);
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
          reorderArrayItem('achievements', fromIdx, toIdx);
        }
      }}
      onDragEnd={() => { setDraggedAchId(null); isHandleGrabbed.current = false; }}
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
            {collapsed ? `Achievement #${idx + 1} - ${ach.title || 'Title'}` : `Achievement #${idx + 1}`}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Group:</span>
            <select
              value={ach.group || 'none'}
              onChange={(e) => handleCardGroupChange('achievements', ach.id, e.target.value)}
              style={{
                color: (ach.group === 'none' || !ach.group) ? '#9ca3af' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <option value="none" style={{ color: '#9ca3af' }}>none</option>
              {(sectionGroups?.achievements || []).map((g) => (
                <option key={g} value={g} style={{ color: 'var(--text-main)' }}>{g}</option>
              ))}
            </select>
          </div>

          <div
            className={styles.dragHandle}
            onMouseDown={() => { isAchHandleGrabbed.current = true; }}
            onMouseUp={() => { isAchHandleGrabbed.current = false; }}
            onTouchStart={() => { isAchHandleGrabbed.current = true; }}
            onTouchEnd={() => { isAchHandleGrabbed.current = false; }}
            title="Drag to Reorder"
          >
            <GripVertical size={16} />
          </div>
          <button
            type="button"
            className={styles.btnRemove}
            onClick={() => removeArrayItem('achievements', ach.id)}
            title="Remove Achievement"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className={collapsed ? styles.cardBodyCollapsed : ''}>
        <div className={styles.formRow} style={{ marginTop: '15px' }}>
          <div className={styles.formGroup}>
            <label>Achievement Title / Award</label>
            <input
              type="text"
              value={ach.title || ''}
              onChange={(e) => handleArrayChange('achievements', ach.id, 'title', e.target.value)}
              maxLength={50}
              placeholder="1st Place in Hackathon"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Organization / Host</label>
            <input
              type="text"
              value={ach.organization || ''}
              onChange={(e) => handleArrayChange('achievements', ach.id, 'organization', e.target.value)}
              maxLength={65}
              placeholder="Tech Crunch / University"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Date</label>
            <input
              type="text"
              value={ach.date || ''}
              onChange={(e) => handleArrayChange('achievements', ach.id, 'date', e.target.value)}
              maxLength={25}
              placeholder="2025"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Link / URL</label>
            <input
              type="url"
              value={ach.url || ''}
              onChange={(e) => handleArrayChange('achievements', ach.id, 'url', e.target.value)}
              maxLength={70}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description / Details</label>
          <textarea
            rows="2"
            value={ach.description || ''}
            onChange={(e) => handleArrayChange('achievements', ach.id, 'description', e.target.value)}
            maxLength={350}
            placeholder="Awarded 1st place among 50+ teams for building an innovative solution."
          />
        </div>
      </div>
    </div>
  );
}
