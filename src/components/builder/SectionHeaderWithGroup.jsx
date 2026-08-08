/**
 * SectionHeaderWithGroup.jsx
 * 
 * Purpose:
 * Renders a section header with an icon, title, and a "+" button with an "Add Group" hover tooltip.
 * Clicking "+" triggers the addGroup callback to create a new sub-category group.
 */

'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from '@/app/builder/page.module.css';

export default function SectionHeaderWithGroup({
  icon: Icon,
  title,
  onAddGroup
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Icon && <Icon size={18} className="text-primary" />}
        <h4 className={styles.subsectionTitle} style={{ margin: 0 }}>
          {title}
        </h4>
      </div>

      {onAddGroup && (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onAddGroup}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-secondary, #f8fafc)',
              color: 'var(--primary, #4f46e5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0
            }}
            aria-label="Add Group"
          >
            <Plus size={16} />
          </button>

          {/* Hover Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '6px',
                padding: '4px 8px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              Add Group
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '8px',
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #1f2937'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
