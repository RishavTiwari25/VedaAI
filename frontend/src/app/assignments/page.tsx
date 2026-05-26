'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import EmptyState from '@/components/assignments/EmptyState';
import { useAssignmentStore, useFilteredAssignments } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function AssignmentsPage() {
  const { fetchAssignments, isLoading, error, setSearchQuery, searchQuery, assignments } = useAssignmentStore();
  const filtered = useFilteredAssignments();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize global WebSocket connection
  useWebSocket();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell">
        <Header
          breadcrumb="Assignment"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="page-content" role="main" id="main-content">
          <div className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <span className="page-title-dot" aria-hidden="true" />
                Assignments
              </h1>
              <p className="page-subtitle">Manage and create assignments for your classes.</p>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner spinner-dark" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>Loading assignments...</p>
              </div>
            </div>
          ) : error ? (
            <div style={{ padding: '48px 28px', textAlign: 'center' }}>
              <div style={{
                background: 'var(--error-light)',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '480px',
                margin: '0 auto',
              }}>
                <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: '8px' }}>Failed to load assignments</p>
                <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>
                <button className="btn btn-primary btn-sm" onClick={() => fetchAssignments()}>
                  Try Again
                </button>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Toolbar */}
              <div className="assignments-toolbar">
                <button className="filter-btn" aria-label="Filter assignments" id="filter-btn">
                  <SlidersHorizontal size={15} />
                  Filter By
                </button>
                <div className="search-box">
                  <div className="search-box-icon" aria-hidden="true">
                    <Search size={16} />
                  </div>
                  <input
                    type="search"
                    placeholder="Search Assignment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search assignments"
                    id="assignment-search"
                  />
                </div>
              </div>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div style={{ padding: '48px 28px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--neutral-500)' }}>
                    No assignments match &quot;<strong>{searchQuery}</strong>&quot;
                  </p>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '12px' }}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="assignments-grid" role="list" aria-label="Assignments">
                  {filtered.map((assignment) => (
                    <div key={assignment._id} role="listitem">
                      <AssignmentCard assignment={assignment} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* FAB - Create Assignment */}
        {assignments.length > 0 && (
          <Link href="/assignments/new" className="fab" id="create-assignment-fab" aria-label="Create new assignment">
            <Plus size={18} />
            Create Assignment
          </Link>
        )}
      </div>
    </div>
  );
}
