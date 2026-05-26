'use client';

import { BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function LibraryPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-shell">
        <Header breadcrumb="My Library" />
        <main className="page-content">
          <div className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <span className="page-title-dot" />
                My Library
              </h1>
              <p className="page-subtitle">Your saved resources and templates</p>
            </div>
          </div>
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📚</div>
            <div className="empty-state-title">Library Coming Soon</div>
            <p className="empty-state-desc">Your saved question papers and templates will appear here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
