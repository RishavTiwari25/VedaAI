'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function GroupsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-shell">
        <Header breadcrumb="My Groups" />
        <main className="page-content">
          <div className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <span className="page-title-dot" />
                My Groups
              </h1>
              <p className="page-subtitle">Manage your student groups and classes</p>
            </div>
          </div>
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👥</div>
            <div className="empty-state-title">Groups Coming Soon</div>
            <p className="empty-state-desc">
              Create and manage student groups to distribute assignments efficiently across your classes.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
