/**
 * GroupDeleteModal.jsx
 * 
 * Purpose:
 * Renders a 3-choice confirmation modal when a user attempts to delete a group box.
 * Options:
 * 1. UnGroup (Yellow): Deletes the group box container, but keeps all cards and sets their group to "none".
 * 2. Delete All (Red): Deletes the group box AND permanently deletes all entries inside it.
 * 3. Cancel: Closes the modal without making changes.
 * 
 * Includes hover tooltips for each option.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, FolderX, Trash2, X } from 'lucide-react';

export default function GroupDeleteModal({
  isOpen,
  groupName,
  itemCount = 0,
  onClose,
  onUnGroup,
  onDeleteAll
}) {
  const [mounted, setMounted] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-main, #1e293b)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            backgroundColor: 'var(--bg-secondary, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#eab308" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main, #1e293b)' }}>
              Delete Group: "{groupName}"
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #64748b)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main, #334155)' }}>
            This group currently contains <strong>{itemCount} {itemCount === 1 ? 'entry' : 'entries'}</strong>. Choose how you would like to proceed:
          </p>

          {/* Hover Tooltip Display Box */}
          <div
            style={{
              minHeight: '42px',
              backgroundColor: 'var(--bg-tertiary, #f1f5f9)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12.5px',
              color: '#475569',
              border: '1px solid var(--border-color, #e2e8f0)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {hoveredButton === 'ungroup' && (
              <span>💡 <strong>Ungroup:</strong> Removes the group container. All {itemCount} entries will be kept and moved to the ungrouped list.</span>
            )}
            {hoveredButton === 'delete' && (
              <span>⚠️ <strong>Delete:</strong> Permanently deletes the group container AND all {itemCount} entries inside it.</span>
            )}
            {hoveredButton === 'cancel' && (
              <span>ℹ️ <strong>Cancel:</strong> Closes this popup without deleting anything.</span>
            )}
            {!hoveredButton && (
              <span style={{ fontStyle: 'italic', opacity: 0.8 }}>Hover over an option below to view its description.</span>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* UnGroup (Yellow) Button */}
            <button
              type="button"
              onClick={onUnGroup}
              onMouseEnter={() => setHoveredButton('ungroup')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#eab308',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(234, 179, 8, 0.3)'
              }}
              title="Delete group container only. Keep all entries as ungrouped."
            >
              <FolderX size={18} />
              <span>Ungroup</span>
            </button>

            {/* Delete All (Red) Button */}
            <button
              type="button"
              onClick={onDeleteAll}
              onMouseEnter={() => setHoveredButton('delete')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}
              title="Permanently delete group container and all entries inside it."
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setHoveredButton('cancel')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'transparent',
                color: 'var(--text-main, #475569)',
                fontWeight: '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
              title="Cancel and keep this group."
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
