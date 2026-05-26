'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  Wand2,
  BookOpen,
  Settings,
  Plus,
  BookMarked,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; badge?: number }[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Wand2 },
  { href: '/library', label: 'My Library', icon: BookOpen },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {onClose && (
        <div
          className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
          <Link href="/" className="sidebar-logo" style={{ padding: 0 }}>
            <div className="sidebar-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="sidebar-logo-text">VedaAI</span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              aria-label="Close menu"
              style={{ display: 'none' }}
              id="sidebar-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Create Assignment CTA */}
        <Link href="/assignments/new" className="sidebar-create-btn" id="sidebar-create-btn">
          <Plus size={16} />
          Create Assignment
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = item.href === '/assignments'
              ? pathname.startsWith('/assignments')
              : pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-settings">
            <Settings size={17} />
            <span>Settings</span>
          </div>
          <div className="school-card">
            <div className="school-avatar">🏫</div>
            <div className="school-info">
              <div className="school-name">Delhi Public School</div>
              <div className="school-location">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
