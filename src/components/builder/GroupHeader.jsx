/**
 * GroupHeader.jsx
 * 
 * Purpose:
 * Renders an inline editable header for a sub-category group box.
 * Maintains local input state during keystrokes to prevent React key unmounting
 * and focus loss when renaming groups. Commits rename to parent state on blur/enter.
 * Renders a collapse/expand chevron toggle when group items count > 2.
 * Includes a GripVertical handle to drag and reorder groups.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Folder, Trash2, ChevronDown, GripVertical } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function GroupHeader({
  groupName,
  itemCount = 0,
  onRename,
  onDelete,
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  onGroupHandleGrab
}) {
  const [localName, setLocalName] = useState(groupName);

  useEffect(() => {
    setLocalName(groupName);
  }, [groupName]);

  const handleBlur = () => {
    const trimmed = localName.trim();
    if (trimmed && trimmed !== groupName) {
      onRename(trimmed);
    } else if (!trimmed) {
      setLocalName(groupName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCollapsed ? '0px' : '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {isCollapsible && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              color: 'var(--primary, #4f46e5)',
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
            title={isCollapsed ? "Expand group items" : "Collapse group items (>2 items)"}
          >
            <ChevronDown size={16} />
          </button>
        )}

        <Folder size={16} color="var(--primary, #4f46e5)" />
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontWeight: '700',
            fontSize: '13.5px',
            color: 'var(--primary, #4f46e5)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px dashed transparent',
            outline: 'none',
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderBottom = '1px solid var(--primary, #4f46e5)';
            e.target.style.backgroundColor = 'rgba(79, 70, 229, 0.06)';
          }}
          title="Click to rename group"
        />
        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary, #4f46e5)' }}>
          {itemCount} {isCollapsed ? '(collapsed)' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          className={styles.dragHandle}
          onMouseDown={() => onGroupHandleGrab && onGroupHandleGrab(true)}
          onMouseUp={() => onGroupHandleGrab && onGroupHandleGrab(false)}
          onTouchStart={() => onGroupHandleGrab && onGroupHandleGrab(true)}
          onTouchEnd={() => onGroupHandleGrab && onGroupHandleGrab(false)}
          title="Drag to Reorder Group"
          style={{ cursor: 'grab', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--primary, #4f46e5)', opacity: 0.8 }}
        >
          <GripVertical size={16} />
        </div>
        <button
          type="button"
          className={styles.btnRemove}
          onClick={onDelete}
          title="Delete Group"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
