'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Assignment } from '@/types';
import { useAssignmentStore } from '@/store/assignmentStore';

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const removeAssignment = useAssignmentStore((s) => s.removeAssignment);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleView = () => router.push(`/assignments/${assignment._id}`);

  const handleDelete = async () => {
    setMenuOpen(false);
    const confirmed = window.confirm(`Delete "${assignment.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await removeAssignment(assignment._id);
      toast.success('Assignment deleted');
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  const assignedDate = format(new Date(assignment.createdAt), 'dd-MM-yyyy');
  const dueDate = format(new Date(assignment.dueDate), 'dd-MM-yyyy');

  return (
    <div
      className="assignment-card"
      onClick={handleView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleView()}
      aria-label={`View assignment: ${assignment.title}`}
    >
      {/* Header: title + 3-dot menu */}
      <div className="assignment-card-header">
        <div className="assignment-card-title">{assignment.title}</div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="assignment-card-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="Assignment options"
            aria-expanded={menuOpen}
            id={`assignment-menu-${assignment._id}`}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              <div
                className="dropdown-item"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  handleView();
                }}
              >
                <Eye size={15} />
                View Assignment
              </div>
              <div className="dropdown-divider" />
              <div
                className="dropdown-item danger"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 size={15} />
                Delete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dates row — matches Figma exactly */}
      <div className="assignment-card-dates">
        <div className="date-item">
          <Calendar size={13} />
          <span>Assigned on : <strong>{assignedDate}</strong></span>
        </div>
        <div className="date-item">
          <span>Due : <strong>{dueDate}</strong></span>
        </div>
      </div>
    </div>
  );
}
