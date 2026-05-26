'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Menu } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export default function Header({ showBack = false, breadcrumb = 'Assignment', onMenuToggle }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="header" role="banner">
      <div className="header-left">
        {onMenuToggle && (
          <button
            className="header-back-btn mobile-header-menu"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            id="header-menu-btn"
          >
            <Menu size={20} />
          </button>
        )}

        {showBack && (
          <button
            className="header-back-btn"
            onClick={() => router.back()}
            aria-label="Go back"
            id="header-back-btn"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="header-breadcrumb">
          <div className="header-breadcrumb-icon">
            <LayoutGrid size={16} />
            <span style={{ color: 'var(--neutral-400)' }}>·</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--neutral-700)' }}>
              {breadcrumb}
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-bell" aria-label="Notifications" role="button" tabIndex={0}>
          <Bell size={20} />
          <span className="header-bell-dot" aria-hidden="true" />
        </div>

        <div className="header-user" role="button" tabIndex={0} aria-label="User menu" id="header-user-btn">
          <div className="header-avatar" aria-hidden="true">JD</div>
          <span className="header-user-name">John Doe</span>
          <span className="header-chevron">
            <ChevronDown size={14} />
          </span>
        </div>
      </div>
    </header>
  );
}
