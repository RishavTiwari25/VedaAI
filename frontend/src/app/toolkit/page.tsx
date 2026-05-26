'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ToolkitPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-shell">
        <Header breadcrumb="AI Teacher's Toolkit" />
        <main className="page-content">
          <div className="page-header">
            <div className="page-title-group">
              <h1 className="page-title">
                <span className="page-title-dot" />
                AI Teacher&apos;s Toolkit
              </h1>
              <p className="page-subtitle">AI-powered tools for teachers</p>
            </div>
          </div>
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🤖</div>
            <div className="empty-state-title">Toolkit Coming Soon</div>
            <p className="empty-state-desc">Advanced AI tools for grading, rubrics, and feedback are on the way.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
